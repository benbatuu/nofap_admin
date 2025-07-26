# Database Setup Guide

This project uses Prisma with PostgreSQL for database management. Follow these steps to set up your database.

## Prerequisites

1. **PostgreSQL Database**: You need a PostgreSQL database running. You can use:
   - Local PostgreSQL installation
   - Docker container
   - Cloud services like Supabase, Railway, or Neon

2. **Environment Variables**: Create a `.env` file in the root directory with:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
   ```

## Quick Setup

Run the complete setup with one command:
```bash
npm run db:setup
```

This will:
1. Generate Prisma client
2. Push schema to database
3. Seed the database with sample data

## Manual Setup Steps

If you prefer to run each step manually:

### 1. Generate Prisma Client
```bash
npm run db:generate
```

### 2. Push Schema to Database
```bash
npm run db:push
```

### 3. Seed Database with Sample Data
```bash
npm run db:seed
```

## Database Schema

The database includes the following models:

### Core Models
- **User**: User accounts with profiles, preferences, and status
- **Message**: Support messages and feedback from users
- **Task**: User tasks with categories, difficulty levels, and completion status
- **Activity**: System activity logs and user actions

### Admin Models
- **Role**: User roles with permissions
- **Permission**: System permissions for access control
- **BlockedUser**: Blocked user accounts with reasons and duration
- **BlockedIP**: Blocked IP addresses for security

### Business Models
- **Product**: Available products and subscriptions
- **BillingLog**: Payment transactions and billing history
- **Notification**: System notifications and campaigns

## Sample Data

The seed script creates:
- 10 sample users with different statuses and premium levels
- Various messages (support, feedback, bug reports)
- Tasks across different categories and difficulty levels
- Notifications for different user groups
- Billing logs with different payment statuses
- Products (subscriptions and one-time purchases)
- Roles and permissions for admin access
- Activity logs for system monitoring

## API Endpoints

After setup, you'll have access to these API endpoints:

### Users
- `GET /api/users` - List users with filtering
- `POST /api/users` - Create new user
- `GET /api/users/[id]` - Get user details
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### Messages
- `GET /api/messages` - List messages with filtering
- `POST /api/messages` - Create new message

### Tasks
- `GET /api/tasks` - List tasks with filtering
- `POST /api/tasks` - Create new task

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/activities` - Recent activities
- `GET /api/dashboard/system-status` - System status
- `GET /api/dashboard/monthly-stats` - Monthly statistics

### Admin
- `GET /api/roles` - List roles
- `POST /api/roles` - Create role
- `GET /api/permissions` - List permissions
- `POST /api/permissions` - Create permission

### Business
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/billing` - List billing logs
- `POST /api/billing` - Create billing log
- `GET /api/notifications` - List notifications
- `POST /api/notifications` - Create notification

## Services Architecture

The project uses a service layer architecture:

### Service Classes
- **UserService**: User management operations
- **MessageService**: Message handling
- **TaskService**: Task management
- **NotificationService**: Notification system
- **BillingService**: Payment and billing
- **ProductService**: Product management
- **RoleService**: Role management
- **PermissionService**: Permission management
- **ActivityService**: Activity logging
- **BlockedUserService**: User blocking
- **BlockedIPService**: IP blocking
- **DashboardService**: Dashboard data aggregation

### Features
- **CRUD Operations**: Full Create, Read, Update, Delete for all models
- **Filtering & Pagination**: Advanced filtering and pagination support
- **Search**: Text search across relevant fields
- **Statistics**: Comprehensive statistics and analytics
- **Relationships**: Proper foreign key relationships and joins
- **Type Safety**: Full TypeScript support with Prisma types

## Development

### Database Changes
1. Modify `prisma/schema.prisma`
2. Run `npm run db:push` to apply changes
3. Update seed data if needed
4. Run `npm run db:seed` to refresh sample data

### Adding New Models
1. Add model to schema
2. Create service class in `lib/services/`
3. Add API routes in `app/api/`
4. Update seed data
5. Export service from `lib/services/index.ts`

## Troubleshooting

### Common Issues

1. **Connection Error**: Check your DATABASE_URL in .env file
2. **Permission Denied**: Ensure your database user has proper permissions
3. **Schema Sync Issues**: Run `npm run db:push` to sync schema
4. **Seed Errors**: Check for unique constraint violations in seed data

### Reset Database
To completely reset your database:
```bash
npx prisma db push --force-reset
npm run db:seed
```

## Production Deployment

1. Set up production PostgreSQL database
2. Update DATABASE_URL environment variable
3. Run migrations: `npx prisma db push`
4. Optionally seed with production data
5. Generate client: `npm run db:generate`

The database is now fully configured and ready for development!