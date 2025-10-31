# test_facade.py
from tutor_app.db import get_db
from tutor_app.learning_facade import LearningFacade
from tutor_app.feedback import get_feedback_instance

def main():

    get_feedback_instance()  # starts server if not running
    print("✅ Feedback server started and ready.")

    # Connect directly to the same DB used by Flask
    db = get_db()
    facade = LearningFacade(db)

    # === Test 1: Reading Exercise ===
    print("\n--- READING EXERCISE ---")
    reading_ex = facade.get_exercise("reading")
    print("Question:", reading_ex.question)
    print(f"Options: {reading_ex.options}\nAnswer:")
    user_input = input()
    print("Answer correct?:", facade.check_reading(reading_ex, user_input))  # Try a test answer


    # === Test 2: Writing Exercise ===
    print("\n--- WRITING EXERCISE ---")
    writing_ex = facade.get_exercise("writing")
    print(f"Prompt: {writing_ex.prompt}\nAnswer:")
    user_input = input()
    feedback = facade.check_writing(writing_ex, user_input)
    print("Feedback:", feedback)

if __name__ == "__main__":
    main()
