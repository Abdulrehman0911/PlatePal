const db = require('../utils/db');
const bcrypt = require('bcryptjs');

const initDB = async () => {
  // Wait for database to be initialized
  await db.initPromise;
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      city TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS restaurants (
      restaurant_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      cuisine_type TEXT NOT NULL,
      city TEXT NOT NULL,
      phone TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS dishes (
      dish_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS nutrition (
      nutrition_id INTEGER PRIMARY KEY AUTOINCREMENT,
      dish_id INTEGER UNIQUE NOT NULL,
      calories INTEGER,
      protein_g REAL,
      carbs_g REAL,
      fat_g REAL,
      fiber_g REAL,
      FOREIGN KEY (dish_id) REFERENCES dishes(dish_id)
    );
    CREATE TABLE IF NOT EXISTS restaurant_menu (
      menu_id INTEGER PRIMARY KEY AUTOINCREMENT,
      restaurant_id INTEGER NOT NULL,
      dish_id INTEGER NOT NULL,
      price REAL NOT NULL,
      UNIQUE(restaurant_id, dish_id),
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id),
      FOREIGN KEY (dish_id) REFERENCES dishes(dish_id)
    );
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
    );
    CREATE TABLE IF NOT EXISTS favorites (
      favorite_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      restaurant_id INTEGER NOT NULL,
      saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, restaurant_id),
      FOREIGN KEY (user_id) REFERENCES users(user_id),
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id)
    );
    CREATE TABLE IF NOT EXISTS health_logs (
      log_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      weight_kg REAL,
      blood_pressure TEXT,
      blood_sugar INTEGER,
      notes TEXT,
      logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id)
    );
  `);

  const count = db.get('SELECT COUNT(*) as count FROM restaurants');
  if (!count || count.count === 0) {
    seedData();
  } else {
    console.log('✅ Database already seeded');
  }
};

const seedData = () => {
  const password = bcrypt.hashSync('Test123!', 10);

  db.prepare('INSERT OR IGNORE INTO users (name, email, password, city) VALUES (?, ?, ?, ?)').run('Ahmed Khan', 'user1@test.com', password, 'Lahore');
  db.prepare('INSERT OR IGNORE INTO users (name, email, password, city) VALUES (?, ?, ?, ?)').run('Sara Ali', 'user2@test.com', password, 'Karachi');

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
  restaurants.forEach(r => db.prepare('INSERT OR IGNORE INTO restaurants (name, cuisine_type, city, phone) VALUES (?, ?, ?, ?)').run(...r));

  const dishes = [
    ['Chicken Karahi', 'Main Course', 'Tender chicken cooked in tomatoes and spices in a wok'],
    ['Mutton Karahi', 'Main Course', 'Slow-cooked mutton in aromatic spices'],
    ['Beef Nihari', 'Main Course', 'Slow-cooked beef shank with rich gravy'],
    ['Chicken Biryani', 'Main Course', 'Fragrant basmati rice with spiced chicken'],
    ['Mutton Biryani', 'Main Course', 'Aromatic basmati rice layered with spiced mutton'],
    ['Seekh Kebab', 'Starters', 'Minced meat skewers with herbs and spices'],
    ['Chapli Kebab', 'Starters', 'Peshawari-style flat minced meat patties'],
    ['Shami Kebab', 'Starters', 'Minced meat patties with chickpeas'],
    ['Haleem', 'Main Course', 'Slow-cooked wheat and meat porridge'],
    ['Paya', 'Main Course', 'Slow-cooked trotters in spiced broth'],
    ['Daal Makhani', 'Main Course', 'Slow-cooked black lentils with butter'],
    ['Palak Paneer', 'Vegetarian', 'Spinach curry with cottage cheese'],
    ['Aloo Gosht', 'Main Course', 'Potato and meat curry'],
    ['Chicken Tikka', 'Starters', 'Marinated chicken pieces grilled on skewers'],
    ['Lahori Fish', 'Main Course', 'Crispy fried fish with spices'],
    ['Prawn Masala', 'Main Course', 'Prawns cooked in tangy masala sauce'],
    ['Naan', 'Bread', 'Traditional tandoor-baked flatbread'],
    ['Roti', 'Bread', 'Whole wheat unleavened flatbread'],
    ['Garlic Naan', 'Bread', 'Naan topped with garlic and butter'],
    ['Paratha', 'Bread', 'Layered whole wheat flatbread'],
    ['Gulab Jamun', 'Dessert', 'Soft milk-solid balls in sugar syrup'],
    ['Kheer', 'Dessert', 'Rice pudding with cardamom and nuts'],
    ['Gajar Ka Halwa', 'Dessert', 'Carrot pudding with ghee and nuts'],
    ['Zarda', 'Dessert', 'Sweet saffron rice with nuts and raisins'],
    ['Rasmalai', 'Dessert', 'Soft cottage cheese dumplings in sweetened milk'],
    ['Lassi', 'Drinks', 'Chilled yogurt-based drink'],
    ['Mango Shake', 'Drinks', 'Fresh mango blended with milk'],
    ['Kashmiri Tea', 'Drinks', 'Pink salted tea with milk and cardamom'],
    ['Lemon Soda', 'Drinks', 'Refreshing lemon soda with mint'],
    ['Rooh Afza', 'Drinks', 'Rose-flavored sweet drink with water/milk'],
    ['Zinger Burger', 'Fast Food', 'Crispy spiced chicken fillet burger'],
    ['Beef Burger', 'Fast Food', 'Juicy beef patty with fresh veggies'],
    ['Club Sandwich', 'Fast Food', 'Triple-decker sandwich with chicken and veggies'],
    ['Chicken Nuggets', 'Fast Food', 'Crispy bite-sized chicken pieces'],
    ['French Fries', 'Fast Food', 'Golden crispy potato fries'],
    ['Margherita Pizza', 'Pizza', 'Classic tomato and mozzarella pizza'],
    ['BBQ Chicken Pizza', 'Pizza', 'Smoky BBQ sauce with grilled chicken'],
    ['Pepperoni Pizza', 'Pizza', 'Classic pepperoni with mozzarella'],
    ['Pasta Arabiata', 'Pasta', 'Spicy tomato sauce pasta'],
    ['Chicken Alfredo', 'Pasta', 'Creamy Alfredo sauce with chicken'],
    ['Kung Pao Chicken', 'Chinese', 'Spicy stir-fried chicken with peanuts'],
    ['Fried Rice', 'Chinese', 'Wok-fried rice with vegetables and egg'],
    ['Chow Mein', 'Chinese', 'Stir-fried noodles with vegetables'],
    ['Spring Rolls', 'Starters', 'Crispy vegetable and meat filled rolls'],
    ['Chicken Manchurian', 'Chinese', 'Crispy chicken in tangy Manchurian sauce'],
    ['Mixed Grill Platter', 'BBQ', 'Assorted grilled meats and kebabs'],
    ['Grilled Chicken', 'BBQ', 'Marinated whole chicken grilled to perfection'],
    ['Lamb Chops', 'BBQ', 'Tender lamb chops marinated and grilled'],
    ['BBQ Ribs', 'BBQ', 'Slow-cooked beef ribs with sauce'],
    ['Tandoori Chicken', 'BBQ', 'Whole chicken marinated in yogurt and spices'],
    ['Caesar Salad', 'Salads', 'Romaine lettuce with Caesar dressing and croutons'],
    ['Greek Salad', 'Salads', 'Fresh vegetables with feta cheese and olives'],
    ['Lentil Soup', 'Soups', 'Hearty red lentil soup with spices'],
    ['Chicken Corn Soup', 'Soups', 'Creamy chicken and sweet corn soup'],
    ['Tomato Soup', 'Soups', 'Rich creamy tomato soup'],
  ];
  dishes.forEach(d => db.prepare('INSERT OR IGNORE INTO dishes (name, category, description) VALUES (?, ?, ?)').run(...d));

  console.log('✅ Database seeded: 24 restaurants, 55 dishes');
};

module.exports = initDB;
