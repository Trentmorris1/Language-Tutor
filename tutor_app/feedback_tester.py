#temporary file to test the feedback module

from feedback import FeedbackModule

text = 'Today I seen an balloon.'
feedback = FeedbackModule()
print(feedback.analyze(text))
feedback.tool.close()
