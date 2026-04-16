import { css } from "@emotion/react";
import { useState } from "react";
import { tokens } from "@/theme/tokens";

export type CarouselItem =
	| { kind: "image"; src: string; alt: string }
	| { kind: "youtube"; url: string; title: string };

export interface CarouselProps {
	items: CarouselItem[];
}

const youtubeEmbed = (url: string): string => {
	const id =
		url.match(/v=([^&]+)/)?.[1] ||
		url.match(/youtu\.be\/([^?]+)/)?.[1] ||
		url.match(/playlist\?list=([^&]+)/)?.[1];
	return `https://www.youtube.com/embed/${id}`;
};

const styles = {
	container: css`
		position: relative;
		overflow: hidden;
		border-radius: 6px;
		border: 1px solid ${tokens.surface.border};
		z-index: 9001;
		&:hover .carousel-arrow {
			opacity: 1;
		}
	`,
	track: css`
		display: flex;
		transition: transform 0.3s ease;
	`,
	slide: css`
		flex: 0 0 100%;
		min-width: 0;
	`,
	image: css`
		object-fit: cover;
		border-radius: 6px;
		max-height: 400px;
		width: 100%;
		display: block;
	`,
	iframeWrapper: css`
		position: relative;
		width: 100%;
		padding-top: 56.25%;
	`,
	iframe: css`
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		border: 0;
	`,
	arrowBase: css`
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		background: rgba(0, 0, 0, 0.5);
		color: ${tokens.text.heading};
		border: none;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		cursor: pointer;
		font-size: 18px;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: opacity 0.2s;
		&:focus-visible {
			opacity: 1;
			outline: 2px solid ${tokens.focus};
			outline-offset: 2px;
		}
	`,
	arrowLeft: css`
		left: 8px;
	`,
	arrowRight: css`
		right: 8px;
	`,
	dots: css`
		display: flex;
		justify-content: center;
		gap: 6px;
		padding: 10px 0;
	`,
};

const dotStyle = (active: boolean) => css`
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: ${active ? tokens.accent : tokens.surface.border};
	border: none;
	cursor: pointer;
	padding: 0;
	transition: background 0.2s;
	&:focus-visible {
		outline: 2px solid ${tokens.focus};
		outline-offset: 2px;
	}
`;

export const Carousel = ({ items }: CarouselProps) => {
	const [index, setIndex] = useState(0);
	const single = items.length <= 1;

	const prev = () => setIndex((i) => Math.max(0, i - 1));
	const next = () => setIndex((i) => Math.min(items.length - 1, i + 1));

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "ArrowLeft") {
			e.preventDefault();
			prev();
		} else if (e.key === "ArrowRight") {
			e.preventDefault();
			next();
		}
	};

	if (items.length === 0) return null;

	return (
		<section
			css={styles.container}
			onKeyDown={handleKeyDown}
			// biome-ignore lint/a11y/noNoninteractiveTabindex: carousel needs keyboard focus for arrow-key navigation
			tabIndex={0}
			aria-label="Media carousel"
		>
			<div
				css={styles.track}
				style={{ transform: `translateX(-${index * 100}%)` }}
			>
				{items.map((item) => (
					<div
						key={item.kind === "image" ? item.src : item.url}
						css={styles.slide}
					>
						{item.kind === "image" ? (
							<img
								css={styles.image}
								src={item.src}
								alt={item.alt}
								loading="lazy"
							/>
						) : (
							<div css={styles.iframeWrapper}>
								<iframe
									css={styles.iframe}
									src={youtubeEmbed(item.url)}
									title={item.title}
									loading="lazy"
									allow="encrypted-media"
								/>
							</div>
						)}
					</div>
				))}
			</div>

			{!single && (
				<>
					<button
						type="button"
						className="carousel-arrow"
						css={[styles.arrowBase, styles.arrowLeft]}
						onClick={prev}
						aria-label="Previous slide"
						disabled={index === 0}
					>
						‹
					</button>
					<button
						type="button"
						className="carousel-arrow"
						css={[styles.arrowBase, styles.arrowRight]}
						onClick={next}
						aria-label="Next slide"
						disabled={index === items.length - 1}
					>
						›
					</button>
				</>
			)}

			{!single && (
				<div css={styles.dots} role="tablist" aria-label="Slides">
					{items.map((item, i) => (
						<button
							key={item.kind === "image" ? item.src : item.url}
							type="button"
							role="tab"
							aria-selected={i === index}
							aria-label={`Go to slide ${i + 1}`}
							css={dotStyle(i === index)}
							onClick={() => setIndex(i)}
						/>
					))}
				</div>
			)}
		</section>
	);
};
