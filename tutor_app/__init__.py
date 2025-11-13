# tutorapp/__init__.py
import os
from flask import Flask, render_template
from flask_cors import CORS
from . import db
from .db import init_db, close_db


def create_app():
    # Create core Flask application with instance specific storage
    app = Flask(__name__, instance_relative_config=True)
    # Enable credentials for cross origin requests so sessions persist
    CORS(app, supports_credentials=True)

    # Register application level configuration defaults
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path, 'language_tutor.db'),
    )

    # Ensure the instance directory exists before database usage
    os.makedirs(app.instance_path, exist_ok=True)

    # Register teardown so database connections close after requests
    app.teardown_appcontext(close_db)

    # Register authentication blueprint when available
    try:
        from . import auth
        app.register_blueprint(auth.bp)
    except ImportError:
        pass
    
    # Register exercises blueprint when available
    try:
        from . import exercises
        app.register_blueprint(exercises.bp)
    except ImportError:
        pass

    # Register progress blueprint when available
    try:
        from . import progress
        app.register_blueprint(progress.bp)
    except ImportError:
        pass

    @app.cli.command('init-db')
    def init_db_command():
        # Initialize database schema through CLI command
        db.init_db()
        print('Database initialized.')

    @app.route('/')
    def index():
        # Render single page application container template
        return render_template('index.html')

    return app
