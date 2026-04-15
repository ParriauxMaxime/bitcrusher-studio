import "./theme/theme.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Root } from "./root";

const container = document.getElementById("root");
if (!container) throw new Error("Root container #root not found");

createRoot(container).render(
	<StrictMode>
		<Root />
	</StrictMode>,
);
