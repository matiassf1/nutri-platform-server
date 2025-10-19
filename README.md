# 🥗 Nutrition Platform Backend

A comprehensive NestJS + Prisma backend API for a nutrition platform that connects nutritionists with patients, enabling personalized meal planning, progress tracking, and professional communication.

---

## 🚀 Quick Start

```bash
# Clone and setup
git clone <repository-url>
cd server
cp .env.example .env

# Start with Docker (recommended)
docker-compose up -d

# Or start locally
npm install
npm run db:migrate   # run migrations (alias to prisma migrate deploy / dev)
npm run start:dev
```

**API documentation (Swagger)**: `http://localhost:3000/api/docs`

---

## ✨ Key Features

* **Authentication & Security**

  * JWT access + refresh tokens
  * Role-based access control (USER, PRO, ADMIN)
  * Rate limiting (throttling)
  * Input validation and structured error handling
  * Security headers (Helmet)

* **User & Patient Management**

  * Multi-role users (regular, nutritionist PRO, admin)
  * Profile management and invitations
  * Patient assignment and medical history (PRO)

* **Recipes & Nutrition**

  * Recipe CRUD with ingredients and nutrition facts
  * Macro/micronutrient analysis
  * Categories, filtering and bulk operations

* **Meal Planning**

  * Weekly plans, templates and patient-specific plans
  * Meal status tracking (planned, completed, skipped)

* **Progress & Analytics**

  * Track progress metrics over time
  * Reports and dashboards for nutritionists

* **Communication & Files**

  * Real-time messaging and notifications
  * Email (SendGrid / SES) templates
  * File uploads to S3 with presigned URLs

---

## 🛠️ Tech Stack

| Layer      | Tech                | Purpose                          |
| ---------- | ------------------- | -------------------------------- |
| Backend    | NestJS + TypeScript | API framework                    |
| ORM        | Prisma              | Database access & migrations     |
| DB         | PostgreSQL          | Persistent storage               |
| Auth       | JWT + Passport      | Authentication                   |
| Validation | class-validator     | DTO validation                   |
| Docs       | Swagger / OpenAPI   | API docs                         |
| Storage    | AWS S3 + Multer     | File storage                     |
| Email      | SendGrid / SES      | Email delivery                   |
| Cache      | Redis               | Caching, sessions, rate-limiting |
| DevOps     | Docker & Compose    | Local reproducible environments  |

---

## ⚙️ Prerequisites

**Required**

* Node.js 18+ (LTS recommended)
* PostgreSQL 13+ (or compatible)
* Redis (optional but recommended for caching/session)

**Optional**

* Docker & Docker Compose
* AWS account for S3
* SendGrid / SES account for email

---

## 🚀 Installation

### Using Docker (recommended)

```bash
# 1. clone
git clone <repository-url>
cd server
cp .env.example .env
# edit .env if needed

docker-compose up -d --build
```

This starts the app, PostgreSQL and Redis (if included in `docker-compose`).

### Manual (local services)

```bash
npm install
cp .env.example .env
# update .env with your DB credentials

# run migrations and generate client
npm run db:migrate
npm run db:generate

# (optional) seed data
npm run db:seed

# development server
npm run start:dev
```

### Production

```bash
npm run build
npm run start:prod
```

---

## 📚 API Documentation

* **Swagger UI** — `http://localhost:3000/api/docs`
* **Health check** — `http://localhost:3000/health`
* **OpenAPI JSON** — `http://localhost:3000/api/docs-json`

---

## ⚙️ Environment Variables

Create `.env` from `.env.example` and fill the required values.

**Required**

* `DATABASE_URL` — PostgreSQL connection string (e.g. `postgresql://user:pass@host:5432/dbname`)
* `JWT_SECRET` — Access token secret (use strong, 32+ char random value)
* `JWT_REFRESH_SECRET` — Refresh token secret (32+ chars)

**Common / Optional**

* `JWT_EXPIRES_IN` (default `15m`)
* `JWT_REFRESH_EXPIRES_IN` (default `7d`)
* `REDIS_URL` (e.g. `redis://localhost:6379`)
* `PORT` (default `3000`)
* `NODE_ENV` (`development`|`production`)
* `FRONTEND_URL` (for CORS)

**AWS S3**

* `AWS_ACCESS_KEY_ID`
* `AWS_SECRET_ACCESS_KEY`
* `AWS_S3_BUCKET`
* `AWS_REGION` (default `us-east-1`)

**Email (SendGrid / SES)**

* `SENDGRID_API_KEY` or SES credentials
* `FROM_EMAIL`
* `FROM_NAME`

---

## 🔗 Core API Endpoints (examples)

> Auth

| Method | Path             | Description                            | Auth |
| -----: | ---------------- | -------------------------------------- | :--: |
|   POST | `/auth/register` | Register new user                      |   ❌  |
|   POST | `/auth/login`    | Login (returns access + refresh token) |   ❌  |
|   POST | `/auth/refresh`  | Refresh access token                   |   ❌  |
|   POST | `/auth/logout`   | Revoke refresh token                   |   ✅  |
|    GET | `/auth/profile`  | Get current user                       |   ✅  |

> Users / Profiles

| Method | Path              | Description             | Role |
| -----: | ----------------- | ----------------------- | :--: |
|    GET | `/users/profile`  | Get own profile         | USER |
|    PUT | `/users/profile`  | Update own profile      | USER |
|    GET | `/users/patients` | Nutritionist's patients |  PRO |

> Recipes

| Method | Path           | Description                      | Role |
| -----: | -------------- | -------------------------------- | :--: |
|    GET | `/recipes`     | List recipes (filters supported) | USER |
|   POST | `/recipes`     | Create recipe                    |  PRO |
|    GET | `/recipes/:id` | Get recipe detail                | USER |
|  PATCH | `/recipes/:id` | Update recipe                    |  PRO |
| DELETE | `/recipes/:id` | Delete recipe                    |  PRO |

> Plans

| Method | Path                                  | Description        | Role |
| -----: | ------------------------------------- | ------------------ | :--: |
|    GET | `/plans`                              | List plans         | USER |
|   POST | `/plans`                              | Create plan        |  PRO |
|  PATCH | `/plans/:planId/meals/:mealId/status` | Update meal status | USER |

(Full list is available in Swagger)

---

## 🗄️ Database & Prisma

* Prisma is used for schema management and queries (`schema.prisma`).
* Migrations are tracked with Prisma migrate.
* Generate the Prisma client after schema changes: `npm run db:generate`.

**Example scripts** (in `package.json`)

```json
{
  "scripts": {
    "db:migrate": "prisma migrate deploy",
    "db:generate": "prisma generate",
    "db:seed": "prisma db seed",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main.js",
    "build": "nest build"
  }
}
```

---

## 🛠️ Development Workflow

1. Create a feature branch
2. Implement and test locally
3. Run migrations and update Prisma client
4. Lint, format and add tests
5. Open a PR and request reviews

---

## 🔒 Security Considerations

* Use strong, rotated secrets for JWT and DB credentials.
* Limit file upload sizes and validate mime types.
* Use HTTPS in production and properly configure CORS.
* Store refresh tokens securely (HTTP-only cookies recommended).

---

## 🤝 Contributing

Please follow the CONTRIBUTING guidelines in the repo.

1. Fork the repo
2. Create a branch
3. Add tests for your changes
4. Ensure linting and tests pass
5. Submit a PR with a clear description

---

## 📄 License

MIT — see the `LICENSE` file.

---

**Built with ❤️ by the Nutrition Platform Team**
