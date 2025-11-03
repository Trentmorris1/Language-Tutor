// ============================================================================
// AUTHENTICATION HANDLERS
// ============================================================================

/**
 * Handles all authentication-related functionality:
 * - User login
 * - User registration
 * - User logout
 */

import { apiCall } from './api.js';
import { appState, updateState } from './state.js';
import { setView } from './router.js';
import { escapeHtml } from './utils.js';

// Forward declaration for renderApp - will be set by views module
let renderApp = null;

/**
 * Sets the renderApp function from views module.
 * This breaks the circular dependency between auth and views.
 */
export function setRenderApp(renderFunction) {
    renderApp = renderFunction;
}

/**
 * Handles user logout.
 * 
 * Flow:
 * 1. Clear all localStorage data
 * 2. Reset appState to logged-out defaults
 * 3. Redirect to login page
 */
export function handleLogout() {
    localStorage.clear(); // Remove all saved data
    updateState({
        isLoggedIn: false,
        userId: null,
        userName: 'Guest',
        view: 'login'
    }, true); // Persist these changes (clear localStorage)
    if (renderApp) {
        renderApp();
    }
}

/**
 * Handles user registration.
 * 
 * @param {HTMLFormElement} form - The registration form element
 * 
 * Flow:
 * 1. Extract form data (email, password, username)
 * 2. Call API to register user
 * 3. If successful, show success message and redirect to login
 * 4. If failed, display error message
 */
export async function handleRegister(form) {
    // Extract form values
    const email = form.elements['login-email'].value.trim();
    const password = form.elements['login-password'].value;
    const username = form.elements['login-username'].value.trim();
    
    // Clear any previous errors
    updateState({ authError: null }, false);
    
    // Call API using our helper function
    const result = await apiCall('/register', 'POST', { email, password, username });
    
    if (result.success) {
        // Registration successful - prompt user to login
        updateState({ 
            authError: 'Registration successful! Please log in.' 
        }, false);
        setView('login');
    } else {
        // Registration failed - show error
        updateState({ 
            authError: result.error || 'Registration failed due to server error.' 
        }, false);
        if (renderApp) {
            renderApp();
        }
    }
}

/**
 * Handles user login.
 * 
 * @param {HTMLFormElement} form - The login form element
 * 
 * Flow:
 * 1. Extract form data (email, password)
 * 2. Call API to authenticate user
 * 3. If successful, save user data and redirect to dashboard
 * 4. If failed, display error message
 */
export async function handleLogin(form) {
    // Extract form values
    const email = form.elements['login-email'].value.trim();
    const password = form.elements['login-password'].value;
    
    // Clear any previous errors
    updateState({ authError: null }, false);
    
    // Call API using our helper function
    const result = await apiCall('/login', 'POST', { email, password });
    
    if (result.success && result.data) {
        // Login successful - save user data and update state
        updateState({
            userId: result.data.user_id,
            userName: result.data.username,
            isLoggedIn: true
        }, true); // Persist to localStorage
        
        // Update footer info
        const appInfoElement = document.getElementById('app-info');
        if (appInfoElement) {
            appInfoElement.textContent = `Logged in as: ${escapeHtml(result.data.username)}`;
        }
        
        // Redirect to dashboard
        setView('dashboard');
    } else {
        // Login failed - show error
        updateState({ 
            authError: result.error || 'Login failed.' 
        }, false);
        if (renderApp) {
            renderApp();
        }
    }
}

