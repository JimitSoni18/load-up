import styles from "./button.module.scss";
import { JSXElement } from "solid-js";

type ButtonProps = {
	theme: "success" | "danger" | "warning" | "error" | "info";
	type?: "submit" | "reset" | "button";
	children: JSXElement;
}

export default function Button(props: ButtonProps) {
	return (
		<button class={styles[props.theme]} type={props.type || "button"}>
			{props.children}
		</button>
	)
}
