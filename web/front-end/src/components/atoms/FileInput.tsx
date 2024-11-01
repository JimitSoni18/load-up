import { JSX } from "solid-js/types/jsx";

interface FileInputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
	accept?: string;
}

export default function FileInput(props: FileInputProps) {
	return (
		<input id={props.id} type="file" accept={props.accept} multiple={props.multiple} />
	)
}
