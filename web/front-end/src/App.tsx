import type { Component } from 'solid-js';
import createReactiveRequest from "./hooks/createReactiveRequest";
import Home from "./pages/Home";

const App: Component = () => {
	return (
		<div>
			<Home />
		</div>
	);
};

export default App;
