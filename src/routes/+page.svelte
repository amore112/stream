<script lang="ts">
	import { onMount } from 'svelte';
	import Video from '$lib/components/Video.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import type { PageData } from './$types';

	// Menerima data yang dimuat dari +page.ts
	export let data: PageData;

	// Inisialisasi state dari data yang sudah di-load
	let allVideos = data.initialVideos;
	let currentPage = 1; // Mulai dari halaman 1, karena halaman 1 sudah dimuat
	let currentQuery = 'indo';
	let isLoading = false;
	let currentVideoIndex = 0;

	const API_BASE = 'https://unyil-api-proxy.scienc-co.workers.dev/api/v2';

	async function fetchVideos(query: string, page: number) {
		const url = `${API_BASE}/video/search/?query=${encodeURIComponent(query)}&per_page=10&page=${page}&thumbsize=big&order=top-weekly&gay=0&lq=0&format=json`;
		try {
			const response = await fetch(url);
			const data = await response.json();
			return data.videos || [];
		} catch (error) {
			console.error("Failed to fetch videos:", error);
			return [];
		}
	}

	// Fungsi ini sekarang hanya untuk memuat halaman berikutnya (infinite scroll)
	async function loadMoreVideos() {
		if (isLoading) return;
		isLoading = true;
		
		currentPage++; // Naikkan halaman sebelum fetch
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
		allVideos = await fetchVideos(query, currentPage); // Fetch data baru secara langsung
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

						// Muat lebih banyak video jika sudah berada di dekat 3 video terakhir
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

	// Atur ulang observer setiap kali daftar video berubah
	$: if (allVideos && allVideos.length > 0 && typeof window !== 'undefined') {
		setTimeout(setupIntersectionObserver, 100);
	}
</script>

<svelte:head>
	<title>Video Stream</title>
</svelte:head>

<SearchBar onSearch={handleSearch} />

<div class="video-list">
	{#each allVideos as video, index (video.id)}
		<div class="video-item" data-index={index}>
			{#if Math.abs(index - currentVideoIndex) <= 1}
				<Video {video} on:keywordsearch={(event) => handleSearch(event.detail)} />
			{/if}
		</div>
	{/each}
</div>

{#if isLoading}
	<div class="loading">Loading...</div>
{/if}

<div class="debug-info">
	<p>Current Index: {currentVideoIndex}</p>
	<p>Total Loaded: {allVideos.length}</p>
	<p>Is Loading: {isLoading}</p>
</div>

<style>
	/* CSS tetap sama seperti sebelumnya, tidak perlu diubah */
	:global(body) {
		margin: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
		background: #000;
		color: white;
		overflow: hidden;
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

	.loading {
		position: fixed;
		bottom: 20px;
		left: 50%;
		transform: translateX(-50%);
		background: rgba(0, 0, 0, 0.7);
		padding: 10px 20px;
		border-radius: 20px;
		z-index: 1000;
		font-size: 14px;
	}

	.debug-info {
		position: fixed;
		top: 80px;
		right: 10px;
		background: rgba(0,0,0,0.6);
		color: white;
		padding: 10px;
		font-size: 12px;
		z-index: 1000;
		border-radius: 8px;
	}
</style>