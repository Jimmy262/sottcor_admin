# Despliegue en EasyPanel - Sottcor Admin

Este documento describe cómo desplegar la aplicación Sottcor Admin en EasyPanel.

## 🐳 Configuración Docker Optimizada

### Características principales:
- **Multi-stage build** para imagen ligera (~80MB final)
- **Standalone output** de Next.js para mejor rendimiento
- **Security headers** configurados automáticamente
- **Health checks** integrados
- **Usuario no-root** para seguridad
- **dumb-init** para manejo correcto de señales

## 📋 Variables de Entorno Requeridas

Configura estas variables en EasyPanel:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://usuario:password@host:puerto/database
ADMIN_PASSWORD=tu_password_seguro
JWT_SECRET=tu_jwt_secret_muy_largo_y_seguro
NEXT_TELEMETRY_DISABLED=1
```

## 🚀 Pasos para Despliegue

### 1. Preparar el código
```bash
# Comprimir el proyecto (excluir node_modules)
zip -r sottcor-admin.zip . -x "node_modules/*" ".next/*" "*.log"
```

### 2. En EasyPanel

1. **Crear nueva aplicación**
   - Tipo: Docker
   - Método: Upload ZIP

2. **Configurar variables de entorno**
   - Añadir todas las variables listadas arriba
   - Asegurar que `DATABASE_URL` apunte a tu base de datos

3. **Configurar red**
   - Puerto interno: `3000`
   - Health check endpoint: `/api/auth/verify`

4. **Configurar dominio**
   - Añadir tu dominio personalizado
   - Habilitar SSL automático

### 3. Primera configuración

Una vez desplegado:

1. **Inicializar base de datos**
   ```bash
   # Ejecutar en el contenedor o via API call
   curl -X POST https://tu-dominio.com/api/init-db
   ```

2. **Verificar funcionamiento**
   ```bash
   curl https://tu-dominio.com/api/auth/verify
   ```

## 🔧 Configuración Avanzada

### Límites de recursos recomendados:
- **CPU**: 0.5 cores (límite), 0.25 cores (reserva)
- **Memoria**: 512MB (límite), 256MB (reserva)

### Configuración de logs:
- Rotación automática cada 10MB
- Máximo 3 archivos de log

### Health Check:
- Intervalo: 30 segundos
- Timeout: 10 segundos
- Intentos: 3
- Periodo inicial: 40 segundos

## 🔍 Monitoreo

### Endpoints de salud:
- `/api/auth/verify` - Estado de autenticación
- `/api/test-db` - Estado de base de datos

### Logs importantes:
```bash
# Ver logs de la aplicación
docker logs sottcor-admin -f

# Ver logs específicos
docker logs sottcor-admin --since 1h
```

## 🐛 Solución de Problemas

### Error de conexión a base de datos:
1. Verificar `DATABASE_URL` en variables de entorno
2. Confirmar conectividad de red
3. Verificar permisos de usuario de BD

### Error 401 en autenticación:
1. Verificar `JWT_SECRET` configurado
2. Confirmar `ADMIN_PASSWORD` establecido

### Error de build:
1. Verificar que el código esté completo
2. Confirmar que `package.json` está incluido
3. Revisar logs de build en EasyPanel

## 📊 Optimizaciones Aplicadas

1. **Imagen Docker reducida**: De ~1GB a ~80MB
2. **Standalone build**: Menor uso de memoria
3. **Security headers**: Protección automática
4. **Compresión habilitada**: Mejor velocidad de carga
5. **Optimización de imágenes**: WebP/AVIF automático

## 🔄 Actualizaciones

Para actualizar la aplicación:

1. Comprimir nueva versión
2. Subir ZIP a EasyPanel
3. Rebuild automático
4. Health check verificará el despliegue

## 📞 Soporte

Si encuentras problemas:
1. Revisar logs en EasyPanel
2. Verificar variables de entorno
3. Confirmar conectividad de base de datos
4. Probar endpoints de salud