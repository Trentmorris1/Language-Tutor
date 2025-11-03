// ============================================================================
// VIEW RENDERING FUNCTIONS
// ============================================================================

/**
 * Handles all view rendering for the single-page application.
 * This module contains the main router and all view rendering functions.
 */

import { appState } from './state.js';
import { appContainer, authStatusElement } from './config.js';
import { escapeHtml } from './utils.js';
import { handleLogin, handleRegister, handleLogout } from './auth.js';
import { loadExercise, submitReadingAnswer, loadNextReadingQuestion, submitWritingAnswer, loadNextWritingExercise } from './exercises.js';
import { setView } from './router.js';

/**
 * Main rendering function that displays the current view.
 * This is the "router" of our single-page application.
 * 
 * Flow:
 * 1. Enforce authentication rules (logged-in users can't see login page, etc.)
 * 2. Update the auth status header
 * 3. Render the main content based on current view
 */
export function renderApp() {
    // Security: Enforce authentication rules
    // If not logged in, force login/register view
    if (!appState.isLoggedIn) {
        appState.view = (appState.view === 'register') ? 'register' : 'login';
    }
    // If logged in but trying to access login/register, redirect to dashboard
    else if (appState.view === 'login' || appState.view === 'register') {
        appState.view = 'dashboard';
    }
    
    // Update the auth status header (top right of page)
    renderAuthStatus();
    
    // Render the main content area based on current view
    switch (appState.view) {
        case 'login':
            appContainer.innerHTML = renderLogin(false);
            break;
        case 'register':
            appContainer.innerHTML = renderLogin(true);
            break;
        case 'dashboard':
            appContainer.innerHTML = renderDashboard();
            break;
        case 'exercise_type_select':
            appContainer.innerHTML = renderExerciseTypeSelect();
            break;
        case 'reading_exercise':
            appContainer.innerHTML = renderReadingExercise();
            break;
        case 'writing_exercise':
            appContainer.innerHTML = renderWritingExercise();
            break;
        default:
            appContainer.innerHTML = renderLogin(false); // Fallback to login
    }
}

/**
 * Updates the authentication status header (top right).
 * Shows either login button or user info with logout button.
 */
function renderAuthStatus() {
    if (appState.isLoggedIn) {
        // User is logged in: show welcome message and logout button
        // SECURITY: Use escapeHtml to prevent XSS from malicious usernames
        authStatusElement.innerHTML = `
            <p class="font-bold">Welcome, ${escapeHtml(appState.userName)}</p>
            <button onclick="window.app.handleLogout()" class="text-accent text-xs hover:underline">Log Out</button>
            <p class="text-xs text-gray-400">User ID: ${escapeHtml(String(appState.userId))}</p>
        `;
    } else {
        // User is not logged in: show login/register button
        authStatusElement.innerHTML = `
            <button onclick="window.app.setView('login')" class="bg-accent text-gray-800 px-3 py-1 rounded-lg font-bold hover:bg-yellow-400">
                Log In / Register
            </button>
        `;
    }
}

/**
 * Renders the login or registration form.
 * 
 * @param {boolean} isRegister - If true, render registration form; if false, render login form
 * @returns {string} - HTML string for the form
 * 
 * SECURITY NOTE: All user data (authError) is escaped using escapeHtml() to prevent XSS attacks.
 */
function renderLogin(isRegister = false) {
    // Escape error message to prevent XSS
    const errorHtml = appState.authError 
        ? `<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-lg">${escapeHtml(appState.authError)}</div>` 
        : '';
    
    return `
        <div class="text-center p-8">
            <h2 class="text-3xl font-bold text-primary mb-6">${isRegister ? 'Create Your Account' : 'Welcome Back'}</h2>
            <p class="text-gray-600 mb-8">
                ${isRegister ? 'Sign up to begin your personalized language journey.' : 'Sign in to track your progress and resume practice.'}
            </p>
            
            ${errorHtml}

            <form onsubmit="event.preventDefault(); window.app.${isRegister ? 'handleRegister' : 'handleLogin'}(this);" class="max-w-sm mx-auto space-y-4">
                ${isRegister ? `
                    <input type="text" id="login-username" name="login-username" placeholder="Full Name (for your profile)" required 
                       class="w-full p-3 border border-gray-300 rounded-lg focus:ring-secondary focus:border-secondary">
                ` : ''}
                <input type="email" id="login-email" name="login-email" placeholder="Email Address" required 
                       class="w-full p-3 border border-gray-300 rounded-lg focus:ring-secondary focus:border-secondary">
                <input type="password" id="login-password" name="login-password" placeholder="Password" required 
                       class="w-full p-3 border border-gray-300 rounded-lg focus:ring-secondary focus:border-secondary">
                <button type="submit" class="w-full btn-primary bg-secondary text-white p-3 rounded-lg font-semibold shadow-md">
                    ${isRegister ? 'Register & Start Learning' : 'Log In & Continue'}
                </button>
            </form>
            
            <div class="mt-6">
                <button onclick="window.app.setView('${isRegister ? 'login' : 'register'}')" class="text-sm text-primary hover:underline">
                    ${isRegister ? 'Already have an account? Log In' : 'Need an account? Register Here'}
                </button>
            </div>
        </div>
    `;
}

/**
 * Renders the main dashboard view.
 * Shows user stats, practice options, and review list.
 * 
 * SECURITY NOTE: userName is escaped to prevent XSS attacks.
 */
function renderDashboard() {
    return `
        <div class="space-y-8">
            <h2 class="text-3xl font-bold text-primary">Hello, ${escapeHtml(appState.userName)}!</h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div class="bg-background p-6 rounded-xl border-t-4 border-secondary shadow-inner">
                    <p class="text-4xl font-extrabold text-secondary">85%</p>
                    <p class="text-sm text-gray-600 mt-2">Grammar Accuracy (FR4)</p>
                </div>
                <div class="bg-background p-6 rounded-xl border-t-4 border-secondary shadow-inner">
                    <p class="text-4xl font-extrabold text-secondary">+124</p>
                    <p class="text-sm text-gray-600 mt-2">Vocabulary Growth (FR4)</p>
                </div>
                <div class="bg-background p-6 rounded-xl border-t-4 border-secondary shadow-inner">
                    <p class="text-4xl font-extrabold text-secondary">B2</p>
                    <p class="text-sm text-gray-600 mt-2">Current Fluency Level</p>
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onclick="window.app.setView('exercise_type_select')"
                        class="btn-primary bg-primary text-white p-5 rounded-xl font-semibold text-lg shadow-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l2 5m-2-5l-5 2" />
                    </svg>
                    Start Exercises
                </button>
                <button onclick="window.app.setView('custom_upload')"
                        class="btn-primary bg-accent text-gray-800 p-5 rounded-xl font-semibold text-lg shadow-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload Custom Content (FR5)
                </button>
            </div>

            <div class="bg-gray-100 p-5 rounded-xl border border-gray-200">
                <h3 class="text-xl font-semibold text-gray-800">Review List (FR8)</h3>
                <ul class="list-disc list-inside mt-2 text-gray-700">
                    <li>Affect / Effect</li>
                    <li>Apathetic (Common Error)</li>
                    <li>Derelict (New Vocabulary)</li>
                </ul>
                <a href="#" class="text-primary hover:underline mt-2 inline-block text-sm">View full list</a>
            </div>

        </div>
    `;
}

/**
 * Renders the exercise type selection view.
 * Allows users to choose between reading and writing exercises.
 */
function renderExerciseTypeSelect() {
    return `
        <div class="space-y-6 text-center">
            <h2 class="text-3xl font-bold text-primary">Choose Exercise Type</h2>
            <p class="text-gray-600">Select the type of exercise you'd like to practice.</p>
            
            ${appState.exerciseError ? `<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-lg">${escapeHtml(appState.exerciseError)}</div>` : ''}
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mt-8">
                <button onclick="window.app.loadExercise('reading')"
                        class="btn-primary bg-primary text-white p-8 rounded-xl font-semibold text-xl shadow-lg flex flex-col items-center justify-center hover:bg-blue-600 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span class="text-2xl">Reading</span>
                    <span class="text-sm mt-2 opacity-90">Practice grammar with multiple choice questions</span>
                </button>
                
                <button onclick="window.app.loadExercise('writing')"
                        class="btn-primary bg-secondary text-white p-8 rounded-xl font-semibold text-xl shadow-lg flex flex-col items-center justify-center hover:bg-blue-400 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span class="text-2xl">Writing</span>
                    <span class="text-sm mt-2 opacity-90">Get feedback on your writing</span>
                </button>
            </div>
            
            <button onclick="window.app.setView('dashboard')" class="text-primary hover:underline mt-6">
                &larr; Back to Dashboard
            </button>
        </div>
    `;
}

/**
 * Renders the reading exercise view.
 * Shows question, options, and input for user answer.
 */
function renderReadingExercise() {
    if (!appState.currentExercise) {
        return `<div class="text-center p-8">
            <p class="text-red-600">Error: Exercise data not loaded.</p>
            <button onclick="window.app.setView('exercise_type_select')" class="text-primary hover:underline mt-4">
                &larr; Back to Exercise Selection
            </button>
        </div>`;
    }
    
    const exercise = appState.currentExercise;
    const questionNum = appState.readingQuestionCount + 1;
    
    return `
        <div class="space-y-6">
            <div class="flex justify-between items-center">
                <h2 class="text-3xl font-bold text-primary">Reading Exercise</h2>
                <p class="text-sm text-gray-600">Question ${questionNum} of 3</p>
            </div>
            
            <div class="bg-background p-6 rounded-xl border border-gray-300">
                <p class="font-medium text-lg mb-4">Question:</p>
                <p class="text-gray-700 text-lg">${escapeHtml(exercise.question)}</p>
            </div>
            
            ${exercise.options && exercise.options.length > 0 ? `
                <div class="bg-blue-50 p-4 rounded-lg">
                    <p class="font-semibold mb-2">Options:</p>
                    <ul class="list-disc list-inside space-y-1">
                        ${exercise.options.map(opt => `<li>${escapeHtml(opt)}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            <div>
                <label for="reading-answer-input" class="block text-lg font-medium text-gray-700 mb-2">
                    Type the correct answer:
                </label>
                <input type="text" id="reading-answer-input" 
                       placeholder="Enter your answer here..."
                       class="w-full p-4 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-lg"
                       onkeypress="if(event.key==='Enter') window.app.submitReadingAnswer()">
            </div>
            
            <button id="reading-submit-btn" onclick="window.app.submitReadingAnswer()" 
                    class="w-full btn-primary bg-primary text-white p-4 rounded-xl font-semibold text-lg shadow-md">
                Submit Answer
            </button>
            
            <div id="reading-feedback" class="hidden"></div>
            
            <button id="reading-next-btn" onclick="window.app.loadNextReadingQuestion()" 
                    class="hidden w-full btn-primary bg-secondary text-white p-4 rounded-xl font-semibold text-lg shadow-md">
                Next Question
            </button>
            
            <div id="reading-continue-prompt" class="hidden bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded-lg">
                <p class="font-bold mb-2">You've completed 3 questions!</p>
                <p class="mb-4">Would you like to continue with more reading exercises?</p>
                <div class="flex gap-4">
                    <button onclick="window.app.loadNextReadingQuestion()" 
                            class="flex-1 bg-primary text-white p-3 rounded-lg font-semibold hover:bg-blue-600">
                        Continue
                    </button>
                    <button onclick="window.app.setView('exercise_type_select')" 
                            class="flex-1 bg-gray-300 text-gray-800 p-3 rounded-lg font-semibold hover:bg-gray-400">
                        Choose Different Exercise
                    </button>
                </div>
            </div>
            
            <button onclick="window.app.setView('exercise_type_select')" class="text-primary hover:underline mt-4">
                &larr; Back to Exercise Selection
            </button>
        </div>
    `;
}

/**
 * Renders the writing exercise view.
 * Shows prompt and textarea for user response.
 */
function renderWritingExercise() {
    if (!appState.currentExercise) {
        return `<div class="text-center p-8">
            <p class="text-red-600">Error: Exercise data not loaded.</p>
            <button onclick="window.app.setView('exercise_type_select')" class="text-primary hover:underline mt-4">
                &larr; Back to Exercise Selection
            </button>
        </div>`;
    }
    
    const exercise = appState.currentExercise;
    
    return `
        <div class="space-y-6">
            <h2 class="text-3xl font-bold text-primary">Writing Exercise</h2>
            
            <div class="bg-background p-6 rounded-xl border border-gray-300">
                <p class="font-medium text-lg mb-4">Prompt:</p>
                <p class="text-gray-700 text-lg">${escapeHtml(exercise.prompt)}</p>
            </div>
            
            <div>
                <label for="writing-answer-input" class="block text-lg font-medium text-gray-700 mb-2">
                    Your Response:
                </label>
                <textarea id="writing-answer-input" rows="10" 
                          placeholder="Type your response here..."
                          class="w-full p-4 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"></textarea>
            </div>
            
            <button id="writing-submit-btn" onclick="window.app.submitWritingAnswer()" 
                    class="w-full btn-primary bg-primary text-white p-4 rounded-xl font-semibold text-lg shadow-md">
                Submit & Get Feedback
            </button>
            
            <div id="writing-feedback" class="hidden"></div>
            
            <div id="writing-continue-prompt" class="hidden bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded-lg">
                <p class="font-bold mb-2">Exercise Complete!</p>
                <p class="mb-4">Would you like to try another writing exercise?</p>
                <div class="flex gap-4">
                    <button onclick="window.app.loadNextWritingExercise()" 
                            class="flex-1 bg-primary text-white p-3 rounded-lg font-semibold hover:bg-blue-600">
                        Continue
                    </button>
                    <button onclick="window.app.setView('exercise_type_select')" 
                            class="flex-1 bg-gray-300 text-gray-800 p-3 rounded-lg font-semibold hover:bg-gray-400">
                        Choose Different Exercise
                    </button>
                </div>
            </div>
            
            <button onclick="window.app.setView('exercise_type_select')" class="text-primary hover:underline mt-4">
                &larr; Back to Exercise Selection
            </button>
        </div>
    `;
}

