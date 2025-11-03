# tutorapp/learning_facade.py
# Simplifies interaction between the Factory, FeedbackModule, and ProgressTracker.

from tutor_app.feedback import get_feedback_instance

feedback_tool = get_feedback_instance()

class LearningFacade:
    def __init__(self, db):
        self.db = db

    def get_exercise(self, exercise_type, exercise_id=None):
        #Fetch a random exercise of the given type (or a specific one if ID provided).
        if exercise_id:
            cursor = self.db.execute(
                'SELECT * FROM questions WHERE id = ? AND type = ?', 
                (exercise_id, exercise_type)
            )
        else:
            cursor = self.db.execute(
                'SELECT * FROM questions WHERE type = ? ORDER BY RANDOM() LIMIT 1',
                (exercise_type,)
            )
        
        row = cursor.fetchone()

        if not row:
            raise ValueError(f'No question found for type: {exercise_type}')
        
        return ExerciseFactory.create_exercise(exercise_type, row)

    
    def check_reading(self, exercise, user_answer):
        return exercise.answer == user_answer
    
    def check_writing(self, exercise, user_answer):
        return exercise.evaluate_answer(user_answer)


    
class ReadingExercise: 
    def __init__(self, question, options, answer):
        self.question = question
        self.options = options
        self.answer = answer
    
    def check_answer(self, user_answer):
        if user_answer == self.answer:
            return True
        return False
    
class WritingExercise:
    def __init__(self, prompt):
        self.prompt = prompt
    
    def evaluate_answer(self, user_answer):
        return feedback_tool.analyze_text(user_answer)

    
class ExerciseFactory:
    @staticmethod
    def create_exercise(exercise_type, data):
        """
        Create an exercise object from database row data.
        
        Args:
            exercise_type: 'reading' or 'writing'
            data: SQLite Row object with fields: id, type, prompt, options, correct_answer
        """
        if exercise_type == 'reading':
            # Convert SQLite Row to dict for safer access
            # SQLite Row objects support dict() conversion
            if hasattr(data, 'keys'):
                row_dict = dict(data)
            else:
                row_dict = data
            
            # Access fields - these should exist in the database
            prompt = row_dict.get('prompt')
            correct_answer = row_dict.get('correct_answer')
            options_str = row_dict.get('options')
            
            if not prompt:
                raise ValueError('Missing required field: prompt')
            if not correct_answer:
                raise ValueError('Missing required field: correct_answer')
            
            # Handle None or empty options - ensure it's always a string before splitting
            if options_str is None or options_str == '':
                options_list = []
            else:
                # Convert to string and split by pipe character
                options_str = str(options_str)
                # Split and clean up each option
                options_list = [opt.strip() for opt in options_str.split('|') if opt.strip()]
            
            return ReadingExercise(
                question=prompt,
                options=options_list,
                answer=correct_answer
            )
        elif exercise_type == 'writing':
            # Convert SQLite Row to dict for safer access
            if hasattr(data, 'keys'):
                row_dict = dict(data)
            else:
                row_dict = data
            
            prompt = row_dict.get('prompt')
            if not prompt:
                raise ValueError('Missing required field: prompt')
            
            return WritingExercise(prompt=prompt)
        else:
            raise ValueError(f'Unsupported exercise type: {exercise_type}')

   

