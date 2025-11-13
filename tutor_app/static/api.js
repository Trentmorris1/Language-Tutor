// API communication layer

// Centralized API call function that handles all fetch requests
function apiCall(endpoint, method, body) {
    if (method === undefined) {
        method = 'GET';
    }
    if (body === undefined) {
        body = null;
    }
    
    // Build fetch options
    var options = {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'  // Include cookies for session handling
    };
    
    // Add body if provided for non GET requests
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    // Make the API request
    return fetch(API_BASE_URL + endpoint, options)
        .then(function(response) {
            // Parse JSON response
            return response.json().then(function(result) {
                // Return standardized result object
                if (response.ok && result.success) {
                    return {
                        success: true,
                        data: result,
                        error: null
                    };
                } else {
                    return {
                        success: false,
                        data: result,
                        error: result.message || 'Request failed'
                    };
                }
            });
        })
        .catch(function(error) {
            // Handle network and parsing errors
            console.error('API call failed for ' + endpoint + ':', error);
            return {
                success: false,
                data: null,
                error: 'Could not connect to the backend server. Please ensure the server is running.'
            };
        });
}
