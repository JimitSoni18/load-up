import { createSignal } from "solid-js";

type WithoutBody = "GET";
type WithBody = "PUT" | "POST" | "PATCH" | "DELETE" | "OPTIONS";

export type RequestOptions = {
	url: string,
	method?: WithoutBody,
} | {
	url: string,
	method?: WithBody,
	body?: string | FormData | ArrayBuffer,
}

type Progress = {
	uploadProgress: number;
	downloadProgress: number;
	started: boolean;
} & ({ // in progress
	failed: false;
	complete: false;
	result: undefined,
} | { // failed
	failed: true;
	complete: false;
	result: undefined,
} | { // completed
	failed: false,
	complete: true,
	result: {
		successFiles: string[],
		errorFiles: {
			fieldName: string | null,
			fileName: string | null,
			reason: string,
		}[]
	}
});

const INITIAL_PROGRESS: Progress = {
	result: undefined,
	uploadProgress: 0,
	downloadProgress: 0,
	complete: false,
	failed: false,
	started: false,
};

export default function createReactiveXHR(xhr: XMLHttpRequest) {
	const [progress, updateProgress] = createSignal<Progress>(INITIAL_PROGRESS);
	function resetProgress() {
		xhr.abort();
		updateProgress(INITIAL_PROGRESS);
	}
	function call(request: RequestOptions) {
		xhr.upload.onprogress = function(event) {
			if (event.lengthComputable) {
				updateProgress(prev => ({
					...prev,
					uploadProgress: (event.loaded * 100 / event.total),
				}));
			}
		}
		xhr.onreadystatechange = function() {
			updateProgress(prev => xhr.readyState !== 0 ? ({
				...prev,
				started: true,
			}) : prev)
		}
		xhr.onprogress = function(event) {
			if (event.lengthComputable) {
				updateProgress(prev => ({
					...prev,
					downloadProgress: event.loaded * 100 / event.total,
				}));
			}
		}
		xhr.onload = function() {
			updateProgress(prev => ({
				...prev,
				uploadProgress: 100,
				downloadProgress: 100,
				failed: false,
				complete: true,
				result: JSON.parse(xhr.response)
			}));
		}
		xhr.onerror = function() {
			updateProgress(prev => ({
				...prev,
				uploadProgress: 0,
				downloadProgress: 0,
				failed: true,
				complete: false,
				result: undefined,
			}));
		}
		xhr.open(request.method || "GET", request.url);
		xhr.send("body" in request ? request?.body : undefined)
	}
	return { call, progress, resetProgress };
}
