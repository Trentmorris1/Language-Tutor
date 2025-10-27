# tutorapp/learning_facade.py
# Simplifies interaction between the Factory, FeedbackModule, and ProgressTracker.

from .lessons import ExerciseFactory
from .feedback import FeedbackModule
from .progress import ProgressTracker, Dashboard, ReviewList

class LearningFacade:
    """
    Provides a unified interface to create exercises, analyze responses,
    and update user progress.
    """
    def __init__(self, user_id):
        # Core subsystems
        self.exerciseFactory = ExerciseFactory()
        self.feedbackModule = FeedbackModule()
        self.progressTracker = ProgressTracker(user_id)

        # Attach observers to the tracker
        self.dashboard = Dashboard()
        self.reviewList = ReviewList()
        self.progressTracker.attach(self.dashboard)
        self.progressTracker.attach(self.reviewList)

    def requestExercise(self, exercise_type):
        """Use Factory to create an exercise and return its content."""
        exercise = self.exerciseFactory.createExercise(exercise_type)
        if exercise_type == "reading":
            return exercise.presentReading()
        else:
            return exercise.presentPrompt()

    def submitAnswer(self, exercise_type, answer):
        """Analyze the user’s answer and update progress accordingly."""
        issue_count = self.feedbackModule.analyze(answer)

        # Compute simple score: fewer issues → higher score
        score = max(0, 1 - (issue_count / 20))
        self.progressTracker.updateProgress(exercise_type, score)

        # Return combined feedback info
        return {
            "score": round(score, 2),
            "issues": issue_count,
            "message": "Great job!" if score > 0.8 else "Keep practicing!"
        }
