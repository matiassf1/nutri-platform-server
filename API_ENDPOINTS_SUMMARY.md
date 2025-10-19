# 📋 Resumen de Endpoints API - NutriPlan Backend

## 🚀 Estado de Implementación

✅ **COMPLETADO** - Todos los endpoints requeridos por el frontend han sido implementados y están listos para la integración.

## 🔐 Autenticación (`/auth`)

| Método | Endpoint         | Descripción             | Estado          |
| ------ | ---------------- | ----------------------- | --------------- |
| POST   | `/auth/login`    | Login de usuario        | ✅ Implementado |
| POST   | `/auth/register` | Registro de usuario     | ✅ Implementado |
| POST   | `/auth/logout`   | Logout de usuario       | ✅ Implementado |
| POST   | `/auth/profile`  | Obtener perfil actual   | ✅ Implementado |
| POST   | `/auth/refresh`  | Renovar token de acceso | ✅ Implementado |

## 👥 Usuarios (`/users`)

| Método | Endpoint                       | Descripción                         | Estado          |
| ------ | ------------------------------ | ----------------------------------- | --------------- |
| GET    | `/users/profile`               | Obtener perfil del usuario          | ✅ Implementado |
| PUT    | `/users/profile`               | Actualizar perfil básico            | ✅ Implementado |
| PUT    | `/users/profile/details`       | Actualizar detalles del perfil      | ✅ Implementado |
| GET    | `/users/patients`              | Obtener pacientes del nutricionista | ✅ Implementado |
| GET    | `/users/patients/:id`          | Obtener paciente por ID             | ✅ Implementado |
| PUT    | `/users/patients/:id/assign`   | Asignar paciente                    | ✅ Implementado |
| PUT    | `/users/patients/:id/unassign` | Desasignar paciente                 | ✅ Implementado |

## 🍽️ Recetas (`/recipes`)

| Método | Endpoint             | Descripción                        | Estado          |
| ------ | -------------------- | ---------------------------------- | --------------- |
| GET    | `/recipes`           | Listar recetas con filtros         | ✅ Implementado |
| GET    | `/recipes/stats`     | Estadísticas de recetas            | ✅ Implementado |
| GET    | `/recipes/item-keys` | Búsqueda de recetas (autocomplete) | ✅ **NUEVO**    |
| GET    | `/recipes/:id`       | Obtener receta por ID              | ✅ Implementado |
| POST   | `/recipes`           | Crear nueva receta                 | ✅ Implementado |
| PATCH  | `/recipes/:id`       | Actualizar receta                  | ✅ Implementado |
| DELETE | `/recipes/:id`       | Eliminar receta                    | ✅ Implementado |

## 📋 Planes (`/plans`)

| Método | Endpoint                              | Descripción                 | Estado          |
| ------ | ------------------------------------- | --------------------------- | --------------- |
| GET    | `/plans`                              | Listar planes con filtros   | ✅ Implementado |
| GET    | `/plans/:id`                          | Obtener plan por ID         | ✅ Implementado |
| POST   | `/plans`                              | Crear nuevo plan            | ✅ Implementado |
| PATCH  | `/plans/:id`                          | Actualizar plan             | ✅ Implementado |
| DELETE | `/plans/:id`                          | Eliminar plan               | ✅ Implementado |
| PATCH  | `/plans/:planId/meals/:mealId/status` | Actualizar estado de comida | ✅ Implementado |

## 👤 Pacientes (`/patients`)

| Método | Endpoint        | Descripción                  | Estado          |
| ------ | --------------- | ---------------------------- | --------------- |
| GET    | `/patients`     | Listar pacientes con filtros | ✅ Implementado |
| GET    | `/patients/:id` | Obtener paciente por ID      | ✅ Implementado |
| POST   | `/patients`     | Crear nuevo paciente         | ✅ Implementado |
| PATCH  | `/patients/:id` | Actualizar paciente          | ✅ Implementado |
| DELETE | `/patients/:id` | Eliminar paciente            | ✅ Implementado |

## 📊 Métricas (`/metrics`)

| Método | Endpoint                    | Descripción                 | Estado          |
| ------ | --------------------------- | --------------------------- | --------------- |
| GET    | `/metrics`                  | Listar métricas con filtros | ✅ Implementado |
| POST   | `/metrics`                  | Crear nueva métrica         | ✅ Implementado |
| GET    | `/metrics/stats/:patientId` | Estadísticas del paciente   | ✅ Implementado |

## 📁 Archivos (`/files`)

| Método | Endpoint         | Descripción                     | Estado          |
| ------ | ---------------- | ------------------------------- | --------------- |
| POST   | `/files/upload`  | Subir archivo                   | ✅ Implementado |
| POST   | `/files/presign` | Generar URL presignada          | ✅ Implementado |
| GET    | `/files/:id`     | Obtener información del archivo | ✅ Implementado |

## 💬 Mensajes (`/messages`)

| Método | Endpoint                 | Descripción                    | Estado          |
| ------ | ------------------------ | ------------------------------ | --------------- |
| GET    | `/messages`              | Listar mensajes con filtros    | ✅ Implementado |
| POST   | `/messages`              | Enviar mensaje                 | ✅ Implementado |
| PATCH  | `/messages/:id/read`     | Marcar mensaje como leído      | ✅ Implementado |
| GET    | `/messages/unread-count` | Contador de mensajes no leídos | ✅ Implementado |

## 🔔 Notificaciones (`/notifications`)

| Método | Endpoint                    | Descripción  | Estado          |
| ------ | --------------------------- | ------------ | --------------- |
| POST   | `/notifications/send-email` | Enviar email | ✅ Implementado |

## 🏥 Health Check (`/health`)

| Método | Endpoint  | Descripción        | Estado          |
| ------ | --------- | ------------------ | --------------- |
| GET    | `/health` | Estado del sistema | ✅ Implementado |

## 📊 Formato de Respuestas

### Respuesta Estándar

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}
```

### Respuesta Paginada

```typescript
interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}
```

## 🔐 Autenticación y Autorización

- **JWT Tokens**: Access token (24h) + Refresh token (7d)
- **Guards**: JwtAuthGuard, RolesGuard
- **Roles**: USER, PRO, ADMIN
- **Decoradores**: @Public(), @Roles(), @CurrentUser()

## 📝 Características Implementadas

✅ **Autenticación JWT completa**
✅ **Sistema de roles y permisos**
✅ **Paginación consistente en todos los listados**
✅ **Validación de datos con DTOs**
✅ **Documentación Swagger completa**
✅ **Manejo de errores estandarizado**
✅ **Logging estructurado**
✅ **Rate limiting**
✅ **CORS configurado**
✅ **Compresión de respuestas**
✅ **Seguridad con Helmet**

## 🚀 Próximos Pasos

1. **Iniciar el servidor**: `npm run start:dev`
2. **Verificar documentación**: http://localhost:3000/api/docs
3. **Probar endpoints** con el frontend
4. **Configurar variables de entorno** según necesidad

## 📋 Variables de Entorno Requeridas

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nutriplan"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
JWT_REFRESH_EXPIRES_IN="7d"

# App
PORT=3000
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
```

---

**🎉 El backend está completamente implementado y listo para la integración con el frontend React!**
