# insert_sample_questions.py
import sqlite3
import os

DB_PATH = os.path.join('instance', 'language_tutor.db')

# --- Sample reading exercises ---
# Each tuple = (type, prompt_with_errors, correct_version)
SAMPLE_READING_QUESTIONS = [
    ("reading", "He go to school every day.", "He go to school every day.|He goes to school every day.|He going to school every day.|He gone to school every day.", "He goes to school every day."),
    ("reading", "They was happy to see us.", "They were happy to see us.|They was happy to see us.|They are happy to saw us.|They were happy seeing us.", "They were happy to see us."),
    ("reading", "I has two cats and one dog.", "I has two cats and one dog.|I had two cats and one dog.|I have two cats and one dog.|I having two cats and one dog.", "I have two cats and one dog."),
    ("reading", "She don't like apples.", "She not like apples.|She don't like apples.|She doesn’t like apples.|She isn’t like apples.", "She doesn’t like apples."),
    ("reading", "We was waiting for the bus.", "We were waiting for the bus.|We was waiting for the bus.|We are waiting for the bus.|We been waiting for the bus.", "We were waiting for the bus."),
    ("reading", "The books is on the table.", "The books are on the table.|The book is on the table.|The books is on the table.|Books are on table.", "The books are on the table."),
    ("reading", "He can sings very well.", "He can sings very well.|He can sing very well.|He singing very well.|He is sing very well.", "He can sing very well."),
    ("reading", "I am study English now.", "I study English now.|I am study English now.|I am studying English now.|I studying English now.", "I am studying English now."),
    ("reading", "There is five students in the class.", "There is five students in the class.|There are five students in the class.|There was five students in the class.|There be five students in the class.", "There are five students in the class."),
    ("reading", "She go to the market yesterday.", "She go to the market yesterday.|She goes to the market yesterday.|She going to the market yesterday.|She went to the market yesterday.", "She went to the market yesterday.")
]

SAMPLE_WRITING_QUESTIONS = [
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

def insert_questions():
    if not os.path.exists(DB_PATH):
        raise FileNotFoundError(f"Database not found at {DB_PATH}. Make sure you ran `flask init-db` first.")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.executemany('''
        INSERT INTO questions (type, prompt)
        VALUES (?, ?)
    ''', SAMPLE_WRITING_QUESTIONS)

    conn.commit()
    conn.close()
    print(f"Inserted questions into {DB_PATH}")

if __name__ == "__main__":
    insert_questions()
