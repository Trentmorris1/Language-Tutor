# tutorapp/feedback.py
import language_tool_python, os, time, subprocess

_feedback_instance = None  # singleton instance


def get_feedback_instance():
    """Return a single shared FeedbackModule (singleton pattern)."""
    global _feedback_instance
    if _feedback_instance is None:
        print('Launching LanguageTool local server...')
        _feedback_instance = FeedbackModule()
    return _feedback_instance


class FeedbackModule:
    def __init__(self):
        self.input_text = ''
        self.matches = []
        self.error_cnt = 0
        self.error_types = {}
        self.feedback = []

        self.server_port = 8081

        # --- Dynamically locate the LanguageTool JAR ---
        jar_dir = os.path.dirname(os.path.abspath(__file__))
        jar_path = os.path.join(jar_dir, 'languagetool', 'LanguageTool-6.6', 'languagetool-server.jar')

        # --- Start server once ---
        subprocess.Popen(
            ['java', '-jar', jar_path, '--port', str(self.server_port)],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
        )
        time.sleep(5)  # give server time to start

        # --- Connect to it ---
        self.tool = language_tool_python.LanguageTool(
            'en-US',
            remote_server=f'http://localhost:{self.server_port}'
        )

    def analyze_text(self, text):
        """Analyze the given text and return structured feedback."""
        self.input_text = text
        self.matches = self.tool.check(text)

        self.error_cnt = len(self.matches)
        self.feedback = []

        # Calculate accuracy based on word count (more meaningful than character count)
        word_count = max(len(self.input_text.split()), 1)  # Avoid division by zero
        self.acc = max(0.0, 1 - (self.error_cnt / word_count))

        #breakdown by category
        self.error_types = {'Grammar': 0, 'Style': 0, 'Typo': 0}

        for match in self.matches:
            category = match.ruleIssueType.capitalize()
            if category in self.error_types:
                self.error_types[category] += 1

            self.feedback.append({
                'message': match.message,
                'suggestions': match.replacements,
                'offset': match.offset,
                'error_text': text[match.offset: match.offset + match.errorLength]
            })

        return {
            'error_count': self.error_cnt,
            'error_types': self.error_types,
            'feedback': self.feedback,
            'accuracy': self.acc * 100
        }

    

    
