// ============================================================================
// VIEW ROUTING AND NAVIGATION
// ============================================================================

/**
 * Handles view navigation and application initialization.
 */

import { appState, updateState, loadStateFromStorage } from './state.js';

// Forward declaration - will be imported from views.js
// We need to import this dynamically to avoid circular dependencies
let renderApp = null;

/**
 * Sets the renderApp function from views module.
 * This breaks the circular dependency between router and views.
 */
export function setRenderApp(renderFunction) {
    renderApp = renderFunction;
}

/**
 * Changes the current view and re-renders the app.
 * 
 * @param {string} newView - The view name to switch to
 * 
 * Flow:
 * 1. Update view in state
 * 2. Clear any error messages (clean slate for new view)
 * 3. Re-render the entire app
 */
export function setView(newView) {
    if (!renderApp) {
        console.error('renderApp not initialized. Call setRenderApp() first.');
        return;
    }
    
    updateState({ 
        view: newView,
        authError: null // Clear errors when switching views
    }, false); // Don't persist view changes (they're temporary)
    renderApp();
}

/**
 * Initializes the application when the page loads.
 * 
 * Flow:
 * 1. Load any saved state from localStorage
 * 2. Render the appropriate initial view
 */
export function initializeApp() {
    loadStateFromStorage(); // Restore user session if exists
    if (renderApp) {
        renderApp(); // Display the initial view
    }
}

