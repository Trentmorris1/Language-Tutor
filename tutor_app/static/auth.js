// Authentication handlers

// Forward declaration for renderApp - will be set by views module
var renderApp = null;

// Sets the renderApp function from views module
function setAuthRenderApp(renderFunction) {
    renderApp = renderFunction;
}

// Handles user logout
function handleLogout() {
    // Call logout API to clear server-side session
    apiCall('/logout', 'POST')
        .then(function(result) {
            // Clear client-side state regardless of API response
            localStorage.clear();
            updateState({
                isLoggedIn: false,
                userId: null,
                userName: 'Guest',
                view: 'login'
            }, true);
            if (renderApp) {
                renderApp();
            }
        })
        .catch(function(error) {
            // Even if API call fails, clear client-side state
            localStorage.clear();
            updateState({
                isLoggedIn: false,
                userId: null,
                userName: 'Guest',
                view: 'login'
            }, true);
            if (renderApp) {
                renderApp();
            }
        });
}

// Handles user registration
function handleRegister(form) {
    // Extract form values
    var email = form.elements['login-email'].value.trim();
    var password = form.elements['login-password'].value;
    var username = form.elements['login-username'].value.trim();
    
    // Clear any previous errors
    updateState({ authError: null }, false);
    
    // Call API using our helper function
    apiCall('/register', 'POST', { email: email, password: password, username: username })
        .then(function(result) {
            if (result.success) {
                // Registration successful - prompt user to login
                updateState({
                    authError: 'Registration successful! Please log in.'
                }, false);
                setView('login');
            } else {
                // Registration failed - show error
                var errorMsg = result.error || 'Registration failed due to server error.';
                updateState({
                    authError: errorMsg
                }, false);
                if (renderApp) {
                    renderApp();
                }
            }
        });
}

// Handles user login
function handleLogin(form) {
    // Extract form values
    var email = form.elements['login-email'].value.trim();
    var password = form.elements['login-password'].value;
    
    // Clear any previous errors
    updateState({ authError: null }, false);
    
    // Call API using our helper function
    apiCall('/login', 'POST', { email: email, password: password })
        .then(function(result) {
            if (result.success && result.data) {
                // Login successful - save user data and update state
                updateState({
                    userId: result.data.user_id,
                    userName: result.data.username,
                    isLoggedIn: true
                }, true);
                
                // Update footer info
                var appInfoElement = document.getElementById('app-info');
                if (appInfoElement) {
                    appInfoElement.textContent = 'Logged in as: ' + escapeHtml(result.data.username);
                }
                
                // Redirect to dashboard
                setView('dashboard');
            } else {
                // Login failed - show error
                var errorMsg = result.error || 'Login failed.';
                updateState({
                    authError: errorMsg
                }, false);
                if (renderApp) {
                    renderApp();
                }
            }
        });
}
