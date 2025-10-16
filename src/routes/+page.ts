import type { PageLoad } from './$types';

// Definisikan tipe data untuk video agar konsisten
interface VideoData {
    id: string;
    title: string;
    embed: string;
    length_min: string;
    rate: string;
    views: string;
    keywords: string;
}

// URL API
const API_BASE = 'https://unyil-api-proxy.scienc-co.workers.dev/api/v2';

export const load: PageLoad = async ({ fetch }) => {
    // Fungsi untuk mengambil data video awal
    async function fetchInitialVideos(): Promise<VideoData[]> {
        const initialQuery = 'indo';
        const initialPage = 1;
        const url = `${API_BASE}/video/search/?query=${encodeURIComponent(initialQuery)}&per_page=10&page=${initialPage}&thumbsize=big&order=top-weekly&gay=0&lq=0&format=json`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            const data = await response.json();
            return data.videos || [];
        } catch (error) {
            console.error("Failed to fetch initial videos:", error);
            return [];
        }
    }

    // Panggil fungsi dan kembalikan datanya
    // Data ini akan tersedia di +page.svelte sebagai prop 'data'
    return {
        initialVideos: await fetchInitialVideos()
    };
};