import language_tool_python

tool = language_tool_python.LanguageTool('es', 'en-US')

help(tool)
'''
print('enter a sentence and i will tell you how bad you are at grammar')

text = input()

matches = tool.check(text)

'''

