# tutorapp/auth.py
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from .db import get_db

bp = Blueprint('auth', __name__)

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
            (user_id, username, 'English', 'Intermediate')
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

    return jsonify({
        'success': True,
        'message': 'Login successful.',
        'user_id': user['id'],
        'username': profile['username'],
        'language': profile['language'],
        'proficiency': profile['proficiency']
    })
