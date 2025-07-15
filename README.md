# Tachles.dev - Company Website & Backoffice

A modern, full-stack web application that serves as both a professional landing page for Tachles.dev development services and a comprehensive backoffice system for managing products, clients, and business operations.

## 🚀 Features

### Landing Page
- **Ultra-modern design** with animated gradients and glass morphism effects
- **Responsive layout** that works perfectly on all devices
- **Professional showcase** of development services and portfolio
- **High-performance** animations using Framer Motion
- **SEO optimized** for better search visibility

### Backoffice Dashboard
- **Product Management** - Track all your products and services
- **Client Management** - Comprehensive CRM for client relationships
- **Payment Integration** - Secure payment processing with Payplus
- **Webhook Security** - Enterprise-grade webhook handling with crypto verification
- **Real-time Updates** - Live notifications and status updates
- **Role-based Access** - Different permission levels for team members

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Framer Motion animations
- **UI Components**: shadcn/ui, Radix UI
- **Authentication**: Clerk (with role-based access)
- **Database**: PostgreSQL with Prisma ORM
- **Payments**: Payplus integration (your existing implementation)
- **Security**: Built-in crypto for webhook verification
- **Deployment**: Vercel ready

## 📁 Project Structure

```
├── app/
│   ├── page.tsx                 # Landing page
│   ├── dashboard/
│   │   ├── layout.tsx          # Dashboard layout with Clerk
│   │   └── page.tsx            # Main dashboard
│   ├── api/
│   │   └── webhooks/
│   │       └── payplus/
│   │           └── route.ts    # Secure webhook handler
│   └── globals.css             # Global styles with animations
├── components/
│   ├── ui/                     # shadcn/ui components
│   └── [other components]
├── lib/
│   ├── payments/
│   │   └── payplus-facade.ts   # Payment service facade
│   ├── services/
│   │   ├── client-service.ts   # Client management
│   │   ├── product-service.ts  # Product management
│   │   └── ticket-service.ts   # Support tickets
│   ├── prisma.ts              # Database client
│   └── utils.ts               # Utility functions
└── prisma/
    └── schema.prisma          # Database schema
```

## 🗄️ Database Schema

The system includes comprehensive models for:

- **Users** - Team members with role-based permissions
- **Clients** - Your development clients and their information
- **Products** - Products and services with status tracking
- **Tickets** - Support and feature requests
- **Payments** - Financial transactions and billing
- **WebhookLogs** - Security and audit logging

## 🔧 Setup Instructions

### 1. Clone and Install
```bash
git clone <repository>
cd didi-tech-web
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env` and configure:

```env
# Database
TACHLES_OFFICE_POSTGRES_URL="postgresql://..."

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Payplus Integration
PAYPLUS_API_URL="https://api.payplus.co.il"
PAYPLUS_API_KEY="your_api_key"
PAYPLUS_WEBHOOK_SECRET="your_webhook_secret"
```

### 3. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run migrations (when you're ready)
npx prisma db push
```

### 4. Development
```bash
npm run dev
```

Visit:
- **Landing page**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard

## 💳 Payment Integration

The system includes a facade pattern for your Payplus implementation:

### PayplusFacade
- Wraps your existing payment logic
- Handles payment creation and status updates
- Maintains database synchronization

### Webhook Security
- HMAC-SHA256 signature verification
- Comprehensive logging
- Automatic payment status updates
- Built with Node.js crypto (no external dependencies)

## 🔐 Security Features

- **Webhook Verification**: Cryptographic signature validation
- **Authentication**: Clerk-based user management
- **Database Security**: Parameterized queries via Prisma
- **Environment Variables**: Secure configuration management

## 🎨 Design System

- **Color Palette**: Purple and cyan gradients for modern tech aesthetic
- **Animations**: Smooth, professional animations with Framer Motion
- **Typography**: Clean, readable fonts with proper hierarchy
- **Components**: Consistent UI components via shadcn/ui

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full dashboard experience
- **Tablet**: Adapted layouts and navigation
- **Mobile**: Touch-optimized interface

## 🚀 Deployment

The application is ready for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## 🔄 Development Workflow

1. **Landing Page Updates**: Modify `app/page.tsx` for service offerings
2. **Dashboard Features**: Add new pages in `app/dashboard/`
3. **API Endpoints**: Create new routes in `app/api/`
4. **Database Changes**: Update `prisma/schema.prisma` and run migrations

## 🎯 Business Use Cases

### For Tachles.dev:
- **Client Acquisition**: Professional landing page to attract new clients
- **Product Management**: Track all products and services in one place
- **Financial Tracking**: Monitor payments and revenue
- **Client Communication**: Integrated ticket system for support

### For Your Clients:
- **Transparency**: Real-time product and service status updates
- **Professional Image**: High-quality landing page builds trust
- **Efficient Communication**: Structured ticket system
- **Secure Payments**: Reliable payment processing

## 📞 Support

For questions about the implementation or customization needs, the codebase is well-documented and follows industry best practices for maintainability and scalability.

---

**Built with ❤️ for Tachles.dev - Practical Apps, Real Results**
