# lessons.py
class Lessons:
    def __init__(self):
        # List of questions
        self.questions = [
            "1. What is your favorite animal and why?",
            "2. If you could travel anywhere in the world, where would you go?",
            "3. What’s one skill you’d love to learn this year?",
            "4. Who inspires you the most?",
            "5. If you could have any superpower, what would it be and why?"
        ]
        # Empty list to store user answers
        self.user_answers = []

    def ask_questions(self):
        """Ask all questions in order and collect user answers."""
        print("Welcome! Please answer the following questions:\n")

        for question in self.questions:
            print(question)
            answer = input("Your answer: ")
            self.user_answers.append(answer)

        print("\nThanks for answering all the questions!")
        self.display_answers()

    def display_answers(self):
        """Display the collected answers."""
        print("Here are your responses:")
        for i, answer in enumerate(self.user_answers, start=1):
            print(f"Q{i}: {answer}")

    def get_answers(self):
        """Return the list of collected answers (for database comparison)."""
        return self.user_answers


# Example usage (uncomment this to run directly):
# if __name__ == "__main__":
#     lesson = Lessons()
#     lesson.ask_questions()
#     print("Collected Answers:", lesson.get_answers())
