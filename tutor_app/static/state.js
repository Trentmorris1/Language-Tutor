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
    overallAccuracy: 0,
    readingAccuracy: 0,
    writingAccuracy: 0,
    errorPercentages: {
        grammar: 0,
        style: 0,
        typo: 0
    },
    errorCounts: {
        grammar: 0,
        style: 0,
        typo: 0
    }
};

var storage;
try {
    storage = window.sessionStorage;
} catch (error) {
    storage = null;
}

if (!storage) {
    storage = {
        getItem: function() { return null; },
        setItem: function() {},
        removeItem: function() {},
        clear: function() {}
    };
}

// Updates both appState and sessionStorage in one operation
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
    
    // Persist to sessionStorage if requested
    if (persist) {
        var persistableKeys = ['userId', 'userName', 'isLoggedIn'];
        for (var i = 0; i < persistableKeys.length; i++) {
            var key = persistableKeys[i];
            if (updates.hasOwnProperty(key)) {
                var value = updates[key];
                if (value === null) {
                    storage.removeItem(key);
                } else {
                    storage.setItem(key, value);
                }
            }
        }
    }
}

// Loads initial state from sessionStorage on app startup
function loadStateFromStorage() {
    // Load all persisted state from sessionStorage
    var storedUserId = storage.getItem('userId');
    var storedUserName = storage.getItem('userName');
    
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
