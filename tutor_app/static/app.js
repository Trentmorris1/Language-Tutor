// ============================================================================
// MAIN APPLICATION ENTRY POINT
// ============================================================================

/**
 * Main entry point for the Language Tutor application.
 * This module imports all other modules and wires everything together.
 */

// Import configuration and utilities
import { appContainer, authStatusElement } from './config.js';
import { escapeHtml } from './utils.js';

// Import state management
import { appState, updateState, loadStateFromStorage } from './state.js';

// Import API layer
import { apiCall } from './api.js';

// Import routing
import { setView, initializeApp, setRenderApp } from './router.js';

// Import authentication handlers
import { handleLogin, handleRegister, handleLogout, setRenderApp as setAuthRenderApp } from './auth.js';

// Import exercise handlers
import { 
    loadExercise, 
    submitReadingAnswer, 
    loadNextReadingQuestion, 
    submitWritingAnswer, 
    loadNextWritingExercise,
    setRenderApp as setExercisesRenderApp 
} from './exercises.js';

// Import view rendering (must be last due to circular dependencies)
import { renderApp } from './views.js';

// Wire up circular dependencies by passing renderApp to modules that need it
// This breaks the circular dependency: router/auth/exercises need renderApp, 
// but views needs router/auth/exercises functions
setRenderApp(renderApp);
setAuthRenderApp(renderApp);
setExercisesRenderApp(renderApp);

// ============================================================================
// PUBLIC API (Expose functions to global scope)
// ============================================================================

/**
 * Expose functions to window.app for use in inline event handlers (HTML onclick attributes).
 * This is necessary because inline handlers need global access.
 * 
 * NOTE: In a production app, you'd want to use event delegation instead of inline handlers
 * for better security and maintainability, but this works for the current architecture.
 */
window.app = {
    setView,
    handleLogin,
    handleRegister,
    handleLogout,
    // Exercise functions
    loadExercise,
    submitReadingAnswer,
    loadNextReadingQuestion,
    submitWritingAnswer,
    loadNextWritingExercise
};

// ============================================================================
// STARTUP
// ============================================================================

// Initialize the application when the script loads
initializeApp();
