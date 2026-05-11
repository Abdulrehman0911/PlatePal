-- ============================================================
--  PlatePal Database
--  MySQL Version
--  Demonstrates: Tables, Views, Triggers, Stored Procedures,
--                Joins, Subqueries, Seed Data
-- ============================================================

DROP DATABASE IF EXISTS platepal;
CREATE DATABASE platepal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE platepal;


-- ============================================================
--  TABLES
-- ============================================================

CREATE TABLE users (
  user_id    INT NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  city       VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id)
);

CREATE TABLE restaurants (
  restaurant_id INT NOT NULL AUTO_INCREMENT,
  name          VARCHAR(255) NOT NULL UNIQUE,
  cuisine_type  VARCHAR(100) NOT NULL,
  city          VARCHAR(100) NOT NULL,
  phone         VARCHAR(50),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (restaurant_id)
);

CREATE TABLE dishes (
  dish_id    INT NOT NULL AUTO_INCREMENT,
  name       VARCHAR(255) NOT NULL UNIQUE,
  category   VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (dish_id)
);

CREATE TABLE nutrition (
  nutrition_id INT NOT NULL AUTO_INCREMENT,
  dish_id      INT NOT NULL UNIQUE,
  calories     INT,
  protein_g    DECIMAL(6,2),
  carbs_g      DECIMAL(6,2),
  fat_g        DECIMAL(6,2),
  fiber_g      DECIMAL(6,2),
  PRIMARY KEY (nutrition_id),
  FOREIGN KEY (dish_id) REFERENCES dishes(dish_id) ON DELETE CASCADE
);

CREATE TABLE restaurant_menu (
  menu_id       INT NOT NULL AUTO_INCREMENT,
  restaurant_id INT NOT NULL,
  dish_id       INT NOT NULL,
  price         DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (menu_id),
  UNIQUE KEY uq_restaurant_dish (restaurant_id, dish_id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
  FOREIGN KEY (dish_id)       REFERENCES dishes(dish_id)            ON DELETE CASCADE
);

CREATE TABLE reviews (
  review_id     INT NOT NULL AUTO_INCREMENT,
  user_id       INT NOT NULL,
  restaurant_id INT NOT NULL,
  rating        TINYINT NOT NULL,
  comment       TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (review_id),
  UNIQUE KEY uq_user_restaurant (user_id, restaurant_id),
  FOREIGN KEY (user_id)       REFERENCES users(user_id)       ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
);

CREATE TABLE favorites (
  favorite_id   INT NOT NULL AUTO_INCREMENT,
  user_id       INT NOT NULL,
  restaurant_id INT NOT NULL,
  saved_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (favorite_id),
  UNIQUE KEY uq_user_favorite (user_id, restaurant_id),
  FOREIGN KEY (user_id)       REFERENCES users(user_id)       ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
);

CREATE TABLE health_logs (
  log_id         INT NOT NULL AUTO_INCREMENT,
  user_id        INT NOT NULL,
  weight_kg      DECIMAL(5,2),
  blood_pressure VARCHAR(20),
  blood_sugar    DECIMAL(6,2),
  notes          TEXT,
  logged_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (log_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);


-- ============================================================
--  VIEWS
--  (pre-built JOINs the application queries by name)
-- ============================================================

-- Restaurants with their average rating and review count
CREATE OR REPLACE VIEW vw_restaurants_with_ratings AS
  SELECT
    r.*,
    ROUND(AVG(rv.rating), 1)  AS avg_rating,
    COUNT(rv.review_id)       AS review_count
  FROM restaurants r
  LEFT JOIN reviews rv ON r.restaurant_id = rv.restaurant_id
  GROUP BY r.restaurant_id;

-- Full menu rows: dish info + nutrition + price for a given restaurant
CREATE OR REPLACE VIEW vw_menu_with_nutrition AS
  SELECT
    rm.restaurant_id,
    rm.price,
    d.dish_id,
    d.name        AS dish_name,
    d.category,
    d.description,
    n.calories,
    n.protein_g,
    n.carbs_g,
    n.fat_g,
    n.fiber_g
  FROM restaurant_menu rm
  JOIN dishes    d ON rm.dish_id = d.dish_id
  JOIN nutrition n ON d.dish_id  = n.dish_id;

-- Reviews enriched with the reviewer's name
CREATE OR REPLACE VIEW vw_reviews_with_user AS
  SELECT
    rv.*,
    u.name AS user_name
  FROM reviews rv
  JOIN users u ON rv.user_id = u.user_id;

-- Dishes above the average calorie count (nested subquery)
CREATE OR REPLACE VIEW vw_high_calorie_dishes AS
  SELECT d.*, n.calories, n.protein_g, n.carbs_g, n.fat_g, n.fiber_g
  FROM dishes d
  JOIN nutrition n ON d.dish_id = n.dish_id
  WHERE n.calories > (SELECT AVG(calories) FROM nutrition);


-- ============================================================
--  TRIGGERS
-- ============================================================

DELIMITER //

-- Validate review rating on INSERT
CREATE TRIGGER trg_before_insert_review
BEFORE INSERT ON reviews
FOR EACH ROW
BEGIN
  IF NEW.rating < 1 OR NEW.rating > 5 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Rating must be between 1 and 5';
  END IF;
END //

-- Validate review rating on UPDATE
CREATE TRIGGER trg_before_update_review
BEFORE UPDATE ON reviews
FOR EACH ROW
BEGIN
  IF NEW.rating < 1 OR NEW.rating > 5 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Rating must be between 1 and 5';
  END IF;
END //

-- Ensure at least one health metric is provided on INSERT
CREATE TRIGGER trg_before_insert_health_log
BEFORE INSERT ON health_logs
FOR EACH ROW
BEGIN
  IF NEW.weight_kg IS NULL AND NEW.blood_pressure IS NULL AND NEW.blood_sugar IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'At least one health metric (weight, blood pressure, or blood sugar) is required';
  END IF;
END //

-- Ensure at least one health metric is provided on UPDATE
CREATE TRIGGER trg_before_update_health_log
BEFORE UPDATE ON health_logs
FOR EACH ROW
BEGIN
  IF NEW.weight_kg IS NULL AND NEW.blood_pressure IS NULL AND NEW.blood_sugar IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'At least one health metric (weight, blood pressure, or blood sugar) is required';
  END IF;
END //

DELIMITER ;


-- ============================================================
--  STORED PROCEDURES
-- ============================================================

DELIMITER //

-- ── AUTH ─────────────────────────────────────────────────────

CREATE PROCEDURE sp_get_user_by_email(IN p_email VARCHAR(255))
BEGIN
  SELECT * FROM users WHERE email = p_email LIMIT 1;
END //

CREATE PROCEDURE sp_get_user_by_id(IN p_user_id INT)
BEGIN
  SELECT user_id, name, email, city, created_at
  FROM users
  WHERE user_id = p_user_id
  LIMIT 1;
END //

-- Password is already hashed in JS before calling this procedure
CREATE PROCEDURE sp_create_user(
  IN p_name     VARCHAR(100),
  IN p_email    VARCHAR(255),
  IN p_password VARCHAR(255),
  IN p_city     VARCHAR(100)
)
BEGIN
  -- Nested subquery: abort if email already exists
  IF EXISTS (SELECT 1 FROM users WHERE email = p_email) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Email already registered';
  END IF;

  INSERT INTO users (name, email, password, city)
  VALUES (p_name, p_email, p_password, p_city);

  SELECT LAST_INSERT_ID() AS user_id, p_name AS name, p_email AS email, p_city AS city;
END //

-- ── RESTAURANTS ──────────────────────────────────────────────

CREATE PROCEDURE sp_get_all_restaurants()
BEGIN
  SELECT * FROM vw_restaurants_with_ratings
  ORDER BY avg_rating DESC, name ASC;
END //

CREATE PROCEDURE sp_search_restaurants(IN p_query VARCHAR(255))
BEGIN
  SELECT * FROM vw_restaurants_with_ratings
  WHERE name LIKE CONCAT('%', p_query, '%')
     OR cuisine_type LIKE CONCAT('%', p_query, '%')
  ORDER BY avg_rating DESC;
END //

CREATE PROCEDURE sp_get_restaurants_by_cuisine(IN p_cuisine VARCHAR(100))
BEGIN
  SELECT * FROM vw_restaurants_with_ratings
  WHERE cuisine_type = p_cuisine
  ORDER BY avg_rating DESC;
END //

CREATE PROCEDURE sp_get_restaurant_by_id(IN p_id INT)
BEGIN
  SELECT * FROM vw_restaurants_with_ratings
  WHERE restaurant_id = p_id
  LIMIT 1;
END //

-- ── DISHES ───────────────────────────────────────────────────

CREATE PROCEDURE sp_get_all_dishes()
BEGIN
  SELECT * FROM dishes ORDER BY name ASC;
END //

CREATE PROCEDURE sp_search_dishes_by_calories(
  IN p_min INT,
  IN p_max INT
)
BEGIN
  -- JOIN across four tables + calorie range filter
  SELECT
    d.*,
    n.calories, n.protein_g, n.carbs_g, n.fat_g, n.fiber_g,
    rm.price,
    r.name AS restaurant_name,
    r.restaurant_id
  FROM dishes d
  JOIN nutrition       n  ON d.dish_id       = n.dish_id
  JOIN restaurant_menu rm ON d.dish_id       = rm.dish_id
  JOIN restaurants     r  ON rm.restaurant_id = r.restaurant_id
  WHERE n.calories BETWEEN p_min AND p_max
  ORDER BY n.calories ASC;
END //

CREATE PROCEDURE sp_get_dish_by_id(IN p_id INT)
BEGIN
  -- Dish with nutrition
  SELECT d.*, n.calories, n.protein_g, n.carbs_g, n.fat_g, n.fiber_g
  FROM dishes d
  LEFT JOIN nutrition n ON d.dish_id = n.dish_id
  WHERE d.dish_id = p_id
  LIMIT 1;

  -- All restaurants that serve this dish (second result set)
  SELECT r.restaurant_id, r.name AS restaurant_name, r.city, rm.price
  FROM restaurant_menu rm
  JOIN restaurants r ON rm.restaurant_id = r.restaurant_id
  WHERE rm.dish_id = p_id;
END //

-- ── MENU ─────────────────────────────────────────────────────

CREATE PROCEDURE sp_get_menu(IN p_restaurant_id INT)
BEGIN
  SELECT * FROM vw_menu_with_nutrition
  WHERE restaurant_id = p_restaurant_id
  ORDER BY category, dish_name;
END //

CREATE PROCEDURE sp_get_menu_by_price(
  IN p_restaurant_id INT,
  IN p_price_min     DECIMAL(10,2),
  IN p_price_max     DECIMAL(10,2)
)
BEGIN
  SELECT * FROM vw_menu_with_nutrition
  WHERE restaurant_id = p_restaurant_id
    AND price BETWEEN p_price_min AND p_price_max
  ORDER BY price ASC;
END //

-- ── REVIEWS ──────────────────────────────────────────────────

CREATE PROCEDURE sp_get_reviews_by_restaurant(IN p_restaurant_id INT)
BEGIN
  SELECT * FROM vw_reviews_with_user
  WHERE restaurant_id = p_restaurant_id
  ORDER BY created_at DESC;
END //

CREATE PROCEDURE sp_add_review(
  IN p_user_id       INT,
  IN p_restaurant_id INT,
  IN p_rating        TINYINT,
  IN p_comment       TEXT
)
BEGIN
  INSERT INTO reviews (user_id, restaurant_id, rating, comment)
  VALUES (p_user_id, p_restaurant_id, p_rating, p_comment);

  -- Return the newly inserted review with user name
  SELECT * FROM vw_reviews_with_user
  WHERE review_id = LAST_INSERT_ID()
  LIMIT 1;
END //

CREATE PROCEDURE sp_get_review_by_id(IN p_review_id INT)
BEGIN
  SELECT * FROM reviews WHERE review_id = p_review_id LIMIT 1;
END //

CREATE PROCEDURE sp_update_review(
  IN p_review_id INT,
  IN p_rating    TINYINT,
  IN p_comment   TEXT
)
BEGIN
  UPDATE reviews
  SET rating  = p_rating,
      comment = p_comment
  WHERE review_id = p_review_id;

  SELECT * FROM reviews WHERE review_id = p_review_id LIMIT 1;
END //

CREATE PROCEDURE sp_delete_review(IN p_review_id INT)
BEGIN
  DELETE FROM reviews WHERE review_id = p_review_id;
END //

-- ── FAVORITES ────────────────────────────────────────────────

CREATE PROCEDURE sp_get_user_favorites(IN p_user_id INT)
BEGIN
  SELECT
    r.*,
    ROUND(AVG(rv.rating), 1) AS avg_rating,
    COUNT(rv.review_id)      AS review_count,
    f.saved_at
  FROM restaurants r
  JOIN favorites f ON r.restaurant_id = f.restaurant_id
  LEFT JOIN reviews rv ON r.restaurant_id = rv.restaurant_id
  WHERE f.user_id = p_user_id
  GROUP BY r.restaurant_id, f.saved_at
  ORDER BY f.saved_at DESC;
END //

CREATE PROCEDURE sp_add_favorite(
  IN p_user_id       INT,
  IN p_restaurant_id INT
)
BEGIN
  INSERT IGNORE INTO favorites (user_id, restaurant_id)
  VALUES (p_user_id, p_restaurant_id);

  SELECT ROW_COUNT() AS changes;
END //

CREATE PROCEDURE sp_remove_favorite(
  IN p_user_id       INT,
  IN p_restaurant_id INT
)
BEGIN
  DELETE FROM favorites
  WHERE user_id = p_user_id AND restaurant_id = p_restaurant_id;

  SELECT ROW_COUNT() AS changes;
END //

CREATE PROCEDURE sp_check_favorite(
  IN p_user_id       INT,
  IN p_restaurant_id INT
)
BEGIN
  SELECT COUNT(*) > 0 AS is_favorited
  FROM favorites
  WHERE user_id = p_user_id AND restaurant_id = p_restaurant_id;
END //

-- ── HEALTH LOGS ──────────────────────────────────────────────

CREATE PROCEDURE sp_add_health_log(
  IN p_user_id        INT,
  IN p_weight_kg      DECIMAL(5,2),
  IN p_blood_pressure VARCHAR(20),
  IN p_blood_sugar    DECIMAL(6,2),
  IN p_notes          TEXT
)
BEGIN
  INSERT INTO health_logs (user_id, weight_kg, blood_pressure, blood_sugar, notes)
  VALUES (p_user_id, p_weight_kg, p_blood_pressure, p_blood_sugar, p_notes);

  SELECT * FROM health_logs WHERE log_id = LAST_INSERT_ID() LIMIT 1;
END //

CREATE PROCEDURE sp_get_health_logs(IN p_user_id INT)
BEGIN
  SELECT * FROM health_logs
  WHERE user_id = p_user_id
  ORDER BY logged_at DESC;
END //

CREATE PROCEDURE sp_get_health_log_by_id(IN p_log_id INT)
BEGIN
  SELECT * FROM health_logs WHERE log_id = p_log_id LIMIT 1;
END //

CREATE PROCEDURE sp_update_health_log(
  IN p_log_id         INT,
  IN p_weight_kg      DECIMAL(5,2),
  IN p_blood_pressure VARCHAR(20),
  IN p_blood_sugar    DECIMAL(6,2),
  IN p_notes          TEXT
)
BEGIN
  UPDATE health_logs
  SET weight_kg      = p_weight_kg,
      blood_pressure = p_blood_pressure,
      blood_sugar    = p_blood_sugar,
      notes          = p_notes
  WHERE log_id = p_log_id;

  SELECT * FROM health_logs WHERE log_id = p_log_id LIMIT 1;
END //

CREATE PROCEDURE sp_delete_health_log(IN p_log_id INT)
BEGIN
  DELETE FROM health_logs WHERE log_id = p_log_id;
END //

DELIMITER ;


-- ============================================================
--  SEED DATA
--  (Users are seeded separately by schema.js using bcrypt)
-- ============================================================

-- ── RESTAURANTS ──────────────────────────────────────────────
INSERT IGNORE INTO restaurants (name, cuisine_type, city, phone) VALUES
  ('Bundu Khan',        'Pakistani',   'Lahore',     '042-35761234'),
  ('Karachi Broast',    'Fast Food',   'Karachi',    '021-35891234'),
  ('Nihari Wala',       'Pakistani',   'Lahore',     '042-37234567'),
  ('BBQ Tonight',       'BBQ',         'Karachi',    '021-35671234'),
  ('Salt n Pepper',     'Continental', 'Lahore',     '042-35891111'),
  ('Cafe Zouk',         'Continental', 'Islamabad',  '051-28901234'),
  ('Bar-B-Q Masters',   'BBQ',         'Lahore',     '042-36781234'),
  ('Savour Foods',      'Pakistani',   'Rawalpindi', '051-45671234'),
  ('Howdy',             'Fast Food',   'Lahore',     '042-38901234'),
  ('Monal Restaurant',  'Pakistani',   'Islamabad',  '051-27891234'),
  ('Cuckoos Den',       'Continental', 'Lahore',     '042-37231234'),
  ('Kababjees',         'Pakistani',   'Karachi',    '021-34561234'),
  ('Quetta Shinwari',   'Pathan',      'Quetta',     '081-23451234'),
  ('Haveli Restaurant', 'Pakistani',   'Lahore',     '042-37801234'),
  ('Desi Dhaba',        'Pakistani',   'Islamabad',  '051-23401234'),
  ('Manhattan Grill',   'American',    'Karachi',    '021-35671111'),
  ('Pizza Palace',      'Italian',     'Lahore',     '042-36781111'),
  ('Spice Bazaar',      'Pakistani',   'Multan',     '061-45671111'),
  ('The Pantry',        'Continental', 'Karachi',    '021-34561111'),
  ('Lal Qila',          'Pakistani',   'Lahore',     '042-38901111'),
  ('Fuchsia',           'Thai',        'Karachi',    '021-37891111'),
  ('Hot Spot',          'Fast Food',   'Islamabad',  '051-28901111'),
  ('Khyber Restaurant', 'Pathan',      'Peshawar',   '091-23451111'),
  ('Dynasty Chinese',   'Chinese',     'Lahore',     '042-37231111');

-- ── DISHES ───────────────────────────────────────────────────
INSERT IGNORE INTO dishes (name, category, description) VALUES
  ('Chicken Karahi',    'Main Course', 'Tender chicken cooked in tomatoes and spices in a wok'),
  ('Mutton Karahi',     'Main Course', 'Slow-cooked mutton in aromatic spices'),
  ('Beef Nihari',       'Main Course', 'Slow-cooked beef shank with rich gravy'),
  ('Chicken Biryani',   'Main Course', 'Fragrant basmati rice with spiced chicken'),
  ('Mutton Biryani',    'Main Course', 'Aromatic basmati rice layered with spiced mutton'),
  ('Seekh Kebab',       'Starters',   'Minced meat skewers with herbs and spices'),
  ('Chapli Kebab',      'Starters',   'Peshawari-style flat minced meat patties'),
  ('Shami Kebab',       'Starters',   'Minced meat patties with chickpeas'),
  ('Haleem',            'Main Course', 'Slow-cooked wheat and meat porridge'),
  ('Paya',              'Main Course', 'Slow-cooked trotters in spiced broth'),
  ('Daal Makhani',      'Main Course', 'Slow-cooked black lentils with butter'),
  ('Palak Paneer',      'Vegetarian',  'Spinach curry with cottage cheese'),
  ('Aloo Gosht',        'Main Course', 'Potato and meat curry'),
  ('Chicken Tikka',     'Starters',   'Marinated chicken pieces grilled on skewers'),
  ('Lahori Fish',       'Main Course', 'Crispy fried fish with spices'),
  ('Prawn Masala',      'Main Course', 'Prawns cooked in tangy masala sauce'),
  ('Naan',              'Bread',       'Traditional tandoor-baked flatbread'),
  ('Roti',              'Bread',       'Whole wheat unleavened flatbread'),
  ('Garlic Naan',       'Bread',       'Naan topped with garlic and butter'),
  ('Paratha',           'Bread',       'Layered whole wheat flatbread'),
  ('Gulab Jamun',       'Dessert',     'Soft milk-solid balls in sugar syrup'),
  ('Kheer',             'Dessert',     'Rice pudding with cardamom and nuts'),
  ('Gajar Ka Halwa',    'Dessert',     'Carrot pudding with ghee and nuts'),
  ('Zarda',             'Dessert',     'Sweet saffron rice with nuts and raisins'),
  ('Rasmalai',          'Dessert',     'Soft cottage cheese dumplings in sweetened milk'),
  ('Lassi',             'Drinks',      'Chilled yogurt-based drink'),
  ('Mango Shake',       'Drinks',      'Fresh mango blended with milk'),
  ('Kashmiri Tea',      'Drinks',      'Pink salted tea with milk and cardamom'),
  ('Lemon Soda',        'Drinks',      'Refreshing lemon soda with mint'),
  ('Rooh Afza',         'Drinks',      'Rose-flavored sweet drink with water or milk'),
  ('Zinger Burger',     'Fast Food',   'Crispy spiced chicken fillet burger'),
  ('Beef Burger',       'Fast Food',   'Juicy beef patty with fresh veggies'),
  ('Club Sandwich',     'Fast Food',   'Triple-decker sandwich with chicken and veggies'),
  ('Chicken Nuggets',   'Fast Food',   'Crispy bite-sized chicken pieces'),
  ('French Fries',      'Fast Food',   'Golden crispy potato fries'),
  ('Margherita Pizza',  'Pizza',       'Classic tomato and mozzarella pizza'),
  ('BBQ Chicken Pizza', 'Pizza',       'Smoky BBQ sauce with grilled chicken'),
  ('Pepperoni Pizza',   'Pizza',       'Classic pepperoni with mozzarella'),
  ('Pasta Arabiata',    'Pasta',       'Spicy tomato sauce pasta'),
  ('Chicken Alfredo',   'Pasta',       'Creamy Alfredo sauce with chicken'),
  ('Kung Pao Chicken',  'Chinese',     'Spicy stir-fried chicken with peanuts'),
  ('Fried Rice',        'Chinese',     'Wok-fried rice with vegetables and egg'),
  ('Chow Mein',         'Chinese',     'Stir-fried noodles with vegetables'),
  ('Spring Rolls',      'Starters',   'Crispy vegetable and meat filled rolls'),
  ('Chicken Manchurian','Chinese',     'Crispy chicken in tangy Manchurian sauce'),
  ('Mixed Grill Platter','BBQ',        'Assorted grilled meats and kebabs'),
  ('Grilled Chicken',   'BBQ',         'Marinated whole chicken grilled to perfection'),
  ('Lamb Chops',        'BBQ',         'Tender lamb chops marinated and grilled'),
  ('BBQ Ribs',          'BBQ',         'Slow-cooked beef ribs with sauce'),
  ('Tandoori Chicken',  'BBQ',         'Whole chicken marinated in yogurt and spices'),
  ('Caesar Salad',      'Salads',      'Romaine lettuce with Caesar dressing and croutons'),
  ('Greek Salad',       'Salads',      'Fresh vegetables with feta cheese and olives'),
  ('Lentil Soup',       'Soups',       'Hearty red lentil soup with spices'),
  ('Chicken Corn Soup', 'Soups',       'Creamy chicken and sweet corn soup'),
  ('Tomato Soup',       'Soups',       'Rich creamy tomato soup');

-- ── NUTRITION ────────────────────────────────────────────────
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 450,  35.0, 15.0, 28.0,  2.0 FROM dishes WHERE name = 'Chicken Karahi';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 520,  38.0, 12.0, 35.0,  1.0 FROM dishes WHERE name = 'Mutton Karahi';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 480,  36.0, 18.0, 30.0,  2.0 FROM dishes WHERE name = 'Beef Nihari';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 650,  40.0, 75.0, 18.0,  3.0 FROM dishes WHERE name = 'Chicken Biryani';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 720,  42.0, 78.0, 22.0,  3.0 FROM dishes WHERE name = 'Mutton Biryani';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 280,  22.0,  8.0, 18.0,  1.0 FROM dishes WHERE name = 'Seekh Kebab';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 320,  24.0, 12.0, 20.0,  1.0 FROM dishes WHERE name = 'Chapli Kebab';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 250,  20.0, 15.0, 12.0,  2.0 FROM dishes WHERE name = 'Shami Kebab';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 380,  28.0, 35.0, 14.0,  4.0 FROM dishes WHERE name = 'Haleem';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 340,  30.0, 10.0, 20.0,  0.0 FROM dishes WHERE name = 'Paya';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 320,  15.0, 40.0, 12.0,  8.0 FROM dishes WHERE name = 'Daal Makhani';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 290,  14.0, 18.0, 18.0,  4.0 FROM dishes WHERE name = 'Palak Paneer';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 420,  28.0, 30.0, 22.0,  4.0 FROM dishes WHERE name = 'Aloo Gosht';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 300,  32.0,  5.0, 16.0,  0.0 FROM dishes WHERE name = 'Chicken Tikka';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 380,  30.0, 20.0, 20.0,  1.0 FROM dishes WHERE name = 'Lahori Fish';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 350,  32.0, 12.0, 20.0,  2.0 FROM dishes WHERE name = 'Prawn Masala';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 260,   8.0, 48.0,  4.0,  2.0 FROM dishes WHERE name = 'Naan';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 120,   4.0, 24.0,  1.0,  3.0 FROM dishes WHERE name = 'Roti';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 300,   9.0, 52.0,  7.0,  2.0 FROM dishes WHERE name = 'Garlic Naan';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 200,   5.0, 30.0,  8.0,  3.0 FROM dishes WHERE name = 'Paratha';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 280,   5.0, 50.0,  8.0,  0.0 FROM dishes WHERE name = 'Gulab Jamun';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 220,   6.0, 40.0,  6.0,  0.0 FROM dishes WHERE name = 'Kheer';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 310,   6.0, 45.0, 12.0,  3.0 FROM dishes WHERE name = 'Gajar Ka Halwa';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 350,   5.0, 65.0, 10.0,  1.0 FROM dishes WHERE name = 'Zarda';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 260,   8.0, 38.0,  9.0,  0.0 FROM dishes WHERE name = 'Rasmalai';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 180,   8.0, 25.0,  6.0,  0.0 FROM dishes WHERE name = 'Lassi';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 240,   6.0, 45.0,  5.0,  2.0 FROM dishes WHERE name = 'Mango Shake';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 120,   4.0, 15.0,  5.0,  0.0 FROM dishes WHERE name = 'Kashmiri Tea';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id,  80,   0.0, 20.0,  0.0,  0.0 FROM dishes WHERE name = 'Lemon Soda';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 100,   1.0, 24.0,  0.0,  0.0 FROM dishes WHERE name = 'Rooh Afza';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 520,  28.0, 48.0, 24.0,  2.0 FROM dishes WHERE name = 'Zinger Burger';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 580,  32.0, 42.0, 30.0,  2.0 FROM dishes WHERE name = 'Beef Burger';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 420,  25.0, 38.0, 18.0,  3.0 FROM dishes WHERE name = 'Club Sandwich';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 350,  20.0, 28.0, 18.0,  1.0 FROM dishes WHERE name = 'Chicken Nuggets';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 320,   4.0, 42.0, 15.0,  4.0 FROM dishes WHERE name = 'French Fries';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 580,  20.0, 72.0, 22.0,  4.0 FROM dishes WHERE name = 'Margherita Pizza';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 650,  28.0, 70.0, 28.0,  4.0 FROM dishes WHERE name = 'BBQ Chicken Pizza';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 700,  30.0, 68.0, 35.0,  3.0 FROM dishes WHERE name = 'Pepperoni Pizza';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 480,  14.0, 72.0, 14.0,  5.0 FROM dishes WHERE name = 'Pasta Arabiata';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 620,  32.0, 65.0, 28.0,  3.0 FROM dishes WHERE name = 'Chicken Alfredo';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 420,  30.0, 22.0, 24.0,  3.0 FROM dishes WHERE name = 'Kung Pao Chicken';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 380,  10.0, 60.0, 12.0,  3.0 FROM dishes WHERE name = 'Fried Rice';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 350,  12.0, 52.0, 10.0,  4.0 FROM dishes WHERE name = 'Chow Mein';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 220,   8.0, 28.0,  9.0,  2.0 FROM dishes WHERE name = 'Spring Rolls';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 380,  25.0, 28.0, 18.0,  2.0 FROM dishes WHERE name = 'Chicken Manchurian';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 680,  55.0, 10.0, 45.0,  1.0 FROM dishes WHERE name = 'Mixed Grill Platter';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 400,  48.0,  5.0, 20.0,  0.0 FROM dishes WHERE name = 'Grilled Chicken';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 480,  42.0,  8.0, 30.0,  0.0 FROM dishes WHERE name = 'Lamb Chops';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 620,  45.0, 12.0, 42.0,  0.0 FROM dishes WHERE name = 'BBQ Ribs';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 380,  46.0,  8.0, 18.0,  0.0 FROM dishes WHERE name = 'Tandoori Chicken';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 280,   8.0, 18.0, 20.0,  3.0 FROM dishes WHERE name = 'Caesar Salad';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 180,   5.0, 15.0, 12.0,  4.0 FROM dishes WHERE name = 'Greek Salad';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 220,  12.0, 32.0,  5.0,  8.0 FROM dishes WHERE name = 'Lentil Soup';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 240,  18.0, 25.0,  8.0,  2.0 FROM dishes WHERE name = 'Chicken Corn Soup';
INSERT IGNORE INTO nutrition (dish_id, calories, protein_g, carbs_g, fat_g, fiber_g)
SELECT dish_id, 160,   4.0, 22.0,  6.0,  3.0 FROM dishes WHERE name = 'Tomato Soup';

-- ── RESTAURANT MENUS ─────────────────────────────────────────
INSERT IGNORE INTO restaurant_menu (restaurant_id, dish_id, price)
SELECT r.restaurant_id, d.dish_id,
  CASE d.name WHEN 'Chicken Karahi' THEN 750 WHEN 'Mutton Karahi' THEN 950 WHEN 'Chicken Biryani' THEN 550 WHEN 'Mutton Biryani' THEN 700 WHEN 'Seekh Kebab' THEN 450 WHEN 'Haleem' THEN 400 WHEN 'Naan' THEN 80 WHEN 'Roti' THEN 40 WHEN 'Gulab Jamun' THEN 250 WHEN 'Lassi' THEN 200 END
FROM restaurants r, dishes d
WHERE r.name = 'Bundu Khan'
  AND d.name IN ('Chicken Karahi','Mutton Karahi','Chicken Biryani','Mutton Biryani','Seekh Kebab','Haleem','Naan','Roti','Gulab Jamun','Lassi');

INSERT IGNORE INTO restaurant_menu (restaurant_id, dish_id, price)
SELECT r.restaurant_id, d.dish_id,
  CASE d.name WHEN 'Zinger Burger' THEN 550 WHEN 'Beef Burger' THEN 600 WHEN 'Club Sandwich' THEN 500 WHEN 'Chicken Nuggets' THEN 420 WHEN 'French Fries' THEN 250 WHEN 'Mango Shake' THEN 250 WHEN 'Lemon Soda' THEN 120 END
FROM restaurants r, dishes d
WHERE r.name = 'Karachi Broast'
  AND d.name IN ('Zinger Burger','Beef Burger','Club Sandwich','Chicken Nuggets','French Fries','Mango Shake','Lemon Soda');

INSERT IGNORE INTO restaurant_menu (restaurant_id, dish_id, price)
SELECT r.restaurant_id, d.dish_id,
  CASE d.name WHEN 'Beef Nihari' THEN 600 WHEN 'Paya' THEN 550 WHEN 'Haleem' THEN 400 WHEN 'Naan' THEN 80 WHEN 'Roti' THEN 40 WHEN 'Paratha' THEN 80 WHEN 'Lassi' THEN 200 WHEN 'Kashmiri Tea' THEN 150 END
FROM restaurants r, dishes d
WHERE r.name = 'Nihari Wala'
  AND d.name IN ('Beef Nihari','Paya','Haleem','Naan','Roti','Paratha','Lassi','Kashmiri Tea');

INSERT IGNORE INTO restaurant_menu (restaurant_id, dish_id, price)
SELECT r.restaurant_id, d.dish_id,
  CASE d.name WHEN 'Seekh Kebab' THEN 450 WHEN 'Chapli Kebab' THEN 500 WHEN 'Chicken Tikka' THEN 650 WHEN 'Mixed Grill Platter' THEN 1500 WHEN 'Grilled Chicken' THEN 900 WHEN 'Lamb Chops' THEN 1200 WHEN 'Tandoori Chicken' THEN 850 WHEN 'Naan' THEN 100 WHEN 'Lassi' THEN 200 END
FROM restaurants r, dishes d
WHERE r.name = 'BBQ Tonight'
  AND d.name IN ('Seekh Kebab','Chapli Kebab','Chicken Tikka','Mixed Grill Platter','Grilled Chicken','Lamb Chops','Tandoori Chicken','Naan','Lassi');

INSERT IGNORE INTO restaurant_menu (restaurant_id, dish_id, price)
SELECT r.restaurant_id, d.dish_id,
  CASE d.name WHEN 'Caesar Salad' THEN 600 WHEN 'Chicken Alfredo' THEN 850 WHEN 'Club Sandwich' THEN 500 WHEN 'Pasta Arabiata' THEN 750 WHEN 'Tomato Soup' THEN 380 WHEN 'Lemon Soda' THEN 150 END
FROM restaurants r, dishes d
WHERE r.name = 'Salt n Pepper'
  AND d.name IN ('Caesar Salad','Chicken Alfredo','Club Sandwich','Pasta Arabiata','Tomato Soup','Lemon Soda');

INSERT IGNORE INTO restaurant_menu (restaurant_id, dish_id, price)
SELECT r.restaurant_id, d.dish_id,
  CASE d.name WHEN 'Caesar Salad' THEN 650 WHEN 'Greek Salad' THEN 550 WHEN 'Chicken Alfredo' THEN 900 WHEN 'Pasta Arabiata' THEN 780 WHEN 'Club Sandwich' THEN 520 WHEN 'Chicken Corn Soup' THEN 420 WHEN 'Lemon Soda' THEN 150 END
FROM restaurants r, dishes d
WHERE r.name = 'Cafe Zouk'
  AND d.name IN ('Caesar Salad','Greek Salad','Chicken Alfredo','Pasta Arabiata','Club Sandwich','Chicken Corn Soup','Lemon Soda');

INSERT IGNORE INTO restaurant_menu (restaurant_id, dish_id, price)
SELECT r.restaurant_id, d.dish_id,
  CASE d.name WHEN 'Seekh Kebab' THEN 400 WHEN 'Chapli Kebab' THEN 450 WHEN 'Chicken Tikka' THEN 600 WHEN 'Mixed Grill Platter' THEN 1400 WHEN 'Grilled Chicken' THEN 850 WHEN 'Tandoori Chicken' THEN 800 WHEN 'Naan' THEN 90 WHEN 'Lassi' THEN 180 END
FROM restaurants r, dishes d
WHERE r.name = 'Bar-B-Q Masters'
  AND d.name IN ('Seekh Kebab','Chapli Kebab','Chicken Tikka','Mixed Grill Platter','Grilled Chicken','Tandoori Chicken','Naan','Lassi');

INSERT IGNORE INTO restaurant_menu (restaurant_id, dish_id, price)
SELECT r.restaurant_id, d.dish_id,
  CASE d.name WHEN 'Chicken Karahi' THEN 700 WHEN 'Mutton Karahi' THEN 900 WHEN 'Chicken Biryani' THEN 500 WHEN 'Seekh Kebab' THEN 400 WHEN 'Haleem' THEN 380 WHEN 'Naan' THEN 70 WHEN 'Roti' THEN 35 WHEN 'Lassi' THEN 180 END
FROM restaurants r, dishes d
WHERE r.name = 'Savour Foods'
  AND d.name IN ('Chicken Karahi','Mutton Karahi','Chicken Biryani','Seekh Kebab','Haleem','Naan','Roti','Lassi');

INSERT IGNORE INTO restaurant_menu (restaurant_id, dish_id, price)
SELECT r.restaurant_id, d.dish_id,
  CASE d.name WHEN 'Zinger Burger' THEN 520 WHEN 'Beef Burger' THEN 580 WHEN 'Club Sandwich' THEN 480 WHEN 'Chicken Nuggets' THEN 400 WHEN 'French Fries' THEN 240 WHEN 'Mango Shake' THEN 240 WHEN 'Lemon Soda' THEN 110 END
FROM restaurants r, dishes d
WHERE r.name = 'Howdy'
  AND d.name IN ('Zinger Burger','Beef Burger','Club Sandwich','Chicken Nuggets','French Fries','Mango Shake','Lemon Soda');

INSERT IGNORE INTO restaurant_menu (restaurant_id, dish_id, price)
SELECT r.restaurant_id, d.dish_id,
  CASE d.name WHEN 'Chicken Karahi' THEN 800 WHEN 'Mutton Biryani' THEN 750 WHEN 'Chicken Tikka' THEN 700 WHEN 'Mixed Grill Platter' THEN 1600 WHEN 'Naan' THEN 100 WHEN 'Lassi' THEN 220 WHEN 'Gulab Jamun' THEN 280 WHEN 'Kashmiri Tea' THEN 160 END
FROM restaurants r, dishes d
WHERE r.name = 'Monal Restaurant'
  AND d.name IN ('Chicken Karahi','Mutton Biryani','Chicken Tikka','Mixed Grill Platter','Naan','Lassi','Gulab Jamun','Kashmiri Tea');

INSERT IGNORE INTO restaurant_menu (restaurant_id, dish_id, price)
SELECT r.restaurant_id, d.dish_id,
  CASE d.name WHEN 'Caesar Salad' THEN 700 WHEN 'Chicken Alfredo' THEN 950 WHEN 'Pasta Arabiata' THEN 800 WHEN 'Club Sandwich' THEN 550 WHEN 'Tomato Soup' THEN 400 WHEN 'Lemon Soda' THEN 160 END
FROM restaurants r, dishes d
WHERE r.name = 'Cuckoos Den'
  AND d.name IN ('Caesar Salad','Chicken Alfredo','Pasta Arabiata','Club Sandwich','Tomato Soup','Lemon Soda');

INSERT IGNORE INTO restaurant_menu (restaurant_id, dish_id, price)
SELECT r.restaurant_id, d.dish_id,
  CASE d.name WHEN 'Seekh Kebab' THEN 420 WHEN 'Chapli Kebab' THEN 480 WHEN 'Shami Kebab' THEN 380 WHEN 'Chicken Tikka' THEN 620 WHEN 'Tandoori Chicken' THEN 820 WHEN 'Naan' THEN 85 WHEN 'Lassi' THEN 190 END
FROM restaurants r, dishes d
WHERE r.name = 'Kababjees'
  AND d.name IN ('Seekh Kebab','Chapli Kebab','Shami Kebab','Chicken Tikka','Tandoori Chicken','Naan','Lassi');

INSERT IGNORE INTO restaurant_menu (restaurant_id, dish_id, price)
SELECT r.restaurant_id, d.dish_id,
  CASE d.name WHEN 'Chapli Kebab' THEN 550 WHEN 'Lamb Chops' THEN 1100 WHEN 'Mutton Karahi' THEN 900 WHEN 'Seekh Kebab' THEN 400 WHEN 'Roti' THEN 45 WHEN 'Lassi' THEN 180 WHEN 'Kashmiri Tea' THEN 140 END
FROM restaurants r, dishes d
WHERE r.name = 'Quetta Shinwari'
  AND d.name IN ('Chapli Kebab','Lamb Chops','Mutton Karahi','Seekh Kebab','Roti','Lassi','Kashmiri Tea');

INSERT IGNORE INTO restaurant_menu (restaurant_id, dish_id, price)
SELECT r.restaurant_id, d.dish_id,
  CASE d.name WHEN 'Chicken Karahi' THEN 780 WHEN 'Mutton Biryani' THEN 720 WHEN 'Seekh Kebab' THEN 430 WHEN 'Haleem' THEN 420 WHEN 'Naan' THEN 85 WHEN 'Roti' THEN 42 WHEN 'Gulab Jamun' THEN 260 WHEN 'Lassi' THEN 210 END
FROM restaurants r, dishes d
WHERE r.name = 'Haveli Restaurant'
  AND d.name IN ('Chicken Karahi','Mutton Biryani','Seekh Kebab','Haleem','Naan','Roti','Gulab Jamun','Lassi');

INSERT IGNORE INTO restaurant_menu (restaurant_id, dish_id, price)
SELECT r.restaurant_id, d.dish_id,
  CASE d.name WHEN 'Chicken Karahi' THEN 650 WHEN 'Daal Makhani' THEN 350 WHEN 'Aloo Gosht' THEN 500 WHEN 'Roti' THEN 35 WHEN 'Paratha' THEN 75 WHEN 'Lassi' THEN 170 END
FROM restaurants r, dishes d
WHERE r.name = 'Desi Dhaba'
  AND d.name IN ('Chicken Karahi','Daal Makhani','Aloo Gosht','Roti','Paratha','Lassi');

INSERT IGNORE INTO restaurant_menu (restaurant_id, dish_id, price)
SELECT r.restaurant_id, d.dish_id,
  CASE d.name WHEN 'Beef Burger' THEN 650 WHEN 'Club Sandwich' THEN 550 WHEN 'BBQ Ribs' THEN 1300 WHEN 'Caesar Salad' THEN 620 WHEN 'French Fries' THEN 280 WHEN 'Lemon Soda' THEN 140 END
FROM restaurants r, dishes d
WHERE r.name = 'Manhattan Grill'
  AND d.name IN ('Beef Burger','Club Sandwich','BBQ Ribs','Caesar Salad','French Fries','Lemon Soda');

INSERT IGNORE INTO restaurant_menu (restaurant_id, dish_id, price)
SELECT r.restaurant_id, d.dish_id,
  CASE d.name WHEN 'Margherita Pizza' THEN 900 WHEN 'BBQ Chicken Pizza' THEN 1100 WHEN 'Pepperoni Pizza' THEN 1200 WHEN 'Pasta Arabiata' THEN 750 WHEN 'Chicken Alfredo' THEN 850 WHEN 'Garlic Naan' THEN 150 WHEN 'Lemon Soda' THEN 130 END
FROM restaurants r, dishes d
WHERE r.name = 'Pizza Palace'
  AND d.name IN ('Margherita Pizza','BBQ Chicken Pizza','Pepperoni Pizza','Pasta Arabiata','Chicken Alfredo','Garlic Naan','Lemon Soda');

INSERT IGNORE INTO restaurant_menu (restaurant_id, dish_id, price)
SELECT r.restaurant_id, d.dish_id,
  CASE d.name WHEN 'Chicken Karahi' THEN 720 WHEN 'Mutton Karahi' THEN 920 WHEN 'Chicken Biryani' THEN 520 WHEN 'Seekh Kebab' THEN 420 WHEN 'Naan' THEN 75 WHEN 'Roti' THEN 38 WHEN 'Lassi' THEN 185 END
FROM restaurants r, dishes d
WHERE r.name = 'Spice Bazaar'
  AND d.name IN ('Chicken Karahi','Mutton Karahi','Chicken Biryani','Seekh Kebab','Naan','Roti','Lassi');

INSERT IGNORE INTO restaurant_menu (restaurant_id, dish_id, price)
SELECT r.restaurant_id, d.dish_id,
  CASE d.name WHEN 'Caesar Salad' THEN 680 WHEN 'Greek Salad' THEN 600 WHEN 'Chicken Alfredo' THEN 920 WHEN 'Pasta Arabiata' THEN 780 WHEN 'Club Sandwich' THEN 540 WHEN 'Tomato Soup' THEN 390 WHEN 'Lemon Soda' THEN 145 END
FROM restaurants r, dishes d
WHERE r.name = 'The Pantry'
  AND d.name IN ('Caesar Salad','Greek Salad','Chicken Alfredo','Pasta Arabiata','Club Sandwich','Tomato Soup','Lemon Soda');

INSERT IGNORE INTO restaurant_menu (restaurant_id, dish_id, price)
SELECT r.restaurant_id, d.dish_id,
  CASE d.name WHEN 'Chicken Karahi' THEN 760 WHEN 'Beef Nihari' THEN 650 WHEN 'Mutton Biryani' THEN 730 WHEN 'Seekh Kebab' THEN 440 WHEN 'Haleem' THEN 410 WHEN 'Naan' THEN 82 WHEN 'Roti' THEN 40 WHEN 'Gulab Jamun' THEN 255 WHEN 'Lassi' THEN 205 END
FROM restaurants r, dishes d
WHERE r.name = 'Lal Qila'
  AND d.name IN ('Chicken Karahi','Beef Nihari','Mutton Biryani','Seekh Kebab','Haleem','Naan','Roti','Gulab Jamun','Lassi');

INSERT IGNORE INTO restaurant_menu (restaurant_id, dish_id, price)
SELECT r.restaurant_id, d.dish_id,
  CASE d.name WHEN 'Kung Pao Chicken' THEN 750 WHEN 'Fried Rice' THEN 500 WHEN 'Chow Mein' THEN 550 WHEN 'Spring Rolls' THEN 380 WHEN 'Chicken Corn Soup' THEN 400 WHEN 'Lemon Soda' THEN 130 END
FROM restaurants r, dishes d
WHERE r.name = 'Fuchsia'
  AND d.name IN ('Kung Pao Chicken','Fried Rice','Chow Mein','Spring Rolls','Chicken Corn Soup','Lemon Soda');

INSERT IGNORE INTO restaurant_menu (restaurant_id, dish_id, price)
SELECT r.restaurant_id, d.dish_id,
  CASE d.name WHEN 'Zinger Burger' THEN 530 WHEN 'Beef Burger' THEN 590 WHEN 'Chicken Nuggets' THEN 410 WHEN 'French Fries' THEN 250 WHEN 'Mango Shake' THEN 245 WHEN 'Lemon Soda' THEN 115 END
FROM restaurants r, dishes d
WHERE r.name = 'Hot Spot'
  AND d.name IN ('Zinger Burger','Beef Burger','Chicken Nuggets','French Fries','Mango Shake','Lemon Soda');

INSERT IGNORE INTO restaurant_menu (restaurant_id, dish_id, price)
SELECT r.restaurant_id, d.dish_id,
  CASE d.name WHEN 'Chapli Kebab' THEN 520 WHEN 'Lamb Chops' THEN 1150 WHEN 'Mutton Karahi' THEN 950 WHEN 'Seekh Kebab' THEN 420 WHEN 'Roti' THEN 42 WHEN 'Lassi' THEN 175 WHEN 'Kashmiri Tea' THEN 145 END
FROM restaurants r, dishes d
WHERE r.name = 'Khyber Restaurant'
  AND d.name IN ('Chapli Kebab','Lamb Chops','Mutton Karahi','Seekh Kebab','Roti','Lassi','Kashmiri Tea');

INSERT IGNORE INTO restaurant_menu (restaurant_id, dish_id, price)
SELECT r.restaurant_id, d.dish_id,
  CASE d.name WHEN 'Kung Pao Chicken' THEN 720 WHEN 'Fried Rice' THEN 480 WHEN 'Chow Mein' THEN 520 WHEN 'Spring Rolls' THEN 350 WHEN 'Chicken Manchurian' THEN 680 WHEN 'Chicken Corn Soup' THEN 380 WHEN 'Lemon Soda' THEN 120 END
FROM restaurants r, dishes d
WHERE r.name = 'Dynasty Chinese'
  AND d.name IN ('Kung Pao Chicken','Fried Rice','Chow Mein','Spring Rolls','Chicken Manchurian','Chicken Corn Soup','Lemon Soda');
