// View rendering functions

// Main rendering function that displays the current view
function renderApp() {
    // Security: Enforce authentication rules
    if (!appState.isLoggedIn) {
        if (appState.view === 'register') {
            appState.view = 'register';
        } else {
            appState.view = 'login';
        }
    } else {
        if (appState.view === 'login' || appState.view === 'register') {
            appState.view = 'dashboard';
        }
    }
    
    // Update the auth status header
    renderAuthStatus();
    
    // Render the main content area based on current view
    if (appState.view === 'login') {
        appContainer.innerHTML = renderLogin(false);
    } else if (appState.view === 'register') {
        appContainer.innerHTML = renderLogin(true);
    } else if (appState.view === 'dashboard') {
        appContainer.innerHTML = renderDashboard();
        loadProgressData();
    } else if (appState.view === 'progress') {
        appContainer.innerHTML = renderProgressPage();
    } else if (appState.view === 'exercise_type_select') {
        appContainer.innerHTML = renderExerciseTypeSelect();
    } else if (appState.view === 'reading_exercise') {
        appContainer.innerHTML = renderReadingExercise();
    } else if (appState.view === 'writing_exercise') {
        appContainer.innerHTML = renderWritingExercise();
    } else {
        appContainer.innerHTML = renderLogin(false);
    }
}

// Updates the authentication status header
function renderAuthStatus() {
    if (appState.isLoggedIn) {
        var userName = escapeHtml(appState.userName);
        var userId = escapeHtml(String(appState.userId));
        authStatusElement.innerHTML = '<p class="font-bold">Welcome, ' + userName + '</p>' +
            '<button onclick="window.app.handleLogout()" class="text-accent text-xs hover:underline">Log Out</button>' +
            '<p class="text-xs text-gray-400">User ID: ' + userId + '</p>';
    } else {
        authStatusElement.innerHTML = '';
    }
}

// Renders the login or registration form
function renderLogin(isRegister) {
    if (isRegister === undefined) {
        isRegister = false;
    }
    
    var errorHtml = '';
    if (appState.authError) {
        errorHtml = '<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-lg">' + escapeHtml(appState.authError) + '</div>';
    }
    
    var title;
    var description;
    var buttonText;
    var switchText;
    var switchView;
    var formAction;
    var usernameField = '';
    
    if (isRegister) {
        title = 'Create Your Account';
        description = 'Sign up to begin your personalized language journey.';
        buttonText = 'Register & Start Learning';
        switchText = 'Already have an account? Log In';
        switchView = 'login';
        formAction = 'handleRegister';
        usernameField = '<input type="text" id="login-username" name="login-username" placeholder="Full Name (for your profile)" required ' +
            'class="w-full p-3 border border-gray-300 rounded-lg focus:ring-secondary focus:border-secondary">';
    } else {
        title = 'Welcome Back';
        description = 'Sign in to track your progress and resume practice.';
        buttonText = 'Log In & Continue';
        switchText = 'Need an account? Register Here';
        switchView = 'register';
        formAction = 'handleLogin';
    }
    
    return '<div class="text-center px-6 py-10 sm:px-12 sm:py-16 space-y-8">' +
        '<h2 class="text-4xl sm:text-5xl font-extrabold text-primary">' + title + '</h2>' +
        '<p class="text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto">' + description + '</p>' +
        errorHtml +
        '<form onsubmit="event.preventDefault(); window.app.' + formAction + '(this);" class="max-w-md mx-auto space-y-6 text-left">' +
        usernameField +
        '<input type="email" id="login-email" name="login-email" placeholder="Email Address" required ' +
        'class="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-secondary focus:border-secondary text-lg">' +
        '<input type="password" id="login-password" name="login-password" placeholder="Password" required ' +
        'class="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-secondary focus:border-secondary text-lg">' +
        '<button type="submit" class="w-full btn-primary bg-secondary text-white py-4 rounded-xl text-xl font-semibold shadow-lg">' +
        buttonText +
        '</button>' +
        '</form>' +
        '<div class="pt-4">' +
        '<button onclick="window.app.setView(\'' + switchView + '\')" class="text-base sm:text-lg text-primary hover:underline">' +
        switchText +
        '</button>' +
        '</div>' +
        '</div>';
}

// Renders the main dashboard view
function renderDashboard() {
    var userName = escapeHtml(appState.userName);
    var accuracyAvailable = typeof appState.overallAccuracy === 'number';
    var overallAccuracy = accuracyAvailable ? appState.overallAccuracy.toFixed(1) : '--';

    return '<div class="space-y-12">' +
        '<h2 class="text-4xl sm:text-5xl font-extrabold text-primary text-center sm:text-left">Hola, ' + userName + '!</h2>' +
        '<div class="bg-background p-10 sm:p-14 rounded-2xl border-t-8 border-secondary shadow-inner text-center">' +
        '<p class="text-6xl sm:text-7xl font-black text-secondary">' + overallAccuracy + '%</p>' +
        '<p class="text-lg text-gray-600 mt-4 tracking-wide uppercase">Overall Accuracy</p>' +
        '</div>' +
        '<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">' +
        '<button onclick="window.app.setView(\'exercise_type_select\')" ' +
        'class="btn-primary bg-primary text-white p-8 sm:p-10 rounded-2xl font-semibold text-2xl shadow-2xl flex items-center justify-center gap-4">' +
        '<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">' +
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l2 5m-2-5l-5 2" />' +
        '</svg>' +
        'Start Exercises' +
        '</button>' +
        '<button onclick="window.app.setView(\'progress\')" ' +
        'class="btn-primary bg-secondary text-white p-8 sm:p-10 rounded-2xl font-semibold text-2xl shadow-2xl flex items-center justify-center gap-4">' +
        '<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">' +
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />' +
        '</svg>' +
        'View Progress' +
        '</button>' +
        '</div>' +
        '</div>';
}

// Loads progress data from the API
function loadProgressData() {
    apiCall('/api/progress', 'GET').then(function(result) {
        if (result.success && result.data && result.data.progress) {
            var progress = result.data.progress;
            updateState({
                overallAccuracy: progress.overall_accuracy || 0
            }, false);

            // Refresh dashboard accuracy display without triggering a full rerender loop
            if (appState.view === 'dashboard') {
                appContainer.innerHTML = renderDashboard();
            }
        }
    }).catch(function(error) {
        console.error('Failed to load progress:', error);
    });
}

// Renders the progress page (placeholder for future implementation)
function renderProgressPage() {
    return '<div class="space-y-6 text-center">' +
        '<h2 class="text-3xl font-bold text-primary">Progress</h2>' +
        '<p class="text-gray-600">Detailed progress insights are coming soon.</p>' +
        '<p class="text-sm text-gray-500">Current overall accuracy: ' +
        (typeof appState.overallAccuracy === 'number' ? appState.overallAccuracy.toFixed(1) + '%' : '--') +
        '</p>' +
        '<button onclick="window.app.setView(\'dashboard\')" class="text-primary hover:underline mt-4">' +
        '&larr; Back to Dashboard' +
        '</button>' +
        '</div>';
}

// Renders the exercise type selection view
function renderExerciseTypeSelect() {
    var errorHtml = '';
    if (appState.exerciseError) {
        errorHtml = '<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-lg">' + escapeHtml(appState.exerciseError) + '</div>';
    }
    
    return '<div class="space-y-10 text-center px-4 sm:px-10 py-8 sm:py-12">' +
        '<h2 class="text-4xl sm:text-5xl font-extrabold text-primary">Choose Exercise Type</h2>' +
        '<p class="text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto">Select the type of exercise you\'d like to practice.</p>' +
        errorHtml +
        '<div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mt-8">' +
        '<button onclick="window.app.loadExercise(\'reading\')" ' +
        'class="btn-primary bg-primary text-white py-12 px-10 rounded-2xl font-semibold text-2xl shadow-2xl flex flex-col items-center justify-center hover:bg-blue-600 transition gap-4">' +
        '<svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">' +
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />' +
        '</svg>' +
        '<span class="text-3xl font-bold">Reading</span>' +
        '<span class="text-base sm:text-lg opacity-90">Practice grammar by correcting sentences</span>' +
        '</button>' +
        '<button onclick="window.app.loadExercise(\'writing\')" ' +
        'class="btn-primary bg-secondary text-white py-12 px-10 rounded-2xl font-semibold text-2xl shadow-2xl flex flex-col items-center justify-center hover:bg-blue-400 transition gap-4">' +
        '<svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">' +
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />' +
        '</svg>' +
        '<span class="text-3xl font-bold">Writing</span>' +
        '<span class="text-base sm:text-lg opacity-90">Get feedback on your writing</span>' +
        '</button>' +
        '</div>' +
        '<button onclick="window.app.setView(\'dashboard\')" class="text-primary hover:underline mt-10 text-lg sm:text-xl">' +
        '&larr; Back to Dashboard' +
        '</button>' +
        '</div>';
}

// Renders the reading exercise view
function renderReadingExercise() {
    if (!appState.currentExercise) {
        return '<div class="text-center p-12 space-y-6">' +
            '<p class="text-red-600 text-xl">Error: Exercise data not loaded.</p>' +
            '<button onclick="window.app.setView(\'exercise_type_select\')" class="text-primary hover:underline text-lg">' +
            '&larr; Back to Exercise Selection' +
            '</button>' +
            '</div>';
    }
    
    var exercise = appState.currentExercise;
    var exerciseNum = appState.readingExerciseCount + 1;
    // Use prompt field
    var promptText = exercise.prompt || '';
    var promptHtml = escapeHtml(promptText);
    
    var optionsHtml = '';
    if (exercise.options && exercise.options.length > 0) {
        optionsHtml = '<div class="bg-blue-50 p-4 rounded-lg">' +
            '<p class="font-semibold mb-2">Options:</p>' +
            '<ul class="list-disc list-inside space-y-1">';
        for (var i = 0; i < exercise.options.length; i++) {
            optionsHtml += '<li>' + escapeHtml(exercise.options[i]) + '</li>';
        }
        optionsHtml += '</ul>' +
            '</div>';
    }
    
    return '<div class="space-y-10">' +
        '<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">' +
        '<h2 class="text-4xl sm:text-5xl font-extrabold text-primary">Reading Exercise</h2>' +
        '</div>' +
        '<div class="bg-background p-10 sm:p-12 rounded-2xl border border-gray-300 shadow-inner">' +
        '<p class="font-semibold text-xl mb-4 uppercase tracking-wide text-gray-500">Correct the following sentence:</p>' +
        '<p class="text-gray-700 text-2xl font-bold italic">' + promptHtml + '</p>' +
        '</div>' +
        optionsHtml +
        '<div>' +
        '<label for="reading-answer-input" class="block text-xl font-semibold text-gray-700 mb-3">' +
        'Type the corrected sentence:' +
        '</label>' +
        '<input type="text" id="reading-answer-input" ' +
        'placeholder="Enter your answer here..." ' +
        'class="w-full p-5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-xl" ' +
        'onkeypress="if(event.key===\'Enter\') window.app.submitReadingAnswer()">' +
        '</div>' +
        '<button id="reading-submit-btn" onclick="window.app.submitReadingAnswer()" ' +
        'class="w-full btn-primary bg-primary text-white py-5 rounded-2xl font-semibold text-2xl shadow-2xl">' +
        'Submit Answer' +
        '</button>' +
        '<div id="reading-feedback" class="hidden"></div>' +
        '<button id="reading-next-btn" onclick="window.app.loadNextReadingExercise()" ' +
        'class="hidden w-full btn-primary bg-secondary text-white py-5 rounded-2xl font-semibold text-2xl shadow-2xl">' +
        'Next Exercise' +
        '</button>' +
        '<div id="reading-continue-prompt" class="hidden bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded-lg">' +
        '<p class="mb-4 text-lg">Would you like to continue with more reading exercises?</p>' +
        '<div class="flex flex-col sm:flex-row gap-4">' +
        '<button onclick="window.app.loadNextReadingExercise()" ' +
        'class="flex-1 bg-primary text-white py-4 rounded-xl font-semibold hover:bg-blue-600">' +
        'Continue' +
        '</button>' +
        '<button onclick="window.app.setView(\'exercise_type_select\')" ' +
        'class="flex-1 bg-gray-200 text-gray-800 py-4 rounded-xl font-semibold hover:bg-gray-300">' +
        'Choose Different Exercise' +
        '</button>' +
        '</div>' +
        '</div>' +
        '<button onclick="window.app.setView(\'exercise_type_select\')" class="text-primary hover:underline mt-6 text-lg">' +
        '&larr; Back to Exercise Selection' +
        '</button>' +
        '</div>';
}

// Renders the writing exercise view
function renderWritingExercise() {
    if (!appState.currentExercise) {
        return '<div class="text-center p-12 space-y-6">' +
            '<p class="text-red-600 text-xl">Error: Exercise data not loaded.</p>' +
            '<button onclick="window.app.setView(\'exercise_type_select\')" class="text-primary hover:underline text-lg">' +
            '&larr; Back to Exercise Selection' +
            '</button>' +
            '</div>';
    }
    
    var exercise = appState.currentExercise;
    var promptHtml = escapeHtml(exercise.prompt);
    
    return '<div class="space-y-10">' +
        '<h2 class="text-4xl sm:text-5xl font-extrabold text-primary">Writing Exercise</h2>' +
        '<div class="bg-background p-10 sm:p-12 rounded-2xl border border-gray-300 shadow-inner">' +
        '<p class="font-semibold text-xl mb-4 uppercase tracking-wide text-gray-500">Prompt</p>' +
        '<p class="text-gray-700 text-2xl leading-relaxed">' + promptHtml + '</p>' +
        '</div>' +
        '<div>' +
        '<label for="writing-answer-input" class="block text-xl font-semibold text-gray-700 mb-3">' +
        'Your Response:' +
        '</label>' +
        '<textarea id="writing-answer-input" rows="10" ' +
        'placeholder="Type your response here..." ' +
        'class="w-full p-5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-xl leading-relaxed"></textarea>' +
        '</div>' +
        '<button id="writing-submit-btn" onclick="window.app.submitWritingAnswer()" ' +
        'class="w-full btn-primary bg-primary text-white py-5 rounded-2xl font-semibold text-2xl shadow-2xl">' +
        'Submit & Get Feedback' +
        '</button>' +
        '<div id="writing-feedback" class="hidden"></div>' +
        '<div id="writing-continue-prompt" class="hidden bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded-lg">' +
        '<p class="font-bold mb-2 text-lg">Exercise Complete!</p>' +
        '<p class="mb-4 text-base sm:text-lg">Would you like to try another writing exercise?</p>' +
        '<div class="flex flex-col sm:flex-row gap-4">' +
        '<button onclick="window.app.loadNextWritingExercise()" ' +
        'class="flex-1 bg-primary text-white py-4 rounded-xl font-semibold hover:bg-blue-600">' +
        'Continue' +
        '</button>' +
        '<button onclick="window.app.setView(\'exercise_type_select\')" ' +
        'class="flex-1 bg-gray-200 text-gray-800 py-4 rounded-xl font-semibold hover:bg-gray-300">' +
        'Choose Different Exercise' +
        '</button>' +
        '</div>' +
        '</div>' +
        '<button onclick="window.app.setView(\'exercise_type_select\')" class="text-primary hover:underline mt-6 text-lg">' +
        '&larr; Back to Exercise Selection' +
        '</button>' +
        '</div>';
}
