# tutorapp/exercises.py
# Flask API endpoints for exercise functionality

from flask import Blueprint, request, jsonify
from .db import get_db
from .learning_facade import LearningFacade

bp = Blueprint('exercises', __name__)

@bp.route('/api/exercise/<exercise_type>', methods=['GET'])
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
        facade = LearningFacade(db)
        exercise = facade.get_exercise(exercise_type)
        
        # Format response based on exercise type
        if exercise_type == 'reading':
            return jsonify({
                'success': True,
                'exercise': {
                    'id': None,  # We don't track IDs in the current implementation
                    'type': 'reading',
                    'question': exercise.question,
                    'options': exercise.options,
                    'correct_answer': exercise.answer
                }
            })
        else:  # writing
            return jsonify({
                'success': True,
                'exercise': {
                    'id': None,
                    'type': 'writing',
                    'prompt': exercise.prompt
                }
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

@bp.route('/api/exercise/check-reading', methods=['POST'])
def check_reading():
    """
    Check a reading exercise answer.
    
    Request body:
        {
            "question": "The question text",
            "user_answer": "User's answer"
        }
    
    Returns:
        JSON with correctness result
    """
    data = request.get_json()
    question = data.get('question')
    user_answer = data.get('user_answer')
    
    if not question or user_answer is None:
        return jsonify({'success': False, 'message': 'Missing question or user_answer.'}), 400
    
    try:
        db = get_db()
        facade = LearningFacade(db)
        
        # We need to find the exercise by question text to get the correct answer
        # This is a simplified approach - in production you'd track exercise IDs
        cursor = db.execute(
            'SELECT * FROM questions WHERE type = ? AND prompt = ?',
            ('reading', question)
        )
        row = cursor.fetchone()
        
        if not row:
            return jsonify({'success': False, 'message': 'Exercise not found.'}), 404
        
        # Create exercise object to check answer
        from .learning_facade import ExerciseFactory
        exercise = ExerciseFactory.create_exercise('reading', row)
        is_correct = facade.check_reading(exercise, user_answer.strip())
        
        return jsonify({
            'success': True,
            'is_correct': is_correct,
            'correct_answer': exercise.answer
        })
    except Exception as e:
        return jsonify({'success': False, 'message': f'Server error: {str(e)}'}), 500

@bp.route('/api/exercise/check-writing', methods=['POST'])
def check_writing():
    """
    Check a writing exercise and return grammatical feedback.
    
    Request body:
        {
            "prompt": "The writing prompt",
            "user_answer": "User's written response"
        }
    
    Returns:
        JSON with grammatical feedback analysis
    """
    data = request.get_json()
    prompt = data.get('prompt')
    user_answer = data.get('user_answer')
    
    if not prompt or not user_answer:
        return jsonify({'success': False, 'message': 'Missing prompt or user_answer.'}), 400
    
    try:
        db = get_db()
        facade = LearningFacade(db)
        
        # Find the exercise by prompt
        cursor = db.execute(
            'SELECT * FROM questions WHERE type = ? AND prompt = ?',
            ('writing', prompt)
        )
        row = cursor.fetchone()
        
        if not row:
            return jsonify({'success': False, 'message': 'Exercise not found.'}), 404
        
        # Create exercise object and evaluate answer
        from .learning_facade import ExerciseFactory
        exercise = ExerciseFactory.create_exercise('writing', row)
        feedback = facade.check_writing(exercise, user_answer)
        
        return jsonify({
            'success': True,
            'feedback': feedback
        })
    except Exception as e:
        return jsonify({'success': False, 'message': f'Server error: {str(e)}'}), 500

