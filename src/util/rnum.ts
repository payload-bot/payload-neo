export function randomNumber(max: number) {
    return Math.floor(Math.random() * max);
}

export function randomRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}