import { describe, expect, it } from "vitest";
import { initialPlayerState, playerReducer } from "@/lib/audio/player-core";

describe("playerReducer", () => {
	it("starts paused at time 0", () => {
		expect(initialPlayerState).toEqual({
			playing: false,
			time: 0,
			duration: 0,
		});
	});

	it("play sets playing true", () => {
		const s = playerReducer(initialPlayerState, { type: "play" });
		expect(s.playing).toBe(true);
	});

	it("pause resets playing flag", () => {
		const playing = playerReducer(initialPlayerState, { type: "play" });
		const paused = playerReducer(playing, { type: "pause" });
		expect(paused.playing).toBe(false);
		expect(paused.time).toBe(playing.time);
	});

	it("seek clamps to [0, duration]", () => {
		const s = playerReducer(
			{ playing: false, time: 0, duration: 100 },
			{ type: "seek", time: 150 },
		);
		expect(s.time).toBe(100);
		const s2 = playerReducer(s, { type: "seek", time: -5 });
		expect(s2.time).toBe(0);
	});

	it("tick advances time by delta, clamped to duration", () => {
		const s = playerReducer(
			{ playing: true, time: 10, duration: 30 },
			{ type: "tick", delta: 5 },
		);
		expect(s.time).toBe(15);
		const end = playerReducer(s, { type: "tick", delta: 100 });
		expect(end.time).toBe(30);
		expect(end.playing).toBe(false);
	});

	it("duration update sets duration and clamps time", () => {
		const s = playerReducer(
			{ playing: false, time: 40, duration: 0 },
			{ type: "duration", duration: 30 },
		);
		expect(s.duration).toBe(30);
		expect(s.time).toBe(30);
	});
});
