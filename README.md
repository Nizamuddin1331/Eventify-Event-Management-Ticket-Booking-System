# 🎫 Eventify — Event Management & Ticket Booking System

A full-stack, production-grade event management and ticket booking platform built with React.js, Node.js, Express, and MongoDB.

---

## 📁 Project Structure

```
eventify/
├── backend/                   # Node.js + Express API
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js  # Auth logic
│   │   ├── eventController.js # Event CRUD
│   │   ├── bookingController.js # Booking + payments
│   │   ├── adminController.js # Admin operations
│   │   ├── organizerController.js
│   │   └── reviewController.js
│   ├── middleware/
│   │   ├── auth.js            # JWT protect + authorize
│   │   ├── upload.js          # Multer image upload
│   │   └── errorHandler.js    # Global error handler
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Event.js           # Event schema
│   │   ├── Booking.js         # Booking schema
│   │   └── Review.js          # Review schema
│   ├── routes/
│   │   ├── auth.js
│   │   ├── events.js
│   │   ├── bookings.js
│   │   ├── payments.js
│   │   ├── admin.js
│   │   ├── organizer.js
│   │   ├── reviews.js
│   │   └── users.js
│   ├── utils/
│   │   ├── email.js           # Nodemailer email sender
│   │   ├── qrcode.js          # QR code generator
│   │   └── seeder.js          # Database seeder
│   ├── uploads/               # Uploaded images (auto-created)
│   ├── .env.example
│   ├── package.json
│   └── server.js              # Entry point
│
└── frontend/                  # React.js app
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   └── common/
    │   │       ├── Navbar.js
    │   │       ├── Footer.js
    │   │       ├── Spinner.js
    │   │       └── EventCard.js
    │   ├── context/
    │   │   └── AuthContext.js  # Global auth state
    │   ├── pages/
    │   │   ├── Home.js
    │   │   ├── Events.js
    │   │   ├── EventDetail.js
    │   │   ├── Login.js        # Also exports Register
    │   │   ├── Register.js
    │   │   ├── Profile.js
    │   │   ├── BookingPage.js
    │   │   ├── BookingConfirm.js
    │   │   ├── MyBookings.js
    │   │   ├── AdminDashboard.js
    │   │   ├── OrganizerDashboard.js
    │   │   ├── CreateEvent.js  # Also exports EditEvent
    │   │   ├── EditEvent.js
    │   │   └── NotFound.js
    │   ├── services/
    │   │   └── api.js          # Axios API layer
    │   ├── App.js              # Routes + guards
    │   └── index.js
    ├── tailwind.config.js
    └── package.json
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

---

### Backend Setup

```bash
# 1. Navigate to backend
cd eventify/backend

# 2. Install dependencies
npm install

# 3. Copy and configure environment variables
cp .env.example .env
# Edit .env with your values:
#   MONGO_URI=mongodb://localhost:27017/eventify
#   JWT_SECRET=your_super_secret_key_here
#   SMTP_USER=your_email@gmail.com (optional)
#   SMTP_PASS=your_gmail_app_password (optional)

# 4. Seed the database with sample data
npm run seed

# 5. Start development server
npm run dev
# → Server runs on http://localhost:5000
```

---

### Frontend Setup

```bash
# 1. Navigate to frontend
cd eventify/frontend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# REACT_APP_API_URL=http://localhost:5000/api

# 4. Start development server
npm start
# → App runs on http://localhost:3000
```

---

### Test Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@eventify.com | Admin@123 |
| Organizer | alice@eventify.com | Alice@123 |
| Organizer | bob@eventify.com | Bob@123 |
| User | charlie@eventify.com | Charlie@123 |

---

## 🗄️ Database Schema Design

### User Schema
```
User {
  name, email (unique), password (hashed),
  role: ['user' | 'organizer' | 'admin'],
  avatar, phone, bio,
  wishlist: [EventId],
  isActive: Boolean,
  timestamps
}
```

### Event Schema
```
Event {
  title, description, organizer (→User),
  category: [music|sports|tech|food|art|business|education|health|other],
  date, endDate, time,
  location: { venue, address, city, state, country, coordinates },
  price, totalSeats, bookedSeats, availableSeats (computed),
  images: [urls], tags: [strings],
  status: [draft|published|cancelled|completed],
  isFeatured, averageRating, numReviews,
  virtual: isSoldOut,
  indexes: text(title, description, tags), compound(date, category, price)
}
```

### Booking Schema
```
Booking {
  bookingId (auto UUID: "EVT-XXXXXXXX"),
  user (→User), event (→Event),
  seats: Number (1-10),
  seatNumbers: [e.g. "A1", "A2"],
  totalAmount,
  status: [pending|confirmed|cancelled|refunded],
  payment: { method, transactionId, status, paidAt },
  qrCode (base64), ticketUrl,
  checkedIn, checkedInAt,
  cancellationReason
}
```

### Review Schema
```
Review {
  event (→Event), user (→User),
  rating: 1-5, comment,
  unique index on (event, user) — one review per user per event,
  post-save hook: recalculates event.averageRating
}
```

---

## 📡 REST API Documentation

### Base URL: `http://localhost:5000/api`

---

### 🔐 Auth Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login + get JWT |
| GET | `/auth/me` | Yes | Get current user |
| PUT | `/auth/updateprofile` | Yes | Update name, phone, bio, avatar |
| PUT | `/auth/changepassword` | Yes | Change password |
| POST | `/auth/wishlist/:eventId` | Yes | Toggle wishlist |

**Register Request:**
```json
{ "name": "John Doe", "email": "john@example.com", "password": "pass123", "role": "user" }
```

**Login Response:**
```json
{ "success": true, "token": "eyJ...", "user": { "_id": "...", "name": "John", "email": "...", "role": "user" } }
```

---

### 🎪 Event Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/events` | No | List/filter events (paginated) |
| GET | `/events/:id` | No | Get event details |
| POST | `/events` | Organizer/Admin | Create event (multipart) |
| PUT | `/events/:id` | Organizer/Admin | Update event |
| DELETE | `/events/:id` | Organizer/Admin | Delete event |
| GET | `/events/:id/analytics` | Organizer/Admin | Event stats |

**GET /events Query Params:**
```
?search=react
&category=tech
&minPrice=0&maxPrice=5000
&city=Hyderabad
&date=2025-03-15
&featured=true
&sort=newest|date|price_asc|price_desc|rating
&page=1&limit=12
```

**Create Event Request (multipart/form-data):**
```
title, description, category, date, time, price, totalSeats,
location[venue], location[city], location[state],
images[] (files), tags, status
```

---

### 🎟 Booking Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/bookings` | User | Create booking (reserve seats) |
| POST | `/bookings/:id/pay` | User | Process payment |
| GET | `/bookings/mybookings` | User | My booking history |
| GET | `/bookings/:id` | User | Get single booking |
| PUT | `/bookings/:id/cancel` | User | Cancel booking |
| GET | `/bookings/:id/ticket` | User | Download PDF ticket |

**Create Booking Request:**
```json
{ "eventId": "...", "seats": 2 }
```

**Process Payment Request:**
```json
{ "method": "simulated", "simulateFailure": false }
```

**Process Payment Response:**
```json
{
  "success": true,
  "booking": {
    "bookingId": "EVT-A1B2C3D4",
    "status": "confirmed",
    "seats": 2,
    "seatNumbers": ["A1", "A2"],
    "totalAmount": 5998,
    "qrCode": "data:image/png;base64,...",
    "payment": { "transactionId": "TXN-1234567890", "status": "completed" }
  }
}
```

---

### 🔧 Admin Endpoints (Admin only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard` | Stats, charts, recent activity |
| GET | `/admin/users` | All users (paginated, searchable) |
| PUT | `/admin/users/:id` | Update user role/status |
| DELETE | `/admin/users/:id` | Delete user |
| GET | `/admin/bookings` | All bookings |
| PUT | `/admin/events/:id/feature` | Toggle featured status |

---

### 🎭 Organizer Endpoints (Organizer/Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/organizer/dashboard` | My events + booking stats |
| GET | `/organizer/events` | My events list |
| GET | `/organizer/events/:id/bookings` | Bookings for my event |

---

### ⭐ Review Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/reviews/event/:eventId` | No | Get event reviews |
| POST | `/reviews/event/:eventId` | User (must have attended) | Create review |
| PUT | `/reviews/:id` | Owner | Update review |
| DELETE | `/reviews/:id` | Owner/Admin | Delete review |

---

## 🖥️ Screen Descriptions

### 1. Home Page (/)
- Hero section with animated gradient, search bar, and key stats
- Category browse grid (6 categories with color-coded tiles)
- Featured events carousel (4 cards)
- Upcoming events grid (8 cards)
- CTA banner for unauthenticated users

### 2. Events Page (/events)
- Header with result count and search bar
- Left sidebar: category filter, price range, city filter, featured toggle
- Right: events grid (12/page) with sorting dropdown
- Pagination controls
- Each card shows: image, category badge, title, date, venue, seats bar, price, wishlist button

### 3. Event Detail Page (/events/:id)
- Full-width hero image with multi-image support
- Two tabs: About (description, details, organizer) and Reviews
- Sticky booking panel: price, seat availability bar, Book button, Wishlist button
- Review form (requires confirmed booking to submit) + reviews list with ratings

### 4. Booking Page (/events/:id/book)
- 3-step progress: Select Seats → Payment → Confirm
- Step 1: Seat counter, price breakdown
- Step 2: Payment method selector (simulate/card/UPI/netbanking), card input fields
- Payment processing animation
- Order summary sidebar (sticky)

### 5. Booking Confirmation (/bookings/:id/confirm)
- Success animation with green checkmark
- Full e-ticket: booking ID, event details, seat numbers, QR code
- PDF download button
- Navigation to My Bookings

### 6. My Bookings (/my-bookings)
- Filter tabs: All, Confirmed, Pending, Cancelled
- Each booking shows: event thumbnail, title, date, seats, amount, status badge
- Actions: View Event, View Ticket, Download PDF, Cancel

### 7. Admin Dashboard (/admin)
- Overview: 4 KPI stat cards (users, events, bookings, revenue)
- Revenue bar chart + bookings line chart (6-month history)
- Recent bookings table
- Top 5 events by bookings
- Users tab: searchable table with role editor, activate/deactivate, delete
- Events tab: link to manage via events page

### 8. Organizer Dashboard (/organizer)
- 3 KPI cards (my events, total bookings, revenue)
- Seat occupancy horizontal bar chart per event
- Recent bookings list
- Events tab: each event shows title, date, booked/total, revenue, progress bar + edit/delete actions
- Bookings tab: full bookings table

### 9. Create/Edit Event (/events/create, /events/:id/edit)
- Section-based form: Basic Info, Date & Time, Location, Tickets & Pricing, Images
- Image drag-and-drop with previews
- Free event detection (shows green banner when price=0)

### 10. Profile (/profile)
- Avatar with click-to-upload
- Tabs: Profile (edit name/phone/bio), Security (change password), Wishlist
- Role badge and member-since date

---

## 🔒 Role-Based Access Control

| Feature | User | Organizer | Admin |
|---------|------|-----------|-------|
| Browse events | ✅ | ✅ | ✅ |
| Book tickets | ✅ | ✅ | ✅ |
| Write reviews | ✅ (attended) | ✅ | ✅ |
| Create events | ❌ | ✅ | ✅ |
| Edit own events | ❌ | ✅ | ✅ |
| Edit any event | ❌ | ❌ | ✅ |
| Delete any event | ❌ | ❌ | ✅ |
| View organizer dash | ❌ | ✅ | ✅ |
| View admin dash | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| Feature events | ❌ | ❌ | ✅ |

---

## 🌐 Deployment Guide

### Frontend → Vercel

```bash
# 1. Build the frontend
cd frontend && npm run build

# 2. Install Vercel CLI
npm i -g vercel

# 3. Deploy
vercel --prod

# 4. Add environment variable in Vercel dashboard:
#    REACT_APP_API_URL = https://your-backend.onrender.com/api
```

Or connect your GitHub repo to Vercel for automatic deployments.

---

### Backend → Render

1. Push code to GitHub
2. Create new **Web Service** on [render.com](https://render.com)
3. Set:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Add Environment Variables:
   ```
   NODE_ENV=production
   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/eventify
   JWT_SECRET=<strong-random-string>
   FRONTEND_URL=https://your-app.vercel.app
   SMTP_USER=your@gmail.com
   SMTP_PASS=your-app-password
   ```

### MongoDB Atlas (Production DB)

1. Create free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create database user
3. Whitelist `0.0.0.0/0` in Network Access
4. Copy connection string to `MONGO_URI`

---

## ⚡ Real-Time Features (Socket.io)

The backend emits real-time events via Socket.io:

```javascript
// Client: join an event room to receive seat updates
socket.emit('join_event', eventId);

// Server emits when seats are booked:
socket.to(`event_${eventId}`).emit('seats_updated', {
  eventId, availableSeats: 380
});
```

To use in frontend, add to EventDetail.js:
```javascript
import { io } from 'socket.io-client';
const socket = io(process.env.REACT_APP_SOCKET_URL);
socket.emit('join_event', id);
socket.on('seats_updated', ({ availableSeats }) => {
  setEvent(prev => ({ ...prev, availableSeats }));
});
```

---

## 💳 Payment Integration (Razorpay/Stripe)

The current implementation simulates payment. To integrate Razorpay:

```bash
npm install razorpay
```

```javascript
// In routes/payments.js
const Razorpay = require('razorpay');
const rzp = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_SECRET });

router.post('/create-order', protect, async (req, res) => {
  const order = await rzp.orders.create({ amount: req.body.amount * 100, currency: 'INR', receipt: `order_${Date.now()}` });
  res.json({ success: true, order });
});
```

---

## 🔧 Key Technical Decisions

| Feature | Approach | Why |
|---------|----------|-----|
| Auth | JWT in localStorage | Simple, stateless, works across deployments |
| Password hashing | bcryptjs salt 12 | Industry standard security |
| Image upload | Multer to /uploads | Simple for self-hosted; swap for S3 in prod |
| Seat reservation | Optimistic booking + payment confirm | Prevents ghost reservations |
| Overbooking prevention | Check availableSeats before both booking creation and payment | Double protection |
| PDF tickets | PDFKit server-side | Full control over ticket design |
| QR codes | qrcode library → base64 | Embeds into PDF + displayed in UI |
| Real-time | Socket.io rooms per event | Efficient — only clients viewing that event get updates |
| Rate limiting | express-rate-limit 100/15min | Prevents API abuse |

---

## 🚧 Future Improvements

- [ ] AWS S3 / Cloudinary for image storage
- [ ] Redis for session caching and rate limiting
- [ ] Email queue with Bull/BullMQ
- [ ] Webhook-based Razorpay payment verification
- [ ] Seat map visualizer (grid/theater layout)
- [ ] Admin analytics export (CSV/Excel)
- [ ] Event check-in via QR scanner
- [ ] Multi-language support (i18n)
- [ ] PWA support for offline ticket access
- [ ] Referral codes and promo discounts
