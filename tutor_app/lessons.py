# List of questions
questions = [
    "1. What is your favorite animal and why?",
    "2. If you could travel anywhere in the world, where would you go?",
    "3. What’s one skill you’d love to learn this year?",
    "4. Who inspires you the most?",
    "5. If you could have any superpower, what would it be and why?"
]

# Empty list to store user answers
user_answers = []

# Loops through each question and collects answers
for question in questions:
    print(question)
    answer = input("Your answer: ")
    user_answers.append(answer)

# Prints the collected answers (for verification against database)
print("\nThanks for answering all the questions!")
print("Here are your responses:")
for i, answer in enumerate(user_answers, start=1):
    print(f"Q{i}: {answer}")

# Later, compare 'user_answers' to database
