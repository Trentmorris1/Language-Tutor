# Progress tracking blueprint and observer utilities
from flask import Blueprint, jsonify, session

from .auth import login_required
from .db import get_db

# Register blueprint that exposes progress endpoints
bp = Blueprint('progress', __name__)


class Subject:
    # Maintain set of observers that react to notifications
    def __init__(self):
        self._observers = set()

    # Attach observer so it receives updates
    def attach(self, observer):
        self._observers.add(observer)

    # Detach observer when it no longer needs updates
    def detach(self, observer):
        self._observers.discard(observer)

    # Notify observers by forwarding new data payload
    def notify(self, data):
        for observer in self._observers:
            observer.update(data)


class Observer:
    # Define interface for update behavior
    def update(self, data):
        raise NotImplementedError


class ProgressTracker(Observer):
    # Track progress totals for a specific user within the database
    def __init__(self, db=None, user_id=None):
        self.db = db
        self.user_id = user_id

    # Receive completed exercise data and aggregate error counts
    def update(self, data):
        ex_type = data['type']
        result = data['result']
        text = data['text']

        errors = result.get('error_count', 0)
        words = max(len(text.split()), 1)

        error_types = result.get('error_types') or {}
        grammar_errors = int(error_types.get('Grammar', 0) or 0)
        style_errors = int(error_types.get('Style', 0) or 0)
        typo_errors = int(error_types.get('Typo', 0) or 0)

        self.update_db(ex_type, errors, words, grammar_errors, style_errors, typo_errors)

    # Persist aggregated counters for a user and exercise type
    def update_db(self, ex_type, errors, words, grammar_errors, style_errors, typo_errors):
        if not self.user_id:
            return

        cursor = self.db.cursor()

        cursor.execute(
            'SELECT id FROM progress WHERE user_id = ?', (self.user_id,)
        )
        row = cursor.fetchone()
        if not row:
            cursor.execute(
                'INSERT INTO progress (user_id) VALUES (?)', (self.user_id,)
            )
            self.db.commit()

        if ex_type == 'reading':
            cursor.execute('''
            UPDATE progress
            SET
                reading_ex_errors = reading_ex_errors + ?,
                reading_ex_words = reading_ex_words + ?,
                total_errors = total_errors + ?,
                total_words = total_words + ?,
                grammar_errors = grammar_errors + ?,
                style_errors = style_errors + ?,
                typo_errors = typo_errors + ?
            WHERE user_id = ?
            ''', (errors, words, errors, words, grammar_errors, style_errors, typo_errors, self.user_id))

        elif ex_type == 'writing':
            cursor.execute('''
            UPDATE progress
            SET
                writing_ex_errors = writing_ex_errors + ?,
                writing_ex_words = writing_ex_words + ?,
                total_errors = total_errors + ?,
                total_words = total_words + ?,
                grammar_errors = grammar_errors + ?,
                style_errors = style_errors + ?,
                typo_errors = typo_errors + ?
            WHERE user_id = ?
            ''', (errors, words, errors, words, grammar_errors, style_errors, typo_errors, self.user_id))

        self.db.commit()

    # Gather aggregated accuracy and error breakdown data for the user
    def get_progress(self):
        cursor = self.db.execute(
            'SELECT * FROM progress WHERE user_id = ?', (self.user_id,)
        )

        row = cursor.fetchone()
        if not row:
            return None

        data = dict(row) if hasattr(row, 'keys') else row

        def acc(errors, words):
            return 0.0 if words == 0 else max(0.0, 1 - (errors / words))

        def get_count(field_name):
            value = data.get(field_name, 0)
            try:
                return int(value)
            except (TypeError, ValueError):
                return 0

        reading_acc = acc(data['reading_ex_errors'], data['reading_ex_words'])
        writing_acc = acc(data['writing_ex_errors'], data['writing_ex_words'])
        overall_acc = acc(data['total_errors'], data['total_words'])

        grammar_count = get_count('grammar_errors')
        style_count = get_count('style_errors')
        typo_count = get_count('typo_errors')

        total_error_types = grammar_count + style_count + typo_count

        def percentage(count):
            if total_error_types == 0:
                return 0.0
            return round((count / total_error_types) * 100, 2)

        return {
            'reading_accuracy': round(reading_acc * 100, 2),
            'writing_accuracy': round(writing_acc * 100, 2),
            'overall_accuracy': round(overall_acc * 100, 2),
            'error_counts': {
                'grammar': grammar_count,
                'style': style_count,
                'typo': typo_count
            },
            'error_percentages': {
                'grammar': percentage(grammar_count),
                'style': percentage(style_count),
                'typo': percentage(typo_count)
            }
        }


@bp.route('/api/progress', methods=['GET'])
@login_required
def get_progress_route():
    # Provide progress metrics for the authenticated user
    try:
        db = get_db()
        user_id = session.get('user_id')
        tracker = ProgressTracker(db, user_id)
        progress_data = tracker.get_progress()

        if progress_data is None:
            progress_data = {
                'overall_accuracy': 0.0,
                'reading_accuracy': 0.0,
                'writing_accuracy': 0.0,
                'error_counts': {
                    'grammar': 0,
                    'style': 0,
                    'typo': 0
                },
                'error_percentages': {
                    'grammar': 0.0,
                    'style': 0.0,
                    'typo': 0.0
                }
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

