import { match } from "ts-pattern";

export interface PlayerState {
	playing: boolean;
	time: number;
	duration: number;
}

export type PlayerAction =
	| { type: "play" }
	| { type: "pause" }
	| { type: "seek"; time: number }
	| { type: "tick"; delta: number }
	| { type: "duration"; duration: number };

export const initialPlayerState: PlayerState = {
	playing: false,
	time: 0,
	duration: 0,
};

const clamp = (v: number, lo: number, hi: number) =>
	Math.max(lo, Math.min(hi, v));

export const playerReducer = (
	state: PlayerState,
	action: PlayerAction,
): PlayerState =>
	match(action)
		.with({ type: "play" }, () => ({ ...state, playing: true }))
		.with({ type: "pause" }, () => ({ ...state, playing: false }))
		.with({ type: "seek" }, ({ time }) => ({
			...state,
			time: clamp(time, 0, state.duration),
		}))
		.with({ type: "tick" }, ({ delta }) => {
			const next = clamp(state.time + delta, 0, state.duration);
			return {
				...state,
				time: next,
				playing: next >= state.duration ? false : state.playing,
			};
		})
		.with({ type: "duration" }, ({ duration }) => ({
			...state,
			duration,
			time: clamp(state.time, 0, duration),
		}))
		.exhaustive();
