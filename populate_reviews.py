import sqlite3

# Connect to the database
conn = sqlite3.connect('vfm_database.db')
cursor = conn.cursor()

# Insert sample data into reviews table
reviews = [
    (1, 1, 'Great quality fruits!', 5),
    (2, 2, 'Fresh vegetables, will buy again.', 4),
    (3, 3, 'The milk was very fresh and tasty.', 5),
    (1, 4, 'Mangoes were a bit overripe.', 3),
    (2, 5, 'Broccoli was fresh and good.', 4),
    (3, 6, 'Cream was too expensive but good.', 4)
]

cursor.executemany('''
INSERT INTO reviews (user_id, product_id, review, rating)
VALUES (?, ?, ?, ?)
''', reviews)

# Commit and close
conn.commit()
conn.close()

print("Reviews table populated successfully.")
