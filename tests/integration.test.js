/**
 * @jest-environment jsdom
 */

// Import the functions from your script
const {
  setButtonLoading,
  buildFeedbackHtml,
  showFeedbackAndActions,
} = require('../tutor_app/static/exercises.js');

// Mock global helpers used by the tests
global.escapeHtml = (str) => str; // Mock simple passthrough escapeHtml for feedback builder

describe('Exercises integration: button loading + feedback UI flow', () => {
  test('INT1: reading flow uses setButtonLoading and showFeedbackAndActions together', () => {
    // Arrange DOM: check button + reading feedback UI
    document.body.innerHTML = `
      <button id="check-btn" class="">Check</button>
      <div id="reading-feedback" class="hidden"></div>
      <button id="reading-next-btn" class="hidden"></button>
      <div id="reading-continue-prompt" class="hidden"></div>
    `;

    const button = document.getElementById('check-btn');
    const elements = {
      feedback: document.getElementById('reading-feedback'),
      nextButton: document.getElementById('reading-next-btn'),
      continuePrompt: document.getElementById('reading-continue-prompt'),
    };

    const feedback = {
      error_count: 0,
      accuracy: 100,
      feedback: [],
    };

    // Act 1: enter loading state on the button
    const restore = setButtonLoading(button, 'Loading...');

    expect(button.disabled).toBe(true);
    expect(button.textContent).toBe('Loading...');

    // Act 2: show feedback and actions for a READING exercise
    showFeedbackAndActions('reading', elements, feedback);

    // Assert: feedback content & visibility (this exercises buildFeedbackHtml internally)
    expect(elements.feedback.classList.contains('hidden')).toBe(false);
    expect(elements.feedback.innerHTML).toContain('Accuracy: 100.0%');
    expect(elements.nextButton.classList.contains('hidden')).toBe(false);
    expect(elements.continuePrompt.classList.contains('hidden')).toBe(true);

    // Act 3: restore button after flow completes
    restore();

    // Assert: button is restored to original state
    expect(button.disabled).toBe(false);
    expect(button.textContent).toBe('Check');
  });

  test('INT2: writing flow uses setButtonLoading and showFeedbackAndActions together', () => {
    // Arrange DOM: check button + writing feedback UI
    document.body.innerHTML = `
      <button id="check-btn" class="">Check</button>
      <div id="writing-feedback" class="hidden"></div>
      <button id="writing-next-btn" class="hidden"></button>
      <div id="writing-continue-prompt" class="hidden"></div>
    `;

    const button = document.getElementById('check-btn');
    const elements = {
      feedback: document.getElementById('writing-feedback'),
      nextButton: document.getElementById('writing-next-btn'),
      continuePrompt: document.getElementById('writing-continue-prompt'),
    };

    const feedback = {
      error_count: 1,
      accuracy: 75,
      feedback: [],
    };

    // Act 1: enter loading state
    const restore = setButtonLoading(button, 'Loading...');

    expect(button.disabled).toBe(true);
    expect(button.textContent).toBe('Loading...');

    // Act 2: show feedback and actions for a WRITING exercise
    showFeedbackAndActions('writing', elements, feedback);

    // Assert: feedback visible and writing-specific UI
    expect(elements.feedback.classList.contains('hidden')).toBe(false);
    expect(elements.continuePrompt.classList.contains('hidden')).toBe(false);
    expect(elements.nextButton.classList.contains('hidden')).toBe(true);

    // Act 3: restore button
    restore();

    expect(button.disabled).toBe(false);
    expect(button.textContent).toBe('Check');
  });

  test('INT3: missing feedback element is handled gracefully for reading flow', () => {
    // Arrange DOM with NO feedback container
    document.body.innerHTML = `
      <button id="check-btn" class="">Check</button>
      <button id="reading-next-btn" class="hidden"></button>
      <div id="reading-continue-prompt" class="hidden"></div>
    `;

    const button = document.getElementById('check-btn');
    const elements = {
      feedback: null, // intentionally missing
      nextButton: document.getElementById('reading-next-btn'),
      continuePrompt: document.getElementById('reading-continue-prompt'),
    };

    const feedback = {
      error_count: 0,
      accuracy: 100,
      feedback: [],
    };

    const restore = setButtonLoading(button, 'Loading...');

    // Act & Assert: showFeedbackAndActions should NOT throw even without feedback element
    expect(() => {
      showFeedbackAndActions('reading', elements, feedback);
    }).not.toThrow();

    // Next button should still become visible for reading flow
    expect(elements.nextButton.classList.contains('hidden')).toBe(false);

    // And restore button at the end
    restore();
    expect(button.disabled).toBe(false);
    expect(button.textContent).toBe('Check');
  });
});

