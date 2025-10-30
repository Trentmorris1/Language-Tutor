# tutorapp/db.py
import sqlite3
from flask import current_app, g

def get_db():
    """Opens a new database connection if there is none yet for the current application context."""
    if 'db' not in g:
        g.db = sqlite3.connect(
            current_app.config['DATABASE'],
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row  # Allows accessing columns by name
    return g.db

def close_db(e=None):
    """Closes the database connection."""
    db = g.pop('db', None)
    if db is not None:
        db.close()

def init_db():
    """Clear existing data and create new tables (same SQL as original app.py)."""
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
    db.execute('''
        CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL CHECK(type IN ('reading', 'writing')),
        prompt TEXT NOT NULL,
        correct_answer TEXT
        )
    ''')

    db.commit()

