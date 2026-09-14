# Apex Mini CRM — User & Production Deployment Manual

Welcome to the **Apex Mini CRM** User and Deployment Manual. This guide provides comprehensive instructions for operating the CRM as an end user and deploying it safely to a production server.

---

# PART 1: USER MANUAL

## 1. Access & Authentication

The CRM enforces JWT (JSON Web Token) authentication to protect company data.

### Logging In
1. Navigate to `http://localhost:3000/login` (or your domain).
2. Enter your work email and password.
3. Default Seed Credentials for testing:
   - **Super Admin (`userRight = 1`)**:
     - Email: `admin@crm.com`
     - Password: `password123`
   - **Sales Agent (`userRight = 0`)**:
     - Email: `agent@crm.com`
     - Password: `password123`

---

## 2. User Rights & Permissions (`userRight`)

The CRM controls features using the `userRight` integer field:

| Role | `userRight` | Privileges |
| :--- | :--- | :--- |
| **Super Admin** | `1` | Full access to Dashboard, Leads, Pipeline, and **User Rights Management** (`/users`). Can create, edit, and delete user accounts. |
| **Normal User** | `0` | Access to Dashboard, Leads, Pipeline, and Lead Details. Cannot access User Management or modify user accounts. |

### Super Admin: Adding New Users
1. Log in as a Super Admin (`admin@crm.com`).
2. Click **User Rights** in the sidebar navigation.
3. Click **Add New User**.
4. Fill in:
   - **Full Name**: e.g., `Maria Garcia`
   - **Work Email**: e.g., `maria@crm.com`
   - **Password**: Minimum 6 characters
   - **User Right Level**: Choose `0 — Normal User` or `1 — Super Admin`
5. Click **Create User**.

---

## 3. Lead Management

### Creating a Lead
1. Click **+ New Lead** in the sidebar or top navigation.
2. Enter Full Name (Required), Company, Email, Phone, Lead Source (Required), and Pipeline Stage (Required).
3. The lead will automatically record **who created the lead** (`createdById`).

### Searching, Filtering & Sorting
1. Navigate to **Leads**.
2. **Search**: Enter name, company, email, or phone in the search bar.
3. **Filter**: Filter by Status (`NEW`, `CONTACTED`, `NEGOTIATING`, `CLOSED`, `LOST`), Source, or Follow-up state (`Overdue`, `Has Upcoming`, `None`).
4. **Sort**: Click column headers to sort by Name, Created Date, or Status.

---

## 4. Follow-ups & Closure Outcome Notes

### Scheduling a Follow-up
1. Open a lead's detail page (`/leads/:id`).
2. Click **Add Follow-up** (or **+ Add** in the Follow-ups card).
3. Select Title, Due Date, Time, Type (`CALL`, `EMAIL`, `MEETING`, `WHATSAPP`, `TASK`), and **Assign To** team member.

### Marking Completed & Recording Outcome Notes
1. On the Lead Details page, find the pending follow-up in the **Follow-ups** list.
2. Click the **Checkbox / Complete icon**.
3. A modal prompt titled **"Close Follow-up & Record Outcome"** will appear asking:
   > *"What happened during this follow-up?"*
4. Type your discussion summary or outcome (e.g., *"Customer requested 10% discount on 50 seats. Agreed to send revised quote."*).
5. Click **Mark Completed**.
6. The outcome note is saved to the completed follow-up card and logged automatically to the **Activity Timeline**.

---

## 5. Sales Pipeline (Kanban Board)

1. Click **Pipeline** in the sidebar.
2. Leads are organized into 4 stage columns: **New Leads**, **Contacted**, **Negotiating**, and **Closed Deals**.
3. **Move Stages**:
   - **Drag and Drop**: Click and drag a lead card into another column.
   - **Dropdown**: Use the quick stage selector on any card.

---

# PART 2: PRODUCTION DEPLOYMENT GUIDE

## 1. Production Architecture Overview

In production, the application is deployed as follows:

```text
[ Client Browser ] ---> ( HTTPS / Port 443 )
                              │
                      [ Nginx Web Server ]
                     /                  \
   Static Build (/dist)            API Proxy (/api)
  React Single Page App         Express Node.js Server (Port 5000)
                                        │
                                [ MySQL Database ]
```

---

## 2. Production Prerequisites

On your Linux server (Ubuntu 22.04 LTS recommended):

```bash
# Update package repositories
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x, Git, MySQL, and Nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs mysql-server nginx git certbot python3-certbot-nginx

# Install PM2 Process Manager globally
sudo npm install -g pm2
```

---

## 3. Production Environment Configuration

Create production `.env` files with secure secrets.

### Backend `.env` (`/server/.env`)
```env
# Production MySQL Database Connection
DATABASE_URL="mysql://crm_user:StrongPassword123!@localhost:3306/mini_crm_prod"

# Server Port
PORT=5000

# Strong Random JWT Secret (Generate with: openssl rand -base64 32)
JWT_SECRET="e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8"

# Environment
NODE_ENV="production"
```

---

## 4. Production Database Setup & Migration

```bash
# Log into MySQL CLI
sudo mysql -u root

# Create Production Database and User
CREATE DATABASE mini_crm_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'crm_user'@'localhost' IDENTIFIED BY 'StrongPassword123!';
GRANT ALL PRIVILEGES ON mini_crm_prod.* TO 'crm_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Deploy Prisma schema and run production seed:

```bash
cd /var/www/mini-crm/server

# Install dependencies
npm install --production=false

# Apply Prisma database migration
npx prisma migrate deploy

# Seed initial Super Admin account
npm run db:seed

# Build TypeScript code
npm run build
```

---

## 5. PM2 Process Management (Backend)

Start the Express backend server with PM2:

```bash
cd /var/www/mini-crm/server

# Start server using PM2
pm2 start dist/server.js --name "mini-crm-api"

# Save PM2 process list to restart on system reboot
pm2 save
pm2 startup
```

---

## 6. Frontend Build

Build the static React assets:

```bash
cd /var/www/mini-crm/client

# Install dependencies
npm install

# Build static bundle
npm run build
```

The compiled files will be located in `/var/www/mini-crm/client/dist`.

---

## 7. Nginx Reverse Proxy & SSL Setup

Create an Nginx configuration file: `/etc/nginx/sites-available/mini-crm`

```nginx
server {
    listen 80;
    server_name crm.yourcompany.com;

    root /var/www/mini-crm/client/dist;
    index index.html;

    # Serve React Frontend Single Page App
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API Requests to Express Server
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/mini-crm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

Obtain Free SSL Certificate (HTTPS):

```bash
sudo certbot --nginx -d crm.yourcompany.com
```

---

## 8. Summary Checklist of Production Changes

| Setting | Development | Production |
| :--- | :--- | :--- |
| `JWT_SECRET` | Simple default string | 64-character random string (`openssl rand -base64 32`) |
| Database | `localhost:3306/mini_crm` | Dedicated `mini_crm_prod` with restricted user privileges |
| CORS | `origin: '*'` | Restrict to your domain `https://crm.yourcompany.com` |
| Server Execution | `tsx watch` | Compiled JS (`dist/server.js`) via PM2 |
| SSL / Transport | HTTP | HTTPS via Nginx + Let's Encrypt SSL |
