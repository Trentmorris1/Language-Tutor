# tutorapp/__init__.py
import os
from flask import Flask, render_template
from flask_cors import CORS
from . import db
from .db import init_db, close_db


def create_app():
    app = Flask(__name__, instance_relative_config=True)
    # Enable credentials (cookies) for CORS - required for sessions
    CORS(app, supports_credentials=True)

    # Set up configuration
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path, 'language_tutor.db'),
    )

    # Ensure the instance folder exists
    os.makedirs(app.instance_path, exist_ok=True)

    # Register teardown so DB closes after each request
    app.teardown_appcontext(close_db)

    # Register blueprints (optional for now)
    try:
        from . import auth
        app.register_blueprint(auth.bp)
    except ImportError:
        pass
    
    try:
        from . import exercises
        app.register_blueprint(exercises.bp)
    except ImportError:
        pass

    try:
        from . import progress
        app.register_blueprint(progress.bp)
    except ImportError:
        pass

    @app.cli.command('init-db')
    def init_db_command():
        """Initialize the database (create tables)."""
        db.init_db()
        print('Database initialized.')

    @app.route('/')
    def index():
        return render_template('index.html')

    return app
