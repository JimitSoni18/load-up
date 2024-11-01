import { createSignal, For, Show } from "solid-js";
import type { DOMElement } from "solid-js/types/jsx";
import { toHumanReadable } from "../utils/size";
import { createFileUpload } from "../api/home"
import Button from "../components/atoms/Button";
import UploadIcon from "../assets/vectors/UploadIcon";
import styles from "../styles/home.module.scss";

export default function Home() {
	type FileDescription = {
		readonly name: string;
		readonly size: number;
		readonly type: string;
	}
	const [uploadedFiles, setUploadedFiles] = createSignal<FileDescription[]>([]);
	const { call, progress, reset } = createFileUpload();

	function handleFileUpload(
		event: Event & {
			currentTarget: HTMLInputElement;
			target: HTMLInputElement;
		}
	) {
		if (event.target.files !== null && event.target.files.length !== 0) {
			const includedFiles: FileDescription[] = [];
			for (const file of event.target.files) {
				includedFiles.push({ name: file.name, size: file.size, type: file.type })
			}
			setUploadedFiles(includedFiles);
		}
	}

	function handleSubmit(e: SubmitEvent & {
		currentTarget: HTMLFormElement;
		target: DOMElement;
	}) {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		call(formData);
	}

	function handleReset(e: Event & {
		currentTarget: HTMLFormElement;
		target: DOMElement;
	}) {
		e.preventDefault();
		setUploadedFiles([]);
		reset();
	}

	return (
		<main class="cosmic-container mx-auto">
			<form onreset={handleReset} onsubmit={handleSubmit}>
				<label for="file-picker-home" class="px-4 py-3 rounded-full bg-violet-600 text-white font-bold inline-block shadow-md shadow-violet-200 hover:shadow-lg cursor-pointer transition-all duration-200 hover:scale-105 active:scale-100" /* class="mx-auto inline-block px-20 py-12 rounded-md bg-zinc-100 border-dashed border-2 border-zinc-400" */>
					<input id="file-picker-home" class="hidden" type="file" multiple onchange={handleFileUpload} name="files" />
					<UploadIcon />
					Upload File
				</label>
				<Show when={progress().started}>
					<div>
						Progress: {progress().uploadProgress.toFixed(2)}
						<div class="w-full h-1 rounded-sm">
							<hr class="bg-indigo-500 h-full transition-[width] duration-150" style={{width: `${progress().uploadProgress}%`}} />
						</div>
					</div>
				</Show>
				<Show when={uploadedFiles().length > 0}>
					<div class="my-5">
						<h2>Uploaded Files</h2>
						<table class="w-full">
							<thead>
								<tr>
									<th>
										Name
									</th>
									<th>
										Type
									</th>
									<th>
										Size
									</th>
								</tr>
							</thead>
							<For each={uploadedFiles()}>
								{(item) => (
									<tbody>
										<tr>
											<td>{item.name}</td>
											<td>{item.type}</td>
											<td>{toHumanReadable(item.size)}</td>
										</tr>
									</tbody>
								)}
							</For>
							<tfoot>
								<tr>
									<th colspan={2}>Total</th>
									<td>{toHumanReadable(uploadedFiles().reduce((prevSum,file)=>(prevSum+file.size),0))}</td>
								</tr>
							</tfoot>
						</table>
					</div>
				</Show>
				<Show when={progress().failed}>
					<strong class="text-red-500">
						Something went wrong
					</strong>
				</Show>
				<Show when={uploadedFiles().length !== 0}>
					<div class="flex gap-3 my-3">
						<Button type="submit" theme="success">submit</Button>
						<Button type="reset" theme="error">reset</Button>
					</div>
				</Show>
				<Show when={progress().complete}>
					<Show when={progress().result?.successFiles.length??0 > 0}>
						<div class="my-3">
							<h4 class={`${styles.text_success} font-medium text-lg mb-3`}>Success Files</h4>
							<ul class={`list-disc ${styles.text_success}`}>
								<For each={progress().result?.successFiles}>
									{file => <li class={styles.text_success}>{file}</li>}
								</For>
							</ul>
						</div>
					</Show>
					<Show when={progress().result?.errorFiles.length??0 > 0}>
						<div class="my-3">
							<h4 class={`${styles.text_error} font-medium text-lg mb-3`}>Error Files</h4>
							<ul class={`list-disc ${styles.text_errro}`}>
								<For each={progress().result?.errorFiles}>
									{file => <li class={styles.text_error}>{file.fileName} - {file.fieldName} - {file.reason}</li>}
								</For>
							</ul>
						</div>
					</Show>
				</Show>
			</form>
		</main>
	)
}
