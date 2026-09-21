import { type Locator, type Page } from "@playwright/test";

export interface NewBugInput {
  title: string;
  severity: "high" | "mid" | "low";
  owner: string;
  description: string;
}

export class CreateBugDialogPage {
  readonly dialog: Locator;
  readonly titleInput: Locator;
  readonly severitySelect: Locator;
  readonly ownerInput: Locator;
  readonly descriptionInput: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.dialog = page.getByRole("dialog", { name: "Create bug" });
    this.titleInput = this.dialog.getByLabel("Title");
    this.severitySelect = this.dialog.getByLabel("Severity");
    this.ownerInput = this.dialog.getByLabel("Owner");
    this.descriptionInput = this.dialog.getByLabel("Description");
    this.saveButton = this.dialog.getByRole("button", { name: "Save" });
  }

  async fillAndSave(bug: NewBugInput) {
    await this.titleInput.fill(bug.title);
    await this.severitySelect.selectOption(bug.severity);
    await this.ownerInput.fill(bug.owner);
    await this.descriptionInput.fill(bug.description);
    await this.saveButton.click();
  }
}
