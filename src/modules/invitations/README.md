# Sistema de Invitaciones de Pacientes

Este módulo implementa un sistema seguro de invitaciones para pacientes con tokens temporales y validación de seguridad.

## 🔐 Características de Seguridad

- **Tokens únicos**: Cada invitación genera un token criptográficamente seguro
- **Expiración temporal**: Las invitaciones expiran en 7 días
- **Validación de estado**: Solo se pueden usar invitaciones pendientes
- **Prevención de duplicados**: No se pueden crear múltiples invitaciones para el mismo email
- **Auditoría completa**: Registro de todas las acciones de invitación

## 📊 Modelo de Datos

### PatientInvitation

```typescript
{
  id: string;                // ID único de la invitación
  token: string;             // Token único para validación
  email: string;             // Email del paciente
  patientName: string;       // Nombre del paciente
  nutritionistId: string;    // ID del nutricionista
  nutritionistName: string;  // Nombre del nutricionista
  personalMessage?: string;  // Mensaje personal opcional
  status: InvitationStatus;  // Estado de la invitación
  expiresAt: DateTime;       // Fecha de expiración
  acceptedAt?: DateTime;     // Fecha de aceptación
  createdAt: DateTime;       // Fecha de creación
  updatedAt: DateTime;       // Fecha de actualización
}
```

### Estados de Invitación

- `PENDING`: Invitación pendiente de aceptación
- `ACCEPTED`: Invitación aceptada
- `EXPIRED`: Invitación expirada
- `CANCELLED`: Invitación cancelada

## 🛠️ Endpoints Disponibles

### 1. Crear Invitación

```http
POST /invitations
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "patient@example.com",
  "patientName": "Juan Pérez",
  "personalMessage": "¡Hola! Me gustaría trabajar contigo en tu plan nutricional."
}
```

### 2. Validar Invitación (Público)

```http
GET /invitations/validate/{token}
```

### 3. Aceptar Invitación

```http
POST /invitations/accept/{token}
Authorization: Bearer <token>
```

### 4. Obtener Invitaciones del Nutricionista

```http
GET /invitations
Authorization: Bearer <token>
```

### 5. Cancelar Invitación

```http
DELETE /invitations/{id}
Authorization: Bearer <token>
```

## 🔄 Flujo de Invitación

### 1. Creación de Invitación

1. El nutricionista crea una invitación con el email del paciente
2. Se genera un token único y seguro
3. Se establece una fecha de expiración (7 días)
4. Se envía un email con el enlace de invitación
5. Se registra la invitación en la base de datos

### 2. Validación de Invitación

1. El paciente accede al enlace de invitación
2. El frontend valida el token con el endpoint público
3. Se verifica que la invitación esté pendiente y no haya expirado
4. Se muestran los detalles de la invitación al paciente

### 3. Aceptación de Invitación

1. El paciente se registra o inicia sesión
2. Se acepta la invitación con el token
3. Se crea la relación paciente-nutricionista
4. Se marca la invitación como aceptada
5. Se registra la fecha de aceptación

## 🛡️ Validaciones de Seguridad

### Validaciones del Servicio

- **Email único**: No se pueden crear múltiples invitaciones pendientes para el mismo email
- **Token único**: Cada token es único y no se puede duplicar
- **Expiración**: Las invitaciones expiran automáticamente después de 7 días
- **Estado válido**: Solo se pueden usar invitaciones en estado PENDING
- **Propiedad**: Solo el nutricionista que creó la invitación puede cancelarla

### Validaciones del Guard

- **Token requerido**: Se debe proporcionar un token válido
- **Invitación existente**: El token debe corresponder a una invitación válida
- **Estado pendiente**: La invitación debe estar en estado PENDING
- **No expirada**: La invitación no debe haber expirado

## 📧 Integración con Email

El sistema se integra con el módulo de mensajería para enviar emails de invitación:

```typescript
await this.emailService.sendPatientInvitationEmail(
  email,
  patientName,
  nutritionistName,
  invitationUrl,
  personalMessage
);
```

## 🔧 Configuración

### Variables de Entorno

```env
# URL del frontend para enlaces de invitación
FRONTEND_URL=https://nutriteam.com

# Configuración de email (ya configurada)
NODEMAILER_HOST=smtp.gmail.com
NODEMAILER_PORT=587
NODEMAILER_ENCRYPTION=tls
NODEMAILER_AUTH_USER=your-email@gmail.com
NODEMAILER_AUTH_PASS=your-app-password
NODEMAILER_SENDER_NAME=NutriTeam
NODEMAILER_SENDER_MAIL=noreply@nutriteam.com
```

## 📝 Uso en el Frontend

### Validar Invitación

```typescript
const validateInvitation = async (token: string) => {
  const response = await fetch(`/api/invitations/validate/${token}`);
  const data = await response.json();
  return data;
};
```

### Aceptar Invitación

```typescript
const acceptInvitation = async (token: string) => {
  const response = await fetch(`/api/invitations/accept/${token}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  return data;
};
```

## 🚨 Manejo de Errores

### Errores Comunes

- `400 Bad Request`: Datos de entrada inválidos
- `404 Not Found`: Invitación no encontrada
- `409 Conflict`: Ya existe una invitación pendiente para este email
- `410 Gone`: Invitación expirada
- `403 Forbidden`: Invitación ya utilizada o cancelada

### Logging

El sistema registra todas las operaciones importantes:

- Creación de invitaciones
- Envío de emails
- Validaciones de tokens
- Aceptaciones de invitaciones
- Cancelaciones de invitaciones

## 🔮 Mejoras Futuras

- [ ] Notificaciones push para invitaciones
- [ ] Reenvío de invitaciones expiradas
- [ ] Límites de invitaciones por nutricionista
- [ ] Plantillas de mensajes personalizables
- [ ] Analytics de conversión de invitaciones
- [ ] Integración con sistemas de CRM
