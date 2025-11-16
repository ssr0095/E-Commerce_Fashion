# Cousins Fashion

A full-stack e-commerce platform with advanced features including authentication, payment processing, admin dashboard, and optimized search functionality.

🔗 **Live Site:** [https://cousinsfashion.in/](https://cousinsfashion.in/)

## 🏗️ Architecture

- **Frontend:** Vite + React - User-facing store
- **Admin Panel:** Vite + React - Product & order management
- **Backend:** Node.js + Express - RESTful API
- **Database:** MongoDB Atlas - Cloud database
- **Image CDN:** Cloudflare R2 Bucket - Fast image delivery

## 🚀 Tech Stack

### Frontend & Admin
- **Build Tool:** [Vite](https://vitejs.dev/) - Lightning-fast development
- **UI Framework:** React
- **UI Components:** [Shadcn/ui](https://ui.shadcn.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **State Management:** React Context
- **HTTP Client:** Axios

### Backend
- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** Express.js
- **Database:** [MongoDB Atlas](https://www.mongodb.com/atlas)
- **ODM:** Mongoose
- **Authentication:** JWT (Access & Refresh Tokens)
- **Payment Gateway:** Razorpay + Custom QR Payment

### Infrastructure
- **Frontend Hosting:** [Vercel](https://vercel.com/)
- **Admin Hosting:** [Vercel](https://vercel.com/)
- **Backend Hosting:** [Render](https://render.com/)
- **CDN:** Cloudflare R2

## ✨ Features

### Authentication & Authorization
- **Dual Authentication:** Credentials-based and Google OAuth
- **Token Management:**
  - Access Token & Refresh Token system
  - Automatic token revalidation
  - Token revocation on logout
- **Role-Based Access Control:** User and Admin roles

### Product Management
- **Server-Side Search:** Optimized search with indexing
- **Pagination:** Efficient product listing with pagination
- **Frontend Caching:** LocalStorage caching for faster load times
- **Admin Controls:** Add, edit, and delete products

### Shopping Features
- **Shopping Cart:** Persistent cart with local storage
- **Coupon System:** Discount code application
- **Order Management:** Complete order tracking

### Payment Integration
- **Razorpay Gateway:** Card, UPI, Net Banking, Wallet payments
- **Custom QR Payment:** Google Pay QR code scanning
- **Payment Verification:** Secure payment confirmation
- **Order Status Updates:** Real-time payment status

### Backend Features
- **Rate Limiting:** API protection against abuse
- **Middleware:**
  - Role-based authorization
  - Request validation
  - Error handling
- **Centralized Error Handler:** Consistent error responses
- **Mongoose Schema Features:**
  - Pre-save hooks
  - Custom methods
  - Virtual properties
- **Audit Control:** User activity tracking

### Data Models
- **User:** Authentication, profile, cart
- **Product:** Catalog with categories and variants
- **Order:** Order details and status
- **Audit:** User action logs

### Admin Dashboard
- **Product Management:** CRUD operations for products
- **Order Management:** View and update order status

### SEO Optimization
- **Meta Tags:** Title, description, keywords
- **Open Graph:** Social media preview
- **Structured Data:** Schema.org markup
- **Sitemap:** XML sitemap generation
- **Robots.txt:** Search engine crawling rules
- **Web Manifest:** PWA support
- **Google Indexing:** Successfully indexed pages

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18.x or higher
- MongoDB Atlas account
- Razorpay account (for payments)
- Google OAuth credentials
- Cloudflare R2 account

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/ssr0095/E-Commerce_Fashion.git
   cd E-Commerce_Fashion
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file:
   ```env
    NODE_ENV=development
    
    # Database
    MONGODB_URI=your_mongodb_atlas_connection_string
    
    # JWT
    JWT_SECRET=your_access_token_secret
    JWT_REFRESH_SECRET=your_refresh_token_secret
    ACCESS_TOKEN_MAX_AGE=3600000
    JWT_EXPIRES_IN=3600000
    JWT_REFRESH_EXPIRES_IN=604800000
    REFRESH_TOKEN_MAX_AGE=604800000
    
    # Google OAuth
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    
    # Razorpay
    RAZORPAY_KEY_ID=your_razorpay_key_id
    RAZORPAY_KEY_SECRET=your_razorpay_key_secret
    
    # Cloudflare R2
    R2_ACCOUNT_ID=your_r2_account_id
    R2_ACCESS_KEY_ID=your_r2_access_key
    R2_SECRET_ACCESS_KEY=your_r2_secret_key
    R2_BUCKET_NAME=your_bucket_name
    
    # Frontend URLs
    FRONTEND_URL=http://localhost:5173
    ADMIN_URL=http://localhost:5174
    
    # Rate Limiting
    RATE_LIMIT_WINDOW_MS=900000
    
    # Admin
    ADMIN_EMAIL=admin@gmail.com
    ADMIN_ID=get-from-mongo-atlas
    ADMIN_PASSWORD=strong-password
    COUSINS_COUPION=COUSINS3242

   ```

4. **Run the server**
   ```bash
   npm run server
   # or for production
   npm start
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file:
   ```env
    VITE_BACKEND_URL = "http://localhost:8000"
    VITE_UPI="upi@okhdfcbank"
    VITE_COUSINS_COUPION = "COUSINS3242"
    VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
    VITE_GOOGLE_CLIENT_ID=your_google_client_id
    VITE_DISCOUNT=10
    VITE_FIRST_ORDER_DISCOUNT=10
    VITE_WHATSAPP=number
    VITE_CURRENCY=₹
    VITE_DELIVERY_FEE=40
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:5173](http://localhost:5173)

### Admin Panel Setup

1. **Navigate to admin directory**
   ```bash
   cd admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file:
   ```env
    VITE_CURRENCY=₹
    VITE_BACKEND_URL = "http://localhost:8000"
    VITE_GOOGLE_CLIENT_ID=your_google_client_id
    FRONTEND_URL=http://localhost:5173
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:5174](http://localhost:5174)

### Build for Production

**Frontend & Admin:**
```bash
npm run build
npm run preview
```

**Backend:**
```bash
npm run build
npm start
```

## 📁 Project Structure

```
cousins-fashion/
├── backend/
│   ├── controllers/          # Route controllers
│   ├── models/              # Mongoose schemas
│   │   └── ...              # All models
│   ├── middleware/          # Custom middleware
│   ├── routes/             # API routes
│   ├── utils/              # Helper functions
│   └── server.js           # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── context/        # Context providers
│   │   ├── utils/          # Utility functions
│   │   └── main.jsx        # Entry point
│   └── public/             # Static assets
└── admin/
│   ├──  src/
│   │   ├── components/     # Admin components
│   │   ├── pages/          # Admin pages
│   │   └── main.jsx        # Entry point
│   └── public/
```

## 🔐 Security Features

- Password hashing with bcrypt
- HTTP-only cookies for refresh tokens
- CORS configuration
- Rate limiting on API endpoints
- Input validation and sanitization
- XSS protection
- SQL injection prevention (NoSQL)
- Secure payment processing

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `POST /api/auth/verify` - Verify token

### Products
- `GET /api/products/single/:slug` - Get single product by slug
- `POST /api/products/single-by-id` - Get single product by id
- `DELETE /api/products/remove` - Delete product (admin)
- `POST /api/products/add` - Create product (admin)
- `POST /api/products/edit` - Update product (admin)
- `GET /api/products/list` - Get all products (paginated, search)
- `GET /api/products/filters` - Get all fillter names

### Cart
- `POST /api/cart/get` - Get user cart
- `POST /api/cart/add` - Add to cart
- `POST /api/cart/update` - Update cart item

## Orders
- `POST /api/orders/list` - Get all orders (admin)
- `POST /api/orders/status` - Update order status (admin)
- `POST /api/orders/paymentstatus` - Update payment status (admin)

### Orders (User)
- `POST /api/orders/userorders` - Get logged-in user’s orders
- `POST /api/orders/getuserorder` - Get a specific user order
- `POST /api/orders/verifyCode` - Apply coupon code

### Orders (Payment)
- `POST /api/orders/place` - Place order (default payment)
- `POST /api/orders/googlepay` - Place order via Google Pay
- `POST /api/orders/stripe` - Place order via Stripe
- `POST /api/orders/razorpay` - Place order via Razorpay

### Orders (Payment Verification)
- `POST /api/orders/verifyStripe` - Verify Stripe payment
- `POST /api/orders/verifyRazorpay` - Verify Razorpay payment

### Orders (Uploads)
- `POST /api/orders/addPaymentScreenshot` - Upload payment screenshot
- `POST /api/orders/addDesignImage` - Upload design image

### User
- `POST /api/user/userInfo` - User info


## 🎯 Future Enhancements

- Image optimization implementation
- Web vitals improvement
- Product reviews and ratings
- Email notifications
- Advanced analytics dashboard
- Inventory management
- Multi-language support
- Progressive Web App (PWA) features
- Next.js convertion

## 🐛 Known Issues

- Images not optimized (planned enhancement)
- Web vitals scores need improvement

## 📄 License

[Creative Commons Attribution-NonCommercial (CC BY-NC)](https://github.com/ssr0095/E-Commerce_Fashion/blob/main/LICENSE)

## 👥 Contributors

Sriram S

---

**Note:** This is a production-ready e-commerce platform with comprehensive features for both customers and administrators.
