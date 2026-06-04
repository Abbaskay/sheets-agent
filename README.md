# sheets-agent

Excel Sheet Agent — AI spreadsheet generation and editing with Handsontable grid, CSV upload, and toolbar formatting.

## Overview

This repository contains both the backend and frontend for the **Excel Sheet Agent** — one of the five agents in the Hyperzod multi-agent AI content suite.

### Tech Stack
- **Backend**: Laravel (PHP)
- **Frontend**: Vue 3 + Vite
- **AI Integration**: Dify (DeepSeek model)
- **Auth**: JWT-based SSO via Super Agent
- **Database**: SQLite

### Project Structure
```
sheets-agent/
├── excel-agent-backend/              # Laravel backend
│   ├── app/
│   ├── config/
│   ├── routes/
│   ├── database/
│   └── ...
├── excel-agent-frontend/              # Vue 3 frontend
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   ├── services/
│   │   └── store/
│   ├── vite.config.js
│   └── ...
├── shared/              # Shared components (LoginModal, auth utils)
└── README.md
```

## Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+
- npm
- SQLite

## Setup

### 1. Backend

```bash
cd excel-agent-backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve --port=8004
```

### 2. Frontend

```bash
cd excel-agent-frontend
npm install
npm run dev
```

## Auth / SSO

This agent uses JWT-based SSO via the **Super Agent**. Login is handled through the Super Agent frontend which redirects here with a signed JWT cookie.

| Credential | Value |
|------------|-------|
| Login URL | http://localhost:5173 |
| Email | admin@superagent.com |
| Password | admin123 |

### JWT Configuration

All agents share the same JWT secret:

```
JWT_SECRET=super-agent-shared-secret-change-in-production
JWT_COOKIE=super_agent_token
```

## Ports

| Service  | Port |
|----------|------|
| Backend  | 8004 |
| Frontend | 5177 |

## Dify Configuration

Set the following in `.env`:

```
DIFY_API_URL=http://localhost/v1/workflows/run
```

## Agent Suite

The Excel Sheet Agent is part of a 5-agent suite:

| Agent | Backend | Frontend |
|-------|---------|----------|
| Super Agent | :8000 | :5173 |
| Doc Agent | :8002 | :5174 |
| Slides Agent | :8003 | :5175 |
| Fact-Check Agent | :8001 | :5176 |
| Excel Sheet Agent | :8004 | :5177 |
