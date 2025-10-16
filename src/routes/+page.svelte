<script lang="ts">
	import { onMount } from 'svelte';
	import Video from '$lib/components/Video.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let allVideos = data.initialVideos;
	let currentPage = 1;
	let currentQuery = 'indo';
	let isLoading = false;
	let currentVideoIndex = 0;

	const API_BASE = 'https://unyil-api-proxy.scienc-co.workers.dev/api/v2';

	// 👇 FUNGSI BARU UNTUK TOMBOL KEMBALI 👇
	function goBack() {
		// Pastikan kode hanya berjalan di browser
		if (typeof window !== 'undefined') {
			window.history.back();
		}
	}

	async function fetchVideos(query: string, page: number) {
		const url = `${API_BASE}/video/search/?query=${encodeURIComponent(
			query
		)}&per_page=10&page=${page}&thumbsize=big&order=top-weekly&gay=0&lq=0&format=json`;
		try {
			const response = await fetch(url);
			const data = await response.json();
			return data.videos || [];
		} catch (error) {
			console.error('Failed to fetch videos:', error);
			return [];
		}
	}

	async function loadMoreVideos() {
		if (isLoading) return;
		isLoading = true;

		currentPage++;
		const newVideos = await fetchVideos(currentQuery, currentPage);

		if (newVideos.length > 0) {
			allVideos = [...allVideos, ...newVideos];
		}

		isLoading = false;
	}

	async function handleSearch(query: string) {
		currentQuery = query;
		currentPage = 1;
		currentVideoIndex = 0;
		isLoading = true;
		allVideos = await fetchVideos(query, currentPage);
		isLoading = false;

		if (typeof window !== 'undefined') {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}

	let observer: IntersectionObserver;

	function setupIntersectionObserver() {
		if (typeof window === 'undefined' || !window.IntersectionObserver) return;
		if (observer) observer.disconnect();

		observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const target = entry.target as HTMLElement;
						const videoIndex = parseInt(target.dataset.index || '0');

						currentVideoIndex = videoIndex;

						const isNearEnd = videoIndex >= allVideos.length - 3;
						if (isNearEnd && !isLoading) {
							loadMoreVideos();
						}
					}
				});
			},
			{
				root: null,
				threshold: 0.6
			}
		);

		const items = document.querySelectorAll('.video-item');
		items.forEach((item) => observer.observe(item));
	}

	$: if (allVideos && allVideos.length > 0 && typeof window !== 'undefined') {
		setTimeout(setupIntersectionObserver, 100);
	}
</script>

<svelte:head>
	<title>Video Stream</title>
</svelte:head>

<div class="top-bar-container">
	<button class="back-button" aria-label="Go back" on:click={goBack}>
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<polyline points="15 18 9 12 15 6"></polyline>
		</svg>
	</button>

	<SearchBar onSearch={handleSearch} />
</div>

<div class="video-list">
	{#each allVideos as video, index (video.id)}
		<div class="video-item" data-index={index}>
			{#if Math.abs(index - currentVideoIndex) <= 1}
				<Video {video} on:keywordsearch={(event) => handleSearch(event.detail)} />
			{/if}
		</div>
	{/each}

	{#if isLoading}
		<div class="video-item skeleton">
			<div class="spinner"></div>
		</div>
	{/if}
</div>

<style>
	:global(body) {
		margin: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
			'Open Sans', 'Helvetica Neue', sans-serif;
		background: #000;
		color: white;
		overflow: hidden;
	}

	.top-bar-container {
		position: fixed;
		top: 20px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		gap: 10px;
		z-index: 1001;
	}

	.back-button {
		display: flex;
		justify-content: center;
		align-items: center;
		/* 👇 TINGGI DAN LEBAR DISAMAKAN DENGAN SEARCH BAR 👇 */
		height: 44px;
		width: 44px;
		border-radius: 50%;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(30, 30, 30, 0.7);
		backdrop-filter: blur(15px);
		color: white;
		cursor: pointer;
		transition: background-color 0.2s ease;
		padding: 0;
		box-sizing: border-box; /* Pastikan padding & border termasuk dalam ukuran */
	}

	.back-button:hover {
		background: rgba(50, 50, 50, 0.9);
	}

	.video-list {
		height: 100vh;
		overflow-y: scroll;
		scroll-snap-type: y mandatory;
		scroll-behavior: smooth;
	}

	.video-item {
		height: 100vh;
		width: 100%;
		scroll-snap-align: start;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.skeleton {
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #111;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid rgba(255, 255, 255, 0.2);
		border-top-color: #fff;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>