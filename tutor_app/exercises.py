# Tutor app exercises module
# Flask API endpoints for exercise functionality

from flask import Blueprint, request, jsonify, session
from .db import get_db
from .auth import login_required
from .feedback import get_feedback_instance
from .progress import Subject, ProgressTracker

bp = Blueprint('exercises', __name__)

feedback_tool = get_feedback_instance()

class LearningFacade(Subject):
    def __init__(self, db, user_id=None):
        super().__init__()
        self.db = db
        self.user_id = user_id
        self.progress_tracker = ProgressTracker(db, user_id)
        self.attach(self.progress_tracker)

    def get_exercise(self, exercise_type, exercise_id=None):
        # Fetch a random exercise of the given type or by id
        if exercise_id:
            cursor = self.db.execute(
                'SELECT * FROM exercises WHERE id = ? AND type = ?', 
                (exercise_id, exercise_type)
            )
        else:
            cursor = self.db.execute(
                'SELECT * FROM exercises WHERE type = ? ORDER BY RANDOM() LIMIT 1',
                (exercise_type,)
            )
        
        row = cursor.fetchone()

        if not row:
            raise ValueError(f'No exercise found for type: {exercise_type}')
        
        # Convert sqlite row to dict for safer access
        if hasattr(row, 'keys'):
            row_dict = dict(row)
        else:
            row_dict = row
        
        # Access fields that exist in the database
        prompt = row_dict.get('prompt')
        
        if not prompt:
            raise ValueError('Missing required field: prompt')
        
        return Exercise(exercise_type=exercise_type, prompt=prompt)

    
    def check_answer(self, exercise, user_answer):
        ex_feedback = exercise.evaluate_answer(user_answer)

        self.notify({'type': exercise.type, 'result': ex_feedback, 'text': user_answer})

        return ex_feedback


class Exercise:
    def __init__(self, exercise_type, prompt):
        self.type = exercise_type
        self.prompt = prompt
    
    def evaluate_answer(self, user_answer):
        return feedback_tool.analyze_text(user_answer)

@bp.route('/api/exercise/<exercise_type>', methods=['GET'])
@login_required
def get_exercise(exercise_type):
    """
    Get a random exercise of the specified type.
    
    Args:
        exercise_type: 'reading' or 'writing'
    
    Returns:
        JSON with exercise data
    """
    if exercise_type not in ['reading', 'writing']:
        return jsonify({'success': False, 'message': 'Invalid exercise type. Must be "reading" or "writing".'}), 400
    
    try:
        db = get_db()
        user_id = session.get('user_id')
        facade = LearningFacade(db, user_id)
        exercise = facade.get_exercise(exercise_type)
        
        # Format response based on exercise type
        # Both reading and writing exercises use the same exercise class
        exercise_data = {
            'id': None,  # We do not track ids in the current implementation
            'type': exercise.type,
            'prompt': exercise.prompt
        }
        
        
        return jsonify({
            'success': True,
            'exercise': exercise_data
        })
    except ValueError as e:
        return jsonify({'success': False, 'message': str(e)}), 404
    except KeyError as e:
        # Handle missing database column errors
        return jsonify({'success': False, 'message': f'Database error: Missing column {str(e)}. Please check database schema.'}), 500
    except Exception as e:
        import traceback
        traceback.print_exc()  # Print full traceback for debugging
        return jsonify({'success': False, 'message': f'Server error: {str(e)}'}), 500

@bp.route('/api/exercise/check/<exercise_type>', methods=['POST'])
@login_required
def check_answer(exercise_type):
    """
    Check an exercise answer and return grammatical feedback.
    
    Args:
        exercise_type: 'reading' or 'writing'
    
    Request body:
        {
            "prompt": "The prompt text",
            "user_answer": "User's answer"
        }
    
    Returns:
        JSON with grammatical feedback analysis
    """
    if exercise_type not in ['reading', 'writing']:
        return jsonify({'success': False, 'message': 'Invalid exercise type. Must be "reading" or "writing".'}), 400
    
    data = request.get_json()
    prompt = data.get('prompt')
    user_answer = data.get('user_answer')
    
    if not prompt or user_answer is None:
        return jsonify({'success': False, 'message': 'Missing prompt or user_answer.'}), 400
    
    try:
        db = get_db()
        user_id = session.get('user_id')
        facade = LearningFacade(db, user_id)
        
        # Find the exercise by prompt
        # This is a simplified approach - in production you'd track exercise IDs
        cursor = db.execute(
            'SELECT * FROM exercises WHERE type = ? AND prompt = ?',
            (exercise_type, prompt)
        )
        row = cursor.fetchone()
        
        if not row:
            return jsonify({'success': False, 'message': 'Exercise not found.'}), 404
        
        # Convert SQLite Row to dict for safer access
        if hasattr(row, 'keys'):
            row_dict = dict(row)
        else:
            row_dict = row
        prompt = row_dict.get('prompt')
        if not prompt:
            return jsonify({'success': False, 'message': 'Missing required field: prompt'}), 500
        exercise = Exercise(exercise_type=exercise_type, prompt=prompt)
        feedback_result = facade.check_answer(exercise, user_answer.strip())
        
        return jsonify({
            'success': True,
            'feedback': feedback_result
        })
    except Exception as e:
        return jsonify({'success': False, 'message': f'Server error: {str(e)}'}), 500



