# Component Guide

This document provides details on reusable components within the Roomies application.

## StepProgressIndicator

**Location:** `components/features/onboarding/place-listing/StepProgressIndicator.tsx`

**Purpose:** Displays a progress bar and accompanying text, typically used within multi-part forms or screens during onboarding or other sequential processes.

**Features:**

*   Animated progress bar.
*   Customizable text display.
*   Flexible progress calculation methods.

**Props:**

*   `currentStep` (number, required): The current step number or progress value.
*   `totalSteps` (number, required): The total number of steps or the maximum progress value.
*   `stepTitles` (string[], optional): An array of strings representing the title for each step. Used for text display when `progressTextFormat` is not provided and `progressCalculation` is `'steps'` (default).
*   `progressTextFormat` (string | (current, total) => string, optional): Defines how the progress text is displayed.
    *   If a string, it can include placeholders `{current}` and `{total}` which will be replaced (e.g., `"Part {current} of {total}"`).
    *   If a function, it receives `currentStep` and `totalSteps` as arguments and should return the string to display.
    *   If omitted, the component tries to use `stepTitles` or falls back to `"${currentStep} of ${totalSteps}"`.
*   `progressCalculation` ('steps' | 'fraction', optional, default: `'steps'`): Determines how the progress bar percentage is calculated.
    *   `'steps'`: Calculates progress based on steps completed relative to total steps, suitable for multi-page forms (e.g., `(currentStep - 1) / (totalSteps - 1)`). Assumes steps start at 1.
    *   `'fraction'`: Calculates progress as a direct fraction (e.g., `currentStep / totalSteps`). Suitable for tracking completion like answered questions.

**Usage Examples:**

1.  **Multi-Step Form (like Place Details):**

    ```jsx
    const STEP_TITLES = [
      '1 of 3 - Basic Information',
      '2 of 3 - Lease Information & Amenities',
      '3 of 3 - Photos & Description'
    ];

    <StepProgressIndicator
      currentStep={currentFormStep} // e.g., 1, 2, or 3
      totalSteps={3}
      stepTitles={STEP_TITLES}
      // progressCalculation defaults to 'steps'
      // progressTextFormat uses stepTitles by default
    />
    ```

2.  **Quiz Progress (like Lifestyle Questions):**

    ```jsx
    <StepProgressIndicator
      currentStep={answeredCount}
      totalSteps={totalQuestions}
      progressCalculation="fraction"
      progressTextFormat={`${answeredCount} of ${totalQuestions} answered`}
    />
    ```

3.  **Section Progress (like Personality Dimensions):**

    ```jsx
    <StepProgressIndicator
      currentStep={currentDimensionIndex + 1}
      totalSteps={personalityDimensions.length}
      progressCalculation="fraction"
      progressTextFormat={`Part ${currentDimensionIndex + 1} of ${personalityDimensions.length}`}
    />
    ``` 