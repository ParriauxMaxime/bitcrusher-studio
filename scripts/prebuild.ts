import { spawnSync } from "node:child_process";

const steps: Array<{ name: string; cmd: string; args: string[] }> = [
	{
		name: "content types",
		cmd: "npx",
		args: ["tsx", "scripts/sync-content-types.ts"],
	},
	// generate-waveforms, generate-og-images — added in Phase 4 / 5
];

for (const step of steps) {
	console.log(`[prebuild] ${step.name}`);
	const r = spawnSync(step.cmd, step.args, { stdio: "inherit" });
	if (r.status !== 0) {
		console.error(
			`[prebuild] step "${step.name}" failed with code ${r.status}`,
		);
		process.exit(r.status ?? 1);
	}
}
