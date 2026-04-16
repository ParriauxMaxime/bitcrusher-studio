import { type ReactNode, useEffect, useRef } from "react";

export interface RevealProps {
	children: ReactNode;
	delay?: 0 | 1 | 2 | 3;
	className?: string;
}

export const Reveal = ({
	children,
	delay = 0,
	className = "",
}: RevealProps) => {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) {
					el.classList.add("visible");
					observer.unobserve(el);
				}
			},
			{ threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	const delayClass = delay > 0 ? ` reveal-delay-${delay}` : "";

	return (
		<div ref={ref} className={`reveal${delayClass} ${className}`}>
			{children}
		</div>
	);
};
