import os
import language_tool_python
from flask import Flask, render_template, request

def create_app():
    app = Flask(__name__)
    '''
    app.config.from_mapping(
        SECRET_KEY = 'natetrentsimon',
        DATABASE = os.path.join(app.instance_path, 'flaskr.sqlite')
    )
    '''

    @app.route('/')
    def hello():
        return "<p>Hello, World!</p>"

    
    return app