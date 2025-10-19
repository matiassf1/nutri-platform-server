# 🌱 Seeder de Recetas - Plataforma de Nutrición

Este directorio contiene los archivos necesarios para poblar la base de datos con datos de ejemplo, incluyendo recetas, usuarios y métricas.

## 📁 Archivos del Seeder

### `seed.ts`

Seeder principal que crea:

- 1 usuario nutricionista profesional
- 1 usuario paciente
- 8 recetas completas con ingredientes y información nutricional
- 3 métricas de ejemplo para el paciente

### `seed-recipes.ts`

Archivo modular que contiene:

- Datos de 8 recetas con información nutricional completa
- Función `seedRecipes()` reutilizable
- Ingredientes detallados para cada receta
- Información nutricional (calorías, proteínas, carbohidratos, grasas, etc.)

### `seed-recipes-only.ts`

Seeder específico para solo recetas:

- Busca un nutricionista existente o crea uno temporal
- Ejecuta solo el seed de recetas
- Ideal para agregar recetas a una base de datos existente

### `test-connection.ts`

Script simple para verificar la conexión a la base de datos.

### `simple-seed.ts`

Seeder básico para testing de conexión.

## 🚀 Scripts Disponibles

### Scripts de Base de Datos

```bash
# Generar cliente de Prisma
npm run db:generate

# Sincronizar schema con la base de datos
npm run db:push

# Ejecutar migraciones
npm run db:migrate

# Abrir Prisma Studio (interfaz visual)
npm run db:studio
```

### Scripts de Seeder

```bash
# Seeder completo (usuarios + recetas + métricas)
npm run db:seed

# Solo verificar conexión a la base de datos
npm run db:seed:test

# Seeder simple para testing
npm run db:seed:simple

# Solo recetas (busca nutricionista existente o crea uno temporal)
npm run db:seed:recipes
```

## 📊 Datos Incluidos

### Usuarios

- **Nutricionista**: Dr. María González (PRO)
  - Email: nutritionist@example.com
  - Password: password123
  - Especialización: Nutrición Deportiva
  - 8 años de experiencia

- **Paciente**: Ana Martínez (USER)
  - Email: patient@example.com
  - Password: password123
  - Asignada al nutricionista

### Recetas (8 recetas completas)

1. **Ensalada César Saludable** - Ensalada con pollo y aderezo casero
2. **Salmón al Horno con Vegetales** - Pescado con vegetales de temporada
3. **Quinoa con Pollo y Vegetales** - Bowl nutritivo con tahini
4. **Smoothie Verde Energético** - Desayuno con proteína
5. **Pasta Integral con Atún y Tomates** - Pasta con pescado fresco
6. **Ensalada de Garbanzos y Aguacate** - Vegetariana con grasas saludables
7. **Pechuga de Pollo a la Plancha** - Proteína con especias mediterráneas
8. **Bowl de Avena con Frutas y Nueces** - Desayuno con fibra

### Información Nutricional

Cada receta incluye:

- Calorías por porción
- Proteínas, carbohidratos y grasas
- Fibra y azúcar
- Sodio y colesterol
- Lista completa de ingredientes
- Tiempo de preparación y cocción
- Dificultad (EASY, MEDIUM, HARD)
- Tags y alérgenos

### Métricas de Ejemplo

- Peso inicial: 68.5 kg
- Peso actual: 67.8 kg
- IMC: 24.2 kg/m²

## 🔧 Uso de los Scripts

### 1. Configurar la Base de Datos

```bash
# Copiar archivo de configuración
copy env.example .env

# Editar .env con tu configuración de base de datos
DATABASE_URL="postgresql://user:password@localhost:5432/nutrition_platform"
```

### 2. Ejecutar Seeder Completo

```bash
# Ejecutar seeder completo (recomendado para primera vez)
npm run db:seed
```

### 3. Solo Agregar Recetas

```bash
# Si ya tienes usuarios y solo quieres agregar recetas
npm run db:seed:recipes
```

### 4. Verificar Conexión

```bash
# Probar conexión a la base de datos
npm run db:seed:test
```

### 5. Testing Básico

```bash
# Seeder simple para testing
npm run db:seed:simple
```

## 🎯 Casos de Uso

### Desarrollo Inicial

```bash
# 1. Configurar base de datos
npm run db:push

# 2. Ejecutar seeder completo
npm run db:seed

# 3. Verificar datos
npm run db:studio
```

### Agregar Más Recetas

```bash
# 1. Editar seed-recipes.ts con nuevas recetas
# 2. Ejecutar solo el seeder de recetas
npm run db:seed:recipes
```

### Testing de Conexión

```bash
# Verificar que la base de datos funciona
npm run db:seed:test
```

## 🔧 Personalización

### Agregar Nuevas Recetas

1. Editar `seed-recipes.ts`
2. Agregar datos de receta al array `recipeSeedData`
3. Ejecutar `npm run db:seed:recipes`

### Modificar Usuarios

1. Editar `seed.ts`
2. Cambiar datos de usuarios en la sección correspondiente
3. Ejecutar `npm run db:seed`

### Agregar Métricas

1. Editar `seed.ts`
2. Agregar datos al array `metricsData`
3. Ejecutar `npm run db:seed`

## 🐛 Solución de Problemas

### Error de Conexión

- Verificar que PostgreSQL esté ejecutándose
- Comprobar la URL de conexión en `.env`
- Ejecutar `npm run db:push` para sincronizar el schema

### Error de Permisos

- En Windows, ejecutar PowerShell como administrador
- Verificar permisos de escritura en la carpeta del proyecto

### Error de Prisma Client

- Ejecutar `npm run db:generate` para regenerar el cliente
- Verificar que el schema esté actualizado

### Error de Duplicados

- Los seeders usan `upsert` para evitar duplicados
- Se pueden ejecutar múltiples veces sin problemas

## 📝 Notas Importantes

- El seeder usa `upsert` para evitar duplicados
- Las contraseñas se hashean con bcrypt
- Las imágenes usan URLs de Unsplash
- Los datos son de ejemplo y no deben usarse en producción
- El seeder es idempotente (se puede ejecutar múltiples veces)

## 🎯 Flujo de Trabajo Recomendado

### Para Desarrollo

1. `npm run db:push` - Sincronizar schema
2. `npm run db:seed` - Poblar con datos de ejemplo
3. `npm run db:studio` - Verificar datos
4. Desarrollo de features
5. `npm run db:seed:recipes` - Agregar más recetas si es necesario

### Para Testing

1. `npm run db:seed:test` - Verificar conexión
2. `npm run db:seed:simple` - Testing básico
3. Tests automatizados

### Para Producción

1. Configurar base de datos de producción
2. Crear seeder de datos de producción
3. Implementar validación de datos
4. Backup antes de ejecutar seeders
