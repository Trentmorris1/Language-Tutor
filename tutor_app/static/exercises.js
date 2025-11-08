// Exercise handlers

// Forward declaration for renderApp - will be set by views module
var renderApp = null;

// Sets the renderApp function from views module
function setExercisesRenderApp(renderFunction) {
    renderApp = renderFunction;
}

// Loads a new exercise from the API based on exercise type
function loadExercise(exerciseType) {
    updateState({ exerciseError: null }, false);
    
    apiCall('/api/exercise/' + exerciseType, 'GET')
        .then(function(result) {
            if (result.success && result.data && result.data.exercise) {
                var viewName;
                if (exerciseType === 'reading') {
                    viewName = 'reading_exercise';
                } else {
                    viewName = 'writing_exercise';
                }
                updateState({
                    exerciseType: exerciseType,
                    currentExercise: result.data.exercise,
                    view: viewName
                }, false);
                if (renderApp) {
                    renderApp();
                }
            } else {
                var errorMsg = result.error || 'Failed to load exercise. Please try again.';
                updateState({
                    exerciseError: errorMsg
                }, false);
                if (renderApp) {
                    renderApp();
                }
            }
        });
}

// Handles submitting an exercise answer (unified for both reading and writing)
function submitAnswer(exerciseType) {
    var prefix = exerciseType + '-';
    var inputElement = document.getElementById(prefix + 'answer-input');
    
    if (!inputElement) {
        alert('Input element not found.');
        return;
    }
    
    var userAnswer = inputElement.value.trim();
    
    if (!userAnswer) {
        alert('Please enter your answer.');
        return;
    }
    
    if (!appState.currentExercise) {
        alert('Exercise data missing. Please reload.');
        return;
    }
    
    // Show loading state
    var submitButton = document.getElementById(prefix + 'submit-btn');
    var originalButtonText = submitButton ? submitButton.textContent : 'Submit';
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Checking...';
    }
    
    // Call API to check answer
    var promptText = appState.currentExercise.prompt;
    apiCall('/api/exercise/check/' + exerciseType, 'POST', {
        prompt: promptText,
        user_answer: userAnswer
    })
        .then(function(result) {
            // Re-enable button
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
            
            if (result.success && result.data && result.data.feedback) {
                var feedback = result.data.feedback;
                
                // Display feedback
                var feedbackDiv = document.getElementById(prefix + 'feedback');
                if (feedbackDiv) {
                    feedbackDiv.classList.remove('hidden');
                    
                    // Build feedback HTML
                    var errorCount = feedback.error_count || 0;
                    var accuracy = feedback.accuracy !== undefined ? feedback.accuracy.toFixed(1) : 'N/A';
                    var feedbackHtml = '<h3 class="font-bold text-lg mb-3">Grammatical Analysis</h3>' +
                        '<div class="mb-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">' +
                        '<p class="text-2xl font-bold text-blue-700 mb-1">Accuracy: ' + accuracy + '%</p>' +
                        '<p class="text-sm text-blue-600">Based on error count and word analysis</p>' +
                        '</div>' +
                        '<p class="mb-2"><strong>Total Errors Found:</strong> ' + errorCount + '</p>';
                    
                    if (feedback.error_types) {
                        feedbackHtml += '<div class="mb-3">' +
                            '<p class="font-semibold">Error Breakdown:</p>' +
                            '<ul class="list-disc list-inside ml-4">';
                        
                        if (feedback.error_types.Grammar) {
                            feedbackHtml += '<li>Grammar: ' + feedback.error_types.Grammar + '</li>';
                        }
                        if (feedback.error_types.Style) {
                            feedbackHtml += '<li>Style: ' + feedback.error_types.Style + '</li>';
                        }
                        if (feedback.error_types.Typo) {
                            feedbackHtml += '<li>Typo: ' + feedback.error_types.Typo + '</li>';
                        }
                        
                        feedbackHtml += '</ul>' +
                            '</div>';
                    }
                    
                    if (feedback.feedback && feedback.feedback.length > 0) {
                        feedbackHtml += '<div class="mt-4 space-y-2">' +
                            '<p class="font-semibold">Detailed Feedback:</p>';
                        
                        for (var i = 0; i < feedback.feedback.length && i < 5; i++) {
                            var item = feedback.feedback[i];
                            var suggestions;
                            if (item.suggestions && item.suggestions.length > 0) {
                                suggestions = item.suggestions.slice(0, 3).join(', ');
                            } else {
                                suggestions = 'No suggestions';
                            }
                            
                            var errorText = item.error_text || '';
                            var message = item.message || '';
                            
                            feedbackHtml += '<div class="bg-yellow-50 p-3 rounded border-l-2 border-yellow-400">' +
                                '<p class="text-sm"><strong>Error:</strong> "' + escapeHtml(errorText) + '"</p>' +
                                '<p class="text-sm"><strong>Message:</strong> ' + escapeHtml(message) + '</p>' +
                                '<p class="text-sm"><strong>Suggestions:</strong> ' + escapeHtml(suggestions) + '</p>' +
                                '</div>';
                        }
                        
                        feedbackHtml += '</div>';
                    } else {
                        feedbackHtml += '<p class="text-green-600 font-semibold mt-2">✓ Great job! No errors found!</p>';
                    }
                    
                    feedbackDiv.innerHTML = feedbackHtml;
                }
                
                // Show next button or continue prompt based on exercise type
                setTimeout(function() {
                    if (exerciseType === 'reading') {
                        var nextBtn = document.getElementById(prefix + 'next-btn');
                        if (nextBtn) {
                            nextBtn.classList.remove('hidden');
                        }
                    } else {
                        var continueDiv = document.getElementById(prefix + 'continue-prompt');
                        if (continueDiv) {
                            continueDiv.classList.remove('hidden');
                        }
                    }
                }, exerciseType === 'reading' ? 2000 : 1000);
            
            } else {
                var errorMsg = result.error || 'Failed to check answer.';
                alert('Error: ' + errorMsg);
            }
        });
}

// Convenience functions for backward compatibility
function submitReadingAnswer() {
    submitAnswer('reading');
}

function submitWritingAnswer() {
    submitAnswer('writing');
}

// Loads the next reading exercise or resets to type selection
function loadNextReadingExercise() {
    // Clear the current exercise state and input
    updateState({ currentExercise: null }, false);
    var input = document.getElementById('reading-answer-input');
    if (input) {
        input.value = '';
    }
    
    loadExercise('reading');
}

// Loads the next writing exercise or returns to type selection
function loadNextWritingExercise() {
    // Clear the current exercise state and input
    updateState({ currentExercise: null }, false);
    var textarea = document.getElementById('writing-answer-input');
    if (textarea) {
        textarea.value = '';
    }
    
    // Hide feedback and continue prompt
    var feedbackDiv = document.getElementById('writing-feedback');
    var continueDiv = document.getElementById('writing-continue-prompt');
    if (feedbackDiv) {
        feedbackDiv.classList.add('hidden');
    }
    if (continueDiv) {
        continueDiv.classList.add('hidden');
    }
    
    loadExercise('writing');
}
