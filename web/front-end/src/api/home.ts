import createReactiveSignal from "../hooks/createReactiveRequest";

const xhr = new XMLHttpRequest();

export function createFileUpload() {
	const { progress, call: callInner, resetProgress: reset } = createReactiveSignal(xhr);
	function call(body: FormData) {
		callInner({
			body,
			url: "/",
			method: "POST"
		});
	}
	return {
		call,
		progress,
		reset,
	}
}
