// Main application entry point

// Wire up circular dependencies by passing renderApp to modules that need it
setRenderApp(renderApp);
setAuthRenderApp(renderApp);
setExercisesRenderApp(renderApp);

// Expose functions to window.app for use in inline event handlers
window.app = {
    setView: setView,
    handleLogin: handleLogin,
    handleRegister: handleRegister,
    handleLogout: handleLogout,
    loadExercise: loadExercise,
    submitAnswer: submitAnswer,
    submitReadingAnswer: submitReadingAnswer,
    loadNextReadingExercise: loadNextReadingExercise,
    submitWritingAnswer: submitWritingAnswer,
    loadNextWritingExercise: loadNextWritingExercise
};

// Initialize the application when the script loads
initializeApp();
