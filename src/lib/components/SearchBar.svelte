<script>
  export let onSearch;
  let query = '';
  let isActive = false;

  function handleSubmit(e) {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  }
</script>

<form 
  class="search-bar" 
  class:active={isActive}
  on:submit={handleSubmit}
>
  <button type="submit" aria-label="Search">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  </button>
  <input
    type="text"
    placeholder="Search..."
    bind:value={query}
    on:focus={() => isActive = true}
    on:blur={() => isActive = false}
  />
</form>

<style>
  .search-bar {
    display: flex;
    align-items: center;
    background: rgba(30, 30, 30, 0.7);
    backdrop-filter: blur(15px);
    border-radius: 50px;
    padding: 0 15px; /* Ubah padding vertikal ke 0 */
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    z-index: 1000;
    transition: all 0.3s ease;
    width: 250px;
    /* 👇 TINGGI DITETAPKAN DI SINI 👇 */
    height: 44px; 
    box-sizing: border-box; /* Pastikan padding & border termasuk dalam tinggi */
  }

  .search-bar.active {
    width: 300px;
    background: rgba(40, 40, 40, 0.9);
  }

  input {
    border: none;
    background: transparent;
    outline: none;
    flex: 1;
    font-size: 1rem;
    color: white;
    padding-left: 10px;
    font-family: 'Space Mono', monospace;
    height: 100%; /* Pastikan input mengisi tinggi search bar */
  }

  input::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  button {
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 0;
    margin: 0;
    display: flex;
    align-items: center;
    color: rgba(255, 255, 255, 0.7);
    transition: color 0.2s ease;
  }
  
  button:hover {
    color: white;
  }
</style>