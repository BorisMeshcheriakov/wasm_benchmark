export const createTable = (
  tableId: string = "table",
  appId: string = "app"
): HTMLTableElement => {
  const table = document.createElement(tableId) as HTMLTableElement;
  const app = document.getElementById(appId) as HTMLElement;
  app.appendChild(table);

  return table;
};
