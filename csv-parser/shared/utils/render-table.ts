import { createTable } from "./create-table";

export const renderTable = (result: string[][]) => {
  const table = createTable();
  const frag = document.createDocumentFragment();
  result.forEach((row, rowIndex) => {
    const tr = document.createElement("tr");
    row.forEach((cell, _i) => {
      const td = document.createElement(rowIndex === 0 ? "th" : "td");
      td.textContent = cell;
      tr.appendChild(td);
    });
    frag.appendChild(tr);
  });
  table.appendChild(frag);
};
