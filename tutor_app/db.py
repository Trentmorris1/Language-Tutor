# tutorapp/db.py
import sqlite3
from flask import current_app, g

def get_db():
    """Get a database connection that works both inside and outside Flask."""
    try:
        # --- When inside Flask app context ---
        if 'db' not in g:
            g.db = sqlite3.connect(
                current_app.config['DATABASE'],
                detect_types=sqlite3.PARSE_DECLTYPES
            )
            g.db.row_factory = sqlite3.Row
        return g.db

    except RuntimeError:
        # --- When running standalone (no Flask app context) ---
        db = sqlite3.connect("instance/language_tutor.db")
        db.row_factory = sqlite3.Row
        return db

def close_db(e=None):
    """Closes the database connection."""
    db = g.pop('db', None)
    if db is not None:
        db.close()

def init_db():
    """Clear existing data and create new tables (same SQL as original app.py)."""
    db = get_db()
    
    # 1. Users Table 
    db.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        )
    ''')
    
    # 2. Profiles Table 
    db.execute('''
        CREATE TABLE IF NOT EXISTS profiles (
            user_id INTEGER PRIMARY KEY,
            username TEXT NOT NULL,
            language TEXT NOT NULL,
            proficiency TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')

    # 3. Review List 
    db.execute('''
        CREATE TABLE IF NOT EXISTS review_list (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            word TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')

    # 4. Exercises Table 
    db.execute('''
        CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL CHECK(type IN ('reading', 'writing')),
        prompt TEXT NOT NULL
        )
    ''')

    # 5. Progress Table
    db.execute('''
        CREATE TABLE IF NOT EXISTS progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            reading_ex_errors INTEGER DEFAULT 0,
            reading_ex_words INTEGER DEFAULT 0,
            writing_ex_errors INTEGER DEFAULT 0,
            writing_ex_words INTEGER DEFAULT 0,
            total_errors INTEGER DEFAULT 0,
            total_words INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users (id)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        )
    ''')


    db.commit()

