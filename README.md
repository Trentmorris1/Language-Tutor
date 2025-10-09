# Language-Tutor
Interactive Language Tutor that helps users study a specific language and listening for correct pronunciations.

Mandatory Functional Requirements:

The system will allow users to select a target language and proficiency level to personalize lessons and practice activities.

The system will provide interactive exercises for listening, speaking, reading, and writing, with real-time feedback on accuracy.

The system shall use an AI-powered speech recognition and natural language processing model to evaluate pronunciation, detect phonetic errors, and provide personalized correction tips with example audio. 

The system will track user progress over time, including vocabulary mastery, grammar accuracy, and fluency scores.

The system will allow users to upload or input custom text content for vocabulary extraction, translation, and targeted practice.


Mandatory Non-Functional Requirements:

The system will process speech input and return AI-generated pronunciation feedback within 5 seconds on recommended hardware.

The system will store all user progress data, recordings, and AI analysis results in encrypted form, and shall not transmit personal data without explicit consent.

The system will support core lesson and practice features, including AI-based pronunciation evaluation, in offline mode using locally stored models.

The system will generate pronunciation feedback with a minimum accuracy rate of 90% when tested against a standardized language dataset.

All project source code must be developed by the CS 360 project team.

The project must use a database.

Performance metrics should be gathered and optimized.

Security metrics should be gathered and optimized.

User interface metrics should be gathered and optimized.

Our team’s goal is to collaboratively design and develop an AI-powered language learning system that meets all mandatory functional and non-functional requirements while continually improving through added features and refinements. We aim to create a secure, efficient, and user-friendly platform that personalizes lessons, provides interactive practice with real-time feedback, and tracks user progress in a meaningful way. As a team, we expect consistent communication, equal contributions, and accountability from all members to ensure project success. We will prioritize maintaining high standards in functionality, performance, security, and usability, while also supporting one another in learning and applying course concepts. By staying organized, meeting deadlines, and following best practices in software development, our team is committed to delivering a system that not only fulfills the project requirements but also demonstrates our growth and collaboration throughout the course.

Flask tutorial: https://flask.palletsprojects.com/en/stable/tutorial/layout/
The plan is to use the above flask tutorial to set up the app and update the code and the structure given to make our language tutor using the following file structure, with some changes if needed along the development process. 

/home/user/Projects/language-tutor
├── tutorapp/
│   ├── __init__.py
│   ├── db.py
│   ├── schema.sql
│   ├── auth.py                ← user login/register (same as Flask tutorial)
│   ├── lessons.py             ← replaces blog.py (handles exercises/lessons)
│   ├── feedback.py            ← new module (AI/NLP feedback + analytics)
│   ├── templates/
│   │   ├── base.html
│   │   ├── auth/
│   │   │   ├── login.html
│   │   │   └── register.html
│   │   ├── lessons/
│   │   │   ├── index.html     ← lesson list or dashboard
│   │   │   ├── exercise.html  ← where user inputs text
│   │   │   └── result.html    ← shows feedback (optional)
│   │   └── feedback/
│   │       └── analytics.html ← progress charts, grammar stats
│   └── static/
│       ├── style.css
│       └── script.js          ← for AJAX calls, frontend interactivity
├── tests/
│   ├── conftest.py
│   ├── data.sql
│   ├── test_factory.py
│   ├── test_db.py
│   ├── test_auth.py
│   ├── test_lessons.py
│   └── test_feedback.py
├── .venv/
├── pyproject.toml
└── MANIFEST.in

