import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach } from "vitest";

beforeEach(() => {
	localStorage.clear();
	document.documentElement.dataset.theme = "vapor";
});

afterEach(() => {
	localStorage.clear();
});
