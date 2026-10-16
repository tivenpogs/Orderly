// Usage:  npm run seed          -> reloads restaurants + offers, creates the demo user if missing
//         npm run seed:reset    -> also wipes users, orders and the order counter
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db.js';
import Restaurant from './models/Restaurant.js';
import Offer from './models/Offer.js';
import User from './models/User.js';
import Order, { Counter } from './models/Order.js';

const m = (name, description, price, category, popular = false) => ({ name, description, price, category, popular });

const REVIEWERS = [
  ['Maria S.', 5, 'Fresh, hot, and arrived on time. Will order again.'],
  ['Jon D.', 4, 'Great flavor and generous portions.'],
  ['Ate Lyn', 5, 'Tastes just like home cooking.'],
  ['Carlo R.', 4, 'Good value. Delivery was a little slow on a Friday.'],
];
const reviews = (offset) => [0, 1, 2].map((i) => {
  const [name, rating, comment] = REVIEWERS[(offset + i) % REVIEWERS.length];
  return { name, rating, comment };
});

const restaurants = [
  {
    name: 'Morris Park Bake Shop', cuisine: 'Filipino', type: 'Bakery', rating: 4.8, reviewCount: 320, priceLevel: 2,
    deliveryMin: 25, deliveryMax: 35, imageColor: '#C4883C', featured: true,
    description: 'Bakery and fresh baked food',
    about: 'Fresh baked food and delicious meals prepared every day. A neighborhood bakery known for its pandesal, ensaymada, and home-style Filipino lunches.',
    address: 'Morris Park, Angeles City, Pampanga',
    menu: [
      m('Chicken Adobo', 'Classic Filipino chicken adobo with steamed rice', 185, 'Rice meals', true),
      m('Crispy Pork Belly', 'Served with rice and house dipping sauce', 245, 'Main dishes', true),
      m('Halo-Halo', 'Traditional shaved ice dessert', 120, 'Desserts', true),
      m('Cheese Pandesal Basket', 'Six warm pandesal filled with cheese', 80, 'Appetizers'),
      m('Garlic Bread Sticks', 'Toasted with garlic butter', 70, 'Appetizers'),
      m('Pork Sinigang', 'Sour tamarind soup with pork and vegetables', 210, 'Main dishes'),
      m('Beef Kaldereta', 'Slow-cooked beef in tomato and liver sauce', 230, 'Main dishes'),
      m('Tapsilog', 'Beef tapa, garlic rice, and a fried egg', 175, 'Rice meals'),
      m('Longganisa Silog', 'Garlicky sausage, garlic rice, and egg', 155, 'Rice meals'),
      m('Iced Calamansi Juice', 'Fresh calamansi over ice', 60, 'Drinks'),
      m("Sago't Gulaman", 'Sweet brown sugar drink with tapioca pearls and jelly', 55, 'Drinks'),
    ],
  },
  {
    name: "Wendy's", cuisine: 'Fast Food', type: 'Hamburgers', rating: 4.6, reviewCount: 540, priceLevel: 2,
    deliveryMin: 25, deliveryMax: 35, imageColor: '#8B3A1E', featured: true,
    description: 'Hamburgers and fast food',
    about: 'Square-patty burgers, crispy chicken, and hot fries, made to order.',
    menu: [
      m("Dave's Single", 'Quarter-pound beef patty with fresh toppings', 215, 'Main dishes', true),
      m('Spicy Chicken Sandwich', 'Crispy chicken fillet with spicy mayo', 195, 'Main dishes', true),
      m('Chicken Nuggets (6 pcs)', 'Golden and crispy with dipping sauce', 135, 'Appetizers', true),
      m('Large Fries', 'Hot, salted fries', 95, 'Appetizers'),
      m('Chocolate Frosty', 'Thick and creamy', 85, 'Desserts'),
      m('Iced Tea', 'Sweet iced tea', 60, 'Drinks'),
    ],
  },
  {
    name: 'Dj Reynolds Pub And Restaurant', cuisine: 'Irish', type: 'Irish', rating: 4.7, reviewCount: 410, priceLevel: 2,
    deliveryMin: 30, deliveryMax: 40, imageColor: '#2E0505', featured: true,
    description: 'Restaurant and pub',
    about: 'A cozy pub serving hearty plates, cold drinks, and live music on weekends.',
    menu: [
      m('Fish and Chips', 'Beer-battered fish with thick-cut fries', 320, 'Main dishes', true),
      m('Shepherd\'s Pie', 'Minced beef and vegetables under mashed potato', 290, 'Main dishes', true),
      m('Loaded Potato Skins', 'Bacon, cheese, and sour cream', 210, 'Appetizers', true),
      m('Chicken Wings (8 pcs)', 'Buffalo or garlic parmesan', 260, 'Appetizers'),
      m('Bangers and Mash', 'Pork sausages with onion gravy', 275, 'Rice meals'),
      m('Irish Coffee', 'Hot coffee with whisky cream', 180, 'Drinks'),
    ],
  },
  {
    name: 'Kapampangan Kitchen', cuisine: 'Filipino', type: 'Kapampangan', rating: 4.9, reviewCount: 410, priceLevel: 2,
    deliveryMin: 30, deliveryMax: 40, imageColor: '#A65D2E', featured: false,
    description: 'Pampanga classics, cooked slowly',
    about: 'Angeles City is the culinary capital of the Philippines. This kitchen serves the local classics the way they are made at home.',
    menu: [
      m('Sizzling Sisig', 'Chopped pork with onions, chili, and calamansi', 240, 'Main dishes', true),
      m('Tocino with Garlic Rice', 'Sweet cured pork, garlic rice, egg', 165, 'Rice meals', true),
      m('Bringhe', 'Kapampangan sticky-rice paella', 220, 'Rice meals', true),
      m('Tidtad Dugo', 'Pork stew with vinegar and spices', 225, 'Main dishes'),
      m('Camaru (Fried Crickets)', 'Crispy adobo-style crickets', 150, 'Appetizers'),
      m('Buko Juice', 'Fresh coconut water', 70, 'Drinks'),
    ],
  },
  {
    name: 'Sakura Ramen House', cuisine: 'Japanese', type: 'Ramen', rating: 4.5, reviewCount: 210, priceLevel: 2,
    deliveryMin: 30, deliveryMax: 40, imageColor: '#6B2D1A', featured: false,
    description: 'Ramen, rice bowls, and gyoza',
    about: 'Slow-simmered tonkotsu broth and hand-folded gyoza.',
    menu: [
      m('Tonkotsu Ramen', 'Pork bone broth, chashu, egg, and scallions', 285, 'Main dishes', true),
      m('Chicken Katsu Don', 'Breaded chicken cutlet over rice with egg', 245, 'Rice meals', true),
      m('Gyoza (6 pcs)', 'Pan-fried pork dumplings', 140, 'Appetizers', true),
      m('Salmon Sushi Set', 'Eight pieces of nigiri', 380, 'Main dishes'),
      m('Iced Green Tea', 'Unsweetened', 70, 'Drinks'),
    ],
  },
  {
    name: 'Seoul Garden', cuisine: 'Korean', type: 'Korean BBQ', rating: 4.4, reviewCount: 180, priceLevel: 3,
    deliveryMin: 35, deliveryMax: 45, imageColor: '#7A4B2A', featured: false,
    description: 'Korean barbecue and stews',
    about: 'Grilled meats, bubbling stews, and banchan sides.',
    menu: [
      m('Samgyeopsal Set', 'Pork belly with lettuce wraps, rice, and banchan', 420, 'Main dishes', true),
      m('Bibimbap', 'Mixed rice with vegetables, beef, and gochujang', 295, 'Rice meals', true),
      m('Kimchi Jjigae', 'Spicy kimchi stew with pork', 260, 'Main dishes'),
      m('Tteokbokki', 'Chewy rice cakes in spicy sauce', 185, 'Appetizers', true),
      m('Banana Milk', 'Korean-style banana milk', 90, 'Drinks'),
    ],
  },
  {
    name: "Nonna's Trattoria", cuisine: 'Italian', type: 'Pizza and Pasta', rating: 4.7, reviewCount: 260, priceLevel: 3,
    deliveryMin: 35, deliveryMax: 45, imageColor: '#D9A24E', featured: false,
    description: 'Wood-fired pizza and fresh pasta',
    about: 'Family recipes, wood-fired pizza, and pasta made in-house every morning.',
    menu: [
      m('Margherita Pizza', 'Tomato, mozzarella, and basil', 380, 'Main dishes', true),
      m('Spaghetti Carbonara', 'Egg, pecorino, and crispy pancetta', 320, 'Main dishes', true),
      m('Bruschetta', 'Grilled bread with tomato and basil', 160, 'Appetizers', true),
      m('Lasagna', 'Baked pasta with beef ragu and bechamel', 340, 'Main dishes'),
      m('Tiramisu', 'Espresso-soaked ladyfingers and mascarpone', 190, 'Desserts'),
      m('Sparkling Water', '500 ml', 80, 'Drinks'),
    ],
  },
  {
    name: 'Dragon Wok', cuisine: 'Chinese', type: 'Chinese', rating: 4.3, reviewCount: 150, priceLevel: 2,
    deliveryMin: 25, deliveryMax: 35, imageColor: '#8B3A1E', featured: false,
    description: 'Stir-fries, noodles, and dim sum',
    about: 'Wok-fried favorites and family-style platters.',
    menu: [
      m('Yang Chow Fried Rice', 'Shrimp, ham, egg, and vegetables', 195, 'Rice meals', true),
      m('Sweet and Sour Pork', 'Crispy pork with pineapple and peppers', 240, 'Main dishes', true),
      m('Pork Siomai (4 pcs)', 'Steamed dumplings', 110, 'Appetizers', true),
      m('Beef Broccoli', 'Tender beef with broccoli in oyster sauce', 255, 'Main dishes'),
      m('Hot Tea Pot', 'Jasmine tea', 65, 'Drinks'),
    ],
  },
  {
    name: 'Casa Taco', cuisine: 'Mexican', type: 'Tacos', rating: 4.5, reviewCount: 120, priceLevel: 1,
    deliveryMin: 20, deliveryMax: 30, imageColor: '#C4883C', featured: false,
    description: 'Tacos, burritos, and nachos',
    about: 'Street-style tacos on fresh tortillas.',
    menu: [
      m('Carne Asada Tacos (3 pcs)', 'Grilled beef, onion, cilantro, lime', 165, 'Main dishes', true),
      m('Chicken Burrito', 'Rice, beans, chicken, and cheese', 185, 'Main dishes', true),
      m('Loaded Nachos', 'Cheese, beef, jalapeños, and sour cream', 175, 'Appetizers', true),
      m('Churros', 'Cinnamon sugar with chocolate dip', 95, 'Desserts'),
      m('Horchata', 'Sweet cinnamon rice drink', 70, 'Drinks'),
    ],
  },
  {
    name: 'Sunrise Cafe', cuisine: 'Filipino', type: 'Cafe', rating: 4.2, reviewCount: 95, priceLevel: 1,
    deliveryMin: 15, deliveryMax: 25, imageColor: '#6B2D1A', featured: false, deliveryAvailable: false,
    description: 'Coffee, silog breakfasts, and pastries (pickup only)',
    about: 'A small cafe for early mornings. Pickup only.',
    menu: [
      m('Spanish Latte', 'Espresso with sweetened milk', 120, 'Drinks', true),
      m('Bacon Silog', 'Bacon, garlic rice, and egg', 145, 'Rice meals', true),
      m('Banana Bread Slice', 'Moist and nutty', 85, 'Desserts'),
    ],
  },
].map((r, i) => ({ pickupAvailable: true, deliveryAvailable: true, ...r, reviews: reviews(i) }));

const offers = [
  { title: 'Weekend Special', description: 'Get a special discount on selected restaurant orders.', badge: '20%', tone: 'red', layout: 'featured', cta: 'View offer', link: '/restaurants', order: 1 },
  { title: 'Free Delivery', description: 'Enjoy free delivery on selected orders.', badge: '₱', tone: 'gold', layout: 'card', cta: 'Order now', link: '/restaurants?delivery=true', order: 2 },
  { title: 'Orderly Favorites', description: 'Discover selected restaurants and their special deals.', badge: '★', tone: 'rust', layout: 'card', cta: 'Explore', link: '/restaurants?rating=4.5', order: 3 },
];

async function run() {
  await connectDB(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/orderly');
  if (process.argv.includes('--reset')) {
    await Promise.all([User.deleteMany({}), Order.deleteMany({}), Counter.deleteMany({})]);
    console.log('Cleared users, orders, counter.');
  }
  await Promise.all([Restaurant.deleteMany({}), Offer.deleteMany({})]);
  const created = await Restaurant.insertMany(restaurants);
  await Offer.insertMany(offers);
  console.log(`Seeded ${created.length} restaurants and ${offers.length} offers.`);

  if (!(await User.exists({ email: 'demo@orderly.ph' }))) {
    await User.create({
      name: 'Demo Customer', email: 'demo@orderly.ph', phone: '09171234567', address: 'Angeles City, Pampanga',
      passwordHash: await bcrypt.hash('demo1234', 10),
    });
    console.log('Created demo user: demo@orderly.ph / demo1234');
  }
  const admin = await User.findOne({ email: 'admin@orderly.ph' });
  if (!admin) {
    await User.create({
      name: 'Orderly Admin', email: 'admin@orderly.ph', role: 'admin',
      passwordHash: await bcrypt.hash('admin1234', 10),
    });
    console.log('Created admin user: admin@orderly.ph / admin1234');
  } else if (admin.role !== 'admin') {
    admin.role = 'admin';
    await admin.save();
  }
  await mongoose.disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
