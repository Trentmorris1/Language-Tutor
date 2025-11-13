# Tutor app database helpers
import sqlite3
from flask import current_app, g

def get_db():
    # Provide a sqlite connection both inside and outside Flask context
    try:
        # When inside Flask application context reuse the cached connection
        if 'db' not in g:
            g.db = sqlite3.connect(
                current_app.config['DATABASE'],
                detect_types=sqlite3.PARSE_DECLTYPES
            )
            g.db.row_factory = sqlite3.Row
        return g.db

    except RuntimeError:
        # When running standalone connect directly to the instance database
        db = sqlite3.connect("instance/language_tutor.db")
        db.row_factory = sqlite3.Row
        return db

def close_db(e=None):
    # Close the sqlite connection at the end of a request
    db = g.pop('db', None)
    if db is not None:
        db.close()

def init_db():
    # Create core tables if they do not exist
    db = get_db()
    
    # Users table
    db.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        )
    ''')
    
    # Profiles table
    db.execute('''
        CREATE TABLE IF NOT EXISTS profiles (
            user_id INTEGER PRIMARY KEY,
            username TEXT NOT NULL,
            language TEXT NOT NULL,
            proficiency TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')

    # Exercises table
    db.execute('''
        CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL CHECK(type IN ('reading', 'writing')),
        prompt TEXT NOT NULL
        )
    ''')

    # Progress table
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
            grammar_errors INTEGER DEFAULT 0,
            style_errors INTEGER DEFAULT 0,
            typo_errors INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users (id)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        )
    ''')

    # Persist schema changes to disk
    db.commit()

