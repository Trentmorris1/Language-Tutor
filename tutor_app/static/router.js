// View routing and navigation

// Forward declaration - will be set by views module
var renderApp = null;

// Sets the renderApp function from views module
function setRenderApp(renderFunction) {
    renderApp = renderFunction;
}

// Changes the current view and re-renders the app
function setView(newView) {
    if (!renderApp) {
        console.error('renderApp not initialized. Call setRenderApp() first.');
        return;
    }
    
    updateState({
        view: newView,
        authError: null
    }, false);
    renderApp();
}

// Initializes the application when the page loads
function initializeApp() {
    loadStateFromStorage();
    if (renderApp) {
        renderApp();
    }
}
