export function generateColors(count: number) {
  const backgroundColors: string[] = [];
  const borderColors: string[] = [];

  let hue = 0;
  const goldenAngle = 137.508;

  for (let i = 0; i < count; i++) {
    hue = (hue + goldenAngle) % 360;

    backgroundColors.push(`hsla(${hue}, 65%, 55%, 0.4)`);
    borderColors.push(`hsla(${hue}, 65%, 55%, 1)`);
  }

  return { backgroundColors, borderColors };
}
