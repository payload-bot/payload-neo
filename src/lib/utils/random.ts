export function random(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function weightedRandom(min: number, max: number, distributionCalculator: (num: number) => number): number;
export function weightedRandom(numberSpread: Array<number>): number;
export function weightedRandom(numberSpeadBlueprints: NumberSpeadBlueprints): number;

export function weightedRandom(
  minOrNumberSpreadOrNumberSpeadBlueprints: number | Array<number> | NumberSpeadBlueprints,
  max?: number,
  distributionCalculator?: (num: number) => number,
) {
  if (typeof minOrNumberSpreadOrNumberSpeadBlueprints == "number") {
    const min = minOrNumberSpreadOrNumberSpeadBlueprints;

    const numberSpread: Array<number> = [];

    for (let i = min; i <= max!; i++) {
      numberSpread.push(...new Array(distributionCalculator!(i)).fill(i));
    }

    return numberSpread[random(0, numberSpread.length - 1)];
  } else if (minOrNumberSpreadOrNumberSpeadBlueprints.some((val: number | object) => !!Number(val))) {
    const numberSpread = minOrNumberSpreadOrNumberSpeadBlueprints as Array<number>;

    return numberSpread[random(0, numberSpread.length - 1)];
  } else {
    const numberSpeadBlueprints = minOrNumberSpreadOrNumberSpeadBlueprints as NumberSpeadBlueprints;

    const numberSpread: Array<number> = [];

    for (let i = 0; i < numberSpeadBlueprints.length; i++) {
      numberSpread.push(...new Array(numberSpeadBlueprints[i].weight).fill(numberSpeadBlueprints[i].number));
    }

    return numberSpread[random(0, numberSpread.length - 1)];
  }
}

type NumberSpeadBlueprints = Array<{
  number: number;
  weight: number;
}>;
