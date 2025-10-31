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
    def create_exercise(exercise_type, data):
        if exercise_type == 'reading':
            return ReadingExercise(
                question=data['prompt'],
                options=data['options'].split('|'),
                answer=data['correct_answer']
            )
        elif exercise_type == 'writing':
            return WritingExercise(
                prompt=data['prompt']
            )
        else:
            raise ValueError(f'Unsupported exercise type: {exercise_type}')

   

