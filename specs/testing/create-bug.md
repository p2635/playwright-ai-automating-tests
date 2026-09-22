# BuggyBoard Create Bug End-to-End Test Plan

## Feature Overview

BuggyBoard's Create bug dialog lets an authenticated user add a new bug from the board's title bar.

## Test Scenarios

### 1. Create bug workflow

#### 1.1. Opens the create-bug modal with required controls

**Steps:**

  1. On the board, click the "New Bug" button in the title bar.
    - expect: A dialog named "Create bug" is visible.
    - expect: The dialog contains labeled Title, Severity, Owner, and Description controls.
    - expect: The dialog contains Cancel and Save buttons.
    - expect: The Severity control offers HIGH, MID, and LOW options.

#### 1.2. Defaults owner to the authenticated user

**Steps:**

  1. Open the Create bug dialog while authenticated as buggy.
    - expect: The Owner field value is "buggy".
    - expect: The Title field is focused and empty.
    - expect: The Severity field defaults to MID.

#### 1.3. Saves a valid bug and closes the modal

**Steps:**

  1. Open the Create bug dialog.
    - expect: The Create bug dialog is visible.
  2. Fill Title with a unique title, select HIGH in Severity, keep Owner as buggy, and fill Description with valid text including special characters such as < and >.
    - expect: The entered values remain in their respective controls.
  3. Click Save.
    - expect: The dialog is closed.
    - expect: A board row shows the unique title, HIGH severity, and buggy owner.

#### 1.4. Cancels without saving

**Steps:**

  1. Open the Create bug dialog and enter a unique title.
    - expect: The entered title is visible in the dialog.
  2. Click Cancel.
    - expect: The dialog is closed.
    - expect: No board row shows the unique title.

#### 1.5. Closes with the X button without saving

**Steps:**

  1. Open the Create bug dialog and enter a unique title.
    - expect: The entered title is visible in the dialog.
  2. Click the Close button in the upper-right corner.
    - expect: The dialog is closed.
    - expect: No board row shows the unique title.

#### 1.6. Closes with Escape without saving

**Steps:**

  1. Open the Create bug dialog and enter a unique title.
    - expect: The entered title is visible in the dialog.
  2. Press Escape.
    - expect: The dialog is closed.
    - expect: No board row shows the unique title.

#### 1.7. Keeps entered data when the backdrop is clicked

**Steps:**

  1. Open the Create bug dialog and enter a unique title and description.
    - expect: The entered values are visible in the dialog.
  2. Click the dimmed backdrop outside the dialog panel.
    - expect: The dialog remains open.
    - expect: The title and description values are preserved.

#### 1.8. Blocks save when required fields are blank

**Steps:**

  1. Open the Create bug dialog without filling any fields.
    - expect: The dialog is visible.
  2. Click Save.
    - expect: The dialog remains open.
    - expect: An alert lists required-field validation messages.
    - expect: No new bug is added to the board.

## Technical Information

### Test File Location

All test scenarios in section 1 are implemented in `tests/create-bug/create-bug.spec.ts`.

### Seed / Setup

All test scenarios use `tests/seed.spec.ts` as the authentication and navigation seed. It authenticates as the `buggy` user and verifies navigation to `/board`.
