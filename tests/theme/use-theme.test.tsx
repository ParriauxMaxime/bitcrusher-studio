import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useTheme } from "@/theme/use-theme";

describe("useTheme", () => {
	it("returns graphite by default", () => {
		const { result } = renderHook(() => useTheme());
		expect(result.current.theme).toBe("graphite");
	});

	it("setTheme updates DOM and localStorage", () => {
		const { result } = renderHook(() => useTheme());
		act(() => {
			result.current.setTheme("mahogany");
		});
		expect(result.current.theme).toBe("mahogany");
		expect(document.documentElement.dataset.theme).toBe("mahogany");
		expect(localStorage.getItem("theme")).toBe("mahogany");
	});

	it("cycleTheme rotates through ALL_THEMES", () => {
		const { result } = renderHook(() => useTheme());
		act(() => result.current.cycleTheme());
		expect(result.current.theme).toBe("mahogany");
		act(() => result.current.cycleTheme());
		expect(result.current.theme).toBe("graphite");
	});

	it("reads initial theme from DOM dataset", () => {
		document.documentElement.dataset.theme = "mahogany";
		const { result } = renderHook(() => useTheme());
		expect(result.current.theme).toBe("mahogany");
	});
});
