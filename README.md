# Arun Quotations — Interior Designer Quotation Management System

> A cross-platform (Web + Mobile) professional quotation management application built for interior designers and architects.

---

## 📋 Project Overview

**Arun Quotations** is a full-stack SaaS application that empowers interior designers to create, manage, and share professional quotations with clients. The system features an Excel-like pricing editor, area-wise (room-wise) cost breakdowns, dynamic PDF generation with company branding, and a responsive layout that adapts between mobile and desktop.

### The Problem It Solves
Interior designers typically rely on Excel spreadsheets or generic invoicing tools to create quotations — leading to inconsistent formatting, manual calculation errors, and unprofessional client presentations. Arun Quotations solves this by providing a purpose-built platform with:

- **Area-wise pricing structure** (Kitchen, Bedroom, Living Room, etc.)
- **Auto-calculating line items** (quantity × rate = amount)
- **Professional branded PDFs** with company logo, colors, and terms
- **Live PDF preview** while editing quotations
- **Material library** for quick item insertion with pre-set pricing
- **Client database** for managing customer information

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────┐
│          Universal Frontend (Expo)           │
│    React Native + Expo Router + TypeScript   │
│    ┌─────────────┐  ┌───────────────────┐   │
│    │  📱 Mobile   │  │  🖥️ Web (Browser) │   │
│    │  Bottom Tabs │  │  Left Sidebar     │   │
│    └──────┬───────┘  └────────┬──────────┘   │
│           │    Shared Code    │              │
│           └────────┬──────────┘              │
└────────────────────┼────────────────────────┘
                     │ REST API (Axios + JWT)
┌────────────────────┼────────────────────────┐
│          Backend (Node.js + Express)         │
│    ┌───────────┐ ┌──────────┐ ┌──────────┐  │
│    │ Auth (JWT) │ │ CRUD API │ │ PDF Gen  │  │
│    └───────────┘ └──────────┘ └──────────┘  │
└────────────────────┼────────────────────────┘
                     │ Mongoose ODM
┌────────────────────┼────────────────────────┐
│            MongoDB Database                  │
│  Users | Clients | Materials | Quotations    │
│  CompanyProfiles                             │
└──────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|:------|:-----------|:--------|
| **Frontend** | React Native + Expo SDK 52 | Universal UI for web & mobile |
| **Routing** | Expo Router (file-based) | Navigation and deep linking |
| **Language** | TypeScript | Type-safe development |
| **State** | Zustand | Lightweight global state |
| **Server Cache** | TanStack Query | Data fetching & caching |
| **HTTP** | Axios | API communication |
| **Backend** | Node.js + Express.js | REST API server |
| **Database** | MongoDB + Mongoose | Document storage & ODM |
| **Auth** | JWT + bcryptjs | Token-based authentication |
| **PDF** | expo-print | Cross-platform PDF generation |
| **Icons** | @expo/vector-icons (Ionicons) | UI iconography |
| **Security** | Helmet + CORS | HTTP security headers |

---

## 📱 Responsive Layout Design

The app uses a **single codebase** with adaptive layouts:

| Platform | Layout | Navigation |
|:---------|:-------|:-----------|
| **Mobile** (< 768px) | Top header + Bottom tab bar | Tab navigator at bottom |
| **Desktop** (≥ 1024px) | Left sidebar + Right content | Fixed sidebar navigation |
| **Quotation Editor (Desktop)** | Left: Editor panel, Right: PDF preview | Split-panel view |
| **Quotation Editor (Mobile)** | Full-screen editor with Preview button | Stacked layout |

---

## 🗄️ Database Schema

### 5 Core Collections

1. **Users** — Designer accounts with hashed passwords
2. **CompanyProfiles** — Branding (logo, colors, address, T&C) linked per user
3. **Clients** — Client database per designer
4. **Materials** — Material library with categories, units, and pricing
5. **Quotations** — Full quotation documents with nested areas → items

### Quotation Data Structure
```
Quotation
├── quotationNumber: "AQ-2026-001"
├── clientId → Client
├── status: draft | sent | approved | rejected | revised
├── areas: [
│   ├── areaName: "Master Bedroom"
│   ├── items: [
│   │   ├── description, unit, quantity, unitPrice, amount
│   │   └── materialId → Material (optional)
│   │ ]
│   └── subtotal
│ ]
├── subtotal → discountAmount → taxAmount → grandTotal
└── termsAndConditions, notes, pdfUrl
```

---

## ✨ Key Features

### 1. Excel-Like Pricing Editor
- Inline cell editing — click any field to edit
- Auto-calculation: `amount = quantity × rate`
- Add/remove rows with single tap
- Desktop: spreadsheet-style table rows
- Mobile: card-based items with Qty × Rate = Amount

### 2. Area-Wise (Room-Wise) Structure
- Add rooms: Master Bedroom, Kitchen, Living Room, etc.
- Each room has its own item table with subtotal
- Collapsible sections for large quotations
- Pre-built room templates for quick setup

### 3. Pricing Summary
- Editable discount percentage
- Configurable GST rate (5%, 12%, 18%, 28%, custom)
- Real-time grand total calculation
- Gold-bordered premium summary card

### 4. Material Library
- Categorized materials (Plywood, Laminate, Hardware, etc.)
- Quick search and filter by category
- Brand and unit price tracking
- Quick-insert materials into quotation line items

### 5. Client Management
- Full client database per designer
- Project association per client
- Avatar with initials
- Quick contact info display

### 6. PDF Generation & Branding
- Company logo in header
- Custom primary color for headings
- Area-wise breakdown tables
- Terms & conditions section
- Custom footer text
- Professional layout suitable for client presentations

### 7. Dashboard
- Stats: Total quotations, approved, pending, revenue
- Quick action buttons (mobile)
- Recent quotations list with status badges
- Responsive grid layout

---

## 🔐 Default Login Credentials

| Field | Value |
|:------|:------|
| **Email** | `arun@demo.com` |
| **Password** | `demo123` |

> Run `node seed.js` from the `backend/` directory to populate the database with the default user, 5 sample clients, and 15 sample materials.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm

### Backend Setup
```bash
cd backend
npm install
# Edit .env with your MongoDB URI
node seed.js        # Seed default data
npm run dev         # Start on port 5000
```

### Frontend Setup
```bash
cd mobile
npm install
npx expo start --web    # Web browser
npx expo start          # Mobile (Expo Go)
```

---

## 📁 Project Structure

```
Arun_quotations/
├── mobile/                        # Expo universal app
│   ├── src/
│   │   ├── app/                   # File-based routes
│   │   │   ├── (auth)/            # Login, Register
│   │   │   └── (main)/            # Dashboard, Quotations, etc.
│   │   │       ├── (tabs)/        # Tab screens
│   │   │       └── quotation/     # Quotation CRUD screens
│   │   ├── components/            # UI + Layout components
│   │   ├── features/              # Business logic (stores, hooks)
│   │   └── lib/                   # Theme, API, constants
│   └── app.json
│
├── backend/                       # Express API
│   ├── models/                    # Mongoose schemas
│   ├── controllers/               # Business logic
│   ├── routes/                    # API endpoints
│   ├── middleware/                 # Auth, error handling
│   ├── seed.js                    # Database seeder
│   └── server.js                  # Entry point
│
└── README.md
```

---

## 🔮 Future Roadmap

| Phase | Feature | Description |
|:------|:--------|:------------|
| **Phase 7** | Live PDF Preview | Side-by-side PDF rendering while editing |
| **Phase 8** | Dashboard Charts | Revenue analytics with Chart.js |
| **v2.0** | Client Portal | Clients can view/approve/reject quotations |
| **v2.0** | WhatsApp Sharing | Share PDF quotations via WhatsApp |
| **v2.5** | AI Material Suggestions | AI-powered material recommendations |
| **v2.5** | Template Library | Pre-built quotation templates by project type |
| **v3.0** | Multi-Team | Multiple designers per company account |
| **v3.0** | Invoicing | Convert approved quotations to invoices |

---

## 📄 API Endpoints

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Login + get JWT |
| GET | `/api/auth/me` | Get current user |
| GET/POST | `/api/clients` | List / Create clients |
| GET/PUT/DELETE | `/api/clients/:id` | Single client CRUD |
| GET/POST | `/api/materials` | List / Create materials |
| GET/PUT/DELETE | `/api/materials/:id` | Single material CRUD |
| GET/POST | `/api/quotations` | List / Create quotations |
| GET/PUT/DELETE | `/api/quotations/:id` | Single quotation CRUD |
| PATCH | `/api/quotations/:id/status` | Update status only |

---

*Built with ❤️ for interior designers by Arun Quotations Team*
