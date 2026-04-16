import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Root } from "./root";
import "./theme/theme.css";

const container = document.getElementById("root");
if (!container) throw new Error("Root container #root not found");

// Always createRoot (not hydrateRoot) — prerendered HTML is for SEO crawlers only.
// Client-side React replaces it on mount.
container.innerHTML = "";
createRoot(container).render(
	<StrictMode>
		<Root />
	</StrictMode>,
);
