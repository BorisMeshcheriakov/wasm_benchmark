/**
 * Упрощает ломаную линию методом Дугласа–Пекера.
 * @param pts Массив координат в формате [x0, y0, x1, y1, ...]
 * @param epsilon Порог упрощения (в тех же единицах, что и координаты)
 * @returns Новый массив координат после упрощения
 */
export function douglasPeucker(
    pts: Float64Array,
    epsilon: number
): Float64Array {
    const idx = douglasPeuckerIndices(pts, epsilon);
    const out = new Float64Array(idx.length * 2);

    for (let j = 0; j < idx.length; j++) {
        const i = idx[j];
        out[2 * j] = pts[2 * i];
        out[2 * j + 1] = pts[2 * i + 1];
    }

    return out;
}

/**
 * Возвращает индексы точек, которые остаются после упрощения.
 * @param pts Массив координат [x0, y0, x1, y1, ...]
 * @param epsilon Порог упрощения
 * @returns Массив индексов
 */
export function douglasPeuckerIndices(
    pts: Float64Array,
    epsilon: number
): number[] {
    const n = pts.length / 2;
    if (n <= 2) return [0, n - 1];

    const keep = new Uint8Array(n);
    keep[0] = 1;
    keep[n - 1] = 1;

    const stack: Array<[number, number]> = [[0, n - 1]];
    const eps2 = epsilon * epsilon;

    while (stack.length) {
        const [i0, i1] = stack.pop() as [number, number];
        const ax = pts[2 * i0], ay = pts[2 * i0 + 1];
        const bx = pts[2 * i1], by = pts[2 * i1 + 1];

        let maxD2 = -1;
        let idx = -1;

        for (let i = i0 + 1; i < i1; i++) {
            const d2 = dist2PointToSegment(
                ax, ay, bx, by,
                pts[2 * i], pts[2 * i + 1]
            );
            if (d2 > maxD2) {
                maxD2 = d2;
                idx = i;
            }
        }

        if (maxD2 > eps2 && idx !== -1) {
            keep[idx] = 1;
            stack.push([i0, idx], [idx, i1]);
        }
    }

    const outIdx: number[] = [];
    for (let i = 0; i < n; i++) {
        if (keep[i]) outIdx.push(i);
    }

    return outIdx;
}

/**
 * Квадрат расстояния от точки до отрезка.
 */
function dist2PointToSegment(
    ax: number, ay: number,
    bx: number, by: number,
    px: number, py: number
): number {
    const vx = bx - ax, vy = by - ay;
    const wx = px - ax, wy = py - ay;
    const c1 = vx * wx + vy * wy;
    const c2 = vx * vx + vy * vy;
    let t = c2 ? c1 / c2 : 0;
    if (t < 0) t = 0;
    else if (t > 1) t = 1;
    const dx = ax + t * vx - px;
    const dy = ay + t * vy - py;
    return dx * dx + dy * dy;
}

/**
 * Запуск бенчмарка
 */
async function runBenchmark(iterations: number, epsilon: number) {
    const response = await fetch('./polyline_100000.json');
    const arr = await response.json();
    const polyline = new Float64Array(arr);
    const points = polyline.length / 2;

    // Прогрев (warm-up)
    for (let i = 0; i < 3; i++) {
        douglasPeucker(polyline, epsilon);
    }

    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
        const t0 = performance.now();
        const simplified = douglasPeucker(polyline, epsilon);
        const t1 = performance.now();
        times.push(t1 - t0);

        // sanity check
        if (simplified.length === 0) {
            throw new Error('Алгоритм вернул пустой результат');
        }
    }

    // Среднее и медиана
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const sorted = [...times].sort((a, b) => a - b);
    const median =
        sorted.length % 2 === 0
            ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
            : sorted[Math.floor(sorted.length / 2)];

    console.log(`--- JS Benchmark Douglas–Peucker ---`);
    console.log(`Точек: ${points}`);
    console.log(`Итераций: ${iterations}`);
    console.log(`Epsilon: ${epsilon}`);
    console.log(`Среднее время: ${avg.toFixed(3)} ms`);
    console.log(`Медиана: ${median.toFixed(3)} ms`);
}

runBenchmark(10, 0.5)