export function randomInteger(minimum: number, maximum: number): number {
	return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

export function randomFloat(minimum: number, maximum: number): number {
	return Math.random() * (maximum - minimum) + minimum;
}

export function randomBoolean(): boolean {
	return Math.random() >= 0.5;
}

export function randomElement<T>(array: T[]): T {
	return array[randomInteger(0, array.length - 1)];
}
