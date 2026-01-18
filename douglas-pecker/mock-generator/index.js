import { writeFileSync, existsSync, unlinkSync } from "fs";
import minimist from "minimist";
import path from "path";

function makePolyline(n) {
    const pts = new Float64Array(n * 2);
    for (let i = 0; i < n; i++) {
        const t = i / n;
        pts[2 * i] = t * 1000;
        pts[2 * i + 1] = Math.sin(t * 20) * 50;
    }
    return pts;
}

const args = minimist(process.argv.slice(2));
const NUMBER_OF_POINTS = Number(args.points || args.p || 100000);

const outDir = path.resolve("results");
const outFile = path.join(outDir, `polyline_${NUMBER_OF_POINTS}.json`);

if (existsSync(outFile)) {
    unlinkSync(outFile); console.log(`Removed existing file: ${outFile}`);
}

const data = makePolyline(NUMBER_OF_POINTS);

// Float64Array → обычный массив → JSON
const json = JSON.stringify(Array.from(data));

writeFileSync(`results/polyline_${NUMBER_OF_POINTS}.json`, json, "utf8");
