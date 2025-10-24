# tutorapp/__init__.py
import os
from flask import Flask
from flask_cors import CORS

from .db import init_db, close_db


def create_app():
    app = Flask(__name__, instance_relative_config=True)
    CORS(app)

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

    return app
