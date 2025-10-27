# tutorapp/lessons.py
# Handles exercise creation and routes for the learning section.

from flask import Blueprint, render_template, request, redirect, url_for, session
from .learning_facade import LearningFacade

bp = Blueprint("lessons", __name__, url_prefix="/lessons")

# ------------------ FACTORY PATTERN ------------------ #

class Exercise:
    """Abstract base class for all exercises."""
    def __init__(self, id, type, difficulty):
        self.id = id
        self.type = type
        self.difficulty = difficulty


class ReadingExercise(Exercise):
    """Concrete exercise type for reading."""
    def __init__(self, id, difficulty, reading):
        super().__init__(id, "reading", difficulty)
        self.reading = reading

    def presentReading(self):
        return f"Read this passage: {self.reading}"


class WritingExercise(Exercise):
    """Concrete exercise type for writing."""
    def __init__(self, id, difficulty, prompt):
        super().__init__(id, "writing", difficulty)
        self.prompt = prompt

    def presentPrompt(self):
        return f"Write a response to: {self.prompt}"


class ExerciseFactory:
    """Creates exercise objects depending on the type requested."""
    def __init__(self, defaultDifficulty="medium"):
        self.defaultDifficulty = defaultDifficulty

    def createExercise(self, exercise_type, **kwargs):
        if exercise_type == "reading":
            return ReadingExercise(kwargs.get("id", 0),
                                   kwargs.get("difficulty", self.defaultDifficulty),
                                   kwargs.get("reading", "Default passage"))
        elif exercise_type == "writing":
            return WritingExercise(kwargs.get("id", 0),
                                   kwargs.get("difficulty", self.defaultDifficulty),
                                   kwargs.get("prompt", "Write something about your day."))
        else:
            raise ValueError(f"Unknown exercise type: {exercise_type}")
# ------------------------------------------------------ #

# Flask routes that use the facade
@bp.route("/")
def index():
    return render_template("lessons/index.html")

@bp.route("/exercise/<etype>")
def get_exercise(etype):
    facade = LearningFacade(session.get("user_id", 1))
    content = facade.requestExercise(etype)
    return render_template("lessons/exercise.html", content=content, etype=etype)

@bp.route("/submit/<etype>", methods=["POST"])
def submit_answer(etype):
    facade = LearningFacade(session.get("user_id", 1))
    answer = request.form["answer"]
    feedback = facade.submitAnswer(etype, answer)
    return render_template("lessons/result.html", feedback=feedback)

