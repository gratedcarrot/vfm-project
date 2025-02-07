import sqlite3


conn = sqlite3.connect('vfm_database.db')
cursor = conn.cursor()


cursor.execute('''
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    image_path TEXT NOT NULL,
    stock INTEGER DEFAULT 0
)
''')


cursor.execute('''
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    mobile_no TEXT NOT NULL,
    address TEXT NOT NULL,
    pincode TEXT NOT NULL
)
''')


cursor.execute('''
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    review TEXT NOT NULL,
    rating INTEGER CHECK(rating >= 1 AND rating <= 5),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
)
''')


conn.commit()
conn.close()

print("Database setup complete.")


