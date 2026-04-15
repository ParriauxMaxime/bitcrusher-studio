import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ThemeSwitcherDev } from "@/components/theme-switcher-dev/theme-switcher-dev";

describe("ThemeSwitcherDev", () => {
	it("shows current theme label", () => {
		render(<ThemeSwitcherDev />);
		expect(screen.getByRole("button")).toHaveTextContent(/graphite/i);
	});

	it("cycles theme on click", async () => {
		const user = userEvent.setup();
		render(<ThemeSwitcherDev />);
		await user.click(screen.getByRole("button"));
		expect(document.documentElement.dataset.theme).toBe("mahogany");
	});

	it("cycles theme on Cmd+Shift+T", async () => {
		const user = userEvent.setup();
		render(<ThemeSwitcherDev />);
		await user.keyboard("{Meta>}{Shift>}T{/Shift}{/Meta}");
		expect(document.documentElement.dataset.theme).toBe("mahogany");
	});
});
