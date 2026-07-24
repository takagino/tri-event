<script>
  import { onMount } from 'svelte';
  import { Router, Route, Link, navigate } from "svelte-routing";
  import { fade } from 'svelte/transition';

  import P5Canvas from './lib/P5Canvas.svelte';
  import Display from './lib/Display.svelte';
  import ModelCanvas from './lib/ModelCanvas.svelte';
  import AdminList from './lib/AdminList.svelte';

  export const url = "";
  let queryString = "";
  let currentPath = "";

  let showAdminMenu = false;
  let longPressTimer;
  const LONG_PRESS_DURATION = 2000; // 2秒

  if (typeof window !== 'undefined') {
    queryString = window.location.search;
    currentPath = window.location.pathname;
  }

  function checkActive({ location, href }) {
    const linkPath = new URL(href, window.location.origin).pathname;
    currentPath = location.pathname;

    if (currentPath.includes('/model') || currentPath.includes('/list')) {
      showAdminMenu = true;
    }

    if (linkPath === location.pathname) {
      return { "aria-current": "page" };
    }
    return {};
  }

  function handlePressStart() {
    longPressTimer = setTimeout(() => {
      showAdminMenu = !showAdminMenu;
      alert(showAdminMenu ? "管理者メニュー: ON" : "管理者メニュー: OFF");
    }, LONG_PRESS_DURATION);
  }

  function handlePressEnd() {
    clearTimeout(longPressTimer);
  }

  onMount(() => {
    const handleKeydown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'v' || e.key === 'V') {
        showAdminMenu = !showAdminMenu;
        console.log("Admin Menu Toggled");
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

<Router {url}>
  <main>
    <nav
      on:mousedown|stopPropagation
      on:touchstart|stopPropagation
      on:touchmove|stopPropagation
      on:touchend|stopPropagation
      on:click|stopPropagation
    >
      <div class="nav-item"
           on:mousedown={handlePressStart}
           on:mouseup={handlePressEnd}
           on:mouseleave={handlePressEnd}
           on:touchstart={handlePressStart}
           on:touchend={handlePressEnd}
           on:contextmenu|preventDefault
      >
        <Link to={"/" + queryString} getProps={checkActive} title="お絵描き画面へ">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.333 16.048L16.57 3.81a2.56 2.56 0 0 1 3.62 3.619L7.951 19.667a2 2 0 0 1-1.022.547L3 21l.786-3.93a2 2 0 0 1 .547-1.022z"/><path d="M14.5 6.5l3 3"/></svg>
        </Link>
      </div>

      <Link to={"/display" + queryString} getProps={checkActive} title="表示画面へ">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z"/><path d="M8 20h8"/></svg>
      </Link>

      {#if showAdminMenu}
        <div class="divider" transition:fade></div>

        <Link to={"/model" + queryString} getProps={checkActive} title="見本作成(Model)">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
        </Link>

        <Link to={"/list" + queryString} getProps={checkActive} title="管理リスト(List)">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
        </Link>
      {/if}

    </nav>

    <Route path="/">
      <P5Canvas />
    </Route>
    <Route path="/display">
      <Display />
    </Route>
    <Route path="/model">
      <ModelCanvas />
    </Route>
    <Route path="/list">
      <AdminList />
    </Route>
  </main>
</Router>

<style>
  nav {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 100;
    background: rgba(255, 255, 255, 0.8);
    padding: 5px 15px;
    border-radius: 30px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    display: flex;
    gap: 15px;
    align-items: center;
    user-select: none;
    -webkit-user-select: none;
  }

  .divider {
    width: 1px;
    height: 24px;
    background-color: #ccc;
    margin: 0 5px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  :global(nav a) {
    color: #333;
    display: flex;
    align-items: center;
    transition: opacity 0.2s;
    -webkit-user-drag: none;
  }

  :global(nav a:hover) {
    opacity: 0.6;
  }

  :global(nav a[aria-current="page"]) {
    color: #e91e63;
  }

  nav svg {
    width: 24px;
    height: 24px;
  }
</style>