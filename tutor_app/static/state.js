// ============================================================================
// APPLICATION STATE MANAGEMENT
// ============================================================================

/**
 * Central state management for the application.
 * This module exports the shared appState object and state management functions.
 */

import { escapeHtml } from './utils.js';
import { appContainer } from './config.js';

/**
 * Central state object that tracks the entire application's current state.
 * This single source of truth prevents state inconsistencies.
 */
export let appState = {
    view: 'login', // Current view: 'login', 'register', 'dashboard', 'exercise_type_select', 'reading_exercise', 'writing_exercise'
    userName: 'Guest', // Current user's display name
    userId: null, // Current user's ID (null if not logged in)
    isLoggedIn: false, // Authentication status flag
    authError: null, // Error message to display (null if no error)
    // Exercise state
    exerciseType: null, // 'reading' or 'writing'
    currentExercise: null, // Current exercise data from API
    readingQuestionCount: 0, // Number of reading questions completed (reset after 3)
    exerciseError: null // Error message for exercises
};

/**
 * Updates both appState and localStorage in one operation.
 * This prevents state desynchronization and reduces code duplication.
 * 
 * @param {object} updates - Object with keys matching appState properties
 * @param {boolean} persist - If true, also save to localStorage (default: true)
 * 
 * Flow:
 * 1. Update appState object
 * 2. If persist is true, also update localStorage
 * 3. This ensures state stays in sync across page reloads
 */
export function updateState(updates, persist = true) {
    // Update appState object
    Object.assign(appState, updates);
    
    // Persist to localStorage if requested (for login state, user data, etc.)
    if (persist) {
        Object.keys(updates).forEach(key => {
            // Only persist certain keys (not view, authError, exercise state which are temporary)
            const persistableKeys = ['userId', 'userName', 'isLoggedIn'];
            if (persistableKeys.includes(key)) {
                const value = updates[key];
                if (value === null) {
                    localStorage.removeItem(key); // Remove null values
                } else {
                    localStorage.setItem(key, value); // Store the value
                }
            }
        });
    }
}

/**
 * Loads initial state from localStorage on app startup.
 * This restores the user's session if they've logged in before.
 * 
 * Flow:
 * 1. Read all stored values from localStorage
 * 2. Update appState with stored values (or defaults)
 * 3. Determine if user is logged in (has userId)
 * 4. Set initial view based on login status
 */
export function loadStateFromStorage() {
    // Load all persisted state from localStorage
    const storedUserId = localStorage.getItem('userId');
    const storedUserName = localStorage.getItem('userName');
    
    // Update appState with stored values (or sensible defaults)
    updateState({
        userId: storedUserId,
        userName: storedUserName || 'Guest',
        isLoggedIn: !!storedUserId // Convert to boolean: true if userId exists
    }, false); // Don't persist back to localStorage (we just loaded from it)
    
    // Set initial view based on login status
    appState.view = appState.isLoggedIn ? 'dashboard' : 'login';
    
    // Update footer info display
    const appInfoElement = document.getElementById('app-info');
    if (appInfoElement) {
        appInfoElement.textContent = appState.isLoggedIn 
            ? `Logged in as: ${escapeHtml(appState.userName)}` 
            : 'Please Log In.';
    }
}

