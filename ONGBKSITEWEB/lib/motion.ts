import { useEffect, useState } from "react";
import type { Variants } from "framer-motion";

const easing = [0.22, 1, 0.36, 1] as [number, number, number, number];

export const motionTiming = {
	duration: 0.62,
	easing,
	easingCss: "cubic-bezier(0.22, 1, 0.36, 1)",
	revealY: 28,
	cardScale: 0.97,
	staggerSeconds: 0.09,
};

export const fadeUp: Variants = {
	hidden: { opacity: 0, y: motionTiming.revealY },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: motionTiming.duration, ease: easing },
	},
};

export const stagger: Variants = {
	hidden: {},
	visible: { transition: { delayChildren: 0.04, staggerChildren: motionTiming.staggerSeconds } },
};

export const scaleIn: Variants = {
	hidden: { opacity: 0, scale: motionTiming.cardScale },
	visible: {
		opacity: 1,
		scale: 1,
		transition: { duration: motionTiming.duration, ease: easing },
	},
};

export function useLowPower() {
	const [lowPower, setLowPower] = useState<boolean | null>(null);

	useEffect(() => {
		const navigatorWithHints = navigator as Navigator & {
			connection?: EventTarget & { saveData?: boolean };
		};
		const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
		const connection = navigatorWithHints.connection;

		const updateLowPower = () => {
			setLowPower(reducedMotion.matches || connection?.saveData === true);
		};

		updateLowPower();
		reducedMotion.addEventListener("change", updateLowPower);
		connection?.addEventListener("change", updateLowPower);

		return () => {
			reducedMotion.removeEventListener("change", updateLowPower);
			connection?.removeEventListener("change", updateLowPower);
		};
	}, []);

	return lowPower;
}
