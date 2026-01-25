import "../../shared/styles/main.css";

import { createInput, renderTable } from "../../shared/utils";

async function parseLargeCsv(file: File, onRow: (row: string[]) => void) {
  const decoder = new TextDecoder();
  const reader = file.stream().getReader();

  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    let lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? ""; // последняя строка может быть неполной

    for (const line of lines) {
      if (line.trim().length > 0) {
        onRow(line.split(","));
      }
    }
  }

  if (buffer.length > 0) {
    onRow(buffer.split(","));
  }
}

const input = createInput();
input.addEventListener("change", async () => {
  const file = input.files?.[0];
  if (!file) return;

  const result: string[][] = [];
  const t0 = performance.now();
  await parseLargeCsv(file, (row) => {
    result.push(row);
  });
  const t1 = performance.now();
  console.log("Парсинг завершен за", t1 - t0, "мс");
  renderTable(result);
});
