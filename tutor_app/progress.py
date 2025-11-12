from flask import Blueprint, jsonify, session

from .auth import login_required
from .db import get_db

# tutor_app/progress.py

bp = Blueprint('progress', __name__)


class Subject:
    def __init__(self):
        self._observers = set()

    def attach(self, observer):
        self._observers.add(observer)

    def detach(self, observer):
        self._observers.discard(observer)

    def notify(self, data):
        for observer in self._observers:
            observer.update(data)


class Observer:
    def update(self, data):
        raise NotImplementedError


class ProgressTracker(Observer):
    def __init__(self, db=None, user_id=None):
        self.db = db
        self.user_id = user_id

    def update(self, data):
        #observer update method for when an exercise is complete
        ex_type = data['type']
        result = data['result']
        text = data['text']

        #extract error & word counts
        errors = result.get('error_count', 0)
        words = max(len(text.split()), 1)

        #update the progress totals
        self.update_db(ex_type, errors, words)



    def update_db(self, ex_type, errors, words):
        if not self.user_id:
            return

        cursor = self.db.cursor()

        #first ensure we can insert the data
        cursor.execute(
            'SELECT id FROM progress WHERE user_id = ?', (self.user_id,)
        )
        row = cursor.fetchone()
        if not row:
            cursor.execute(
                'INSERT INTO progress (user_id) VALUES (?)', (self.user_id,)
            )
            self.db.commit()
        
        #update appropriate columns in the progress table
        if ex_type == 'reading':
            cursor.execute('''
            UPDATE progress
            SET
                reading_ex_errors = reading_ex_errors + ?,
                reading_ex_words = reading_ex_words + ?,
                total_errors = total_errors + ?,
                total_words = total_words + ?
            WHERE user_id = ?
            ''', (errors, words, errors, words, self.user_id))
        
        elif ex_type == 'writing':
            cursor.execute('''
            UPDATE progress
            SET 
                writing_ex_errors = writing_ex_errors + ?,
                writing_ex_words = writing_ex_words + ?,
                total_errors = total_errors + ?,
                total_words = total_words + ?
            WHERE user_id = ?
            ''', (errors, words, errors, words, self.user_id))
        
        self.db.commit()

    
    #for future progress page
    def get_progress(self):
        #Fetch and compute accuracy dynamically
        cursor = self.db.execute(
            'SELECT * FROM progress WHERE user_id = ?', (self.user_id,)
        )

        row = cursor.fetchone()
        if not row: 
            return None

        data = dict(row) if hasattr(row, 'keys') else row

        def acc(errors, words):
            return 0.0 if words == 0 else max(0.0, 1 - (errors/ words))
        
        reading_acc = acc(data['reading_ex_errors'], data['reading_ex_words'])
        writing_acc = acc(data['writing_ex_errors'], data['writing_ex_words'])
        overall_acc = acc(data['total_errors'], data['total_words'])

        return{
            'reading_accuracy': round(reading_acc * 100, 2),
            'writing_accuracy': round(writing_acc * 100, 2),
            'overall_accuracy': round(overall_acc * 100, 2)
        }


@bp.route('/api/progress', methods=['GET'])
@login_required
def get_progress_route():
    """API endpoint to fetch overall progress metrics for the authenticated user."""
    try:
        db = get_db()
        user_id = session.get('user_id')
        tracker = ProgressTracker(db, user_id)
        progress_data = tracker.get_progress()

        if progress_data is None:
            progress_data = {
                'overall_accuracy': 0.0,
                'reading_accuracy': 0.0,
                'writing_accuracy': 0.0
            }

        return jsonify({
            'success': True,
            'progress': progress_data
        })
    except Exception as exc:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(exc)}'
        }), 500
