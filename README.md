<div align="center">

<h1>PlatePal</h1>
<p><strong>Health-Conscious Restaurant & Dish Discovery Platform</strong></p>
<p>Discover restaurants, explore nutritional data, filter dishes by price or calories, track your health metrics, and manage your favorites — all in one place, running entirely on your local machine.</p>

<br/>

</div>

---

## Screenshots

<table>
  <tr>
    <td align="center">
      <img src="Screenshots/sign%20up.png" alt="Sign Up" width="100%"/>
      <br/><sub><b>Sign Up</b></sub>
    </td>
    <td align="center">
      <img src="Screenshots/sign%20in.png" alt="Sign In" width="100%"/>
      <br/><sub><b>Sign In</b></sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="Screenshots/main-dashboard.png" alt="Home Dashboard" width="100%"/>
      <br/><sub><b>Home Dashboard</b></sub>
    </td>
    <td align="center">
      <img src="Screenshots/main-dashboard-2.png" alt="Restaurant Menu" width="100%"/>
      <br/><sub><b>Restaurant Menu & Reviews</b></sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="Screenshots/filter-by-dishes.png" alt="Filter by Price" width="100%"/>
      <br/><sub><b>Filter Dishes by Price</b></sub>
    </td>
    <td align="center">
      <img src="Screenshots/filter-by-calories.png" alt="Filter by Calories" width="100%"/>
      <br/><sub><b>Filter Dishes by Calories</b></sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="Screenshots/favourites.png" alt="Favourites" width="100%"/>
      <br/><sub><b>Favourite Restaurants</b></sub>
    </td>
    <td align="center">
      <img src="Screenshots/health-log.png" alt="Health Log" width="100%"/>
      <br/><sub><b>Health Log</b></sub>
    </td>
  </tr>
  <tr>
    <td align="center" colspan="2">
      <img src="Screenshots/user-profile.png" alt="User Profile" width="50%"/>
      <br/><sub><b>User Profile</b></sub>
    </td>
  </tr>
</table>

---

## Overview

PlatePal is a full-stack food discovery and health tracking platform built specifically for the Pakistani restaurant scene. It lets users browse 24 restaurants across major cities, explore detailed dish menus with full nutritional breakdowns, filter dishes by price range or calorie count, save favorites, write reviews, and log personal health metrics — all backed by a local SQLite database with JWT authentication.

The frontend is built with React 18, Vite, and Tailwind CSS v4 with a custom Material Design 3 color system for a clean, modern look. The backend is a Node.js/Express REST API that manages authentication, restaurant data, nutritional information, reviews, favorites, and health logs — with zero external dependencies at runtime.

---

## Key Features

- **Restaurant Discovery** — Browse 24 restaurants across Lahore, Karachi, Islamabad, Peshawar, Quetta, Rawalpindi, and Multan, organized by cuisine type with ratings and review counts.
- **Full Menu Browsing** — View every restaurant's complete menu grouped by category, with dish descriptions, prices (PKR), and full nutritional data per dish.
- **Filter by Price** — Select a restaurant and set a min/max PKR range (or use presets) to instantly see only dishes within your budget.
- **Filter by Calories** — Set a calorie range across all restaurants to find meals that fit your dietary goals, with sorting by calories, protein, or price.
- **Dish Nutrition Detail** — Each dish has a dedicated page showing calories, protein, carbs, fat, and fiber with color-coded macro cards, plus a "Where to Find It" section listing every restaurant that serves it with prices.
- **Favorites** — Heart any restaurant to save it; view and manage your entire favorites list from a dedicated page.
- **Reviews & Ratings** — Read community reviews with star ratings and rating distribution charts. Authenticated users can write, edit, and delete their own reviews.
- **Health Log** — Log personal health metrics (weight, blood pressure, blood sugar, notes) and view a history of your entries with computed stats.
- **JWT Authentication** — Secure email/password signup and login with 7-day tokens stored in localStorage; protected routes redirect unauthenticated users automatically.
- **Cuisine-Based Imagery** — Restaurant cards and detail pages display curated Unsplash photos matched to their cuisine type (Pakistani, BBQ, Continental, Chinese, Italian, Thai, American, Pathan, Fast Food).

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 18 + Vite | Core framework and build tool |
| React Router v7 | Client-side routing with protected route guards |
| Tailwind CSS v4 | Utility-first styling with Material Design 3 tokens |
| Axios | HTTP client with auto-injected JWT headers |
| React Context API | Auth state and toast notification management |
| Material Symbols | Icon library (Google's variable icon font) |
| Epilogue + Manrope | Typography (Google Fonts) |

### Backend

| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| SQLite3 | Local relational database |
| bcryptjs | Password hashing (salt rounds: 10) |
| jsonwebtoken | JWT generation and verification (7-day expiry) |
| dotenv | Environment variable management |
| cors + body-parser | Cross-origin requests and JSON body parsing |
| nodemon | Development auto-reload |

---

## Project Structure

```
PlatePal/
│
├── backend/
│   ├── server.js                  # Express app entry point
│   ├── package.json
│   ├── .env                       # PORT and JWT_SECRET
│   │
│   ├── db/
│   │   └── schema.js              # Table creation + full seed data
│   │
│   ├── utils/
│   │   └── db.js                  # SQLite3 async wrapper with queue
│   │
│   ├── middleware/
│   │   └── auth.js                # JWT verification middleware
│   │
│   ├── routes/
│   │   ├── auth.js                # Signup, login, logout, /me
│   │   ├── restaurants.js         # Restaurant listing, search, detail
│   │   ├── dishes.js              # Dish listing, calorie filter, detail
│   │   ├── menu.js                # Restaurant menu with price filter
│   │   ├── reviews.js             # Review CRUD (protected)
│   │   ├── favorites.js           # Favorites management (protected)
│   │   └── health.js              # Health log CRUD (protected)
│   │
│   └── data/
│       └── platepal.db            # SQLite database file (auto-created)
│
├── platepal-frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   │
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                # React Router setup + protected routes
│       │
│       ├── api/
│       │   └── client.js          # Axios instance with JWT interceptor
│       │
│       ├── context/
│       │   └── AuthContext.jsx    # Auth state, login/logout helpers
│       │
│       ├── hooks/
│       │   └── useAuth.js         # Auth context consumer hook
│       │
│       ├── components/
│       │   ├── Navbar.jsx         # Top navigation with user avatar
│       │   ├── RestaurantCard.jsx # Card with image, rating, cuisine badge
│       │   ├── DishCard.jsx       # Dish card with calories badge and macros
│       │   ├── Loading.jsx        # Spinner component
│       │   └── Toast.jsx          # Toast notification system
│       │
│       └── pages/
│           ├── Auth/
│           │   ├── Login.jsx
│           │   └── Signup.jsx
│           ├── Home/
│           │   └── HomeScreen.jsx      # Restaurant grid with search
│           ├── Restaurant/
│           │   └── RestaurantMenu.jsx  # Menu, reviews, price filter
│           ├── Dish/
│           │   ├── DishDetail.jsx      # Nutrition facts + where to find
│           │   ├── FilterByPrice.jsx   # Price range filter UI
│           │   └── SearchDishes.jsx    # General dish search
│           ├── Favorites/
│           │   └── FavoritesScreen.jsx
│           ├── Health/
│           │   ├── FilterByCalories.jsx
│           │   ├── LogHealth.jsx
│           │   └── HealthHistory.jsx
│           └── Profile/
│               └── ProfileScreen.jsx
│
├── Screenshots/                   # App screenshots
├── launch.bat                     # One-click launcher (backend + frontend)
└── README.md
```

---

## Database Schema

PlatePal uses a local SQLite database with 7 tables, automatically created and seeded on first run.

```
┌──────────────┐       ┌─────────────────┐       ┌──────────┐
│    users     │       │   restaurants   │       │  dishes  │
├──────────────┤       ├─────────────────┤       ├──────────┤
│ user_id (PK) │       │restaurant_id(PK)│       │dish_id   │
│ name         │       │ name (UNIQUE)   │       │name(UNIQ)│
│ email(UNIQUE)│       │ cuisine_type    │       │ category │
│ password     │       │ city            │       │description│
│ city         │       │ phone           │       └────┬─────┘
└──────┬───────┘       └────────┬────────┘            │
       │                        │               ┌─────▼──────┐
       │            ┌───────────┴──────┐        │ nutrition  │
       │            │  restaurant_menu │        ├────────────┤
       │            ├──────────────────┤        │nutrition_id│
       │            │ menu_id (PK)     │        │dish_id(FK) │
       │            │ restaurant_id(FK)├────────┤ calories   │
       │            │ dish_id (FK)     │        │ protein_g  │
       │            │ price            │        │ carbs_g    │
       │            └──────────────────┘        │ fat_g      │
       │                        │               │ fiber_g    │
       │            ┌───────────┴──────┐        └────────────┘
       │            │    favorites     │
       ├────────────┤──────────────────┤
       │            │ favorite_id (PK) │
       │            │ user_id (FK)     │
       │            │ restaurant_id(FK)│
       │            └──────────────────┘
       │
       │            ┌──────────────────┐        ┌─────────────┐
       │            │    reviews       │        │ health_logs │
       ├────────────┤──────────────────┤        ├─────────────┤
       │            │ review_id (PK)   │        │ log_id (PK) │
       └────────────┤ user_id (FK)     ├────────┤ user_id(FK) │
                    │ restaurant_id(FK)│        │ weight_kg   │
                    │ rating (1–5)     │        │blood_pressure│
                    │ comment          │        │ blood_sugar │
                    └──────────────────┘        │ notes       │
                                                └─────────────┘
```

**Seed Data (loaded automatically on first run)**
- 5 test users (password: `Test123!` for all)
- 24 restaurants across 7 Pakistani cities
- 55 dishes across 13 categories
- Full nutritional data for all 55 dishes
- ~170 restaurant–dish menu entries with PKR prices
- 25+ reviews across 12 restaurants

---

## Full Architecture & User Flow

```
────────────────────────────────────────────────────────────────
                        USER JOURNEY
────────────────────────────────────────────────────────────────

  1. AUTHENTICATION
     /login or /signup → JWT issued on success (7-day expiry)
     Token stored in localStorage
     All protected routes redirect to /login if no token

  2. HOME DASHBOARD
     /  → GET /api/restaurants
          Returns all 24 restaurants with avg_rating
          and review_count aggregated from reviews table
          Cuisine-matched Unsplash image shown on each card

  3. RESTAURANT SEARCH
     /search → GET /api/restaurants/search?query=
               GET /api/restaurants/cuisine/:type
               Full-text search on name and cuisine_type

  4. RESTAURANT DETAIL
     /restaurant/:id → parallel requests:
       GET /api/restaurants/:id          (restaurant info)
       GET /api/menu/:id                 (full grouped menu)
       GET /api/reviews/restaurant/:id   (reviews + stats)
       GET /api/favorites/check/:id      (is favorited?)

     Page shows:
     • Hero banner image (cuisine-matched)
     • Menu grouped by category (Main Course, BBQ, Dessert…)
     • Built-in price filter (expandable)
     • Review section with rating distribution
     • Write/Edit/Delete review form (authenticated users)

  5. FILTER BY PRICE
     /filter-price → GET /api/restaurants (populate dropdown)
     On apply    → GET /api/menu/:restaurantId
                        ?price_min=X&price_max=Y
                   SQL: JOIN restaurant_menu WHERE price BETWEEN

  6. FILTER BY CALORIES
     /filter-calories → GET /api/dishes/search
                              ?calories_min=X&calories_max=Y
                        SQL: JOIN nutrition WHERE calories BETWEEN
                        Optional sort: lowest calories,
                        highest protein, lowest price

  7. DISH DETAIL
     /dish/:id → GET /api/dishes/:id
                 Returns dish info + nutrition facts +
                 list of restaurants serving it with prices

  8. FAVORITES
     POST /api/favorites/:restaurantId   (add, protected)
     DELETE /api/favorites/:restaurantId (remove, protected)
     GET  /api/favorites                 (list, protected)

  9. HEALTH LOG
     POST /api/health  → log new entry (weight, BP, sugar)
     GET  /api/health  → retrieve history with computed stats
                         (avg weight, avg sugar, entry count)
     PUT  /api/health/:id  → update entry (owner only)
     DELETE /api/health/:id → delete entry (owner only)

 10. USER PROFILE
     GET /api/auth/me → returns name, email, city, joined date
```

---

## API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `POST` | `/api/auth/signup` | ✗ | Register new user, returns JWT |
| `POST` | `/api/auth/login` | ✗ | Login, returns JWT |
| `POST` | `/api/auth/logout` | ✗ | Logout |
| `GET`  | `/api/auth/me` | ✓ | Get current user profile |

### Restaurants

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `GET` | `/api/restaurants` | ✗ | List all restaurants with avg rating |
| `GET` | `/api/restaurants/search?query=` | ✗ | Search by name or cuisine |
| `GET` | `/api/restaurants/cuisine/:type` | ✗ | Filter by cuisine type |
| `GET` | `/api/restaurants/:id` | ✗ | Single restaurant detail |

### Menu & Dishes

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `GET` | `/api/menu/:restaurantId` | ✗ | Full restaurant menu grouped by category |
| `GET` | `/api/menu/:restaurantId?price_min=X&price_max=Y` | ✗ | Menu filtered by price range |
| `GET` | `/api/dishes` | ✗ | All dishes |
| `GET` | `/api/dishes/search?calories_min=X&calories_max=Y` | ✗ | Dishes filtered by calorie range |
| `GET` | `/api/dishes/:id` | ✗ | Dish with nutrition facts and restaurants |

### Reviews

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `GET`    | `/api/reviews/restaurant/:id` | ✗ | All reviews for a restaurant with stats |
| `POST`   | `/api/reviews` | ✓ | Create a review (1 per user per restaurant) |
| `PUT`    | `/api/reviews/:id` | ✓ | Update own review |
| `DELETE` | `/api/reviews/:id` | ✓ | Delete own review |

### Favorites

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `GET`    | `/api/favorites` | ✓ | List user's favorite restaurants |
| `POST`   | `/api/favorites/:restaurantId` | ✓ | Add to favorites |
| `DELETE` | `/api/favorites/:restaurantId` | ✓ | Remove from favorites |
| `GET`    | `/api/favorites/check/:restaurantId` | ✓ | Check if a restaurant is favorited |

### Health

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `POST`   | `/api/health` | ✓ | Log a health entry |
| `GET`    | `/api/health` | ✓ | Get all health logs with stats |
| `PUT`    | `/api/health/:id` | ✓ | Update own health log |
| `DELETE` | `/api/health/:id` | ✓ | Delete own health log |
| `GET`    | `/api/health-check` | ✗ | Server status check |

---

## Getting Started

### Prerequisites

- Node.js v18+
- npm
- Git

> No external services required. The database is created automatically on first run.

### 1. Clone the Repository

```bash
git clone https://github.com/Abdulrehman0911/PlatePal.git
cd PlatePal
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Start the server
node server.js
# Server starts at http://localhost:5000
# Database is created and seeded automatically
```

### 3. Frontend Setup

```bash
cd platepal-frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
# App runs at http://localhost:5173
```

### 4. One-Click Launch (Windows)

Double-click **`launch.bat`** in the project root. It will:
1. Start the backend server in a dedicated terminal window
2. Start the frontend dev server in a dedicated terminal window
3. Open the app in a new private/incognito browser window after a short delay

```
PlatePal/
└── launch.bat   ← double-click this
```

### 5. Environment Variables

Create `backend/.env` (already included with defaults):

```env
PORT=5000
JWT_SECRET=platepal-super-secret-jwt-key-2024
```

### 6. Test Accounts

The following accounts are seeded automatically:

| Name | Email | Password |
|------|-------|----------|
| Ahmed Khan | user1@test.com | Test123! |
| Sara Ali | user2@test.com | Test123! |
| Fatima Ahmed | user3@test.com | Test123! |
| Ali Hassan | user4@test.com | Test123! |
| Zainab Khan | user5@test.com | Test123! |

---

## Seed Data Overview

| Table | Count | Details |
|-------|------:|--------|
| Restaurants | 24 | Lahore, Karachi, Islamabad, Peshawar, Quetta, Rawalpindi, Multan |
| Dishes | 55 | 13 categories: Main Course, BBQ, Fast Food, Pizza, Pasta, Chinese, Starters, Bread, Dessert, Drinks, Vegetarian, Salads, Soups |
| Nutrition entries | 55 | Calories, protein, carbs, fat, fiber for every dish |
| Menu entries | ~170 | Each restaurant has 6–10 dishes with PKR prices |
| Reviews | 25+ | Spread across 12 restaurants from 5 users |
| Cuisine types | 9 | Pakistani, BBQ, Fast Food, Continental, Italian, Chinese, Thai, American, Pathan |

---

<div align="center">
  <p>Built by <strong>Abdul Rehman</strong></p>
</div>
