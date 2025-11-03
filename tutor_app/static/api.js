// ============================================================================
// API COMMUNICATION LAYER
// ============================================================================

/**
 * Centralized API call function that handles all fetch requests.
 * This eliminates repetitive fetch/error handling code across the application.
 */

import { API_BASE_URL } from './config.js';

/**
 * Centralized API call function that handles all fetch requests.
 * This eliminates ~60 lines of repetitive fetch/error handling code.
 * 
 * @param {string} endpoint - API endpoint path (e.g., '/login', '/register')
 * @param {string} method - HTTP method ('GET', 'POST', etc.)
 * @param {object} body - Data to send in request body (will be JSON stringified)
 * @returns {Promise<object>} - Resolves with {success: bool, data: object, error: string}
 * 
 * Flow:
 * 1. Make fetch request to API
 * 2. Parse JSON response
 * 3. Return standardized result object
 * 4. Handle network/parsing errors gracefully
 */
export async function apiCall(endpoint, method = 'GET', body = null) {
    try {
        // Build fetch options
        const options = {
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };
        
        // Add body if provided (for POST/PUT requests)
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        // Make the API request
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        // Parse JSON response (this can throw if response isn't valid JSON)
        const result = await response.json();
        
        // Return standardized result object
        return {
            success: response.ok && result.success,
            data: result,
            error: response.ok ? null : (result.message || 'Request failed')
        };
    } catch (error) {
        // Handle network errors, JSON parsing errors, etc.
        console.error(`API call failed for ${endpoint}:`, error);
        return {
            success: false,
            data: null,
            error: 'Could not connect to the backend server. Please ensure the server is running.'
        };
    }
}

