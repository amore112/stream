<script>
  export let video;

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
    allowfullscreen
    title={title}
  ></iframe>

  <div class="metadata">
    <h3>{title}</h3>
    <div class="stats">
      <span>{length}</span>
      <span>⭐ {rate}</span>
      <span>👁️ {views}</span>
    </div>
    <div class="keywords">
      {#each keywords as keyword}
        <span class="keyword">{keyword.trim()}</span>
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
</style>