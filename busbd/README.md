# BusBD — Advanced Bus Reservation System

A modern, full-stack bus reservation website for Bangladesh with real-time seat selection, waiting lists, admin panel, and 3D bus visualization.

## Features
- ✅ User registration & JWT authentication (Passenger & Admin roles)
- ✅ Real-time seat selection with interactive 40-seat map
- ✅ Multiple bus types: Regular, AC, Sleeper
- ✅ Waiting list with automatic promotion
- ✅ Digital tickets with print support
- ✅ Full admin panel (buses, trips, bookings, seats, users, revenue, settings)
- ✅ Dark/Light mode with smooth transitions
- ✅ 3D interactive bus with color customization
- ✅ Responsive design for mobile, tablet, and desktop
- ✅ Framer Motion animations throughout
- ✅ Recharts analytics dashboard
- ✅ Database transactions to prevent double-booking
- ✅ Rate limiting, security headers, request logging

## Tech Stack
- **Frontend:** React 18, Vite 5, Tailwind CSS 3, React Router 6, Axios, Framer Motion 11, Three.js, @react-three/fiber, Recharts
- **Backend:** Node.js, Express 4, Prisma ORM, SQLite, JWT, bcryptjs, Zod
- **Database:** SQLite (via Prisma)

## Installation & Run

### Windows PowerShell:
```powershell
cd busbd\backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```
Then in a second terminal:
```powershell
cd busbd\frontend
npm install
npm run dev
```

### macOS / Linux:
```bash
cd busbd/backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```
Then in a second terminal:
```bash
cd busbd/frontend
npm install
npm run dev
```

### Open:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## Demo Logins

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@busbd.com | Admin@12345 |
| Passenger | passenger@busbd.com | Passenger@12345 |

## API Endpoints

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user
- `POST /api/auth/logout` — Logout

### Buses & Search
- `GET /api/buses` — List active buses (with query filters)
- `GET /api/buses/filters` — Get filter options
- `GET /api/buses/:id` — Get bus by ID
- `GET /api/buses/:id/seats?date=YYYY-MM-DD` — Get seat map for date
- `GET /api/routes/popular` — Popular routes

### Bookings
- `POST /api/bookings` — Create booking
- `GET /api/bookings/my` — My bookings
- `GET /api/bookings/:id` — Get booking by ID
- `DELETE /api/bookings/:id` — Cancel booking
- `GET /api/bookings/:id/ticket` — Get ticket data

### Waiting List
- `POST /api/waitlist` — Join waiting list
- `GET /api/waitlist/my` — My waiting list entries
- `GET /api/waitlist/:tripId` — Waiting list for trip
- `DELETE /api/waitlist/:id` — Leave waiting list

### Admin
- `GET /api/admin/dashboard` — Dashboard stats
- `GET/POST/PUT/DELETE /api/admin/buses` — Bus CRUD
- `GET/POST/DELETE /api/admin/trips` — Trip management
- `GET/DELETE /api/admin/bookings` — Booking management
- `GET/PUT /api/admin/users` — User management
- `GET/POST/DELETE /api/admin/waitlist` — Waiting list management
- `POST/DELETE /api/admin/buses/:id/seats/block` — Seat blocking
- `PUT /api/admin/buses/:id/seats/:seatNumber/type` — Change seat type
- `GET /api/admin/revenue` — Revenue analytics
- `GET/PUT /api/admin/settings` — Site settings

## Folder Structure
```
busbd/
  backend/
    prisma/
      schema.prisma
      seed.js
    src/
      server.js
      app.js
      config/env.js, db.js
      middleware/auth.js, adminOnly.js, errorHandler.js, validate.js
      routes/authRoutes.js, busRoutes.js, bookingRoutes.js, waitlistRoutes.js, adminRoutes.js
      controllers/*.js
      services/*.js
      utils/jwt.js, password.js, bookingCode.js, apiResponse.js, dateValidation.js
  frontend/
    src/
      main.jsx, App.jsx, index.css
      api/axios.js, authApi.js, busApi.js, bookingApi.js, waitlistApi.js, adminApi.js
      context/AuthContext.jsx, ThemeContext.jsx, ToastContext.jsx
      hooks/useAuth.js, useDebounce.js, useLocalStorage.js
      components/*.jsx
      pages/*.jsx
      utils/formatCurrency.js, formatDate.js, formatTime.js, seatHelpers.js, validation.js
```

## Reset Database
```bash
cd backend
npx prisma migrate reset
npm run seed
```

## Troubleshooting
- **Port already in use:** Kill the process or change PORT in `backend/.env`
- **Prisma migration error:** Run `npx prisma migrate reset` then `npm run seed`
- **CORS errors:** Ensure frontend runs on port 5173 and backend CORS_ORIGIN matches
- **Images not loading:** All images have fallbacks; check internet connection
- **3D bus not showing:** WebGL may be unavailable; a static image fallback is shown automatically

## Note
All payments are **demo-only**. No real money is charged.
