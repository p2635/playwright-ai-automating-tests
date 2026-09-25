import { expect, type Locator, type Page } from "@playwright/test";

export class ConfirmDeleteBugDialogPage {
  readonly dialog: Locator;
  readonly deleteButton: Locator;
  readonly cancelButton: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.dialog = page.getByRole("dialog", { name: /Delete bug/ });
    this.deleteButton = this.dialog.getByRole("button", { name: "Delete" });
    this.cancelButton = this.dialog.getByRole("button", { name: "Cancel" });
    this.closeButton = this.dialog.getByRole("button", { name: "Close" });
  }

  async expectVisible() {
    await expect(this.dialog).toBeVisible();
  }

  /** Confirms the deletion; closes both the confirmation dialog and the Edit bug dialog. */
  async confirm() {
    await this.deleteButton.click();
    await expect(this.dialog).toBeHidden();
  }

  async cancel() {
    await this.cancelButton.click();
    await expect(this.dialog).toBeHidden();
  }

  async closeViaX() {
    await this.closeButton.click();
    await expect(this.dialog).toBeHidden();
  }
}
