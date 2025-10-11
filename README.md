# Asignación de Pesos por Mensaje - Sottcor Admin

Una aplicación web elegante y minimalista construida con Next.js para asignar pesos a vendedores por mensaje dentro de cada inbox, optimizando la distribución de carga de trabajo del equipo mediante una interfaz intuitiva con modales interactivos.

## Características

- ✅ **Sistema de autenticación seguro con JWT**
- ✅ **Selección de Inbox y Mensaje en cascada**
- ✅ **Asignación de pesos por vendedor en cada mensaje**
- ✅ **Interfaz web elegante y minimalista**
- ✅ **Visualización clara con tarjetas modernas**
- ✅ **Sistema de pesos con escala visual**
- ✅ **Distribución de pesos en tiempo real**
- ✅ **Optimistic UI updates (sin lag)**
- ✅ **Base de datos PostgreSQL con Prisma ORM**
- ✅ **Validación robusta de pesos**
- ✅ **Mensajes de feedback elegantes**
- ✅ **Diseño responsive**

## Estructura de la Base de Datos

```sql
-- Tabla de mensajes entrantes por inbox
CREATE TABLE incoming_messages (
    id BIGSERIAL PRIMARY KEY,
    inbox_id INTEGER NOT NULL,
    message_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_inbox_message_text UNIQUE (inbox_id, message_text)
);

-- Tabla de pesos asignados por mensaje y usuario
CREATE TABLE incoming_message_weights (
    id BIGSERIAL PRIMARY KEY,
    id_incoming_message BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    peso INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT fk_incoming_message
        FOREIGN KEY (id_incoming_message)
        REFERENCES incoming_messages (id)
        ON DELETE CASCADE,
    CONSTRAINT unique_message_user UNIQUE (id_incoming_message, user_id)
);
```

**Tablas existentes utilizadas (Chatwoot):**
- `inboxes` - Canales/equipos de atención
- `users` - Información de vendedores
- `inbox_members` - Relación usuarios ↔ inboxes

## Instalación y Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar la base de datos

Edita el archivo `.env` y configura tu conexión a PostgreSQL:

```env
DATABASE_URL="postgres://usuario:password@host:puerto/base_datos"
ADMIN_PASSWORD="tu-contraseña-admin"
JWT_SECRET="tu-secret-jwt-minimo-32-caracteres"
```

**Ejemplo:**
```env
DATABASE_URL="postgres://postgres:mypass@localhost:5432/chatwoot_production"
ADMIN_PASSWORD="admin123"
JWT_SECRET="your-super-secret-jwt-key-here-min-32-chars-long"
```

### 3. Generar cliente de Prisma

```bash
# Generar el cliente de Prisma
npm run db:generate

# (Opcional) Abrir Prisma Studio para ver la base de datos
npm run db:studio
```

**Nota:** Las tablas `incoming_messages` e `incoming_message_weights` deben existir en tu base de datos. Si no existen, créalas con los scripts SQL de arriba.

### 4. Ejecutar la aplicación

```bash
# Modo desarrollo
npm run dev

# O construir y ejecutar en producción
npm run build
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## Flujo de Uso de la Aplicación

### 1. Iniciar Sesión

- Ingresa la contraseña de administrador configurada en `.env`
- La sesión durará 8 horas

### 2. Seleccionar Inbox

- Al cargar la aplicación, verás un dropdown con todos los inboxes disponibles
- Selecciona el inbox con el que deseas trabajar

### 3. Seleccionar Mensaje

- Una vez seleccionado el inbox, aparecerá un segundo dropdown con los mensajes de ese inbox
- Los mensajes están ordenados por fecha (más recientes primero)
- Puedes ver el texto completo del mensaje seleccionado debajo del dropdown

### 4. Asignar Pesos a Vendedores

1. **Vista general**: Se cargarán todos los vendedores del inbox seleccionado
2. **Asignar pesos**:
   - **Haz clic en cualquier tarjeta de vendedor** para abrir el modal de edición
   - **Elige un peso** usando el input numérico o los botones rápidos (0, 3, 6, 10)
   - **Presiona "Guardar"** para confirmar los cambios
   - **O presiona "Cancelar"** o ESC para cerrar sin guardar

3. **Sistema de pesos**:
   - **0**: Sin peso asignado
   - **1-3**: Carga ligera
   - **4-6**: Carga media
   - **7-9**: Carga alta
   - **10+**: Carga máxima

### 5. Visualizar Distribución

- En la columna derecha verás la **distribución de pesos** en tiempo real
- Gráfico de barras con porcentajes por vendedor
- Estadísticas: total de vendedores activos y peso promedio

## Tecnologías Utilizadas

- **Next.js 15** - Framework de React con App Router
- **React 19** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Prisma** - ORM para base de datos
- **PostgreSQL** - Base de datos relacional
- **Tailwind CSS 4** - Framework de estilos
- **JWT** - Autenticación con tokens
- **Docker** - Containerización

## Estructura del Proyecto

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts       # Login con JWT
│   │   │   ├── verify/route.ts      # Verificación de sesión
│   │   │   └── logout/route.ts      # Cerrar sesión
│   │   ├── inboxes/route.ts         # GET inboxes disponibles
│   │   ├── messages/route.ts        # GET mensajes por inbox
│   │   └── vendedores/
│   │       ├── route.ts             # GET vendedores por mensaje
│   │       └── [id]/route.ts        # PUT actualizar peso
│   ├── layout.tsx                   # Layout principal
│   └── page.tsx                     # Página principal
├── components/
│   ├── Header.tsx                   # Header con logout
│   ├── LoginForm.tsx                # Formulario de login
│   ├── InboxSelector.tsx            # Selector de inbox
│   ├── MessageSelector.tsx          # Selector de mensaje
│   ├── VendedorWeightList.tsx       # Lista de vendedores
│   ├── WeightModal.tsx              # Modal para asignar pesos
│   └── WeightDistribution.tsx       # Visualización de distribución
├── contexts/
│   └── AuthContext.tsx              # Context de autenticación
└── lib/
    ├── prisma.ts                    # Cliente de Prisma
    ├── database.ts                  # Funciones de base de datos
    └── auth.ts                      # Utilidades de autenticación
```

## API Endpoints

### Autenticación

- `POST /api/auth/login` - Iniciar sesión
  ```json
  { "password": "admin123" }
  ```

- `GET /api/auth/verify` - Verificar sesión actual
- `POST /api/auth/logout` - Cerrar sesión

### Datos

- `GET /api/inboxes` - Obtener todos los inboxes
  ```json
  [{ "id": 1, "name": "Ventas" }, ...]
  ```

- `GET /api/messages?inbox_id=1` - Obtener mensajes de un inbox
  ```json
  [{ "id": "123", "inbox_id": 1, "message_text": "Hola", "created_at": "..." }, ...]
  ```

- `GET /api/vendedores?message_id=123&inbox_id=1` - Obtener vendedores con pesos
  ```json
  [{ "user_id": "1", "user_name": "Juan", "message_id": "123", "peso": 5 }, ...]
  ```

- `PUT /api/vendedores/[id]` - Actualizar peso de un vendedor
  ```json
  { "peso": 5, "messageId": "123" }
  ```

## Características Técnicas

### Optimistic Updates

La aplicación actualiza la UI inmediatamente al cambiar un peso, sin esperar la respuesta del servidor. Si hay un error, se hace rollback automático.

### Autenticación

- JWT almacenado en cookies httpOnly
- Sesiones de 8 horas
- Verificación automática al cargar la aplicación
- Middleware de autenticación en todas las rutas API

### Performance

- Componentes memoizados con `memo`
- Cálculos optimizados con `useMemo` y `useCallback`
- Queries SQL optimizadas con joins
- Conversión de BigInt a String para JSON

## Despliegue con Docker

### Construcción manual

```bash
# Construir la imagen
docker build -t sottcor-app .

# Ejecutar el contenedor
docker run -p 3000:3000 \
  -e DATABASE_URL="postgres://..." \
  -e ADMIN_PASSWORD="..." \
  -e JWT_SECRET="..." \
  sottcor-app
```

### Con Docker Compose

```bash
# Ejecutar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

### Para EasyPanel

Consulta [EASYPANEL-DEPLOY.md](EASYPANEL-DEPLOY.md) para instrucciones detalladas de despliegue.

## Scripts Disponibles

### Desarrollo
- `npm run dev` - Inicia el servidor de desarrollo con Turbopack
- `npm run build` - Construye la aplicación para producción
- `npm start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter

### Base de datos
- `npm run db:generate` - Genera el cliente de Prisma
- `npm run db:migrate` - Ejecuta migraciones de base de datos (dev)
- `npm run db:studio` - Abre Prisma Studio (GUI)
- `npm run db:push` - Sincroniza el esquema con la base de datos

## Lógica de Negocio

### Flujo de Asignación de Pesos

1. **Usuario selecciona Inbox** → Se cargan los mensajes de ese inbox
2. **Usuario selecciona Mensaje** → Se cargan los vendedores miembros del inbox
3. **Usuario asigna peso a vendedor** → Se guarda en `incoming_message_weights`
4. **Sistema hace UPSERT** → Si existe el registro, actualiza; si no, crea uno nuevo

### Constraints Importantes

- Un mensaje es único por `(inbox_id, message_text)`
- Un peso es único por `(id_incoming_message, user_id)`
- Si se elimina un mensaje, se eliminan sus pesos en cascada
- Los vendedores mostrados son solo los que pertenecen al inbox (tabla `inbox_members`)

## Solución de Problemas

### Error de conexión a la base de datos

- Verifica que PostgreSQL esté ejecutándose
- Comprueba las credenciales en `.env`
- Asegúrate de que la base de datos existe
- Verifica que las tablas `incoming_messages` e `incoming_message_weights` existan

### Error al generar cliente de Prisma

- Ejecuta `npm run db:generate`
- Verifica que el schema de Prisma esté correcto en `prisma/schema.prisma`

### Sesión expirada constantemente

- Verifica que `JWT_SECRET` esté configurado en `.env`
- Asegúrate de que el secret tenga al menos 32 caracteres
- Revisa que las cookies estén habilitadas en tu navegador

### No aparecen mensajes o vendedores

- Verifica que existan datos en `incoming_messages` para el inbox seleccionado
- Confirma que los usuarios estén en `inbox_members` del inbox
- Revisa los logs del servidor con `npm run dev` para ver errores

## Seguridad

- ✅ Contraseñas no hasheadas en JWT (considera usar bcrypt en producción)
- ✅ Cookies httpOnly para prevenir XSS
- ✅ SameSite strict para prevenir CSRF
- ✅ Tokens con expiración de 8 horas
- ✅ Validación de entrada en todas las rutas API
- ✅ Variables de entorno para secretos

## Licencia

Este proyecto es de uso privado.
