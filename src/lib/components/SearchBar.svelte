<script>
  export let onSearch;

  let query = '';

  function handleSubmit(e) {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  }
</script>

<form class="search-bar" on:submit={handleSubmit}>
  <input
    type="text"
    placeholder="Search videos..."
    bind:value={query}
  />
  <button type="submit">🔍</button>
</form>

<style>
  .search-bar {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border-radius: 30px;
    padding: 12px 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.2);
    z-index: 1000;
    transition: all 0.3s ease;
  }

  .search-bar:hover {
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  }

  input {
    border: none;
    background: transparent;
    outline: none;
    flex: 1;
    font-size: 16px;
    color: white;
  }

  input::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }

  button {
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 18px;
  }
</style>