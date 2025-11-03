// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Utility functions used across the application.
 */

/**
 * Escapes HTML special characters to prevent XSS attacks.
 * This is critical when inserting user data into innerHTML.
 * 
 * @param {string} text - User input that might contain HTML
 * @returns {string} - Safely escaped text
 * 
 * Example: escapeHtml('<script>alert("xss")</script>') 
 *          returns '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 */
export function escapeHtml(text) {
    if (text == null) return ''; // Handle null/undefined gracefully
    const div = document.createElement('div');
    div.textContent = text; // textContent automatically escapes HTML
    return div.innerHTML; // Return the escaped HTML string
}

