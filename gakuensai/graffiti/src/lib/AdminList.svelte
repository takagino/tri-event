<script>
  import { onMount } from 'svelte';
  import { supabase } from './supabaseClient';
  import { fade } from 'svelte/transition';

  let drawings = [];
  let isLoading = false;

  let currentPage = 1;
  const itemsPerPage = 12;
  let totalItems = 0;

  const tableName = new URLSearchParams(window.location.search).get('table') || 'drawings';

  async function fetchDrawings(page) {
    isLoading = true;
    try {
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      drawings = data || [];
      totalItems = count || 0;
      currentPage = page;

    } catch (err) {
      console.error(err);
      alert('データの取得に失敗しました');
    } finally {
      isLoading = false;
    }
  }

  async function deleteDrawing(id) {
    if (!confirm(`ID: ${id} を削除してもよろしいですか？`)) return;

    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('削除しました');
      fetchDrawings(currentPage);

    } catch (err) {
      console.error(err);
      alert('削除に失敗しました');
    }
  }

  function getSvgPoints(points) {
    if (!points) return "";
    return points.map(p => `${p.x},${p.y}`).join(' ');
  }

  function getSvgViewBox(paths) {
    if (!paths || paths.length === 0) return "0 0 100 100";
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const path of paths) {
      for (const point of path.points) {
        if (point.x < minX) minX = point.x;
        if (point.x > maxX) maxX = point.x;
        if (point.y < minY) minY = point.y;
        if (point.y > maxY) maxY = point.y;
      }
    }
    const padding = 20;
    return `${minX - padding} ${minY - padding} ${(maxX - minX) + (padding * 2)} ${(maxY - minY) + (padding * 2)}`;
  }

  function goToPage(page) {
    if (page < 1 || page > Math.ceil(totalItems / itemsPerPage)) return;
    fetchDrawings(page);
    const wrapper = document.querySelector('.scroll-wrapper');
    if (wrapper) wrapper.scrollTo(0, 0);
  }

  onMount(() => {
    fetchDrawings(1);
  });
</script>

<svelte:head>
  <title>作品管理 | {tableName}</title>
</svelte:head>

<div class="scroll-wrapper">

  <div class="admin-container">
    <header>
      <h1>作品管理一覧 <span class="table-name">({tableName})</span></h1>
      <p>全 {totalItems} 件</p>
    </header>

    {#if isLoading}
      <div class="loading">読み込み中...</div>
    {:else}
      <div class="grid-container" transition:fade>
        {#each drawings as drawing (drawing.id)}
          <div class="card">
            <div class="preview-area">
              <svg viewBox={getSvgViewBox(drawing.path_data)} preserveAspectRatio="xMidYMid meet">
                {#each drawing.path_data as path}
                  <polyline
                    points={getSvgPoints(path.points)}
                    fill="none"
                    stroke={path.color || "#000"}
                    stroke-width={path.weight || 5}
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                {/each}
              </svg>
            </div>

            <div class="card-footer">
              <div class="info">
                <span class="id">ID: {drawing.id}</span>
                <span class="date">{new Date(drawing.created_at).toLocaleDateString()} {new Date(drawing.created_at).toLocaleTimeString()}</span>
              </div>
              <button class="delete-btn" on:click={() => deleteDrawing(drawing.id)}>
                削除
              </button>
            </div>
          </div>
        {/each}
      </div>

      {#if totalItems > itemsPerPage}
        <div class="pagination">
          <button
            disabled={currentPage === 1}
            on:click={() => goToPage(currentPage - 1)}
          >
            &lt; 前へ
          </button>

          <span class="page-info">
            {currentPage} / {Math.ceil(totalItems / itemsPerPage)}
          </span>

          <button
            disabled={currentPage >= Math.ceil(totalItems / itemsPerPage)}
            on:click={() => goToPage(currentPage + 1)}
          >
            次へ &gt;
          </button>
        </div>
      {/if}
    {/if}
  </div>

</div>

<style>
  .scroll-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100dvh;
    overflow-y: auto;
    background-color: #f4f4f4;
    z-index: 1;
  }

  .admin-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
    padding-bottom: 100px;
  }

  header { text-align: center; margin-bottom: 30px; margin-top: 20px; }
  h1 { margin: 0; color: #333; font-size: 24px; }
  .table-name { font-size: 16px; color: #666; font-weight: normal; }
  .loading { text-align: center; padding: 50px; color: #666; }

  .grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
  }

  .card {
    background: white; border-radius: 12px; overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: flex; flex-direction: column;
    transition: transform 0.2s;
  }
  .card:hover { transform: translateY(-3px); }

  .preview-area {
    width: 100%; aspect-ratio: 1/1; background-color: #fff;
    border-bottom: 1px solid #eee; padding: 10px; box-sizing: border-box;
    display: flex; justify-content: center; align-items: center;
  }
  .preview-area svg { width: 100%; height: 100%; overflow: visible; }

  .card-footer {
    margin-top: auto;
    padding: 10px 15px; display: flex; justify-content: space-between; align-items: center;
    background: #fafafa;
  }
  .info { display: flex; flex-direction: column; font-size: 12px; color: #666; }
  .id { font-weight: bold; color: #333; }

  .delete-btn {
    background: #ff5252; color: white; border: none; padding: 5px 12px;
    border-radius: 4px; cursor: pointer; font-size: 12px;
  }
  .delete-btn:hover { background: #ff1744; }

  .pagination {
    display: flex; justify-content: center; align-items: center; gap: 20px;
    margin-top: 20px; padding-bottom: 40px;
  }
  .pagination button {
    padding: 8px 16px; background: white; border: 1px solid #ddd;
    border-radius: 4px; cursor: pointer; color: #333;
  }
  .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
  .pagination button:hover:not(:disabled) { background: #f0f0f0; }
</style>