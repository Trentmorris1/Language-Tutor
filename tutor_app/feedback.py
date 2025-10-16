import language_tool_python
from flask import Blueprint, Flask, render_template, request

bp = Blueprint('feedback', __name__, url_prefix='/feedback')
tool = language_tool_python('en-US')

@bp.route('/test', methods = ['GET', 'POST'])
def test():
    results = None
    if request.method == 'POST':
        text = request.form.get('text', '')

    if text:
        matches = tool.check(text)
        
    

    
