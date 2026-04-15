import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { Root } from "./root";
import "./theme/theme.css";

const container = document.getElementById("root");
if (!container) throw new Error("Root container #root not found");

if (container.hasChildNodes()) {
	hydrateRoot(
		container,
		<StrictMode>
			<Root />
		</StrictMode>,
	);
} else {
	createRoot(container).render(
		<StrictMode>
			<Root />
		</StrictMode>,
	);
}
