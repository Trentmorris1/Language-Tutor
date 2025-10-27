# tutorapp/progress.py
# This module implements the Observer pattern to track user progress updates.

class Observer:
    """Abstract base class for any object that wants to be notified of progress changes."""
    def update(self, data):
        raise NotImplementedError


class ProgressTracker:
    """
    Subject class in the Observer pattern.
    It maintains a list of observers (like Dashboard, ReviewList, FeedbackModule)
    and notifies them when progress data changes.
    """
    def __init__(self, user_id):
        self.user_id = user_id
        self.progressData = {}  # holds progress metrics like {"writing": 0.85}
        self.observers = []     # list of registered observer objects

    def attach(self, observer):
        """Registers a new observer."""
        self.observers.append(observer)

    def detach(self, observer):
        """Unregisters an observer."""
        self.observers.remove(observer)

    def notify(self):
        """Calls update() on all observers when data changes."""
        for observer in self.observers:
            observer.update(self.progressData)

    def updateProgress(self, exercise_type, score):
        """Updates progress for a given exercise and notifies observers."""
        self.progressData[exercise_type] = score
        self.notify()


# Example concrete observers:
class Dashboard(Observer):
    """Updates the dashboard with current progress data."""
    def __init__(self):
        self.displayData = {}

    def update(self, data):
        self.displayData = data
        print(f"[Dashboard] Progress updated: {data}")


class ReviewList(Observer):
    """Tracks words or exercises the user struggles with."""
    def __init__(self):
        self.difficultWords = []

    def update(self, data):
        # Example: if writing score is low, mark some area as difficult
        if data.get("writing", 1.0) < 0.7:
            self.difficultWords.append("verbs")
        print(f"[ReviewList] Updated difficult words: {self.difficultWords}")
