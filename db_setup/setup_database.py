#!/usr/bin/env python3
import os
import sys
import glob
import argparse
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from dotenv import load_dotenv

def load_env_config():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    env_path = os.path.join(script_dir, '..', '.env')
    
    if not os.path.exists(env_path):
        raise FileNotFoundError(f"Archivo .env no encontrado en: {env_path}")
    
    load_dotenv(env_path)
    
    config = {
        'host': os.getenv('DB_HOST'),
        'port': os.getenv('DB_PORT'),
        'database': os.getenv('DB_NAME'),
        'user': os.getenv('DB_USER'),
        'password': os.getenv('DB_PASSWORD')
    }
    for key, value in config.items():
        if not value:
            raise ValueError(f"Falta la configuración: {key}")
    
    return config

def connect_to_postgres(config, database='postgres'):
    try:
        conn = psycopg2.connect(
            host=config['host'],
            database=database,
            user=config['user'],
            password=config['password'],
            client_encoding='utf8'
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        
        cursor = conn.cursor()
        cursor.execute("SET client_encoding TO 'UTF8';")
        conn.commit()
        cursor.close()
        
        return conn
    except psycopg2.Error as e:
        print(f"Error al conectar a PostgreSQL: {e}")
        raise

def database_exists(config, database_name=None):
    if not database_name:
        database_name = config['database']
    
    conn = connect_to_postgres(config)
    cursor = conn.cursor()
    cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (database_name,))
    exists = cursor.fetchone() is not None
    cursor.close()
    conn.close()
    return exists

def recreate_database(config):
    conn = connect_to_postgres(config)
    cursor = conn.cursor()
    database_name = config['database']
    
    if database_exists(config):
        cursor.execute(f"""
            SELECT pg_terminate_backend(pid)
            FROM pg_stat_activity
            WHERE datname = '{database_name}' AND pid <> pg_backend_pid()
        """)
        cursor.execute(f'DROP DATABASE IF EXISTS "{database_name}"')
        print(f"Database {database_name}: ELIMINADA")
    
    cursor.execute(f'CREATE DATABASE "{database_name}"')
    print(f"Database {database_name}: CREADA")
    
    cursor.close()
    conn.close()
    return True

def execute_sql_file(config, sql_file_path):
    file_name = os.path.basename(sql_file_path)
    
    if not os.path.exists(sql_file_path):
        print(f"{file_name}: ERROR - Archivo no encontrado")
        return False
    
    sql_content = None
    encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
    
    for encoding in encodings:
        try:
            with open(sql_file_path, 'r', encoding=encoding) as f:
                sql_content = f.read()
            break
        except UnicodeDecodeError:
            continue
    
    if sql_content is None:
        print(f"{file_name}: ERROR - No se pudo leer el archivo")
        return False
    
    if not sql_content.strip():
        print(f"{file_name}: OMITIDO - Archivo vacío")
        return True
    
    conn = None
    try:
        conn = connect_to_postgres(config, config['database'])
        cursor = conn.cursor()
        cursor.execute(sql_content)
        conn.commit()
        cursor.close()
        conn.close()
        print(f"{file_name}: ÉXITO - Ejecutado correctamente")
        return True
    except Exception as e:
        print(f"{file_name}: ERROR - {str(e)}")
        if conn:
            conn.rollback()
            conn.close()
        return False

def execute_sql_files(config, files_to_execute):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    success = True
    
    for sql_file in files_to_execute:
        sql_file_path = os.path.join(script_dir, sql_file)
        if not execute_sql_file(config, sql_file_path):
            success = False
    
    return success

def find_sql_files(prefixes):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    files_to_execute = []
    
    for prefix in prefixes:
        matching_files = glob.glob(os.path.join(script_dir, f"{prefix}*.sql"))
        if matching_files:
            files_to_execute.append(os.path.basename(matching_files[0]))
        else:
            print(f"Advertencia: No se encontró ningún archivo que comience con '{prefix}'")
    
    return files_to_execute

def parse_arguments():
    parser = argparse.ArgumentParser(
        description='Configura la base de datos PostgreSQL para el sistema',
        epilog='''
MODOS DISPONIBLES:

-c/--count: Contar filas en todas las tablas sin modificar nada
-d/--drop: Reiniciar la BD sin ejecutar ningún archivo SQL
-t/--total: Reiniciar BD y ejecutar archivos 1_*.sql, 2_*.sql, 3_*.sql y 4_*.sql
-r/--reset: Reiniciar BD y ejecutar archivo 1_*.sql
        ''',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    group = parser.add_mutually_exclusive_group(required=True)
    
    group.add_argument(
        '-c', '--count',
        action='store_true',
        help='Contar filas en todas las tablas'
    )
    
    group.add_argument(
        '-d', '--drop',
        action='store_true',
        help='Reiniciar BD sin ejecutar ningún script'
    )
    
    group.add_argument(
        '-t', '--total',
        action='store_true',
        help='Reiniciar BD y ejecutar archivos 1_*.sql, 2_*.sql, 3_*.sql y 4_*.sql'
    )
    
    group.add_argument(
        '-r', '--reset',
        action='store_true',
        help='Reiniciar BD y ejecutar archivo 1_*.sql'
    )
    
    parser.add_argument(
        '-y', '--yes',
        action='store_true',
        help='Ejecutar sin confirmación'
    )
    
    return parser.parse_args()

def count_table_rows(config):
    if not database_exists(config):
        print(f"ERROR: La base de datos '{config['database']}' no existe.")
        print("Use el comando -d para crear la base de datos.")
        return False
        
    conn = None
    try:
        conn = connect_to_postgres(config, config['database'])
        
        cursor = conn.cursor()
        
        cursor.execute("SET client_encoding TO 'UTF8';")
        conn.commit()
        
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
              AND table_type = 'BASE TABLE'
            ORDER BY table_name
        """)
        
        tables = cursor.fetchall()
        
        if not tables:
            print("No se encontraron tablas en la base de datos.")
            return
        
        print(f"=== CONTEO DE FILAS EN BASE DE DATOS '{config['database']}' ===")
        print()
        
        total_rows = 0
        max_table_name_length = max(len(table[0]) for table in tables)
        
        print(f"{'TABLA':<{max_table_name_length}} | FILAS")
        print("-" * (max_table_name_length + 10))
        
        for table in tables:
            table_name = table[0]
            
            cursor.execute(f'SELECT COUNT(*) FROM public."{table_name}"')
            row_count = cursor.fetchone()[0]
            total_rows += row_count
            
            print(f"{table_name:<{max_table_name_length}} | {row_count:,}")
        
        print("-" * (max_table_name_length + 10))
        print(f"{'TOTAL':<{max_table_name_length}} | {total_rows:,}")
        print()
        
        cursor.close()
        
    except psycopg2.Error as e:
        print(f"Error al contar filas: {e}")
        raise
    finally:
        if conn:
            conn.close()

def confirm_execution(config, mode=None, files_to_execute=None):
    print("=== ADVERTENCIA ===")
    print("Este script realizará las siguientes acciones:")
    print(f"  • Conectar a PostgreSQL en: {config['host']}")
    print(f"  • Eliminar la base de datos: '{config['database']}' (si existe)")
    print(f"  • Crear una nueva base de datos: '{config['database']}'")
    
    if files_to_execute:
        print("  • Ejecutar los siguientes archivos:")
        for file in files_to_execute:
            print(f"    - {file}")
    
    print()
    print("⚠️  TODOS LOS DATOS EN LA BASE DE DATOS SERÁN ELIMINADOS ⚠️")
    print()
    
    while True:
        response = input("¿Desea continuar? (s/n): ").lower().strip()
        if response in ['s', 'si', 'sí', 'y', 'yes']:
            return True
        elif response in ['n', 'no']:
            print("Operación cancelada por el usuario.")
            return False
        else:
            print("Por favor, responda 's' para sí o 'n' para no.")

def main():
    try:
        args = parse_arguments()
        
        print("=== CONFIGURACIÓN DE BASE DE DATOS POSTGRESQL ===")
        print()
        
        print("1. Cargando configuración desde .env...")
        config = load_env_config()
        print(f"   - Host: {config['host']}")
        print(f"   - Base de datos: {config['database']}")
        print(f"   - Usuario: {config['user']}")
        print(f"   - Puerto: {config['port']}")
        print()
        
        execution_modes = {
            "count": {"description": "Conteo de filas", "files": []},
            "drop": {"description": "Reinicio sin ejecutar scripts", "files": []},
            "total": {"description": "Reinicio con todos los scripts secuenciales", "files": ["1_", "2_", "3_", "4_"]},
            "reset": {"description": "Reinicio con archivo 1_*.sql", "files": ["1_"]}
        }
        
        if args.count:
            print("MODO: Conteo de filas")
            count_table_rows(config)
            return
        
        files_to_execute = []
        
        if args.drop:
            print("MODO: Reinicio sin ejecutar scripts")
        elif args.total:
            print("MODO: Reinicio con todos los scripts secuenciales")
            files_to_execute = find_sql_files(["1_", "2_", "3_", "4_"])
        elif args.reset:
            print("MODO: Reinicio con archivo 1_*.sql")
            files_to_execute = find_sql_files(["1_"])
        
        print()
        
        if not args.yes:
            if not confirm_execution(config, None, files_to_execute):
                sys.exit(0)
            print()
        
        print("2. Recreando la base de datos...")
        if not recreate_database(config):
            print("ERROR: No se pudo recrear la base de datos.")
            sys.exit(1)
        print()
        
        if files_to_execute:
            print(f"3. Ejecutando archivos SQL:")
            result = execute_sql_files(config, files_to_execute)
            print()
            if result:
                print("=== BASE DE DATOS CONFIGURADA EXITOSAMENTE ===")
            else:
                print("ADVERTENCIA: Algunos archivos SQL tuvieron errores durante la ejecución.")
                print("Revise los mensajes anteriores para más detalles.")
                print("La base de datos puede estar en un estado incompleto.")
                sys.exit(1)
        else:
            print("=== BASE DE DATOS RECREADA EXITOSAMENTE (SIN ARCHIVOS SQL) ===")
            print("La base de datos está vacía.")
        
    except KeyboardInterrupt:
        print("\n\nOperación interrumpida por el usuario.")
        sys.exit(1)
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()