// ============================================================================
// EXERCISE HANDLERS
// ============================================================================

/**
 * Handles all exercise-related functionality:
 * - Loading exercises from API
 * - Submitting reading exercise answers
 * - Submitting writing exercise answers
 * - Managing exercise flow and navigation
 */

import { apiCall } from './api.js';
import { appState, updateState } from './state.js';
import { setView } from './router.js';
import { escapeHtml } from './utils.js';

// Forward declaration for renderApp - will be set by views module
let renderApp = null;

/**
 * Sets the renderApp function from views module.
 * This breaks the circular dependency between exercises and views.
 */
export function setRenderApp(renderFunction) {
    renderApp = renderFunction;
}

/**
 * Loads a new exercise from the API based on exercise type.
 * 
 * @param {string} exerciseType - 'reading' or 'writing'
 * 
 * Flow:
 * 1. Call API to get random exercise
 * 2. Store exercise in state
 * 3. Update view to show the exercise
 */
export async function loadExercise(exerciseType) {
    updateState({ exerciseError: null }, false);
    
    const result = await apiCall(`/api/exercise/${exerciseType}`, 'GET');
    
    if (result.success && result.data && result.data.exercise) {
        updateState({
            exerciseType: exerciseType,
            currentExercise: result.data.exercise,
            view: exerciseType === 'reading' ? 'reading_exercise' : 'writing_exercise'
        }, false);
        if (renderApp) {
            renderApp();
        }
    } else {
        updateState({ 
            exerciseError: result.error || 'Failed to load exercise. Please try again.' 
        }, false);
        if (renderApp) {
            renderApp();
        }
    }
}

/**
 * Handles submitting a reading exercise answer.
 * 
 * Flow:
 * 1. Get user's answer from input
 * 2. Call API to check answer
 * 3. Show feedback (correct/incorrect)
 * 4. Increment question count
 * 5. After 3 questions, ask if user wants to continue
 */
export async function submitReadingAnswer() {
    const userAnswer = document.getElementById('reading-answer-input').value.trim();
    
    if (!userAnswer) {
        alert('Please enter an answer.');
        return;
    }
    
    if (!appState.currentExercise) {
        alert('Exercise data missing. Please reload.');
        return;
    }
    
    // Show loading state
    const submitButton = document.getElementById('reading-submit-btn');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Checking...';
    }
    
    // Call API to check answer
    const result = await apiCall('/api/exercise/check-reading', 'POST', {
        question: appState.currentExercise.question,
        user_answer: userAnswer
    });
    
    // Re-enable button
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Answer';
    }
    
    if (result.success && result.data) {
        const isCorrect = result.data.is_correct;
        const correctAnswer = result.data.correct_answer;
        
        // Show feedback
        const feedbackDiv = document.getElementById('reading-feedback');
        if (feedbackDiv) {
            feedbackDiv.classList.remove('hidden');
            feedbackDiv.className = isCorrect 
                ? 'bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg'
                : 'bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg';
            
            feedbackDiv.innerHTML = isCorrect
                ? `<p class="font-bold">✓ Correct! Great job!</p>`
                : `<p class="font-bold">✗ Incorrect.</p>
                   <p class="mt-2">The correct answer is: <strong>${escapeHtml(correctAnswer)}</strong></p>`;
        }
        
        // Increment question count
        appState.readingQuestionCount++;
        
        // After 3 questions, show continue prompt
        if (appState.readingQuestionCount >= 3) {
            setTimeout(() => {
                showReadingContinuePrompt();
            }, 2000);
        } else {
            // Show next question button after 2 seconds
            setTimeout(() => {
                const nextBtn = document.getElementById('reading-next-btn');
                if (nextBtn) {
                    nextBtn.classList.remove('hidden');
                }
            }, 2000);
        }
    } else {
        alert(`Error: ${result.error || 'Failed to check answer.'}`);
    }
}

/**
 * Shows the continue prompt after 3 reading questions.
 */
function showReadingContinuePrompt() {
    const continueDiv = document.getElementById('reading-continue-prompt');
    if (continueDiv) {
        continueDiv.classList.remove('hidden');
    }
}

/**
 * Loads the next reading question or resets to type selection.
 */
export async function loadNextReadingQuestion() {
    // Reset question count if we're continuing after 3 questions
    if (appState.readingQuestionCount >= 3) {
        appState.readingQuestionCount = 0;
    }
    
    // Clear the current exercise state and input
    updateState({ currentExercise: null }, false);
    const input = document.getElementById('reading-answer-input');
    if (input) input.value = '';
    
    await loadExercise('reading');
}

/**
 * Handles submitting a writing exercise answer.
 * 
 * Flow:
 * 1. Get user's written response
 * 2. Call API to get grammatical feedback
 * 3. Display feedback with errors
 * 4. Ask if user wants to continue
 */
export async function submitWritingAnswer() {
    const userAnswer = document.getElementById('writing-answer-input').value.trim();
    
    if (!userAnswer) {
        alert('Please write your response.');
        return;
    }
    
    if (!appState.currentExercise) {
        alert('Exercise data missing. Please reload.');
        return;
    }
    
    // Show loading state
    const submitButton = document.getElementById('writing-submit-btn');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Analyzing...';
    }
    
    // Call API to get feedback
    const result = await apiCall('/api/exercise/check-writing', 'POST', {
        prompt: appState.currentExercise.prompt,
        user_answer: userAnswer
    });
    
    // Re-enable button
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit & Get Feedback';
    }
    
    if (result.success && result.data && result.data.feedback) {
        const feedback = result.data.feedback;
        
        // Display feedback
        const feedbackDiv = document.getElementById('writing-feedback');
        if (feedbackDiv) {
            feedbackDiv.classList.remove('hidden');
            
            // Build feedback HTML
            let feedbackHtml = `
                <h3 class="font-bold text-lg mb-3">Grammatical Analysis</h3>
                <p class="mb-2"><strong>Total Errors Found:</strong> ${feedback.error_count || 0}</p>
            `;
            
            if (feedback.error_types) {
                feedbackHtml += `<div class="mb-3">
                    <p class="font-semibold">Error Breakdown:</p>
                    <ul class="list-disc list-inside ml-4">
                        ${feedback.error_types.Grammar ? `<li>Grammar: ${feedback.error_types.Grammar}</li>` : ''}
                        ${feedback.error_types.Style ? `<li>Style: ${feedback.error_types.Style}</li>` : ''}
                        ${feedback.error_types.Typo ? `<li>Typo: ${feedback.error_types.Typo}</li>` : ''}
                    </ul>
                </div>`;
            }
            
            if (feedback.feedback && feedback.feedback.length > 0) {
                feedbackHtml += `<div class="mt-4 space-y-2">
                    <p class="font-semibold">Detailed Feedback:</p>`;
                
                feedback.feedback.forEach((item, index) => {
                    if (index < 5) { // Show first 5 errors
                        const suggestions = item.suggestions && item.suggestions.length > 0 
                            ? item.suggestions.slice(0, 3).join(', ') 
                            : 'No suggestions';
                        feedbackHtml += `
                            <div class="bg-yellow-50 p-3 rounded border-l-2 border-yellow-400">
                                <p class="text-sm"><strong>Error:</strong> "${escapeHtml(item.error_text || '')}"</p>
                                <p class="text-sm"><strong>Message:</strong> ${escapeHtml(item.message || '')}</p>
                                <p class="text-sm"><strong>Suggestions:</strong> ${escapeHtml(suggestions)}</p>
                            </div>`;
                    }
                });
                
                feedbackHtml += `</div>`;
            } else {
                feedbackHtml += `<p class="text-green-600 font-semibold mt-2">✓ Great job! No errors found!</p>`;
            }
            
            feedbackDiv.innerHTML = feedbackHtml;
        }
        
        // Show continue prompt
        setTimeout(() => {
            const continueDiv = document.getElementById('writing-continue-prompt');
            if (continueDiv) {
                continueDiv.classList.remove('hidden');
            }
        }, 1000);
    } else {
        alert(`Error: ${result.error || 'Failed to get feedback.'}`);
    }
}

/**
 * Loads the next writing exercise or returns to type selection.
 */
export async function loadNextWritingExercise() {
    // Clear the current exercise state and input
    updateState({ currentExercise: null }, false);
    const textarea = document.getElementById('writing-answer-input');
    if (textarea) textarea.value = '';
    
    // Hide feedback and continue prompt
    const feedbackDiv = document.getElementById('writing-feedback');
    const continueDiv = document.getElementById('writing-continue-prompt');
    if (feedbackDiv) feedbackDiv.classList.add('hidden');
    if (continueDiv) continueDiv.classList.add('hidden');
    
    await loadExercise('writing');
}

