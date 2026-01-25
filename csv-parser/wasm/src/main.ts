import init, { BufferHandle } from "csv-parser-wasm";

import "../../shared/styles/main.css";
import { createInput, renderTable } from "../../shared/utils";

const input = createInput();

input.addEventListener("change", async (e) => {
  const target = e.target as HTMLInputElement;
  if (!target.files) {
    return;
  }

  const file = target.files[0];
  if (!file) {
    return;
  }

  await sendFileToWasm(file);
});

const sendFileToWasm = async (file: File) => {
  const t0 = performance.now();
  await init();
  const bufferSize = 104857600;
  const parser = new BufferHandle(bufferSize);

  let offset = 0;
  // Последовательно грузим файл в память wasm
  for await (const chunk of file.stream() as unknown as AsyncIterable<Uint8Array>) {
    const view = parser.view();

    while (offset < chunk.length) {
      const slicedChunk = chunk.subarray(offset, offset + view.length);
      view.set(slicedChunk);
      parser.set_length(slicedChunk.length);
      parser.process();
      offset += slicedChunk.length;
    }

    offset = 0;
  }

  const table = parser.finish();
  parser.free();
  const t1 = performance.now();

  console.log("Парсинг завершен за", t1 - t0, "мс");
  renderTable(table);
};
