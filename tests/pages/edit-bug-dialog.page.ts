import { expect, type Locator, type Page } from "@playwright/test";

export class EditBugDialogPage {
  readonly dialog: Locator;
  readonly deleteButton: Locator;
  readonly cancelButton: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.dialog = page.getByRole("dialog", { name: /Edit bug/ });
    this.deleteButton = this.dialog.getByRole("button", { name: "Delete" });
    this.cancelButton = this.dialog.getByRole("button", { name: "Cancel" });
    this.saveButton = this.dialog.getByRole("button", { name: "Save" });
  }

  async expectVisible() {
    await expect(this.dialog).toBeVisible();
  }

  async delete() {
    await this.deleteButton.click();
    await expect(this.dialog).toBeHidden();
  }

  async cancel() {
    await this.cancelButton.click();
    await expect(this.dialog).toBeHidden();
  }
}
