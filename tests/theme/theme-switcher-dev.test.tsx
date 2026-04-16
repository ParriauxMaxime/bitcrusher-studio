import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ThemeSwitcherDev } from "@/components/theme-switcher-dev/theme-switcher-dev";

describe("ThemeSwitcherDev", () => {
	it("shows current theme label on pill", () => {
		render(<ThemeSwitcherDev />);
		expect(
			screen.getByLabelText(/theme.*click to configure/i),
		).toHaveTextContent(/vapor/i);
	});

	it("opens panel and allows theme selection", async () => {
		const user = userEvent.setup();
		render(<ThemeSwitcherDev />);
		await user.click(screen.getByLabelText(/click to configure/i));
		await user.click(screen.getByLabelText("Graphite"));
		expect(document.documentElement.dataset.theme).toBe("graphite");
	});

	it("cycles theme on Cmd+Shift+T", async () => {
		const user = userEvent.setup();
		render(<ThemeSwitcherDev />);
		await user.keyboard("{Meta>}{Shift>}T{/Shift}{/Meta}");
		expect(document.documentElement.dataset.theme).toBe("graphite");
	});
});
