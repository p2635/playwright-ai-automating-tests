import { expect, type Locator, type Page } from "@playwright/test";

export class EditBugDialogPage {
  readonly dialog: Locator;
  readonly deleteButton: Locator;
  readonly cancelButton: Locator;
  readonly saveButton: Locator;
  readonly closeButton: Locator;
  readonly idField: Locator;
  readonly titleField: Locator;
  readonly severityField: Locator;
  readonly stateField: Locator;
  readonly ownerField: Locator;
  readonly descriptionField: Locator;

  constructor(page: Page) {
    this.dialog = page.getByRole("dialog", { name: /Edit bug/ });
    this.deleteButton = this.dialog.getByRole("button", { name: "Delete" });
    this.cancelButton = this.dialog.getByRole("button", { name: "Cancel" });
    this.saveButton = this.dialog.getByRole("button", { name: "Save" });
    this.closeButton = this.dialog.getByRole("button", { name: "Close" });
    this.idField = this.dialog.getByLabel("ID");
    this.titleField = this.dialog.getByLabel("Title");
    this.severityField = this.dialog.getByLabel("Severity");
    this.stateField = this.dialog.getByLabel("State");
    this.ownerField = this.dialog.getByLabel("Owner");
    this.descriptionField = this.dialog.getByLabel("Description");
  }

  /** Clicks the dimmed backdrop outside the dialog panel bounds. */
  async clickBackdrop() {
    await this.dialog.click({ position: { x: 4, y: 4 } });
  }

  async expectVisible() {
    await expect(this.dialog).toBeVisible();
  }

  /** Clicks Delete, which opens the delete-confirmation dialog (does not delete by itself). */
  async clickDelete() {
    await this.deleteButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
    await expect(this.dialog).toBeHidden();
  }
}
