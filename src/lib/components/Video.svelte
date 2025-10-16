<script>
  import { createEventDispatcher } from 'svelte';

  export let video;
  const dispatch = createEventDispatcher();

  function handleKeywordClick(keyword) {
    dispatch('keywordsearch', keyword);
  }

  $: embedUrl = video.embed;
  $: title = video.title;
  $: length = video.length_min;
  $: rate = video.rate;
  $: views = video.views;
  $: keywords = video.keywords.split(',').filter(k => k.trim());
</script>

<div class="video-container">
  <iframe
    src={embedUrl}
    width="100%"
    height="100%"
    frameborder="0"
    allow="autoplay; fullscreen"
    title={title}
  ></iframe>

  <div class="metadata">
    <div class="title-container">
      <h3>{title}</h3>
    </div>
    
    <div class="stats">
      <span>{length}</span>
      <span>⭐ {rate}</span>
      <span>👁️ {views}</span>
    </div>
    <div class="keywords">
      {#each keywords as keyword}
        <span
          class="keyword"
          on:click={() => handleKeywordClick(keyword.trim())}
          on:keypress={() => handleKeywordClick(keyword.trim())}
          role="button"
          tabindex="0"
        >
          {keyword.trim()}
        </span>
      {/each}
    </div>
  </div>
</div>

<style>
  .video-container {
    position: relative;
    width: 100%;
    height: 100vh;
    background: black;
  }

  iframe {
    width: 100%;
    height: 100%;
  }

  .metadata {
    font-family: 'Space Mono', monospace;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 24px;
    padding-bottom: 70px;
    color: white;
    text-shadow: 0px 1px 5px rgba(0, 0, 0, 0.7);
    pointer-events: none;
  }

  .title-container {
    width: 100%;
    overflow: hidden;
    position: relative;
  }
  
  .title-container h3 {
    font-size: 1rem;
    margin-bottom: 12px;
    white-space: nowrap;
    display: inline-block;
    padding-left: 100%;
    animation: marquee 15s linear infinite;
  }

  @keyframes marquee {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-100%);
    }
  }

  .stats {
    display: flex;
    gap: 15px;
    margin: 10px 0;
    font-size: 0.85rem;
  }

  .keywords {
    display: flex;
    gap: 10px;
    margin-top: 10px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    pointer-events: auto;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .keywords::-webkit-scrollbar {
    display: none;
  }

  .keyword {
    background: rgba(30, 30, 30, 0.7);
    backdrop-filter: blur(10px);
    padding: 6px 12px;
    border-radius: 20px;
    white-space: nowrap;
    border: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 0.8rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  /* 👇 ATURAN CSS YANG LENGKAP ADA DI SINI 👇 */
  .keyword:hover {
    background: rgba(50, 50, 50, 0.9);
  }
</style>