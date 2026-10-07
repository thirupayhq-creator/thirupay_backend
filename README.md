# TIRU PAY - Backend API

Production-ready Payment Gateway Platform Backend built with **Express 5**, **TypeScript**, **Prisma ORM**, **PostgreSQL**, and **Cashfree Payment Gateway Integration**, structured with **Vertical Slice Architecture**.

---

## 🏛️ Architecture: Vertical Slice Architecture

Unlike traditional horizontal layered architectures where code is segregated by technical concerns (`controllers/`, `services/`, `routes/`, `schemas/`), TIRU PAY organizes code around **business domains & feature slices**:

```
src/
├── core/                         # Cross-cutting infrastructure & utilities
│   ├── config/                   # Typed environment, Database & Logger
│   │   ├── database.ts           # Prisma client, health checks & lifecycle
│   │   ├── env.ts                # Validated environment configuration
│   │   └── logger.ts             # Structured logging
│   ├── middleware/               # Centralized Express middlewares
│   │   ├── auth.middleware.ts    # JWT authentication & RBAC
│   │   ├── error.middleware.ts   # Global error handler (Prisma, Zod, HTTP)
│   │   ├── rate-limit.middleware.ts # IP rate limiters
│   │   └── validation.middleware.ts # Zod schema validation middleware
│   ├── utils/                    # Shared cryptographic & response utilities
│   │   ├── hmac.ts               # Cashfree HMAC-SHA256 signature verifier
│   │   ├── idempotency.ts        # Idempotency key validator & generator
│   │   ├── jwt.ts                # Token sign & verify
│   │   ├── password.ts           # Bcrypt hashing & comparing
│   │   └── response.ts           # Standard API response formatting
│   └── types/                    # Core TypeScript definitions & Express augmentation
│
├── modules/                      # Independent Vertical Slices
│   ├── auth/                     # Authentication Slice (Register, Login, Me)
│   │   ├── auth.controller.ts
│   │   ├── auth.routes.ts
│   │   ├── auth.schema.ts
│   │   ├── auth.service.ts
│   │   └── index.ts
│   │
│   ├── merchant/                 # Merchant Management Slice
│   │   ├── merchant.controller.ts
│   │   ├── merchant.routes.ts
│   │   ├── merchant.schema.ts
│   │   ├── merchant.service.ts
│   │   └── index.ts
│   │
│   ├── kyc/                      # KYC Verification Slice
│   │   ├── kyc.controller.ts
│   │   ├── kyc.routes.ts
│   │   ├── kyc.service.ts
│   │   └── index.ts
│   │
│   ├── payment/                  # Payment Processing & Cashfree Integration Slice
│   │   ├── providers/            # Payment Providers (Cashfree PG & Mock)
│   │   │   ├── cashfree.provider.ts
│   │   │   ├── mock-payment.provider.ts
│   │   │   ├── payment-provider.interface.ts
│   │   │   └── index.ts
│   │   ├── payment.controller.ts
│   │   ├── payment.routes.ts
│   │   ├── payment.schema.ts
│   │   ├── payment.service.ts
│   │   └── index.ts
│   │
│   ├── refund/                   # Refunds Slice (Cashfree refund API)
│   │   ├── refund.controller.ts
│   │   ├── refund.routes.ts
│   │   ├── refund.schema.ts
│   │   ├── refund.service.ts
│   │   └── index.ts
│   │
│   ├── payout/                   # Payouts Slice
│   │   ├── payout.controller.ts
│   │   ├── payout.routes.ts
│   │   ├── payout.schema.ts
│   │   ├── payout.service.ts
│   │   └── index.ts
│   │
│   └── webhook/                  # Cashfree Webhooks Slice
│       ├── cashfree-webhook.verifier.ts
│       ├── webhook.controller.ts
│       ├── webhook.routes.ts
│       └── index.ts
│
├── app.ts                        # Express application configuration
└── server.ts                     # HTTP server startup & graceful shutdown
```

---

## 🗄️ Database Setup (PostgreSQL + Prisma)

### 1. Set `DATABASE_URL` in `.env`
Provide your PostgreSQL connection string in `.env`:

```env
# Local PostgreSQL:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tiru_pay?schema=public"

# Remote PostgreSQL (Neon / Supabase / Railway / AWS RDS):
DATABASE_URL="postgresql://user:password@host.cloud.com/dbname?sslmode=require"
```

### 2. Run Database Migration / Push
Push the schema to create or sync your tables:

```bash
# Push schema directly to your new database:
npm run db:push

# Or run Prisma migrations:
npm run db:migrate
```

### 3. Test Database Connection
Run the diagnostic script to verify your connection and check table status:

```bash
npm run db:test
```

---

## 💳 Cashfree Payment Gateway Integration

Supports both **Sandbox (Test)** and **Production (Live)** environments seamlessly.

### 1. Configuration in `.env`
```env
# Mode: 'sandbox' (Test) or 'production' (Live)
CASHFREE_ENV="sandbox"

# Credentials from Cashfree Dashboard -> Developers -> API Keys
CASHFREE_CLIENT_ID="TEST..."
CASHFREE_CLIENT_SECRET="..."

# Webhook secret from Cashfree Dashboard -> Developers -> Webhooks
CASHFREE_WEBHOOK_SECRET="..."

# Provider selection: CASHFREE or MOCK
PAYMENT_PROVIDER="CASHFREE"
```

### 2. Verify Cashfree Credentials
Run the standalone test script to test your Cashfree API keys and create a test order:

```bash
npm run cashfree:test
```

### 3. Payment Flow
1. **Frontend / Client** calls `POST /api/v1/payments` with `{ orderId, amount, customerPhone, customerEmail, ... }`.
2. Backend calls Cashfree PG API (`POST /orders`) to create order and receive `payment_session_id`.
3. Backend records payment in PostgreSQL with status `PENDING` and returns `paymentSessionId`.
4. **Client** opens Cashfree Checkout SDK using the `paymentSessionId`.
5. **Cashfree Webhook** notifies `POST /api/v1/webhooks/payment` when payment completes.
6. Backend verifies webhook signature using HMAC-SHA256 (`x-webhook-timestamp` + raw body) and updates payment status in PostgreSQL to `SUCCESS`.

---

## 📡 API Endpoints

### Health & Diagnostics
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API status and architecture info |
| `GET` | `/health` | Server and PostgreSQL health check |
| `GET` | `/api/v1/health` | Diagnostic health endpoint |

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | Public | Register merchant user (supports business, bank & KYC fields) |
| `POST` | `/register-merchant` | Public | Full merchant registration wizard endpoint |
| `POST` | `/login` | Public | Login & receive JWT Bearer token |
| `GET` | `/me` | Bearer | Fetch current user, merchant profile, and KYC status |

### Merchants (`/api/v1/merchants`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/onboard` | Bearer | Onboard/update merchant business and bank account details |
| `POST` | `/` | Bearer | Alias for merchant onboarding |
| `GET` | `/me` | Bearer | Get current merchant profile, bank details & KYC status |
| `GET` | `/profile` | Bearer | Alias for merchant profile |
| `GET` | `/public/:id` | Public | Get public merchant info for checkout / pay links |
| `GET` | `/` | Admin | List all merchants (paginated) |
| `PATCH`| `/:id/status`| Admin | Update merchant status (ACTIVE, SUSPENDED, REJECTED) |

### KYC (`/api/v1/kyc`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/submit` | Bearer | Submit merchant KYC documentation (PAN, Identity, Incorporation, Directors) |
| `GET` | `/status` | Bearer | Get KYC verification status and submitted documents |
| `GET` | `/pending` | Admin | List pending KYC verifications with merchant details |
| `GET` | `/:id` | Admin | Get specific KYC document details by ID |
| `GET` | `/` | Admin | List all KYC records with optional status filter |
| `POST` | `/verify` | Admin | Approve or reject KYC verification (activates merchant) |


### Payments (`/api/v1/payments`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/` | Bearer | Create payment & Cashfree checkout session |
| `GET` | `/` | Bearer | List merchant payments (paginated) |
| `GET` | `/:id` | Bearer | Get payment details by ID |
| `POST` | `/:id/verify` | Bearer | Verify payment status with Cashfree |

### Refunds (`/api/v1`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/payments/:id/refund` | Bearer | Initiate refund for payment via Cashfree |
| `POST` | `/refunds` | Bearer | Alternative refund endpoint |
| `GET` | `/refunds/:id` | Bearer | Get refund details |
| `GET` | `/refunds` | Bearer | List merchant refunds |

### Payouts (`/api/v1/payouts`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/` | Bearer | Initiate payout |
| `GET` | `/` | Bearer | List merchant payouts |
| `GET` | `/:id` | Bearer | Get payout details |

### Webhooks (`/api/v1/webhooks`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/payment` | Public (Signed) | Cashfree Webhook listener |
| `POST` | `/cashfree` | Public (Signed) | Alias Cashfree Webhook endpoint |

---

## 🚀 Running the Project

```bash
# 1. Install dependencies
npm install

# 2. Check TypeScript types
npm run build

# 3. Test Database Connection
npm run db:test

# 4. Start Development Server (with hot reloading)
npm run dev

# 5. Start Production Server
npm start
```
