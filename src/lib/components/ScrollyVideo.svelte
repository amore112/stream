<script lang="ts">
	import { onMount } from 'svelte';

	interface VideoData {
		id: string;
		title: string;
		embed: string;
		length_min: string;
		rate: string;
		views: string;
		keywords: string;
	}

	export let video: VideoData;
	export let index: number = 0;

	let container: HTMLElement;
	let scrollyVideo: any = null;

	// Type assertion for ScrollyVideo on window
	interface ScrollyVideoWindow extends Window {
		ScrollyVideo: any;
	}

	// Convert video data to ScrollyVideo format
	$: videoSrc = video?.embed || '';
	$: title = video?.title || '';

	onMount(() => {
		if (typeof window !== 'undefined' && (window as ScrollyVideoWindow).ScrollyVideo && container) {
			try {
				// Initialize ScrollyVideo
				scrollyVideo = new (window as ScrollyVideoWindow).ScrollyVideo({
					scrollyVideoContainer: `scrolly-video-${index}`,
					src: videoSrc,
					cover: true,
					sticky: true,
					full: true,
					trackScroll: true,
					transitionSpeed: 8,
					debug: false
				});

				console.log(`ScrollyVideo initialized for video ${index}: ${title}`);

				// Cleanup on destroy
				return () => {
					if (scrollyVideo) {
						scrollyVideo.destroy?.();
					}
				};
			} catch (error) {
				console.error('Error initializing ScrollyVideo:', error);
			}
		}
	});

	// Reactive update when video changes
	$: if (scrollyVideo && videoSrc) {
		try {
			scrollyVideo.src = videoSrc;
		} catch (error) {
			console.error('Error updating ScrollyVideo src:', error);
		}
	}
</script>

<div class="scrolly-video-wrapper">
	<div
		id="scrolly-video-{index}"
		bind:this={container}
		class="scrolly-video-container"
		data-index={index}
	>
		<!-- Video will be rendered here by ScrollyVideo -->
	</div>

	<div class="metadata">
		<h3>{title}</h3>
		<div class="stats">
			<span>{video?.length_min || ''}</span>
			<span>⭐ {video?.rate || ''}</span>
			<span>👁️ {video?.views || ''}</span>
		</div>
		<div class="keywords">
			{#if video?.keywords}
				{#each video.keywords.split(',').filter(k => k.trim()) as keyword}
					<span class="keyword">{keyword.trim()}</span>
				{/each}
			{/if}
		</div>
	</div>
</div>

<style>
	.scrolly-video-wrapper {
		position: relative;
		width: 100%;
		height: 100vh;
		background: black;
		overflow: hidden;
	}

	.scrolly-video-container {
		width: 100%;
		height: 100%;
		position: relative;
	}

	.metadata {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: linear-gradient(
			to top,
			rgba(0, 0, 0, 0.9) 0%,
			rgba(0, 0, 0, 0.7) 40%,
			rgba(0, 0, 0, 0.3) 70%,
			transparent 100%
		);
		padding: 24px;
		padding-bottom: 48px;
		color: white;
		z-index: 10;
	}

	.stats {
		display: flex;
		gap: 15px;
		margin: 10px 0;
	}

	.keywords {
		display: flex;
		gap: 10px;
		overflow-x: auto;
		margin-top: 10px;
	}

	.keyword {
		background: rgba(255, 255, 255, 0.15);
		backdrop-filter: blur(10px);
		padding: 6px 12px;
		border-radius: 20px;
		white-space: nowrap;
		border: 1px solid rgba(255, 255, 255, 0.2);
		transition: all 0.2s ease;
	}

	.keyword:hover {
		background: rgba(255, 255, 255, 0.25);
		transform: translateY(-1px);
	}

	/* Ensure smooth scrolling behavior */
	:global(html) {
		scroll-behavior: smooth;
	}
</style>