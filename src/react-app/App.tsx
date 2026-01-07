// src/App.tsx

import { useState } from "react";
import popazLogo from "./assets/popaz-logo.png";
import "./App.css";

function App() {
	const [count, setCount] = useState(0);
	const [name, setName] = useState("unknown");

	return (
		<>
			<div>
				<popazLogo/>
			</div>
			<div>
				<p>Stay tuned for changes in Arizona.</p>
			</div>
		</>
	);
}

export default App;
