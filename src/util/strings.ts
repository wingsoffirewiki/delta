export function toPascalCase(string: string, separator?: string): string {
	return string
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.substring(1))
		.join(separator);
}
