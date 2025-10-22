import language_tool_python


class FeedbackModule():
    def __init__(self):
        self.tool = language_tool_python.LanguageTool('en-US') #tool to be used for grammar analysis
        self.input_text = '' #this will be for the text that was last analyzed
        self.matches = []  
        
        self.feedback = [] #this will be the list of fixes to give back
        self.error_cnt = 0 #holds the total number of errors 
        self.error_types = {} #holds counts of the types of errors: Grammar, Style, Typo
    
    def analyze(self, text):
        self.input_text = text
        self.matches = self.tool.check(text)
        return len(self.matches)
    

    
