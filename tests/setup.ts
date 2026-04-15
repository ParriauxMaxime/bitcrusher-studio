import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach } from "vitest";

beforeEach(() => {
	localStorage.clear();
	document.documentElement.dataset.theme = "graphite";
});

afterEach(() => {
	localStorage.clear();
});
