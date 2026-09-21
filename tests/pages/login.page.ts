import { expect, type Locator, type Page } from "@playwright/test";
import type { TestUser } from "../support/auth.js";

export class LoginPage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(private readonly page: Page) {
    this.usernameInput = page.getByLabel("Username");
    this.passwordInput = page.getByLabel("Password");
    this.loginButton = page.getByRole("button", { name: "Login" });
  }

  /** Logs in as the given user and waits for the board page to load. */
  async login(user: TestUser) {
    await this.page.goto("/login");
    await this.usernameInput.fill(user.username);
    await this.passwordInput.fill(user.password);
    await this.loginButton.click();
    await expect(this.page).toHaveURL(/\/board$/);
  }
}
