/**
 * Integration tests for exercises UI flow:
 * setButtonLoading + buildFeedbackHtml + showFeedbackAndActions
 */

import {
  setButtonLoading,
  buildFeedbackHtml,
  showFeedbackAndActions,
} from '../tutor_app/static/exercises';

// If escapeHtml is a global in your app, re-create the same passthrough mock:
global.escapeHtml = (str) => str;

describe('Exercises integration: feedback flow', () => {
  let button;
  let feedbackDiv;
  let nextButton;
  let continuePrompt;

  beforeEach(() => {
    document.body.innerHTML = `
      <button id="check-btn">Check</button>
      <div id="feedback" class="hidden"></div>
      <button id="next-btn" class="hidden">Next</button>
      <div id="continue-prompt" class="hidden">Continue writing…</div>
    `;

    button = document.getElementById('check-btn');
    feedbackDiv = document.getElementById('feedback');
    nextButton = document.getElementById('next-btn');
    continuePrompt = document.getElementById('continue-prompt');
  });

  function buildElementsObject() {
    return {
      feedback: feedbackDiv,
      nextButton,
      continuePrompt,
    };
  }

  test('INT1: reading exercise happy path (all three functions together)', () => {
    // Arrange – starting state
    expect(button.disabled).toBe(false);
    expect(button.textContent).toBe('Check');

    // Act step 1: enter loading state
    const restoreButton = setButtonLoading(button);

    // Simulated backend feedback object (what your real API would return)
    const feedback = {
      accuracy: 95.0,
      error_count: 2,
      error_types: {
        Grammar: 1,
        Typo: 1,
      },
      errors: [
        { text: 'Ths', message: 'Possible typo: "This"' },
        { text: 'is are', message: 'Subject-verb agreement issue' },
      ],
      has: {
        error_types: true,
        suggestions: true,
      },
      suggestions: ['Check spelling', 'Review subject-verb agreement'],
    };

    // Act step 2: build feedback HTML
    const html = buildFeedbackHtml(feedback);

    // Act step 3: show feedback and actions for a reading exercise
    const elements = buildElementsObject();
    showFeedbackAndActions(html, 'reading', elements);

    // Act step 4: restore button state (as your click handler would do after success)
    restoreButton();

    // Assert: button restored
    expect(button.disabled).toBe(false);
    expect(button.textContent).toBe('Check'); // original label

    // Assert: feedback content and visibility
    expect(feedbackDiv.classList.contains('hidden')).toBe(false);
    expect(feedbackDiv.innerHTML).toContain('95.0');
    expect(feedbackDiv.innerHTML).toContain('Error Breakdown');
    expect(feedbackDiv.innerHTML).toContain('Grammar');
    expect(feedbackDiv.innerHTML).toContain('Typo');

    // Assert: reading workflow actions
    expect(nextButton.classList.contains('hidden')).toBe(false);
    expect(continuePrompt.classList.contains('hidden')).toBe(true);
  });

  test('INT2: writing exercise happy path', () => {
    const restoreButton = setButtonLoading(button);

    const feedback = {
      accuracy: 80.0,
      error_count: 5,
      error_types: {
        Grammar: 3,
        Typo: 2,
      },
      errors: [
        { text: 'He go to school', message: 'Verb form incorrect' },
      ],
      has: {
        error_types: true,
        suggestions: true,
      },
      suggestions: ['Rewrite sentence with correct verb tense'],
    };

    const html = buildFeedbackHtml(feedback);
    const elements = buildElementsObject();
    showFeedbackAndActions(html, 'writing', elements);
    restoreButton();

    // Feedback visible with detailed section for writing
    expect(feedbackDiv.classList.contains('hidden')).toBe(false);
    expect(feedbackDiv.innerHTML).toContain('80.0');
    expect(feedbackDiv.innerHTML).toContain('Detailed Feedback');

    // Writing workflow actions: continue prompt visible, next hidden
    expect(continuePrompt.classList.contains('hidden')).toBe(false);
    expect(nextButton.classList.contains('hidden')).toBe(true);
  });

  test('INT3: missing feedback element handled gracefully', () => {
    // Simulate missing feedback element – typical integration fault
    feedbackDiv.remove();

    const restoreButton = setButtonLoading(button);

    const feedback = {
      accuracy: 100.0,
      error_count: 0,
      error_types: {},
      errors: [],
      has: {
        error_types: false,
        suggestions: false,
      },
      suggestions: [],
    };

    const html = buildFeedbackHtml(feedback);
    const elements = {
      feedback: null,           // intentionally missing
      nextButton,
      continuePrompt,
    };

    // Should NOT throw even though elements.feedback is null
    expect(() => {
      showFeedbackAndActions(html, 'reading', elements);
    }).not.toThrow();

    // Next button still becomes visible for reading exercises
    expect(nextButton.classList.contains('hidden')).toBe(false);

    restoreButton();
  });
});
