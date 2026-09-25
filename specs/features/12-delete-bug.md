# User Story

As a BuggyBoard user,
I want to delete bugs,
So that I can remove bugs that are incorrect or no longer needed.

## Design

- The "Edit bug" modal should have a "delete" button.
- Clicking the delete button opens a confirmation modal; the bug is not deleted yet.
- The confirmation modal follows the shared modal look and feel defined in `specs/design/theme.md` (consistent layout, header style, button placement, spacing, X close control, Escape-to-cancel).
- The confirmation modal has a "confirm" button and a "cancel" button.
- Confirming the deletion removes the bug from the database and closes both the confirmation modal and the edit modal.
- Cancelling (via the cancel button, the X, or Escape) closes the confirmation modal only, without deleting the bug, and returns the user to the edit modal.

## Acceptance Criteria

```gherkin
Background:
  Given the user is authenticated into the app
  And the user is on the board page
  And there are bugs in the database
  And the user opens the edit modal for a bug

Scenario: Edit bug modal displays a delete button
  Then the modal displays a delete button

Scenario: Clicking delete opens a confirmation modal
  When the user clicks the delete button to open the confirmation modal
  Then a confirmation modal is displayed
  And the confirmation modal displays a confirm button and a cancel button
  And the bug is not removed from the database

Scenario: Confirming deletion removes the bug from the database and closes the modals
  Given the user clicks the delete button to open the confirmation modal
  When the user clicks the confirm button
  Then the bug is removed from the database
  And the confirmation modal closes
  And the edit modal closes
  And the board no longer displays that bug

Scenario: Cancelling the confirmation modal keeps the bug and returns to the edit modal
  Given the user clicks the delete button to open the confirmation modal
  When the user clicks the cancel button
  Then the bug is not removed from the database
  And the confirmation modal closes
  And the edit modal remains open
  And the board still displays that bug
```
