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

function getExerciseElements(exerciseType) {
    var prefix = exerciseType + '-';
    return {
        prefix: prefix,
        input: document.getElementById(prefix + 'answer-input'),
        submitButton: document.getElementById(prefix + 'submit-btn'),
        feedback: document.getElementById(prefix + 'feedback'),
        nextButton: document.getElementById(prefix + 'next-btn'),
        continuePrompt: document.getElementById(prefix + 'continue-prompt')
    };
}

function setButtonLoading(button, text) {
    if (!button) {
        return function noop() {};
    }
    var originalText = button.textContent;
    button.disabled = true;
    button.textContent = text;
    return function restore() {
        button.disabled = false;
        button.textContent = originalText;
    };
}

function buildFeedbackHtml(feedback) {
    var errorCount = feedback.error_count || 0;
    var accuracy = feedback.accuracy !== undefined ? feedback.accuracy.toFixed(1) : 'N/A';

    var html = '<h3 class="font-bold text-xl mb-4">Grammatical Analysis</h3>' +
        '<div class="mb-6 p-6 bg-blue-50 rounded-xl border-l-4 border-blue-500">' +
        '<p class="text-3xl font-black text-blue-700 mb-1">Accuracy: ' + accuracy + '%</p>' +
        '<p class="text-sm text-blue-600">Based on error count and word analysis</p>' +
        '</div>' +
        '<p class="mb-4 text-lg"><strong>Total Errors Found:</strong> ' + errorCount + '</p>';

    if (feedback.error_types) {
        html += '<div class="mb-5">' +
            '<p class="font-semibold text-lg">Error Breakdown:</p>' +
            '<ul class="list-disc list-inside ml-4 space-y-1">';

        if (feedback.error_types.Grammar) {
            html += '<li>Grammar: ' + feedback.error_types.Grammar + '</li>';
        }
        if (feedback.error_types.Style) {
            html += '<li>Style: ' + feedback.error_types.Style + '</li>';
        }
        if (feedback.error_types.Typo) {
            html += '<li>Typo: ' + feedback.error_types.Typo + '</li>';
        }
        html += '</ul></div>';
    }

    if (feedback.feedback && feedback.feedback.length > 0) {
        html += '<div class="mt-6 space-y-3">' +
            '<p class="font-semibold text-lg">Detailed Feedback:</p>';

        var itemsToShow = Math.min(feedback.feedback.length, 5);
        for (var i = 0; i < itemsToShow; i++) {
            var item = feedback.feedback[i];
            var suggestions = (item.suggestions && item.suggestions.length > 0) ?
                item.suggestions.slice(0, 3).join(', ') :
                'No suggestions';
            var errorText = item.error_text || '';
            var message = item.message || '';

            html += '<div class="bg-yellow-50 p-4 rounded-lg border-l-2 border-yellow-400">' +
                '<p class="text-sm"><strong>Error:</strong> "' + escapeHtml(errorText) + '"</p>' +
                '<p class="text-sm"><strong>Message:</strong> ' + escapeHtml(message) + '</p>' +
                '<p class="text-sm"><strong>Suggestions:</strong> ' + escapeHtml(suggestions) + '</p>' +
                '</div>';
        }

        html += '</div>';
    } else {
        html += '<p class="text-green-600 font-semibold mt-4 text-lg">✓ Great job! No errors found!</p>';
    }

    return html;
}

function showFeedbackAndActions(exerciseType, elements, feedback) {
    if (elements.feedback) {
        elements.feedback.classList.remove('hidden');
        elements.feedback.innerHTML = buildFeedbackHtml(feedback);
    }

    if (exerciseType === 'reading' && elements.nextButton) {
        elements.nextButton.classList.remove('hidden');
    }

    if (exerciseType === 'writing' && elements.continuePrompt) {
        elements.continuePrompt.classList.remove('hidden');
    }
}

// Handles submitting an exercise answer (unified for both reading and writing)
function submitAnswer(exerciseType) {
    var elements = getExerciseElements(exerciseType);

    if (!elements.input) {
        alert('Input element not found.');
        return;
    }
    
    var userAnswer = elements.input.value.trim();
    
    if (!userAnswer) {
        alert('Please enter your answer.');
        return;
    }
    
    if (!appState.currentExercise) {
        alert('Exercise data missing. Please reload.');
        return;
    }
    
    // Show loading state
    var restoreButton = setButtonLoading(elements.submitButton, 'Checking...');
    
    // Call API to check answer
    var promptText = appState.currentExercise.prompt;
    apiCall('/api/exercise/check/' + exerciseType, 'POST', {
        prompt: promptText,
        user_answer: userAnswer
    })
        .then(function(result) {
            // Re-enable button
            restoreButton();
            
            if (result.success && result.data && result.data.feedback) {
                showFeedbackAndActions(exerciseType, elements, result.data.feedback);
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

// Export for testing in Node (ignored in browser)
if (typeof module !== 'undefined') {
    module.exports = {
        setButtonLoading,
        buildFeedbackHtml,
        showFeedbackAndActions
    };
}
