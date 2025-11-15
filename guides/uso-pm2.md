## Instalar

```bash
npm install pm2 -g
```

## Iniciar

```bash
pm2 start app.js -i max
```
## Otros comandos

* **Para ver el estado del cluster (verás varias instancias de `app`):**
```bash
pm2 list
```
* **Para ver los logs de todos los workers en tiempo real:**
```bash
pm2 logs
```
* **Para detener la aplicación:**
```bash
pm2 stop app
```
* **Para reiniciar la aplicación (si actualizas tu código):**
```bash
pm2 restart app
```
* **Para ver un monitor de rendimiento (CPU, RAM):**
```bash
pm2 monit
```