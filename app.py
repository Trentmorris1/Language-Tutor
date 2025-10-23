import sqlite3
import os
from flask import Flask, request, jsonify, g
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS # New Import for CORS

# --- Flask & Database Configuration ---

app = Flask(__name__, instance_relative_config=True)
CORS(app) # Initialize CORS to allow cross-origin requests
# Ensure the instance folder exists for the SQLite file
os.makedirs(app.instance_path, exist_ok=True)
DATABASE = os.path.join(app.instance_path, 'language_tutor.db')

# --- Database Initialization Functions ---

def get_db():
    """Opens a new database connection if there is none yet for the current application context."""
    if 'db' not in g:
        g.db = sqlite3.connect(
            DATABASE,
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row # Allows accessing columns by name
    return g.db

def close_db(e=None):
    """Closes the database connection."""
    db = g.pop('db', None)
    if db is not None:
        db.close()

def init_db():
    """Clear existing data and create new tables."""
    db = get_db()
    
    # 1. Users Table (for authentication)
    db.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        )
    ''')
    
    # 2. Profiles Table (for FR1: Language and Proficiency settings)
    db.execute('''
        CREATE TABLE IF NOT EXISTS profiles (
            user_id INTEGER PRIMARY KEY,
            username TEXT NOT NULL,
            language TEXT NOT NULL,
            proficiency TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')

    # 3. Review List (for FR8: Difficult words - simple structure)
    db.execute('''
        CREATE TABLE IF NOT EXISTS review_list (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            word TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    db.commit()

# Register init_db with the application context
with app.app_context():
    init_db()

# Attach teardown function to close the DB connection after each request
app.teardown_appcontext(close_db)

# --- API Endpoints ---

@app.route('/register', methods=['POST'])
def register():
    """Endpoint for user registration (FR6)."""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    username = data.get('username')

    if not all([email, password, username]):
        return jsonify({'success': False, 'message': 'Missing email, password, or username.'}), 400

    db = get_db()
    cursor = db.cursor()
    
    # Check if user already exists
    if cursor.execute('SELECT id FROM users WHERE email = ?', (email,)).fetchone():
        return jsonify({'success': False, 'message': 'User already registered.'}), 409

    try:
        password_hash = generate_password_hash(password)
        
        # Insert user into users table
        cursor.execute(
            'INSERT INTO users (email, password_hash) VALUES (?, ?)',
            (email, password_hash)
        )
        user_id = cursor.lastrowid
        
        # Insert default profile (FR1)
        cursor.execute(
            'INSERT INTO profiles (user_id, username, language, proficiency) VALUES (?, ?, ?, ?)',
            (user_id, username, 'English', 'Intermediate')
        )
        db.commit()
        return jsonify({'success': True, 'message': 'Registration successful. Please log in.'})
    except Exception as e:
        db.rollback()
        return jsonify({'success': False, 'message': f'Database error during registration: {str(e)}'}), 500

@app.route('/login', methods=['POST'])
def login():
    """Endpoint for user login (FR6). Returns profile data on success."""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    db = get_db()
    user = db.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()

    if user is None or not check_password_hash(user['password_hash'], password):
        return jsonify({'success': False, 'message': 'Incorrect email or password.'}), 401
    
    # Fetch profile data (FR7)
    profile = db.execute('SELECT * FROM profiles WHERE user_id = ?', (user['id'],)).fetchone()
    
    if profile is None:
         return jsonify({'success': False, 'message': 'Profile data missing. Contact support.'}), 500

    # In a real app, this would set a secure session cookie. Here we return data for client-side storage.
    return jsonify({
        'success': True,
        'message': 'Login successful.',
        'user_id': user['id'],
        'username': profile['username'],
        'language': profile['language'],
        'proficiency': profile['proficiency']
    })

@app.route('/api/profile/<int:user_id>', methods=['POST'])
def update_profile(user_id):
    """Endpoint to update user profile settings (FR1)."""
    data = request.get_json()
    language = data.get('language')
    proficiency = data.get('proficiency')

    if not all([language, proficiency]):
        return jsonify({'success': False, 'message': 'Missing language or proficiency data.'}), 400

    db = get_db()
    try:
        db.execute(
            'UPDATE profiles SET language = ?, proficiency = ? WHERE user_id = ?',
            (language, proficiency, user_id)
        )
        db.commit()
        return jsonify({'success': True, 'message': 'Profile updated.'})
    except Exception as e:
        db.rollback()
        return jsonify({'success': False, 'message': f'Database error: {str(e)}'}), 500


if __name__ == '__main__':
    # WARNING: For development purposes only. Set host to '0.0.0.0' to run in the container.
    # The default Flask port is 5000.
    app.run(host='0.0.0.0', port=5000, debug=True)
