import os

from flask import Flask

def create_app():
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY = 'natetrentsimon',
        DATABASE = os.path.join(app.instance_path, 'flaskr.sqlite')
    )
    


    return app