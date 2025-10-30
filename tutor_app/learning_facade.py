# tutorapp/learning_facade.py
# Simplifies interaction between the Factory, FeedbackModule, and ProgressTracker.

from .lessons import ExerciseFactory

class LearningFacade:
    def __init__(self, db):
        self.db = db

    def get_exercise(self, exercise_type, exercise_id):
        cursor = self.db.execute('SELECT * FROM questions WHERE ID = ?', (exercise_id,))
        row = cursor.fetchone()

        if not row:
            raise ValueError(f'no question found with id {exercise_id}')
        
        return ExerciseFactory.create_exercise(exercise_type, row)
    
    

