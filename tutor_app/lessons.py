# tutorapp/lessons.py
# Handles exercise creation and routes for the learning section.

#from flask import Blueprint, render_template, request, redirect, url_for, session


class ReadingExerise: 
    def __init__(self, question, options, answer):
        self.question = question
        self.options = options
        self.answer = answer
    
    def check_answer():
        return
    
class ExerciseFactory:
    def create_exercise(exercise_type, data):
        if exercise_type == 'reading':
            return ReadingExerise(
                question=data['question'],
                options=data['options'].split('|'),
                answer=data['answer']
            )



