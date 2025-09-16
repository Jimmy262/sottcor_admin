# Asignación de Pesos - Vendedores

Una aplicación web elegante y minimalista construida con Next.js para asignar pesos a vendedores existentes mediante una interfaz intuitiva con modales interactivos, optimizando la distribución de carga de trabajo del equipo.

## Características

- ✅ **Interfaz web elegante y minimalista**
- ✅ **Asignación de pesos con modal interactivo**
- ✅ **Visualización clara con tarjetas modernas**
- ✅ **Sistema de pesos con escala visual**
- ✅ **Animaciones y transiciones suaves**
- ✅ **Base de datos PostgreSQL con Prisma ORM**
- ✅ **Validación robusta de pesos**
- ✅ **Mensajes de feedback elegantes**
- ✅ **Diseño responsive con gradientes**

## Estructura de la Base de Datos

```sql
CREATE TABLE inbox_vendedores (
    vendedor_id INT PRIMARY KEY,
    vendedor_nombre VARCHAR(100) NOT NULL,
    inbox_id INT NOT NULL,
    inbox_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    peso INT
);
```

## Instalación y Configuración

### 1. Configuración rápida (recomendado)

```bash
# Ejecuta el script de configuración automática
node setup.js
```

### 1. Configuración manual

```bash
# Instalar dependencias
npm install
```

### 2. Configurar la base de datos

Edita el archivo `.env` y configura tu conexión a MySQL:

```env
DATABASE_URL="mysql://usuario:password@localhost:3306/nombre_base_datos"
```

**Ejemplo:**
```env
DATABASE_URL="mysql://root:mipassword@localhost:3306/chatwoot_vendedores"
```

### 3. Crear y migrar la base de datos

```bash
# Generar el cliente de Prisma
npm run db:generate

# Crear la migración inicial
npm run db:migrate

# (Opcional) Abrir Prisma Studio para ver la base de datos
npm run db:studio
```

### 4. Ejecutar la aplicación

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Uso de la Aplicación

### Asignar pesos a vendedores

1. **Vista general**: La aplicación muestra una cuadrícula elegante con todos los vendedores registrados

2. **Asignar pesos**:
   - **Haz clic en cualquier tarjeta de vendedor** para abrir el modal de edición
   - **Elige un peso** usando el input numérico o la escala visual interactiva
   - **Presiona "Guardar Peso"** para confirmar los cambios
   - **O presiona "Cancelar"** para cerrar sin guardar

3. **Sistema de pesos intuitivo**:
   - 🔵 **1-3**: Carga ligera (vendedor junior)
   - 🟢 **4-6**: Carga media (vendedor experimentado)
   - 🟠 **7-9**: Carga alta (vendedor senior)
   - 🔴 **10+**: Carga máxima (especialista)

### Características de la interfaz

- **Tarjetas modernas** con avatares personalizados
- **Modal interactivo** con escala visual de pesos
- **Animaciones suaves** en hover y transiciones
- **Indicadores visuales** del estado de cada vendedor
- **Estadísticas en tiempo real** del peso total del equipo
- **Mensajes de confirmación** elegantes

## Tecnologías Utilizadas

- **Next.js 14** - Framework de React
- **TypeScript** - Tipado estático
- **Prisma** - ORM para base de datos
- **PostgreSQL** - Base de datos
- **Tailwind CSS** - Framework de estilos
- **React Hooks** - Gestión de estado

## Estructura del Proyecto

```
src/
├── app/
│   ├── api/vendedores/
│   │   ├── [id]/route.ts        # API para actualizar pesos
│   │   └── route.ts            # API para obtener vendedores
│   ├── layout.tsx              # Layout principal
│   └── page.tsx                # Página principal
├── components/
│   ├── VendedorWeightList.tsx  # Lista elegante de vendedores
│   └── WeightModal.tsx         # Modal para asignar pesos
├── lib/
│   └── prisma.ts               # Cliente de Prisma
└── ...
```

## API Endpoints

- `GET /api/vendedores` - Obtener todos los vendedores con sus pesos actuales
- `PUT /api/vendedores/[id]` - Actualizar únicamente el peso de un vendedor específico

## Experiencia de Usuario

### 🎨 **Diseño Elegante**
- **Header moderno** con icono y gradientes
- **Tarjetas interactivas** con hover effects
- **Modal elegante** con escala visual de pesos
- **Animaciones suaves** y transiciones fluidas
- **Colores consistentes** con gradientes atractivos

### ⚡ **Interacciones Intuitivas**
- **Clic en tarjetas** para abrir modal de edición
- **Escala visual** para selección rápida de pesos
- **Teclado shortcuts** (Enter para guardar, Escape para cancelar)
- **Feedback visual** inmediato en todas las acciones
- **Estados de carga** con spinners elegantes

### 📊 **Información en Tiempo Real**
- **Contador de vendedores activos**
- **Suma total de pesos** del equipo
- **Estados visuales** (asignado/sin asignar)
- **Indicadores de progreso** con colores intuitivos

## Vista Previa de la Interfaz

```
┌─────────────────────────────────────────────────────────┐
│  ⚖️ Asignación de Pesos                                  │
│  Gestiona la carga de trabajo de tu equipo             │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────┐ ┌─────────────┐    │
│  │ Vendedores activos: 5          │ │ Peso total: │    │
│  │ ●                             │ │    25       │    │
│  └─────────────────────────────────┘ └─────────────┘    │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────┐ │
│  │  A              │ │  M              │ │  J          │ │
│  │  Ana García     │ │  Miguel López   │ │  Juan Pérez │ │
│  │  ID: 1          │ │  ID: 2          │ │  ID: 3      │ │
│  │                 │ │                 │ │             │ │
│  │  Peso actual:   │ │  Peso actual:   │ │  Peso actual│ │
│  │  [5] Asignado   │ │  [0] Sin asignar│ │  [8] Asignado│ │
│  │                 │ │                 │ │             │ │
│  │ ⚖️ Asignar Peso │ │ ⚖️ Asignar Peso │ │ ⚖️ Asignar Peso│ │
│  └─────────────────┘ └─────────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Despliegue con Docker

### Para EasyPanel (desde ZIP)

#### Opción 1: Despliegue Automático con Script

1. **Prepara tu proyecto automáticamente**:
   ```bash
   # Método universal (funciona en cualquier sistema)
   npm run zip:prepare

   # O directamente con Node.js
   node scripts/prepare-zip.js

   # Scripts específicos por sistema:
   # Linux/Mac: ./prepare-zip.sh
   # Windows: prepare-zip.bat
   ```

2. **El script generará** un archivo ZIP optimizado automáticamente con timestamp único

#### Opción 2: Preparación Manual

1. **Prepara tu proyecto**:
   ```bash
   # Copia el archivo de ejemplo de variables de entorno
   cp env.example .env
   # Edita el .env con tus credenciales reales
   ```

2. **Crea un ZIP** con los archivos esenciales:
   - `src/` (código fuente)
   - `public/` (archivos estáticos)
   - `prisma/` (configuración BD)
   - `package.json` y `package-lock.json`
   - `Dockerfile` y `docker-compose.yml`
   - `.env` (con tus configuraciones)

#### Despliegue en EasyPanel

3. **Sube el archivo ZIP** a EasyPanel

4. **En EasyPanel**, crea un nuevo servicio:
   - **Tipo**: Docker Compose
   - **Archivo ZIP**: Selecciona tu archivo ZIP
   - **Archivo Docker Compose**: `docker-compose.yml`
   - **Nombre del servicio**: `sottcor-app`

5. **Configura las variables de entorno**:
   - `DATABASE_URL`: Tu URL de base de datos PostgreSQL
   - `NODE_ENV`: `production`
   - `PORT`: `3000` (opcional)

6. **Configura recursos** (opcional):
   - **CPU**: 0.5 vCPU
   - **Memoria**: 512MB

7. **Despliega** el servicio

8. **Verifica** que la aplicación esté funcionando visitando la URL proporcionada por EasyPanel

### Para EasyPanel (desde Git)

Si prefieres usar Git en lugar de ZIP:

1. **Sube tu proyecto** a un repositorio Git (GitHub, GitLab, etc.)

2. **En EasyPanel**, crea un nuevo servicio:
   - **Tipo**: Docker Compose
   - **Repositorio**: URL de tu repositorio
   - **Archivo**: `docker-compose.yml`
   - **Rama**: `main` (o la rama que uses)

3. **Configura las variables de entorno** y sigue los pasos 5-8 anteriores

### Construcción manual de Docker

```bash
# Construir la imagen
docker build -t sottcor-app .

# Ejecutar el contenedor
docker run -p 3000:3000 -e DATABASE_URL="tu-url-postgres" sottcor-app
```

### Con Docker Compose

```bash
# Ejecutar con docker-compose
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

### Optimizaciones de Docker

- **Imagen base ligera**: Usa `node:18-alpine` para reducir el tamaño
- **Cache de dependencias**: Copia `package*.json` primero para aprovechar el cache
- **.dockerignore**: Excluye archivos innecesarios para builds más rápidos
- **Healthcheck**: Incluye verificación de salud para el servicio
- **Multi-stage builds**: Optimizado para producción

### Tamaño estimado de la imagen
- **Imagen final**: ~150-200MB (dependiendo de las dependencias)
- **Tiempo de build**: 2-4 minutos en la primera ejecución
- **Tiempo de inicio**: 10-20 segundos

## Desarrollo

Para desarrollo local:

```bash
# Instalar dependencias
npm install

# Configurar la base de datos (ver sección anterior)
npm run db:generate
npm run db:migrate

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar en producción
npm start
```

### Scripts disponibles

#### Desarrollo
- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter

#### Base de datos
- `npm run db:generate` - Genera el cliente de Prisma
- `npm run db:migrate` - Ejecuta migraciones de base de datos
- `npm run db:studio` - Abre Prisma Studio
- `npm run db:push` - Sincroniza el esquema con la base de datos

#### Docker
- `npm run docker:build` - Construye la imagen Docker
- `npm run docker:run` - Ejecuta el contenedor Docker
- `npm run docker:up` - Inicia con Docker Compose
- `npm run docker:down` - Detiene los contenedores
- `npm run docker:logs` - Muestra los logs de Docker
- `npm run docker:clean` - Limpia imágenes y contenedores

## Notas Importantes

- Asegúrate de que tu base de datos PostgreSQL esté ejecutándose
- Verifica que las credenciales en `.env` sean correctas
- La tabla `inbox_vendedores` debe existir en tu base de datos antes de usar la aplicación
- El campo `vendedor_id` debe ser único en la base de datos
- La aplicación **solo permite modificar el campo `peso`** de los vendedores existentes
- **No se pueden crear ni eliminar vendedores** desde la aplicación

## Solución de Problemas

### Error de conexión a la base de datos
- Verifica que PostgreSQL esté ejecutándose
- Comprueba las credenciales en `.env`
- Asegúrate de que la base de datos existe

### Error al crear migraciones
- Ejecuta `npm run db:generate` primero
- Verifica que el schema de Prisma esté correcto

### Problemas con Docker
- **Build falla**: Verifica que tengas Docker instalado y ejecutándose
- **Puerto ocupado**: Cambia el puerto en `docker-compose.yml` si el 3000 está ocupado
- **Base de datos no conecta**: Verifica que `DATABASE_URL` esté configurada correctamente
- **Contenedor no inicia**: Revisa los logs con `npm run docker:logs`
- **Memoria insuficiente**: Aumenta la memoria asignada a Docker Desktop

## Licencia

Este proyecto es de uso privado.