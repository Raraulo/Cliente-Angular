# Cliente Angular

Frontend desarrollado con **Angular** para una tienda en línea de productos para mascotas. La aplicación consume una API REST para ofrecer autenticación, navegación por categorías, carrito de compras, facturación y un módulo administrativo con reportes.

---

## Table of Contents

- Overview
- Features
- Technology Stack
- Application Structure
- API Integration
- Installation
- Development
- Production Build
- Deployment
- Application Routes
- Project Structure
- Configuration Notes
- Available Scripts
- Author

---

# Overview

Cliente Angular es una aplicación web diseñada para la gestión de una tienda de productos para mascotas. Proporciona una interfaz moderna para clientes y administradores, integrándose con un backend mediante una API REST.

---

# Features

## Customer Features

- User authentication
- Product catalog
- Category navigation
- Shopping cart
- Checkout process
- Invoice generation
- Purchase history
- User profile

### Available Categories

- Dogs
- Cats
- Fish
- Birds
- Small Pets
- Farm Animals
- Veterinary Medicine

## Administrative Features

- Product management
- Invoice management
- Invoice details
- Sales reports
- Inventory reports
- Customer reports
- Stock statistics

---

# Technology Stack

| Category | Technology |
|-----------|------------|
| Framework | Angular 19 |
| CLI | Angular CLI 19.2.15 |
| Language | TypeScript 5.7 |
| Styling | Tailwind CSS |
| Charts | Chart.js / ng2-charts |
| Alerts | SweetAlert2 |
| Authentication | JWT |

---

# API Integration

The application consumes a REST API deployed on Render.

```text
https://servidor-go.onrender.com/api
```

### Main Endpoints

```http
/login
/user
/producto
/categoria
/animal
/factura
/factura/mias
/factura/compra

/catalogo/mas-vendidos

/reportes/stock-disponible
/reportes/top-clientes
/reportes/top-productos
/reportes/valor-stock
/reportes/total-recaudado
/reportes/total-vendido
/reportes/ventas-por-dia-2026
/reportes/bajo-stock
```

---

# Installation

Clone the repository.

```bash
git clone <repository-url>
```

Install dependencies.

```bash
npm install
```

---

# Development

Run the development server.

```bash
npm start
```

or

```bash
ng serve
```

Open the application in your browser.

```text
http://localhost:4200
```

---

# Production Build

Generate the production build.

```bash
npm run build
```

Build output:

```text
dist/cliente-app
```

---

# Deployment

The project can be deployed on any static hosting service such as:

- Vercel
- Netlify
- Firebase Hosting

Typical deployment process:

```bash
npm install
npm run build
```

For Vercel:

| Setting | Value |
|----------|-------|
| Framework | Angular |
| Build Command | npm run build |
| Output Directory | dist/cliente-app/browser |

---

# Application Routes

| Route | Description |
|--------|-------------|
| / | Home |
| /login | Login |
| /perfil | User Profile |
| /perros | Dogs |
| /gatos | Cats |
| /peces | Fish |
| /aves | Birds |
| /pequenos | Small Pets |
| /granja | Farm Animals |
| /medicina | Veterinary Medicine |
| /usuario/finalizar-compra | Checkout |
| /usuario/mis-compras | Purchase History |
| /admin/productos | Product Administration |
| /admin/facturas | Invoice Administration |
| /admin/facturas/:id | Invoice Details |
| /admin/reportes | Administrative Reports |

---

# Project Structure

```text
src/
└── app/
    ├── components/
    ├── models/
    ├── pages/
    ├── services/
    ├── app.routes.ts
    └── app.config.ts
```

---

# Configuration Notes

- JWT authentication is used for protected endpoints.
- Authentication tokens are stored in localStorage.
- An HTTP interceptor automatically includes the Authorization header.
- The shopping cart is persisted in localStorage.
- Administrative modules require administrator privileges.
- The backend must allow CORS for the frontend domain.
- API endpoints can be configured by updating the corresponding Angular services.

---

# Available Scripts

| Command | Description |
|----------|-------------|
| npm start | Starts the development server |
| npm run build | Generates the production build |
| npm run watch | Watches for file changes |
| npm test | Runs unit tests using Karma |

---

# Author

Angular frontend developed for a pet supplies e-commerce platform with integration to a RESTful backend API.
