#!/usr/bin/env python3
import os
import sys
import argparse
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from dotenv import load_dotenv

def load_env_config():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    env_path = os.path.join(script_dir, '.env')
    
    if not os.path.exists(env_path):
        raise FileNotFoundError(f"Archivo .env no encontrado en: {env_path}")
    
    load_dotenv(env_path)
    
    config = {
        'host': os.getenv('PORT', '127.0.0.1'),
        'database': os.getenv('NAME'),
        'user': os.getenv('USER'),
        'password': os.getenv('PASSWORD')
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
            password=config['password']
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        return conn
    except psycopg2.Error as e:
        print(f"Error al conectar a PostgreSQL: {e}")
        raise

def database_exists(cursor, database_name):
    cursor.execute(
        "SELECT 1 FROM pg_database WHERE datname = %s",
        (database_name,)
    )
    return cursor.fetchone() is not None

def drop_database(cursor, database_name):
    cursor.execute(f"""
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = '{database_name}' AND pid <> pg_backend_pid()
    """)
    
    cursor.execute(f'DROP DATABASE IF EXISTS "{database_name}"')
    print(f"Base de datos '{database_name}' eliminada exitosamente.")

def create_database(cursor, database_name):
    cursor.execute(f'CREATE DATABASE "{database_name}"')
    print(f"Base de datos '{database_name}' creada exitosamente.")

def execute_sql_file(config):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    sql_file_path = os.path.join(script_dir, 'schema_public.sql')
    
    if not os.path.exists(sql_file_path):
        raise FileNotFoundError(f"Archivo schema_public.sql no encontrado en: {sql_file_path}")

    conn = None
    try:
        conn = psycopg2.connect(
            host=config['host'],
            database=config['database'],
            user=config['user'],
            password=config['password']
        )
        
        cursor = conn.cursor()
        with open(sql_file_path, 'r', encoding='utf-8') as sql_file:
            sql_content = sql_file.read()
        
        print(f"Ejecutando script SQL desde: {sql_file_path}")
        cursor.execute(sql_content)
        conn.commit()
        
        print("Script SQL ejecutado exitosamente.")
        
        cursor.close()
        
    except psycopg2.Error as e:
        print(f"Error al ejecutar el script SQL: {e}")
        if conn:
            conn.rollback()
        raise
    finally:
        if conn:
            conn.close()

def parse_arguments():
    parser = argparse.ArgumentParser(
        description='Configura la base de datos PostgreSQL para el sistema de gestión de parroquias',
        epilog='''
DESCRIPCIÓN DETALLADA:
Este script automatiza la configuración de la base de datos con diferentes modos:

MODO CONTEO (-c):
1. Se conecta a la base de datos existente
2. Cuenta las filas reales de todas las tablas usando SELECT COUNT(*)
3. Muestra un reporte detallado sin modificar nada

MODO REINICIO SIN ESQUEMA (-d):
1. Lee la configuración desde el archivo .env (HOST, NAME, USER, PASSWORD)
2. Se conecta a PostgreSQL usando las credenciales proporcionadas
3. Elimina la base de datos existente (con confirmación)
4. Crea una nueva base de datos vacía
5. NO ejecuta el esquema - deja la BD lista para configuración manual

MODO REINICIO CON ESQUEMA (-r):
1-4. Igual que el modo -d
5. Ejecuta el archivo schema_public.sql para crear todas las tablas, índices, etc.

ADVERTENCIA: Los modos -d y -r eliminan completamente la base de datos existente.
Asegúrate de tener respaldos si es necesario.

ESTRUCTURA DE ARCHIVOS REQUERIDA:
- .env (con PORT, NAME, USER, PASSWORD)
- schema_public.sql (script de creación de esquema, solo para modo -r)
- setup_database.py (este script)

EJEMPLOS DE USO:
  python setup_database.py           # Muestra esta ayuda
  python setup_database.py -h        # Muestra esta ayuda
  python setup_database.py -c        # Contar filas en base de datos existente
  python setup_database.py -d        # Reinicio interactivo (solo base de datos)
  python setup_database.py -d -y     # Reinicio automático (solo base de datos)
  python setup_database.py -r        # Reinicio interactivo (con esquema)
  python setup_database.py -r -y     # Reinicio automático (con esquema)
        ''',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    # Grupo mutuamente excluyente para las operaciones principales
    group = parser.add_mutually_exclusive_group(required=True)
    
    group.add_argument(
        '-c', '--count',
        action='store_true',
        help='Contar filas reales en todas las tablas de la base de datos existente'
    )
    
    group.add_argument(
        '-d', '--drop',
        action='store_true',
        help='Reiniciar base de datos sin ejecutar el esquema (deja la BD vacía)'
    )
    
    group.add_argument(
        '-r', '--reset',
        action='store_true',
        help='Reiniciar base de datos y ejecutar el esquema completo'
    )
    
    parser.add_argument(
        '-y', '--yes',
        action='store_true',
        help='Ejecutar automáticamente sin solicitar confirmación (solo para -d y -r)'
    )
    
    return parser.parse_args()

def count_table_rows(config):
    """Cuenta las filas reales de todas las tablas en la base de datos"""
    conn = None
    try:
        conn = psycopg2.connect(
            host=config['host'],
            database=config['database'],
            user=config['user'],
            password=config['password']
        )
        
        cursor = conn.cursor()
        
        # Obtener todas las tablas del esquema public
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
            
            # Contar filas reales usando SELECT COUNT(*)
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

def confirm_execution(config, is_drop_only=False):
    """Solicita confirmación del usuario antes de proceder"""
    print("=== ADVERTENCIA ===")
    print("Este script realizará las siguientes acciones:")
    print(f"  • Conectar a PostgreSQL en: {config['host']}")
    print(f"  • Eliminar la base de datos: '{config['database']}' (si existe)")
    print(f"  • Crear una nueva base de datos: '{config['database']}'")
    
    if is_drop_only:
        print("  • Dejar la base de datos vacía (sin esquema)")
    else:
        print(f"  • Ejecutar el esquema desde: schema_public.sql")
    
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
        print()
        
        # Modo conteo de filas
        if args.count:
            print("MODO: Conteo de filas")
            print()
            count_table_rows(config)
            return
        
        # Validar que -y solo se use con -d o -r
        if args.yes and not (args.drop or args.reset):
            print("ERROR: La opción -y/--yes solo puede usarse con -d/--drop o -r/--reset")
            sys.exit(1)
        
        # Determinar el modo de operación
        is_drop_only = args.drop
        execute_schema = args.reset
        
        # Mostrar modo actual
        if is_drop_only:
            print("MODO: Reinicio de base de datos (sin esquema)")
        elif execute_schema:
            print("MODO: Reinicio de base de datos (con esquema)")
        print()
        
        # Solicitar confirmación si no se especificó -y
        if not args.yes:
            if not confirm_execution(config, is_drop_only):
                sys.exit(0)
            print()
        
        print("2. Conectando a PostgreSQL...")
        conn = connect_to_postgres(config, 'postgres')
        cursor = conn.cursor()
        print("   Conexión establecida exitosamente.")
        print()
        
        print("3. Verificando si la base de datos existe...")
        if database_exists(cursor, config['database']):
            print(f"   La base de datos '{config['database']}' existe.")
            
            print("4. Eliminando la base de datos existente...")
            drop_database(cursor, config['database'])
        else:
            print(f"   La base de datos '{config['database']}' no existe.")
        
        print()
        print("5. Creando la nueva base de datos...")
        create_database(cursor, config['database'])
        print()
        
        cursor.close()
        conn.close()
        
        # Ejecutar esquema solo si es modo reset (-r)
        if execute_schema:
            print("6. Ejecutando el archivo schema_public.sql...")
            execute_sql_file(config)
            print()
            print("=== BASE DE DATOS CONFIGURADA EXITOSAMENTE ===")
        else:
            print("=== BASE DE DATOS RECREADA EXITOSAMENTE (SIN ESQUEMA) ===")
            print("La base de datos está vacía y lista para configuración manual.")
        
    except KeyboardInterrupt:
        print("\n\nOperación interrumpida por el usuario.")
        sys.exit(1)
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()