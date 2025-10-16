<script lang="ts">
	import { onMount } from 'svelte';
	import ScrollyVideo from '$lib/components/ScrollyVideo.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';

	interface VideoData {
		id: string;
		title: string;
		embed: string;
		length_min: string;
		rate: string;
		views: string;
		keywords: string;
	}

	let videos: VideoData[] = [];
	let currentPage = 1;
	let currentQuery = 'indo';
	let isLoading = false;
	let currentVideoIndex = 0;
	let allVideos: VideoData[] = []; // Store all loaded videos

	const API_BASE = 'https://unyil-api-proxy.scienc-co.workers.dev/api/v2';

	async function fetchVideos(query: string, page: number): Promise<VideoData[]> {
		const url = `${API_BASE}/video/search/?query=${encodeURIComponent(query)}&per_page=10&page=${page}&thumbsize=big&order=top-weekly&gay=0&lq=0&format=json`;
		const response = await fetch(url);
		const data = await response.json();
		return data.videos || [];
	}

	async function loadVideos(reset = false): Promise<void> {
		if (isLoading) {
			console.log('Already loading, skipping...');
			return;
		}
		isLoading = true;

		console.log(`Loading videos - Page: ${currentPage}, Query: ${currentQuery}, Reset: ${reset}`);

		try {
			const newVideos = await fetchVideos(currentQuery, currentPage);
			console.log(`Fetched ${newVideos.length} videos from API`);

			if (reset) {
				allVideos = newVideos;
				currentVideoIndex = 0;
				videos = getVisibleVideos();
				console.log(`Reset - Total videos: ${allVideos.length}, Visible: ${videos.length}`);
			} else {
				const oldLength = allVideos.length;
				allVideos = [...allVideos, ...newVideos];
				videos = getVisibleVideos();
				console.log(`Appended - Old: ${oldLength}, New: ${newVideos.length}, Total: ${allVideos.length}, Visible: ${videos.length}`);
			}
		} catch (error) {
			console.error('Error loading videos:', error);
		} finally {
			isLoading = false;
		}
	}

	function getVisibleVideos(): VideoData[] {
		// Only render 3 videos: previous, current, next
		const start = Math.max(0, currentVideoIndex - 1);
		const end = Math.min(allVideos.length, currentVideoIndex + 2);
		const visibleVideos = allVideos.slice(start, end);
		console.log(`getVisibleVideos - Start: ${start}, End: ${end}, Result: ${visibleVideos.length} videos`);
		return visibleVideos;
	}

	async function handleSearch(query: string) {
		currentQuery = query;
		currentPage = 1;
		currentVideoIndex = 0;
		await loadVideos(true);

		// Scroll to top after search (browser only)
		setTimeout(() => {
			if (typeof window !== 'undefined') {
				window.scrollTo({ top: 0, behavior: 'smooth' });
			}
		}, 100);
	}

	function goToNextVideo() {
		console.log(`goToNextVideo - Current: ${currentVideoIndex}, Total: ${allVideos.length}`);

		if (currentVideoIndex < allVideos.length - 1) {
			currentVideoIndex++;
			videos = getVisibleVideos();
			console.log(`Next - New index: ${currentVideoIndex}, Visible videos: ${videos.length}`);

			// Preload next page when we have less than 5 videos left
			const remaining = allVideos.length - currentVideoIndex;
			console.log(`Remaining videos: ${remaining}`);

			if (remaining <= 5 && !isLoading) {
				console.log('Triggering load more videos');
				currentPage++;
				loadVideos();
			}
		} else {
			console.log('Already at last video');
		}
	}

	function goToPrevVideo() {
		console.log(`goToPrevVideo - Current: ${currentVideoIndex}`);

		if (currentVideoIndex > 0) {
			currentVideoIndex--;
			videos = getVisibleVideos();
			console.log(`Prev - New index: ${currentVideoIndex}, Visible videos: ${videos.length}`);
		}
	}

	// Simplified pagination trigger
	function checkAndLoadMore() {
		const remaining = allVideos.length - currentVideoIndex;
		const totalVideos = allVideos.length;

		console.log(`checkAndLoadMore - Remaining: ${remaining}, Total: ${totalVideos}, Loading: ${isLoading}`);

		// Load more when we have less than 8 videos total or when current video is near the end
		if (!isLoading && (remaining <= 8 || totalVideos < 15)) {
			console.log('Loading more videos...');
			currentPage++;
			loadVideos();
		} else {
			console.log('Not loading - conditions not met');
		}
	}

	// Intersection Observer for preloading next videos
	let observer: IntersectionObserver | null = null;
	let lastIndexUpdate = 0;

	function setupIntersectionObserver() {
		// Check if we're in browser environment and IntersectionObserver is supported
		if (typeof window === 'undefined' || !window.IntersectionObserver) {
			console.log('IntersectionObserver not available, skipping setup');
			return;
		}

		if (observer) observer.disconnect();

		try {
			observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							const target = entry.target as HTMLElement;
							const videoIndex = parseInt(target.dataset.index || '0');
	
							console.log(`Intersection - Video index: ${videoIndex}, Current: ${currentVideoIndex}, Total: ${allVideos.length}`);
	
							// Update current video index when a video comes into view (with debounce)
							if (videoIndex !== currentVideoIndex && videoIndex >= 0) {
								const now = Date.now();
								if (now - lastIndexUpdate > 300) { // Debounce for 300ms
									console.log(`Updating current index from ${currentVideoIndex} to ${videoIndex}`);
									lastIndexUpdate = now;
									currentVideoIndex = videoIndex;
									videos = getVisibleVideos();
									console.log(`Updated visible videos: ${videos.length} videos starting from index ${currentVideoIndex}`);
								}
							}
	
							// Load more when approaching the end
							if (videoIndex >= allVideos.length - 3 && !isLoading) {
								const remaining = allVideos.length - currentVideoIndex;
								console.log(`Intersection trigger - Remaining: ${remaining}`);
								checkAndLoadMore();
							}
						}
					});
				},
				{
					root: null,
					rootMargin: '50px',
					threshold: 0.5
				}
			);

			// Observe all video items
			const items = document.querySelectorAll('.video-item');
			console.log(`Observing ${items.length} video items`);
			items.forEach((item) => {
				observer?.observe(item);
			});
		} catch (error) {
			console.error('Error setting up IntersectionObserver:', error);
		}
	}

	// Infinite scroll - load next page when scrolling
	function handleScroll() {
		if (typeof window !== 'undefined') {
			setupIntersectionObserver();
		}
	}

	// Keyboard navigation
	function handleKeydown(event: KeyboardEvent) {
		if (typeof window === 'undefined') return;

		switch (event.key) {
			case 'ArrowDown':
			case ' ': // Spacebar
				event.preventDefault();
				goToNextVideo();
				break;
			case 'ArrowUp':
				event.preventDefault();
				goToPrevVideo();
				break;
		}
	}

	// Client-side initialization
	onMount(async () => {
		console.log('Client-side mounted, starting initial load...');

		// Initial load
		await loadVideos();

		// Setup intersection observer after initial load
		setTimeout(() => {
			setupIntersectionObserver();
		}, 1000);
	});

	// Reactive statement to setup observer when videos change
	$: if (videos.length > 0 && typeof window !== 'undefined') {
		setTimeout(() => {
			setupIntersectionObserver();
		}, 500);
	}
</script>

<svelte:window on:scroll={handleScroll} on:keydown={handleKeydown} />

<SearchBar onSearch={handleSearch} />

<div class="video-list">
	{#each videos as video, index (video.id)}
		<div class="video-item" data-index={currentVideoIndex + index}>
			<ScrollyVideo {video} {index} />
		</div>
	{/each}
</div>

{#if isLoading}
	<div class="loading">Loading...</div>
{/if}

<div class="debug-info" style="position: fixed; top: 10px; right: 10px; background: rgba(0,0,0,0.8); color: white; padding: 10px; font-size: 12px; z-index: 1000;">
	<p>Current: {currentVideoIndex} | Total: {allVideos.length} | Visible: {videos.length}</p>
	<p>Page: {currentPage} | Loading: {isLoading}</p>
	<p>Remaining: {allVideos.length - currentVideoIndex}</p>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: Arial, sans-serif;
		background: black;
		color: white;
		overflow: hidden;
	}

	.video-list {
		scroll-snap-type: y mandatory;
		height: 100vh;
		overflow-y: scroll;
		scroll-behavior: smooth;
	}

	.video-item {
		height: 100vh;
		scroll-snap-align: start;
		scroll-snap-stop: always;
	}

	.loading {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 20px;
		border-radius: 10px;
		z-index: 1000;
	}
</style>
