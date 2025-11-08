// Application state management

// Central state object that tracks the entire application's current state
var appState = {
    view: 'login',
    userName: 'Guest',
    userId: null,
    isLoggedIn: false,
    authError: null,
    exerciseType: null,
    currentExercise: null,
    exerciseError: null,
};

// Updates both appState and localStorage in one operation
function updateState(updates, persist) {
    if (persist === undefined) {
        persist = true;
    }
    
    // Update appState object manually
    for (var key in updates) {
        if (updates.hasOwnProperty(key)) {
            appState[key] = updates[key];
        }
    }
    
    // Persist to localStorage if requested
    if (persist) {
        var persistableKeys = ['userId', 'userName', 'isLoggedIn'];
        for (var i = 0; i < persistableKeys.length; i++) {
            var key = persistableKeys[i];
            if (updates.hasOwnProperty(key)) {
                var value = updates[key];
                if (value === null) {
                    localStorage.removeItem(key);
                } else {
                    localStorage.setItem(key, value);
                }
            }
        }
    }
}

// Loads initial state from localStorage on app startup
function loadStateFromStorage() {
    // Load all persisted state from localStorage
    var storedUserId = localStorage.getItem('userId');
    var storedUserName = localStorage.getItem('userName');
    
    // Update appState with stored values
    var updates = {
        userId: storedUserId,
        userName: storedUserName || 'Guest',
        isLoggedIn: !!storedUserId
    };
    updateState(updates, false);
    
    // Set initial view based on login status
    if (appState.isLoggedIn) {
        appState.view = 'dashboard';
    } else {
        appState.view = 'login';
    }
    
    // Update footer info display
    var appInfoElement = document.getElementById('app-info');
    if (appInfoElement) {
        if (appState.isLoggedIn) {
            appInfoElement.textContent = 'Logged in as: ' + escapeHtml(appState.userName);
        } else {
            appInfoElement.textContent = 'Please Log In.';
        }
    }
}
