export function calculateScore(guess: number, actualPosition: number) {
  const difference = Math.abs(guess - actualPosition);

  const maxPossibleDifference = Math.max(
    actualPosition,
    1 - actualPosition,
  );

  const normalizedError = Math.min(
    difference / maxPossibleDifference,
    1,
  );

  const steepness = 3;

  const scoreMultiplier =
    (Math.exp(-steepness * normalizedError) - Math.exp(-steepness)) /
    (1 - Math.exp(-steepness));

  return Math.round(1000 * Math.max(0, scoreMultiplier));
}
