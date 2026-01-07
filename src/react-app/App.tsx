// src/App.tsx

import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import cloudflareLogo from "./assets/Cloudflare_Logo.svg";
import honoLogo from "./assets/hono.svg";
import "./App.css";

function App() {
	const [count, setCount] = useState(0);
	const [name, setName] = useState("unknown");

	return (
		<>
			<div>
				Logo Image Here
			</div>
			<div>
				<p>Stay tuned for changes in Arizona.</p>
			</div>
		</>
	);
}

export default App;
