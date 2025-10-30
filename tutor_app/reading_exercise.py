from .feedback import FeedbackModule

class ReadingExercise:
    def __init__(self, ex_id, prompt):
        self.id = ex_id
        self.prompt = prompt
        self.feedback = FeedbackModule()
    
    def evaluate(self, user_text):
        self.feedback.input_text=user_text
        self.feedback.analyze()
        return self.feedback.feedback
    
    
