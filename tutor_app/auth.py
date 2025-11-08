# tutorapp/auth.py
from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from .db import get_db

bp = Blueprint('auth', __name__)

def login_required(f):
    """Decorator to require authentication for a route."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'Authentication required.'}), 401
        return f(*args, **kwargs)
    return decorated_function

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    username = data.get('username')

    if not all([email, password, username]):
        return jsonify({'success': False, 'message': 'Missing email, password, or username.'}), 400

    db = get_db()
    cursor = db.cursor()

    if cursor.execute('SELECT id FROM users WHERE email = ?', (email,)).fetchone():
        return jsonify({'success': False, 'message': 'User already registered.'}), 409

    try:
        password_hash = generate_password_hash(password)
        cursor.execute('INSERT INTO users (email, password_hash) VALUES (?, ?)', (email, password_hash))
        user_id = cursor.lastrowid
        cursor.execute(
            'INSERT INTO profiles (user_id, username, language, proficiency) VALUES (?, ?, ?, ?)',
            (user_id, username, 'English', 'Intermediate')  # Default values for backward compatibility
        )
        db.commit()
        return jsonify({'success': True, 'message': 'Registration successful. Please log in.'})
    except Exception as e:
        db.rollback()
        return jsonify({'success': False, 'message': f'Database error: {str(e)}'}), 500


@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    db = get_db()
    user = db.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()

    if user is None or not check_password_hash(user['password_hash'], password):
        return jsonify({'success': False, 'message': 'Incorrect email or password.'}), 401

    profile = db.execute('SELECT * FROM profiles WHERE user_id = ?', (user['id'],)).fetchone()

    if profile is None:
        return jsonify({'success': False, 'message': 'Profile missing.'}), 500

    # Store user_id and username in session
    session['user_id'] = user['id']
    session['username'] = profile['username']

    return jsonify({
        'success': True,
        'message': 'Login successful.',
        'user_id': user['id'],
        'username': profile['username']
    })

@bp.route('/logout', methods=['POST'])
def logout():
    """Log out the current user by clearing the session."""
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully.'})
