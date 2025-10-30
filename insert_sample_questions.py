# insert_sample_questions.py
import sqlite3
import os

DB_PATH = os.path.join('instance', 'language_tutor.db')

# --- Sample reading exercises ---
# Each tuple = (type, prompt_with_errors, correct_version)
SAMPLE_QUESTIONS = [
    ("reading", "He go to school every day.", "He goes to school every day."),
    ("reading", "They was happy to see us.", "They were happy to see us."),
    ("reading", "I has two cats and one dog.", "I have two cats and one dog."),
    ("reading", "She don't like apples.", "She doesn't like apples."),
    ("reading", "We was waiting for the bus.", "We were waiting for the bus."),
    ("reading", "The books is on the table.", "The books are on the table."),
    ("reading", "He can sings very well.", "He can sing very well."),
    ("reading", "I am study English now.", "I am studying English now."),
    ("reading", "There is five students in the class.", "There are five students in the class."),
    ("reading", "She go to the market yesterday.", "She went to the market yesterday.")
]

def insert_questions():
    if not os.path.exists(DB_PATH):
        raise FileNotFoundError(f"Database not found at {DB_PATH}. Make sure you ran `flask init-db` first.")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.executemany('''
        INSERT INTO questions (type, prompt, correct_answer)
        VALUES (?, ?, ?)
    ''', SAMPLE_QUESTIONS)

    conn.commit()
    conn.close()
    print(f"Inserted 10 reading questions into {DB_PATH}")

if __name__ == "__main__":
    insert_questions()
