import { type Locator, type Page } from "@playwright/test";

export class BoardPage {
  readonly heading: Locator;
  readonly bugsTable: Locator;
  readonly searchbox: Locator;
  readonly clearSearchButton: Locator;
  readonly newBugButton: Locator;
  readonly openFilterButton: Locator;
  readonly closedFilterButton: Locator;
  readonly titleSortButton: Locator;
  readonly severitySortButton: Locator;
  readonly titleColumnHeader: Locator;
  readonly severityColumnHeader: Locator;
  readonly noBugsMatchedMessage: Locator;
  readonly noBugsMessage: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole("heading", { name: "BuggyBoard" });
    this.bugsTable = page.getByRole("table", { name: "Bugs" });
    this.searchbox = page.getByRole("search", { name: "Search bugs by title" });
    this.clearSearchButton = page.getByRole("button", { name: "Clear search" });
    this.newBugButton = page.getByRole("button", { name: "New Bug" });
    this.openFilterButton = page.getByRole("button", { name: "Open" });
    this.closedFilterButton = page.getByRole("button", { name: "Closed" });
    this.titleSortButton = page.getByRole("button", { name: "Title" });
    this.severitySortButton = page.getByRole("button", { name: "Severity" });
    this.titleColumnHeader = page.getByRole("columnheader", { name: "Title" });
    this.severityColumnHeader = page.getByRole("columnheader", { name: "Severity" });
    this.noBugsMatchedMessage = page.getByText("No bugs matched.");
    this.noBugsMessage = page.getByText("No bugs.", { exact: true });
  }

  rowByTitle(title: string) {
    return this.bugsTable.getByText(title, { exact: true });
  }

  cellByTitle(title: string) {
    return this.page.getByRole("cell", { name: title, exact: true });
  }

  visibleTitles() {
    return this.bugsTable.locator("tbody tr td:nth-child(3)").allInnerTexts();
  }

  visibleSeverities() {
    return this.bugsTable.locator("tbody tr td:nth-child(2)").allInnerTexts();
  }

  async openBugByTitle(title: string) {
    await this.rowByTitle(title).click();
  }
}
