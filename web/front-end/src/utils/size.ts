export enum SizeFormat {
	Kb,
	KB,
	Mb,
	MB,
	Gb,
	GB,
	Tb,
	TB,
	Pb,
	PB,
	Eb,
	EB,
}

export function toHumanReadable(bytes: number, format?: SizeFormat) {
	if (format === null || format === undefined) {
		let magnitude = 0;
		while (bytes > 1024 && magnitude < 3) {
			bytes = bytes / 1024;
			magnitude++;
		}
		if (magnitude == 0) {
			return bytes.toFixed(2) + " B";
		} else if (magnitude == 1) {
			return bytes.toFixed(2) + " KB";
		} else if (magnitude == 2) {
			return bytes.toFixed(2) + " MB";
		} else if (magnitude == 3) {
			return bytes.toFixed(2) + " GB";
		} else {
			return bytes.toFixed(2).toString();
		}
	} else return bytes.toFixed(2).toString();
}
