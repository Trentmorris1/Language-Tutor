import language_tool_python, os, time, subprocess

class FeedbackModule():
    def __init__(self):
        self.input_text = '' #this will be for the text that was last analyzed
        self.matches = []  
        
        self.feedback = [] #this will be the list of fixes to give back
        self.error_cnt = 0 #holds the total number of errors 
        self.error_types = {} #holds counts of the types of errors: Grammar, Style, Typo

        self.server_port = 8081 #just hardcoding this port, we can pass in a port later if needed

        #defining path to the languagetool jar dynamically based on where each person has it
        script_dir = os.path.dirname(os.path.abspath(__file__))
        jar_path = os.path.join(script_dir, 'languagetool', 'LanguageTool-6.6', 'languagetool-server.jar')

        subprocess.Popen(['java', '-jar', jar_path, '--port', str(self.server_port)],    #starting the server
                         stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL) #these just get rid of the output
        time.sleep(5) #give the server a little time to start before attempting to connect to it

        #finally time to connect the tool to the server so we can use it
        self.tool = language_tool_python.LanguageTool(
            'en-US',
            remote_server=f'http://localhost:{self.server_port}'
        )

    def analyze(self, text):
        self.input_text = text
        self.matches = self.tool.check(text)
        return len(self.matches)
    

    
