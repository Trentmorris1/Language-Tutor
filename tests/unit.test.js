/**
 * @jest-environment jsdom
 */

// Import the functions from your script
const { setButtonLoading, buildFeedbackHtml, showFeedbackAndActions } = require('../tutor_app/static/exercises.js');

// Mock global helpers used by the tests
global.escapeHtml = (str) => str; // Mock simple passthrough escapeHtml for feedback builder

describe('setButtonLoading', () => {
  test('TC1: button = null or undefined', () => {
    const restoreNull = setButtonLoading(null, 'Loading...');
    const restoreUndefined = setButtonLoading(undefined, 'Loading...');

    expect(typeof restoreNull).toBe('function');
    expect(typeof restoreUndefined).toBe('function');
    
    // Should not throw when called
    expect(() => restoreNull()).not.toThrow();
    expect(() => restoreUndefined()).not.toThrow();
  });

  test('TC2: button is a valid element', () => {
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
  test('TC1: error types = none, suggestions = none', () => {
    const feedback = {
      error_count: 0,
      accuracy: 100,
      feedback: []
    };

    const html = buildFeedbackHtml(feedback);

    expect(html).toContain('Accuracy: 100.0%');
    expect(html).toContain('<strong>Total Errors Found:</strong> 0');
    expect(html).not.toContain('Error Breakdown:');
    expect(html).toContain('✓ Great job! No errors found!');
  });

  test('TC2: error types = present, suggestions = list', () => {
    const feedback = {
      error_count: 2,
      accuracy: 85.5,
      error_types: { Grammar: 1, Typo: 1 },
      feedback: [
        {
          error_text: 'I are happy',
          message: 'Subject-verb agreement error',
          suggestions: ['I am happy', 'I was happy']
        },
        {
          error_text: 'teh',
          message: 'Typo detected',
          suggestions: ['the']
        }
      ]
    };

    const html = buildFeedbackHtml(feedback);

    expect(html).toContain('Accuracy: 85.5%');
    expect(html).toContain('<strong>Total Errors Found:</strong> 2');
    expect(html).toContain('Error Breakdown:');
    expect(html).toContain('Grammar: 1');
    expect(html).toContain('Typo: 1');
    expect(html).toContain('Detailed Feedback:');
    expect(html).toContain('I are happy');
    expect(html).toContain('I am happy, I was happy');
    expect(html).toContain('teh');
    expect(html).toContain('the');
  });
});

describe('showFeedbackAndActions', () => {
  test('TC1: elements.feedback = false', () => {
    document.body.innerHTML = `
      <button id="reading-next-btn" class="hidden"></button>
      <div id="reading-continue-prompt" class="hidden"></div>
    `;

    const elements = {
      feedback: null,
      nextButton: document.getElementById('reading-next-btn'),
      continuePrompt: document.getElementById('reading-continue-prompt')
    };

    const feedback = {
      error_count: 0,
      accuracy: 100,
      feedback: []
    };

    // Should not throw when feedback is null/false
    expect(() => {
      showFeedbackAndActions('reading', elements, feedback);
    }).not.toThrow();

    // Next button should still be shown for reading
    expect(elements.nextButton.classList.contains('hidden')).toBe(false);
  });

  test('TC2: elements.feedback = true, exerciseType = reading', () => {
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

  test('TC3: elements.feedback = true, exerciseType = writing', () => {
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


