import sqlite3

# Connect to the database
conn = sqlite3.connect('vfm_database.db')
cursor = conn.cursor()

# Insert sample data into products table
products = [
    # Fruits
    ('Apple', 'Fruits', 100, 'images/apple.jpg', 50),
    ('Banana', 'Fruits', 50, 'images/banana.jpg', 100),
    ('Orange', 'Fruits', 80, 'images/orange.jpg', 75),
    ('Grape', 'Fruits', 120, 'images/grape.jpg', 60),
    ('Mango', 'Fruits', 150, 'images/mango.jpg', 40),
    ('Pineapple', 'Fruits', 70, 'images/pineapple.jpg', 30),
    # Vegetables
    ('Carrot', 'Vegetables', 40, 'images/carrot.jpg', 70),
    ('Potato', 'Vegetables', 30, 'images/potato.jpg', 100),
    ('Tomato', 'Vegetables', 35, 'images/tomato.jpg', 90),
    ('Onion', 'Vegetables', 25, 'images/onion.jpg', 120),
    ('Broccoli', 'Vegetables', 60, 'images/broccoli.jpg', 40),
    ('Spinach', 'Vegetables', 20, 'images/spinach.jpg', 50),
    # Dairy
    ('Milk', 'Dairy', 50, 'images/milk.jpg', 80),
    ('Cheese', 'Dairy', 200, 'images/cheese.jpg', 30),
    ('Yogurt', 'Dairy', 40, 'images/yogurt.jpg', 50),
    ('Butter', 'Dairy', 150, 'images/butter.jpg', 20),
    ('Paneer', 'Dairy', 250, 'images/paneer.jpg', 25),
    ('Cream', 'Dairy', 100, 'images/cream.jpg', 15)
]

cursor.executemany('''
INSERT INTO products (name, category, price, image_path, stock)
VALUES (?, ?, ?, ?, ?)
''', products)

# Commit and close
conn.commit()
conn.close()

print("Products table populated successfully.")
