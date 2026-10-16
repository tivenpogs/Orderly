# Orderly

Restaurant discovery and food ordering for Angeles City, built from the Figma screens.

**Stack:** React 18 + Vite + Tailwind CSS · Node.js + Express · MongoDB (Mongoose)

## Quick start

Requirements: Node 18+ and a running MongoDB (local `mongod` or a MongoDB Atlas URI).

```bash
npm run install:all          # installs root, server and client dependencies
cp server/.env.example server/.env   # optional; sensible defaults are built in
npm run seed                 # loads restaurants, offers and a demo user
npm run dev                  # API on :5000, web app on :5173
```

Open http://localhost:5173 and log in with **demo@orderly.ph / demo1234**, or create an account.

**Admin account** (can add/delete restaurants and menu items): **admin@orderly.ph / admin1234**. After logging in, open the avatar menu and choose *Manage restaurants* (`/admin`).

Production: `npm run build` then `npm start` (Express serves `client/dist` on port 5000).

## Environment (server/.env)

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | 5000 | API port |
| `MONGODB_URI` | mongodb://127.0.0.1:27017/orderly | Database |
| `JWT_SECRET` | dev-only fallback | Signs login tokens. Set a long random value in production |
| `CLIENT_ORIGIN` | http://localhost:5173 | Allowed CORS origin |

## Screens implemented

Admin (add/delete restaurants and menu items) · Home · Restaurants (search, filters, sort) · Restaurant detail (menu, cart steppers, About, Reviews, Save) · Checkout · Order Successful · My Orders · Order Details (status timeline) · Special Offers · About · Login/Register · Saved restaurants.

## Business rules

- Delivery fee ₱49. ₱50 off when the subtotal is ₱300 or more. Example: 185 + 120 = 305; 305 + 49 - 50 = **₱304**.
- A cart holds items from one restaurant at a time.
- New orders start at **Preparing**. On Order Details, "Demo: advance to next status" moves it to Out for Delivery, then Delivered.
- Payments are simulated. No money moves.
- Table reservations are not built (the design had a button but no screen).

## Folder map

```
server/src/  index.js · seed.js · config/db.js · models/ · routes/ · middleware/auth.js · utils/
client/src/  main.jsx · App.jsx · api.js · context/ · hooks/ · components/ · pages/ · utils/
```
