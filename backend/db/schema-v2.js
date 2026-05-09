const db = require('../utils/db');
const bcrypt = require('bcryptjs');

const CREATE_TABLES_SQL = {
  users: `
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      city TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
  restaurants: `
    CREATE TABLE IF NOT EXISTS restaurants (
      restaurant_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      cuisine_type TEXT NOT NULL,
      city TEXT NOT NULL,
      phone TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
  dishes: `
    CREATE TABLE IF NOT EXISTS dishes (
      dish_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
  nutrition: `
    CREATE TABLE IF NOT EXISTS nutrition (
      nutrition_id INTEGER PRIMARY KEY AUTOINCREMENT,
      dish_id INTEGER UNIQUE NOT NULL,
      calories INTEGER,
      protein_g REAL,
      carbs_g REAL,
      fat_g REAL,
      fiber_g REAL,
      FOREIGN KEY (dish_id) REFERENCES dishes(dish_id)
    )`,
  restaurant_menu: `
    CREATE TABLE IF NOT EXISTS restaurant_menu (
      menu_id INTEGER PRIMARY KEY AUTOINCREMENT,
      restaurant_id INTEGER NOT NULL,
      dish_id INTEGER NOT NULL,
      price REAL NOT NULL,
      UNIQUE(restaurant_id, dish_id),
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id),
      FOREIGN KEY (dish_id) REFERENCES dishes(dish_id)
    )`,
  reviews: `
    CREATE TABLE IF NOT EXISTS reviews (
      review_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      restaurant_id INTEGER NOT NULL,
      rating INTEGER CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, restaurant_id),
      FOREIGN KEY (user_id) REFERENCES users(user_id),
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id)
    )`,
  favorites: `
    CREATE TABLE IF NOT EXISTS favorites (
      favorite_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      restaurant_id INTEGER NOT NULL,
      saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, restaurant_id),
      FOREIGN KEY (user_id) REFERENCES users(user_id),
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id)
    )`,
  health_logs: `
    CREATE TABLE IF NOT EXISTS health_logs (
      log_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      weight_kg REAL,
      blood_pressure TEXT,
      blood_sugar INTEGER,
      notes TEXT,
      logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id)
    )`
};

const initDB = async () => {
  try {
    // Initialize database connection first
    await db.initialize();
    
    // Create all tables
    for (const [name, sql] of Object.entries(CREATE_TABLES_SQL)) {
      await db.executeSql(sql);
    }
    
    // Check if data is already seeded
    const count = await db.getRow('SELECT COUNT(*) as count FROM restaurants');
    if (!count || count.count === 0) {
      await seedData();
    } else {
      console.log('✅ Database already seeded');
    }
  } catch (err) {
    console.error('Database initialization error:', err);
    throw err;
  }
};

const seedData = async () => {
  const password = bcrypt.hashSync('Test123!', 10);

  // Seed users
  await db.executeSql('INSERT OR IGNORE INTO users (name, email, password, city) VALUES (?, ?, ?, ?)', 
    ['Ahmed Khan', 'user1@test.com', password, 'Lahore']);
  await db.executeSql('INSERT OR IGNORE INTO users (name, email, password, city) VALUES (?, ?, ?, ?)', 
    ['Sara Ali', 'user2@test.com', password, 'Karachi']);

  // Seed restaurants (simplified - only create table structure)
  const restaurants = [
    ['Bundu Khan', 'Pakistani', 'Lahore', '042-35761234'],
    ['Karachi Broast', 'Fast Food', 'Karachi', '021-35891234'],
    ['Nihari Wala', 'Pakistani', 'Lahore', '042-37234567'],
    ['BBQ Tonight', 'BBQ', 'Karachi', '021-35671234'],
    ['Salt n Pepper', 'Continental', 'Lahore', '042-35891111'],
    ['Cafe Zouk', 'Continental', 'Islamabad', '051-28901234'],
    ['Bar-B-Q Masters', 'BBQ', 'Lahore', '042-36781234'],
    ['Savour Foods', 'Pakistani', 'Rawalpindi', '051-45671234'],
    ['Howdy', 'Fast Food', 'Lahore', '042-38901234'],
    ['Monal Restaurant', 'Pakistani', 'Islamabad', '051-27891234'],
    ["Cuckoo's Den", 'Continental', 'Lahore', '042-37231234'],
    ['Kababjees', 'Pakistani', 'Karachi', '021-34561234'],
    ['Quetta Shinwari', 'Pathan', 'Quetta', '081-23451234'],
    ['Haveli Restaurant', 'Pakistani', 'Lahore', '042-37801234'],
    ['Desi Dhaba', 'Pakistani', 'Islamabad', '051-23401234'],
    ['Manhattan Grill', 'American', 'Karachi', '021-35671111'],
    ['Pizza Palace', 'Italian', 'Lahore', '042-36781111'],
    ['Spice Bazaar', 'Pakistani', 'Multan', '061-45671111'],
    ['The Pantry', 'Continental', 'Karachi', '021-34561111'],
    ['Lal Qila', 'Pakistani', 'Lahore', '042-38901111'],
    ['Fuchsia', 'Thai', 'Karachi', '021-37891111'],
    ['Hot Spot', 'Fast Food', 'Islamabad', '051-28901111'],
    ['Khyber Restaurant', 'Pathan', 'Peshawar', '091-23451111'],
    ['Dynasty Chinese', 'Chinese', 'Lahore', '042-37231111'],
  ];
  
  for (const r of restaurants) {
    await db.executeSql('INSERT OR IGNORE INTO restaurants (name, cuisine_type, city, phone) VALUES (?, ?, ?, ?)', r);
  }

  console.log('✅ Database seeded: 24 restaurants');
};

module.exports = initDB;
