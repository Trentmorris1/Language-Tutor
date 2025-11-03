// ============================================================================
// CONFIGURATION & SETUP
// ============================================================================

/**
 * Configuration constants and DOM element references.
 * This module provides shared configuration that all other modules can import.
 */

// Use relative URL for API calls (works with any domain/port)
// This makes the app more flexible and secure than hardcoding localhost
export const API_BASE_URL = ''; // Empty string means "same origin" - Flask serves from same domain

// Cache DOM elements we'll frequently access (performance optimization)
export const appContainer = document.getElementById('app-container');
export const authStatusElement = document.getElementById('auth-status');

