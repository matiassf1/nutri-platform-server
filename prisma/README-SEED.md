# Seeds de la Base de Datos

Este directorio contiene los scripts de seed para poblar la base de datos con datos de prueba.

## 🚀 Comandos Disponibles

### Seed Principal (Recomendado)

```bash
npm run db:seed
```

Este es el seed unificado que crea:
- ✅ 1 nutricionista profesional
- ✅ 10 pacientes con diferentes estados (ACTIVE, INACTIVE, PENDING)
- ✅ 8 recetas con ingredientes y valores nutricionales
- ✅ 4 plantillas de planes (sin asignar)
- ✅ 3 planes asignados a pacientes
- ✅ Métricas de ejemplo (peso, IMC, grasa corporal)
- ✅ Citas pasadas (completadas) y futuras (programadas)

### Otros Seeds

| Comando | Descripción |
|---------|-------------|
| `npm run db:seed:old` | Seed original (1 nutricionista, 1 paciente) |
| `npm run db:seed:simple` | Seed simplificado |
| `npm run db:seed:recipes` | Solo recetas |
| `npm run db:seed:test` | Test de conexión a la base de datos |

## 🔑 Credenciales de Prueba

### Nutricionista
- **Email:** `nutritionist@example.com`
- **Password:** `password123`
- **Rol:** PRO

### Pacientes (10 usuarios)
| Email | Nombre | Estado |
|-------|--------|--------|
| ana.martinez@example.com | Ana Martínez | ACTIVE |
| carlos.lopez@example.com | Carlos López | ACTIVE |
| maria.garcia@example.com | María García | ACTIVE |
| pedro.sanchez@example.com | Pedro Sánchez | ACTIVE |
| laura.fernandez@example.com | Laura Fernández | ACTIVE |
| diego.rodriguez@example.com | Diego Rodríguez | INACTIVE |
| sofia.ruiz@example.com | Sofía Ruiz | ACTIVE |
| andres.torres@example.com | Andrés Torres | PENDING |
| valentina.castro@example.com | Valentina Castro | ACTIVE |
| nicolas.moreno@example.com | Nicolás Moreno | ACTIVE |

**Password para todos:** `password123`

## 📋 Datos Incluidos

### Recetas
8 recetas variadas con información nutricional completa:
- Ensalada César Saludable
- Salmón al Horno con Vegetales
- Quinoa con Pollo y Vegetales
- Smoothie Verde Energético
- Pasta Integral con Atún
- Bowl de Avena con Frutas
- Ensalada de Garbanzos
- Pollo a la Plancha con Especias

### Planes
- **Plantillas (DRAFT):** Plan Pérdida de Peso, Plan Ganancia Muscular, Plan Control Diabetes, Plan Vegetariano Completo
- **Planes Asignados (ACTIVE):** Planes personalizados para los primeros 3 pacientes activos

### Métricas
Para cada paciente activo:
- 3 registros de peso (progresión de 30 días)
- 1 registro de IMC
- 1 registro de % grasa corporal

### Citas
- 1 cita completada (pasada) por cada paciente no-pendiente
- 1 cita programada (futura) por cada paciente activo

## 🔄 Ejecución Segura

El seed utiliza `upsert` para usuarios y pacientes, evitando duplicados si se ejecuta múltiples veces.

```bash
# Ejecutar después de hacer cambios en el schema
npm run db:push
npm run db:seed
```

## 🧹 Reset Completo

Para un reset completo de la base de datos:

```bash
# Opción 1: Reset con migración
npm run db:migrate -- --name reset

# Opción 2: Push forzado (elimina datos)
npx prisma db push --force-reset
npm run db:seed
```

⚠️ **Advertencia:** Esto eliminará todos los datos existentes.
