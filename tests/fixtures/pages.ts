import { test as base } from "@playwright/test";
import { LoginPage } from "../pages/login.page.js";
import { BoardPage } from "../pages/board.page.js";
import { EditBugDialogPage } from "../pages/edit-bug-dialog.page.js";
import { CreateBugDialogPage } from "../pages/create-bug-dialog.page.js";

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
