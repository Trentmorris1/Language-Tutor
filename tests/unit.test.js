// Jest environment jsdom

// Import the functions from your script
const { setButtonLoading, buildFeedbackHtml, showFeedbackAndActions } = require('../tutor_app/static/exercises.js');

// Mock global helpers used by the tests
global.escapeHtml = (str) => str; // Mock simple passthrough escapeHtml for feedback builder

describe('setButtonLoading', () => {
  test('disables the button and changes its text', () => {
    document.body.innerHTML = `<button id="btn">Submit</button>`;
    const button = document.getElementById('btn');

    const restore = setButtonLoading(button, 'Loading...');

    expect(button.disabled).toBe(true);
    expect(button.textContent).toBe('Loading...');

    restore();
    expect(button.disabled).toBe(false);
    expect(button.textContent).toBe('Submit');
  });
});

describe('buildFeedbackHtml', () => {
  test('returns HTML with accuracy and error count', () => {
    const feedback = {
      error_count: 2,
      accuracy: 85.5,
      error_types: { Grammar: 1, Typo: 1 },
      feedback: []
    };

    const html = buildFeedbackHtml(feedback);

    expect(html).toContain('Accuracy: 85.5%');
    expect(html).toContain('<strong>Total Errors Found:</strong> 2');
    expect(html).toContain('Grammar: 1');
    expect(html).toContain('Typo: 1');
  });
});

describe('showFeedbackAndActions', () => {
  test('reveals feedback and next button for reading exercises', () => {
    document.body.innerHTML = `
      <div id="reading-feedback" class="hidden"></div>
      <button id="reading-next-btn" class="hidden"></button>
      <div id="reading-continue-prompt" class="hidden"></div>
    `;

    const elements = {
      feedback: document.getElementById('reading-feedback'),
      nextButton: document.getElementById('reading-next-btn'),
      continuePrompt: document.getElementById('reading-continue-prompt')
    };

    const feedback = {
      error_count: 0,
      accuracy: 100,
      feedback: []
    };

    showFeedbackAndActions('reading', elements, feedback);

    expect(elements.feedback.classList.contains('hidden')).toBe(false);
    expect(elements.feedback.innerHTML).toContain('Accuracy: 100.0%');
    expect(elements.nextButton.classList.contains('hidden')).toBe(false);
    expect(elements.continuePrompt.classList.contains('hidden')).toBe(true);
  });

  test('reveals continue prompt for writing exercises', () => {
    document.body.innerHTML = `
      <div id="writing-feedback" class="hidden"></div>
      <button id="writing-next-btn" class="hidden"></button>
      <div id="writing-continue-prompt" class="hidden"></div>
    `;

    const elements = {
      feedback: document.getElementById('writing-feedback'),
      nextButton: document.getElementById('writing-next-btn'),
      continuePrompt: document.getElementById('writing-continue-prompt')
    };

    const feedback = {
      error_count: 1,
      accuracy: 75,
      feedback: []
    };

    showFeedbackAndActions('writing', elements, feedback);

    expect(elements.feedback.classList.contains('hidden')).toBe(false);
    expect(elements.continuePrompt.classList.contains('hidden')).toBe(false);
    expect(elements.nextButton.classList.contains('hidden')).toBe(true);
  });
});


