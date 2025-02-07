from flask import Flask, jsonify, send_from_directory, request, session, g
from flask_cors import CORS
from flask import send_file
import bcrypt
import os
import sqlite3
from PIL import Image, ImageDraw, ImageFont
import random
import string
import os
from flask import redirect, url_for, render_template

app = Flask(__name__)
app.secret_key = 'your_secret_key'  
CORS(app)


def get_db_connection():
    db_path = r'C:\Users\Pratap\Documents\Sem-6 folder\FOE\Lab project\vfm_database.db'
    print("Connecting to database at:", db_path)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row  
    return conn

@app.route('/show-tables')
def show_tables():
    conn = get_db_connection()
    cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row[0] for row in cursor.fetchall()]
    conn.close()
    return jsonify({"tables": tables})

@app.route('/')
def home():
    return send_from_directory('static', 'index.html')  


@app.route('/learn_more.html')
def learn_more():
    return send_from_directory('static', 'learn_more.html')



@app.route('/products')
def fetch_products():
    categories = request.args.get('categories')  
    conn = get_db_connection()

    if categories:
        categories = categories.split(',')  
        query = "SELECT * FROM products WHERE category IN ({})".format(
            ','.join('?' for _ in categories)
        )
        cursor = conn.execute(query, categories)
    else:
        cursor = conn.execute('SELECT * FROM products')  

    products = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(products)

@app.route('/add-to-cart', methods=['POST'])
def add_to_cart():
    data = request.get_json()
    print("Cart Data:", data)
    return jsonify({"message": "Item added to cart successfully", "cart": data})

@app.route('/captcha-image')
def generate_captcha():
    captcha_text = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    session['captcha_text'] = captcha_text

   
    image = Image.new('RGB', (150, 50), (255, 255, 255))
    draw = ImageDraw.Draw(image)
    font_path = os.path.join(os.path.dirname(__file__), 'arial.ttf')
    font = ImageFont.truetype(font_path, 30)
    draw.text((10, 5), captcha_text, fill=(0, 0, 0), font=font)

    from io import BytesIO
    img_io = BytesIO()
    image.save(img_io, 'PNG')
    img_io.seek(0)
    return send_file(img_io, mimetype='image/png')

@app.route('/validate-captcha', methods=['POST'])
def validate_captcha():
    user_captcha = request.json.get('captcha', '')
    if user_captcha == session.get('captcha_text', ''):
        return jsonify({"success": True, "message": "CAPTCHA verified"})
    else:
        return jsonify({"success": False, "message": "Incorrect CAPTCHA"}), 400

@app.route('/images/<path:filename>')
def serve_image(filename):
    return send_from_directory('static/images', filename)

@app.route('/health')
def health_check():
    return jsonify({"status": "running"})

@app.route('/register', methods=['POST'])
def register_user():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "No data provided"}), 400

        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        mobile_no = data.get('mobile_no')
        address = data.get('address')
        pincode = data.get('pincode')

        if not name or not email or not password or not mobile_no or not address or not pincode:
            return jsonify({"success": False, "message": "All fields are required"}), 400

              
        conn = get_db_connection()
        conn.execute('INSERT INTO users (name, email, password, mobile_no, address, pincode) VALUES (?, ?, ?, ?, ?, ?)',
                     (name, email, password, mobile_no, address, pincode))

        conn.commit()
        conn.close()

        return jsonify({"success": True, "message": "User registered successfully"})
    except sqlite3.IntegrityError:
        return jsonify({"success": False, "message": "Email already exists"}), 400
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"success": False, "message": "Internal Server Error"}), 500

    
@app.route('/login', methods=['POST'])
def login_user():
    data = request.get_json()
    email = data['email']
    password = data['password']

    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
    conn.close()

    if user:
        
        if password == user['password']:
            session['user_id'] = user['id']
            return jsonify({"success": True, "message": "Login successful"})
        else:
            return jsonify({"success": False, "message": "Invalid email or password"}), 401
    else:
        return jsonify({"success": False, "message": "Invalid email or password"}), 401

@app.before_request
def load_logged_in_user():
    user_id = session.get('user_id')
    if user_id is None:
        g.user = None
    else:
        conn = get_db_connection()
        g.user = conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
        conn.close()

@app.route('/protected')
def protected_route():
    if g.user is None:
        return jsonify({"success": False, "message": "Unauthorized"}), 403
    return jsonify({"success": True, "message": "Welcome, {}".format(g.user['name'])})

@app.route('/reviews', methods=['GET'])
def get_reviews():
    """Fetch reviews from the database with user names and product details"""
    conn = get_db_connection()
    query = """
        SELECT r.id, u.name AS user_name, p.name AS product_name, r.review, r.rating
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        JOIN products p ON r.product_id = p.id
    """
    cursor = conn.execute(query)
    reviews = [
        {
            "id": row["id"],
            "user_name": row["user_name"],
            "product_name": row["product_name"],
            "review": row["review"],
            "rating": row["rating"]
        }
        for row in cursor.fetchall()
    ]
    conn.close()
    return jsonify(reviews)


@app.route('/reviews', methods=['POST'])
def add_review():
    if 'user_id' not in session:
        return jsonify({"success": False, "message": "User not logged in"}), 401

    data = request.get_json()
    product_name = data.get('product_name')
    review = data.get('review')
    rating = data.get('rating')
    user_id = session['user_id']

    if not product_name or not review or not rating:
        return jsonify({"success": False, "message": "Missing required fields"}), 400

    try:
        db = get_db_connection()
        product = db.execute("SELECT id FROM products WHERE name = ?", (product_name,)).fetchone()
        if not product:
            return jsonify({"success": False, "message": "Product not found"}), 404

        db.execute(
            "INSERT INTO reviews (user_id, product_id, review, rating) VALUES (?, ?, ?, ?)",
            (user_id, product['id'], review, rating)
        )
        db.commit()
        return jsonify({"success": True, "message": "Review added successfully"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@app.route('/product-names', methods=['GET'])
def get_product_names():
    conn = get_db_connection()
    cursor = conn.execute("SELECT name FROM products")
    products = cursor.fetchall()
    conn.close()
    
    # Ensure correct format
    product_list = [row["name"] for row in products]  
    return jsonify(product_list)

@app.route('/search')
def search():
    query = request.args.get('q', '').strip()
    
    if not query:
        return redirect(url_for('home'))  

    conn = get_db_connection()
    product = conn.execute("SELECT id FROM products WHERE name LIKE ?", ('%' + query + '%',)).fetchone()
    conn.close()

    if product:
        return redirect(url_for('home', _anchor=query))  

    return redirect(url_for('home', _anchor="catalog"))  

@app.route('/current-user', methods=['GET'])
def get_current_user():
    """Check if a user is logged in and return their details"""
    if 'user_id' in session:
        conn = get_db_connection()
        user = conn.execute("SELECT id, name, email, mobile_no, address FROM users WHERE id = ?", (session['user_id'],)).fetchone()
        conn.close()
        
        if user:
            return jsonify({
                "logged_in": True,
                "user_id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "contact": user["mobile_no"],
                "address": user["address"]
            })
    return jsonify({"logged_in": False})

@app.route('/update-profile', methods=['POST'])
def update_profile():
    """Allow logged-in users to update their profile details"""
    if 'user_id' not in session:
        return jsonify({"success": False, "message": "User not logged in"}), 401

    data = request.get_json()
    name = data.get("name")
    contact = data.get("contact")
    address = data.get("address")

    if not name or not contact or not address:
        return jsonify({"success": False, "message": "All fields are required"}), 400

    conn = get_db_connection()
    conn.execute(
        "UPDATE users SET name = ?, mobile_no = ?, address = ? WHERE id = ?",
        (name, contact, address, session['user_id'])
    )
    conn.commit()
    conn.close()

    return jsonify({"success": True, "message": "Profile updated successfully"})


@app.route('/logout', methods=['POST'])
def logout():
    """Logs the user out by clearing session data."""
    session.clear()
    return jsonify({"success": True, "message": "Logged out successfully"})

if __name__ == '__main__':
    app.run(debug=True, port=5001)  

@app.errorhandler(500)
def handle_internal_server_error(e):
    return jsonify({"success": False, "message": "Internal Server Error"}), 500

app.run(debug=True, port=5001)

