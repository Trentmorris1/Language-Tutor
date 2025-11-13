# Insert sample exercises into database
import sqlite3
import os

DB_PATH = os.path.join('instance', 'language_tutor.db')

# Sample reading and writing exercises
# Each tuple uses the form (type, prompt)
SAMPLE_EXERCISES = [
    ("reading", "He go to school every day."),
    ("reading", "They was happy to see us."),
    ("reading", "I has two cats and one dog."),
    ("reading", "She don't like apples."),
    ("reading", "We was waiting for the bus."),
    ("reading", "The books is on the table."),
    ("reading", "He can sings very well."),
    ("reading", "I am study English now."),
    ("reading", "There is five students in the class."),
    ("reading", "She go to the market yesterday."),
    ("writing", "Describe your favorite hobby in two or three sentences."),
    ("writing", "Write a short paragraph about your last vacation."),
    ("writing", "Explain why learning a new language is important."),
    ("writing", "Write three sentences using the past tense to describe what you did yesterday."),
    ("writing", "Describe your daily routine in English."),
    ("writing", "Write a short note to a friend inviting them to lunch."),
    ("writing", "Describe your favorite food and why you like it."),
    ("writing", "Write three sentences using the future tense about your weekend plans."),
    ("writing", "Write a short description of your hometown."),
    ("writing", "Explain what you like most about studying English."),
]

def insert_exercises():
    if not os.path.exists(DB_PATH):
        raise FileNotFoundError(f"Database not found at {DB_PATH}. Make sure you ran `flask init-db` first.")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Insert exercises into the table
    cursor.executemany('''
        INSERT INTO exercises (type, prompt)
        VALUES (?, ?)
    ''', SAMPLE_EXERCISES)

    conn.commit()
    conn.close()
    print(f"Inserted {len(SAMPLE_EXERCISES)} exercises into {DB_PATH}")

if __name__ == "__main__":
    insert_exercises()
