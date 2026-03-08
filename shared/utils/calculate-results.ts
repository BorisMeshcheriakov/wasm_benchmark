export const calculateResults = (
  title: string,
  times: number[],
  iterations: number,
) => {
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const sorted = [...times].sort((a, b) => a - b);
  const median =
    sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

  console.log(`--- ${title} ---`);
  console.log(`Итераций: ${iterations}`);
  console.log(`Среднее время: ${avg.toFixed(3)} ms`);
  console.log(`Медиана: ${median.toFixed(3)} ms`);
};
