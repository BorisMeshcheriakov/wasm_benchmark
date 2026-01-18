import init, {
    alloc_f64, alloc_u8, free_f64, free_u8,
    dp_full_inplace_noalloc, get_wasm_memory
} from 'dp_simplify';

function makePolyline(view: Float64Array, n: number, seed = 42) {
    let s = seed >>> 0;
    const rand = () => (s = (1664525 * s + 1013904223) >>> 0, (s & 0xffff) / 0xffff);
    for (let i = 0; i < n; i++) {
        const t = i / n;
        view[2 * i] = t * 1000;
        view[2 * i + 1] = Math.sin(t * 20) * 50 + (rand() - 0.5) * 0.2;
    }
}

function median(arr: number[]): number {
    const sorted = [...arr].sort((a, b) => a - b);
    const m = sorted.length >> 1;
    return sorted.length % 2 ? sorted[m] : (sorted[m - 1] + sorted[m]) / 2;
}

export async function runBenchmark(iterations: number, epsilon: number) {
    await init();

    // Загрузить в память wasm
    const response = await fetch('./polyline_10000.json');
    const arr = await response.json();
    const polyline = new Float64Array(arr);
    const points = polyline.length / 2;

    // 1. Выделяем память под вход, выход и keep
    const ptrIn = alloc_f64(points * 2);
    const ptrOut = alloc_f64(points * 2);
    const ptrKeep = alloc_u8(points);

    // 2. Берём актуальное представление памяти после всех alloc
    let wasmMemF64 = new Float64Array((get_wasm_memory() as any).buffer);

    // 3. Заполняем входные данные
    const inputView = wasmMemF64.subarray(ptrIn / 8, ptrIn / 8 + points * 2);
    inputView.set(polyline)

    // 4. Прогрев
    for (let i = 0; i < 3; i++) {
        dp_full_inplace_noalloc(ptrIn, points * 2, epsilon, ptrKeep, ptrOut);
        wasmMemF64 = new Float64Array((get_wasm_memory() as any).buffer);
    }

    // 5. Замеры
    const times: number[] = [];
    for (let i = 0; i < iterations; i++) {
        const t0 = performance.now();
        const count = dp_full_inplace_noalloc(ptrIn, points * 2, epsilon, ptrKeep, ptrOut);
        const t1 = performance.now();
        times.push(t1 - t0);

        if (count === 0) throw new Error('Алгоритм вернул пустой результат');

        wasmMemF64 = new Float64Array((get_wasm_memory() as any).buffer);
    }

    // 6. Результаты
    console.log(`--- WASM No-Alloc Benchmark ---`);
    console.log(`Точек: ${points}`);
    console.log(`Итераций: ${iterations}`);
    console.log(`Epsilon: ${epsilon}`);
    console.log(`Медиана: ${median(times).toFixed(3)} ms`);
    console.log(`Среднее: ${(times.reduce((a, b) => a + b, 0) / times.length).toFixed(3)} ms`);
    console.log(`ns/point: ${((median(times) * 1e6) / points).toFixed(1)}`);

    // 7. Освобождаем память
    free_f64(ptrIn, points * 2);
    free_f64(ptrOut, points * 2);
    free_u8(ptrKeep, points);
}

// Пример запуска
runBenchmark(10, 0.5);