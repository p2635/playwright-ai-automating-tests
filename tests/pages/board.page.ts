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
  readonly idColumnHeader: Locator;
  readonly severityColumnHeader: Locator;
  readonly titleColumnHeader: Locator;
  readonly ownerColumnHeader: Locator;
  readonly idSortButton: Locator;
  readonly severitySortButton: Locator;
  readonly titleSortButton: Locator;
  readonly ownerSortButton: Locator;
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
    this.idColumnHeader = page.getByRole("columnheader", { name: "ID" });
    this.severityColumnHeader = page.getByRole("columnheader", { name: "Severity" });
    this.titleColumnHeader = page.getByRole("columnheader", { name: "Title" });
    this.ownerColumnHeader = page.getByRole("columnheader", { name: "Owner" });
    this.idSortButton = page.getByRole("button", { name: "ID" });
    this.severitySortButton = page.getByRole("button", { name: "Severity" });
    this.titleSortButton = page.getByRole("button", { name: "Title" });
    this.ownerSortButton = page.getByRole("button", { name: "Owner" });
    this.noBugsMatchedMessage = page.getByText("No bugs matched.");
    this.noBugsMessage = page.getByText("No bugs.", { exact: true });
  }

  rowByTitle(title: string) {
    return this.bugsTable.getByText(title, { exact: true });
  }

  cellByTitle(title: string) {
    return this.page.getByRole("cell", { name: title, exact: true });
  }

  /** The severity badge <span> in the row for the given bug title. */
  severityBadgeByTitle(title: string) {
    return this.rowByTitle(title)
      .locator("xpath=ancestor::tr")
      .locator(".severity-badge");
  }

  visibleIds() {
    return this.bugsTable.locator("tbody tr td:nth-child(1)").allInnerTexts();
  }

  visibleSeverities() {
    return this.bugsTable.locator("tbody tr td:nth-child(2)").allInnerTexts();
  }

  visibleTitles() {
    return this.bugsTable.locator("tbody tr td:nth-child(3)").allInnerTexts();
  }

  visibleOwners() {
    return this.bugsTable.locator("tbody tr td:nth-child(4)").allInnerTexts();
  }

  async openBugByTitle(title: string) {
    await this.rowByTitle(title).click();
  }
}
