// Type declarations for ScrollyVideo library
interface ScrollyVideoOptions {
	scrollyVideoContainer: string;
	src: string;
	cover?: boolean;
	sticky?: boolean;
	full?: boolean;
	trackScroll?: boolean;
	transitionSpeed?: number;
	debug?: boolean;
	frameThreshold?: number;
	lockScroll?: boolean;
	useWebCodecs?: boolean;
	videoPercentage?: number;
	onReady?: () => void;
	onChange?: (percentage: number) => void;
}

interface ScrollyVideoInstance {
	src: string;
	setVideoPercentage(percentage: number, options?: { transitionSpeed?: number; easing?: any }): void;
	destroy(): void;
}

interface ScrollyVideoConstructor {
	new (options: ScrollyVideoOptions): ScrollyVideoInstance;
}

declare global {
	interface Window {
		ScrollyVideo: ScrollyVideoConstructor;
	}
}

export {};