import { test as base } from "@playwright/test";
import { LoginPage } from "./login.page.js";
import { BoardPage } from "./board.page.js";
import { EditBugDialogPage } from "./edit-bug-dialog.page.js";
import { CreateBugDialogPage } from "./create-bug-dialog.page.js";

type Pages = {
  loginPage: LoginPage;
  boardPage: BoardPage;
  editBugDialog: EditBugDialogPage;
  createBugDialog: CreateBugDialogPage;
};

export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  boardPage: async ({ page }, use) => {
    await use(new BoardPage(page));
  },
  editBugDialog: async ({ page }, use) => {
    await use(new EditBugDialogPage(page));
  },
  createBugDialog: async ({ page }, use) => {
    await use(new CreateBugDialogPage(page));
  },
});

export { expect } from "@playwright/test";
