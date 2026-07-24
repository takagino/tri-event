/**
 * 就職実績ダッシュボード アプリケーションロジック (Webデザイン学科 特化・シンプル版)
 * data.js で定義された careerData を元に動的表示と Chart.js の制御を行います。
 */

// グローバル状態管理
let selectedYear = "2026"; // 初期選択年度
let jobTypeChartInstance = null;
let regionChartInstance = null;
let industryChartInstance = null;
let monthlyTrendChartInstance = null;
let compareDataCache = null;

// 月毎の就職活動状況の解説文（ツールチップに表示）
const monthlyExplanation = {
  "〜3月": "【準備期間】\n就活の最大の武器となる「ポートフォリオ（作品集）」制作、自己分析、業界研究などを徹底します。",
  "4月": "【春採用スタート】\n企業の採用が一斉に開始。本学科では1年次から繋がる早期選考や面接が本格的に動き出します。",
  "5月": "【選考の活発化】\n面接試験や作品審査が集中。1次面接から次のステップへとスピード感を持って進みます。",
  "6月": "【内定獲得のピーク】\n採用活動の最盛期。内定（内々定）通知が本格化し、最初の成果が出る重要な時期です。",
  "7月": "【夏前のアプローチ】\n選考継続中。夏休み前に向け、採用を続ける優良・中堅企業へ積極的にアプローチします。",
  "8月": "【夏期選考・見直し】\n夏期休暇を利用した個別面接の実施。同時に、応募書類や作品集の手直しを行います。",
  "9月": "【秋採用スタート】\n後期授業の開始とともに、追加募集などの「秋採用」に向けた選考が本格化します。",
  "10月": "【内定式・秋冬採用】\n多くの企業で内定式を実施。同時に、秋冬の採用枠を狙う個別エントリーを進めます。",
  "11月": "【IT系等への並行応募】\nIT系（システム開発等）へも視野を広げた「並行応募」を開始。選択肢を広げてチャンスを最大化します。",
  "12月": "【年内内定への集中対策】\n年内の進路決定を目指し、学校求人との個別マッチングや面接対策を徹底して行います。",
  "1月": "【幅広い情報収集】\n年明けの追加求人を狙い、学校求人だけでなく「転職サイト」や「ハローワーク」等も活用して広くアプローチします。",
  "2月": "【春休み中の継続サポート】\n春休みに入りますが、内定獲得に向けて全力でサポートを継続します。",
  "3月": "【進路決定・社会人への準備】\n全員の進路決定を完了させ、社会人として羽ばたくための準備を整えます。"
};

/**
 * 現在アクティブなデータ（単一年度または統計データ）を返す
 */
function getActiveData() {
  if (selectedYear === "compare") {
    return getCompareData();
  }
  return careerData.years[selectedYear];
}

/**
 * 全年度のデータを集計して統計用オブジェクトを作成する
 */
function getCompareData() {
  if (compareDataCache) return compareDataCache;

  const years = Object.keys(careerData.years).sort();

  let totalGraduates = 0;
  let securedPaths = 0;
  let totalEmploymentRate = 0;
  let totalIndustryRate = 0;
  let totalAverageApplied = 0;
  let maxAppliedValue = 0;

  years.forEach(year => {
    const s = careerData.years[year].summary;
    totalGraduates += s.totalGraduates;
    securedPaths += s.securedPaths;
    totalEmploymentRate += s.employmentRate;
    totalIndustryRate += s.industryRate;
    totalAverageApplied += s.averageApplied;
    if (s.maxApplied && s.maxApplied > maxAppliedValue) {
      maxAppliedValue = s.maxApplied;
    }
  });

  const countYears = years.length;

  const summary = {
    employmentRate: totalEmploymentRate / countYears,
    industryRate: totalIndustryRate / countYears,
    averageApplied: totalAverageApplied / countYears,
    maxApplied: maxAppliedValue,
    totalGraduates: totalGraduates,
    securedPaths: securedPaths
  };

  // 職種割合の集計
  const jobTypeMap = {};
  years.forEach(year => {
    careerData.years[year].jobTypeBreakdown.forEach(item => {
      if (!jobTypeMap[item.name]) {
        jobTypeMap[item.name] = { count: 0, color: item.color };
      }
      jobTypeMap[item.name].count += item.count;
    });
  });
  const jobTypeBreakdown = Object.keys(jobTypeMap).map(name => {
    const count = jobTypeMap[name].count;
    const percentage = (count / securedPaths) * 100;
    return { name, percentage, count, color: jobTypeMap[name].color };
  });

  // 地域別の集計
  const regionMap = {};
  years.forEach(year => {
    careerData.years[year].regionBreakdown.forEach(item => {
      if (!regionMap[item.name]) {
        regionMap[item.name] = { count: 0, color: item.color };
      }
      regionMap[item.name].count += item.count;
    });
  });
  const regionBreakdown = Object.keys(regionMap).map(name => {
    const count = regionMap[name].count;
    const percentage = (count / securedPaths) * 100;
    return { name, percentage, count, color: regionMap[name].color };
  });

  // 業種別の集計
  const industryMap = {};
  years.forEach(year => {
    careerData.years[year].industryBreakdown.forEach(item => {
      if (!industryMap[item.name]) {
        industryMap[item.name] = { count: 0, color: item.color };
      }
      industryMap[item.name].count += item.count;
    });
  });
  const industryBreakdown = Object.keys(industryMap).map(name => {
    const count = industryMap[name].count;
    const percentage = (count / securedPaths) * 100;
    return { name, percentage, count, color: industryMap[name].color };
  });

  compareDataCache = {
    summary,
    jobTypeBreakdown,
    regionBreakdown,
    industryBreakdown
  };

  return compareDataCache;
}

document.addEventListener("DOMContentLoaded", () => {
  // データがロードされているか確認
  if (typeof careerData === "undefined") {
    console.error("careerData が定義されていません。data.js が正しく読み込まれているか確認してください。");
    return;
  }

  // 1. 基本メタ情報のセットアップ
  setupMetaInfo();

  // 2. 年度切り替えの初期化
  initYearSwitcher();

  // 3. KPI（サマリー数値）の表示
  updateKPIs();

  // 4. 各種グラフの初期化 (Chart.js)
  initCharts();

  // 5. プレゼン・コントロール（高コントラストモード、フルスクリーン）
  initPresentationControls();

  // 6. 個人面談スケジュールの初期化 (NEW)
  initSchedule();
});

/**
 * ページの基本メタ情報（学校名、更新日など）を埋め込む
 */
function setupMetaInfo() {
  const meta = careerData.meta;
  document.getElementById("school-name").textContent = meta.schoolName;
  document.getElementById("department-name").textContent = `${meta.departmentName} 就職実績`;
  if (selectedYear === "compare") {
    document.getElementById("target-year").textContent = "全体統計";
  } else {
    const gradYear = parseInt(selectedYear) + 1;
    document.getElementById("target-year").textContent = `${gradYear}年卒実績`;
  }
  document.getElementById("update-date").textContent = `※ ${meta.updatedDate} 時点`;
}

/**
 * 年度切り替えボタングループの初期化
 */
function initYearSwitcher() {
  const pills = document.querySelectorAll(".year-pill");
  pills.forEach(pill => {
    // 初期状態のアクティブ設定
    if (pill.getAttribute("data-year") === selectedYear) {
      pill.classList.add("active");
      pill.setAttribute("aria-checked", "true");
    } else {
      pill.classList.remove("active");
      pill.setAttribute("aria-checked", "false");
    }

    pill.addEventListener("click", () => {
      const targetYear = pill.getAttribute("data-year");
      if (targetYear === selectedYear) return;

      // アクティブ切り替え
      pills.forEach(p => {
        p.classList.remove("active");
        p.setAttribute("aria-checked", "false");
      });
      pill.classList.add("active");
      pill.setAttribute("aria-checked", "true");

      selectedYear = targetYear;

      // データの更新
      if (selectedYear === "compare") {
        document.getElementById("target-year").textContent = "全体統計";
      } else {
        const gradYear = parseInt(selectedYear) + 1;
        document.getElementById("target-year").textContent = `${gradYear}年卒実績`;
      }
      updateKPIs();
      updateCharts();
    });
  });
}

/**
 * 選択された年度のデータに基づいてKPI数値を更新 (アニメーションは行わず即時表示)
 */
function updateKPIs() {
  const yearData = getActiveData();
  const summary = yearData.summary;

  // 各種数値を即時表示
  setKpiValue("kpi-emp-rate", summary.employmentRate, "%");
  setKpiValue("kpi-ind-rate", summary.industryRate, "%");

  // 応募社数の平均と最大を表示
  const avgObj = document.getElementById("kpi-avg-applied");
  if (avgObj) {
    const avgVal = summary.averageApplied % 1 !== 0 ? summary.averageApplied.toFixed(1) : Math.floor(summary.averageApplied);
    const maxVal = summary.maxApplied || 0;
    avgObj.innerHTML = `${avgVal}<span class="kpi-unit">社</span><span class="kpi-max-value" style="font-size: 1.25rem; font-weight: 700; color: var(--text-muted); margin-left: 8px;">(最大${maxVal}社)</span>`;
  }

  // 決定者数と卒業者数
  document.getElementById("kpi-secured").innerHTML = summary.securedPaths + `<span class="kpi-unit">名</span>`;
  document.getElementById("kpi-graduates").innerHTML = summary.totalGraduates + `<span class="kpi-unit">名</span>`;

  // プログレスバーの更新
  document.getElementById("bar-emp-rate").style.width = `${summary.employmentRate}%`;
  document.getElementById("bar-ind-rate").style.width = `${summary.industryRate}%`;

  const securedRate = (summary.securedPaths / summary.totalGraduates) * 100;
  document.getElementById("bar-secured-rate").style.width = `${securedRate}%`;
}

/**
 * KPIの数値をフォーマットしてHTMLにセットするヘルパー関数
 */
function setKpiValue(id, value, suffix = "") {
  const obj = document.getElementById(id);
  if (!obj) return;
  const isDecimal = value % 1 !== 0;
  if (isDecimal) {
    obj.innerHTML = value.toFixed(1) + `<span class="kpi-unit">${suffix}</span>`;
  } else {
    obj.innerHTML = Math.floor(value) + `<span class="kpi-unit">${suffix}</span>`;
  }
}

/**
 * Chart.js を使用したグラフの初期化
 */
function initCharts() {
  const yearData = getActiveData();

  // Chart.jsのデフォルトフォントとカラーを設定 (ライトテーマに最適化)
  Chart.defaults.font.family = "'Outfit', 'Noto Sans JP', sans-serif";
  Chart.defaults.font.size = 15;
  Chart.defaults.color = "#475569"; // text-secondary
  Chart.defaults.plugins.tooltip.backgroundColor = "rgba(15, 23, 42, 0.9)";
  Chart.defaults.plugins.tooltip.borderColor = "#e2e8f0";
  Chart.defaults.plugins.tooltip.borderWidth = 1;
  Chart.defaults.plugins.tooltip.titleFont = { weight: 'bold', size: 18 };
  Chart.defaults.plugins.tooltip.bodyFont = { size: 16 };
  Chart.defaults.plugins.tooltip.padding = 12;
  Chart.defaults.plugins.tooltip.cornerRadius = 8;

  // 1. 職種割合グラフ (Doughnut Chart)
  const ctxJob = document.getElementById("jobTypeChart").getContext("2d");
  jobTypeChartInstance = new Chart(ctxJob, {
    type: 'doughnut',
    data: {
      labels: yearData.jobTypeBreakdown.map(item => item.name),
      datasets: [{
        data: yearData.jobTypeBreakdown.map(item => item.percentage),
        backgroundColor: yearData.jobTypeBreakdown.map(item => item.color),
        borderWidth: 2,
        borderColor: "#ffffff",
        hoverOffset: 12
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            boxWidth: 16,
            padding: 16,
            font: { size: 16, weight: '700' },
            color: '#0f172a'
          }
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const index = context.dataIndex;
              const activeData = getActiveData();
              const item = activeData.jobTypeBreakdown[index];
              return ` 割合: ${context.parsed.toFixed(1)}% (${item.count}名)`;
            }
          }
        }
      },
      cutout: '65%'
    }
  });

  // 2. 地域別就職割合グラフ (Doughnut Chart) - NEW
  const ctxRegion = document.getElementById("regionChart").getContext("2d");
  regionChartInstance = new Chart(ctxRegion, {
    type: 'doughnut',
    data: {
      labels: yearData.regionBreakdown.map(item => item.name),
      datasets: [{
        data: yearData.regionBreakdown.map(item => item.percentage),
        backgroundColor: yearData.regionBreakdown.map(item => item.color),
        borderWidth: 2,
        borderColor: "#ffffff",
        hoverOffset: 12
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            boxWidth: 16,
            padding: 16,
            font: { size: 16, weight: '700' },
            color: '#0f172a'
          }
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const index = context.dataIndex;
              const activeData = getActiveData();
              const item = activeData.regionBreakdown[index];
              return ` 割合: ${context.parsed.toFixed(1)}% (${item.count}名)`;
            }
          }
        }
      },
      cutout: '65%'
    }
  });

  // 3. 業種割合グラフ (Horizontal Bar Chart)
  const ctxIndustry = document.getElementById("industryChart").getContext("2d");
  industryChartInstance = new Chart(ctxIndustry, {
    type: 'bar',
    data: {
      labels: yearData.industryBreakdown.map(item => item.name),
      datasets: [{
        label: '割合 (%)',
        data: yearData.industryBreakdown.map(item => item.percentage),
        backgroundColor: yearData.industryBreakdown.map(item => item.color || '#2563eb'),
        borderRadius: 4,
        borderWidth: 0,
        barThickness: 22
      }]
    },
    options: {
      indexAxis: 'y', // 横棒にする
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const index = context.dataIndex;
              const activeData = getActiveData();
              const item = activeData.industryBreakdown[index];
              return ` 割合: ${context.parsed.toFixed(1)}% (${item.count}名)`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: '#e2e8f0' },
          ticks: { font: { size: 15, weight: '700' }, color: '#475569' },
          min: 0,
          max: 100,
          title: {
            display: true,
            text: '割合 (%)',
            font: { size: 16, weight: 'bold' }
          }
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 15, weight: '700' }, color: '#0f172a' }
        }
      }
    }
  });

  // 4. 月毎の内定推移グラフの初期化
  updateMonthlyTrendChart();
}

/**
 * 選択年度のデータに基づいてグラフを更新
 */
function updateCharts() {
  if (!jobTypeChartInstance || !regionChartInstance || !industryChartInstance) return;

  const yearData = getActiveData();

  // 1. 職種割合グラフの更新
  jobTypeChartInstance.data.labels = yearData.jobTypeBreakdown.map(item => item.name);
  jobTypeChartInstance.data.datasets[0].data = yearData.jobTypeBreakdown.map(item => item.percentage);
  jobTypeChartInstance.data.datasets[0].backgroundColor = yearData.jobTypeBreakdown.map(item => item.color);
  jobTypeChartInstance.update();

  // 2. 地域別就職割合グラフの更新
  regionChartInstance.data.labels = yearData.regionBreakdown.map(item => item.name);
  regionChartInstance.data.datasets[0].data = yearData.regionBreakdown.map(item => item.percentage);
  regionChartInstance.data.datasets[0].backgroundColor = yearData.regionBreakdown.map(item => item.color);
  regionChartInstance.update();

  // 3. 業種割合グラフの更新
  industryChartInstance.data.labels = yearData.industryBreakdown.map(item => item.name);
  industryChartInstance.data.datasets[0].data = yearData.industryBreakdown.map(item => item.percentage);
  industryChartInstance.data.datasets[0].backgroundColor = yearData.industryBreakdown.map(item => item.color || '#2563eb');
  industryChartInstance.update();

  // 4. 月毎内定グラフの更新 (再生成)
  updateMonthlyTrendChart();
}

/**
 * プレゼン・コントロール（高コントラストモード、フルスクリーン）の初期化
 */
function initPresentationControls() {
  // 1. 高コントラストモード（黒背景）切り替え (プロジェクター用)
  const contrastBtn = document.getElementById("toggle-contrast");
  contrastBtn.addEventListener("click", () => {
    document.body.classList.toggle("high-contrast");

    const isHighContrast = document.body.classList.contains("high-contrast");
    contrastBtn.title = isHighContrast ? "ライトモードに戻す" : "黒背景モード (プロジェクター用)";

    // ライトモードと高コントラストダークモード用カラー定義
    const newTextColor = isHighContrast ? "#e5e7eb" : "#475569";
    const labelColor = isHighContrast ? "#ffffff" : "#0f172a";
    const newGridColor = isHighContrast ? "rgba(255, 255, 255, 0.15)" : "#e2e8f0";

    updateChartColors(newTextColor, labelColor, newGridColor, isHighContrast);
  });

  // 2. フルスクリーン切り替え
  const fullscreenBtn = document.getElementById("toggle-fullscreen");
  fullscreenBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        alert(`フルスクリーン表示に失敗しました: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  });

  document.addEventListener("fullscreenchange", () => {
    const isFs = !!document.fullscreenElement;
    const svgPath = fullscreenBtn.querySelector("svg");
    if (isFs) {
      fullscreenBtn.title = "フルスクリーン解除";
      svgPath.innerHTML = '<path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7" />';
    } else {
      fullscreenBtn.title = "フルスクリーン表示";
      svgPath.innerHTML = '<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />';
    }
  });
}

/**
 * コントラストモードに合わせてグラフの色を更新する
 */
function updateChartColors(textColor, labelColor, gridColor, isHighContrast) {
  Chart.defaults.color = textColor;

  // ドーナツグラフの切れ目線
  const doughnutBorderColor = isHighContrast ? "#111827" : "#ffffff";

  if (jobTypeChartInstance) {
    jobTypeChartInstance.options.plugins.legend.labels.color = labelColor;
    jobTypeChartInstance.data.datasets[0].borderColor = doughnutBorderColor;
    jobTypeChartInstance.update();
  }

  if (regionChartInstance) {
    regionChartInstance.options.plugins.legend.labels.color = labelColor;
    regionChartInstance.data.datasets[0].borderColor = doughnutBorderColor;
    regionChartInstance.update();
  }

  if (industryChartInstance) {
    industryChartInstance.options.scales.x.ticks.color = textColor;
    industryChartInstance.options.scales.x.grid.color = gridColor;
    industryChartInstance.options.scales.x.title.color = textColor;
    industryChartInstance.options.scales.y.ticks.color = labelColor;
    industryChartInstance.update();
  }

  if (monthlyTrendChartInstance) {
    updateMonthlyTrendChart();
  }
}

/**
 * 月毎の内定推移グラフ（単一年度 vs 全年度統計）の動的描画・更新処理
 */
function updateMonthlyTrendChart() {
  if (monthlyTrendChartInstance) {
    monthlyTrendChartInstance.destroy();
  }

  const ctxMonthly = document.getElementById("monthlyTrendChart").getContext("2d");
  const isHighContrast = document.body.classList.contains("high-contrast");
  const textColor = isHighContrast ? "#e5e7eb" : "#475569";
  const labelColor = isHighContrast ? "#ffffff" : "#0f172a";
  const gridColor = isHighContrast ? "rgba(255, 255, 255, 0.15)" : "#e2e8f0";

  // タイトル表示用のテキストを変更
  const trendCard = document.getElementById("monthlyTrendChart").closest(".card");
  const trendTitleEl = trendCard ? trendCard.querySelector(".card-title") : null;

  if (selectedYear === "compare") {
    if (trendTitleEl) {
      trendTitleEl.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 3v18h18"></path>
          <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>
        </svg>
        全体の累計内定獲得推移 (統計)
      `;
    }

    // 各年度のデータと色定義
    const yearColors = {
      "2023": isHighContrast ? "#2dd4bf" : "#0d9488",
      "2024": isHighContrast ? "#60a5fa" : "#2563eb",
      "2025": isHighContrast ? "#fb923c" : "#ea580c",
      "2026": isHighContrast ? "#c084fc" : "#7c3aed"
    };

    const datasets = Object.keys(careerData.years).sort().map(year => {
      const yearData = careerData.years[year];
      const gradYear = parseInt(year) + 1;
      return {
        label: `${gradYear}年卒 累計 (人)`,
        data: yearData.monthlyTrends.cumulativeCount,
        borderColor: yearColors[year],
        backgroundColor: "transparent",
        borderWidth: year === "2026" ? 4 : 2.5, // 最新年度を少し太く
        pointBackgroundColor: yearColors[year],
        pointBorderColor: "#ffffff",
        pointBorderWidth: 1.5,
        pointRadius: year === "2026" ? 4.5 : 3.5,
        pointHoverRadius: 6,
        tension: 0.15
      };
    });

    monthlyTrendChartInstance = new Chart(ctxMonthly, {
      type: 'line',
      data: {
        labels: careerData.years["2026"].monthlyTrends.months,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 22,
              padding: 18,
              font: { size: 16, weight: '700' },
              color: labelColor
            }
          },
          tooltip: {
            backgroundColor: "rgba(15, 23, 42, 0.9)",
            borderColor: isHighContrast ? "rgba(255,255,255,0.2)" : "#e2e8f0",
            borderWidth: 1,
            titleColor: "#ffffff",
            bodyColor: "#ffffff",
            titleFont: { weight: 'bold', size: 18 },
            bodyFont: { size: 16 },
            footerFont: { size: 15, weight: 'normal' },
            footerColor: isHighContrast ? "#cbd5e1" : "#94a3b8",
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              footer: function (tooltipItems) {
                const label = tooltipItems[0].label;
                const explanation = monthlyExplanation[label];
                return explanation ? `\n${explanation}` : "";
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { font: { size: 15, weight: '700' }, color: textColor }
          },
          yMonthly: {
            type: 'linear',
            position: 'left',
            min: 0,
            max: 30, // 累計内定者数の上限を30に固定
            grid: { color: gridColor },
            ticks: { font: { size: 15 }, color: textColor },
            title: {
              display: true,
              text: '累計内定者数 (人)',
              font: { size: 16, weight: 'bold' },
              color: textColor
            }
          },
          yCumulative: {
            display: false // 統計時は右側の重複軸は非表示
          }
        }
      }
    });
  } else {
    if (trendTitleEl) {
      trendTitleEl.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-orange)" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 3v18h18"></path>
          <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>
        </svg>
        月毎の内定獲得推移 (単月内定者数 ＆ 累計合計)
      `;
    }

    const yearData = careerData.years[selectedYear];

    // グラデーションの作成
    const cumulativeGradient = ctxMonthly.createLinearGradient(0, 0, 0, 300);
    if (isHighContrast) {
      cumulativeGradient.addColorStop(0, 'rgba(168, 85, 247, 0.3)');
      cumulativeGradient.addColorStop(1, 'rgba(168, 85, 247, 0.0)');
    } else {
      cumulativeGradient.addColorStop(0, 'rgba(124, 58, 237, 0.15)');
      cumulativeGradient.addColorStop(1, 'rgba(124, 58, 237, 0.0)');
    }

    monthlyTrendChartInstance = new Chart(ctxMonthly, {
      type: 'bar',
      data: {
        labels: yearData.monthlyTrends.months,
        datasets: [
          {
            label: 'その月の内定者数 (人)',
            type: 'bar',
            data: yearData.monthlyTrends.monthlyCount,
            backgroundColor: isHighContrast ? '#3b82f6' : '#2563eb',
            borderRadius: 3,
            yAxisID: 'yMonthly',
            barPercentage: 0.5
          },
          {
            label: '累計内定者数 (人) [合計]',
            type: 'line',
            data: yearData.monthlyTrends.cumulativeCount,
            borderColor: isHighContrast ? '#a855f7' : '#7c3aed',
            borderWidth: 3,
            pointBackgroundColor: isHighContrast ? '#a855f7' : '#7c3aed',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: true,
            backgroundColor: cumulativeGradient,
            yAxisID: 'yCumulative',
            tension: 0.15
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 22,
              padding: 18,
              font: { size: 16, weight: '700' },
              color: labelColor
            }
          },
          tooltip: {
            backgroundColor: "rgba(15, 23, 42, 0.9)",
            borderColor: isHighContrast ? "rgba(255,255,255,0.2)" : "#e2e8f0",
            borderWidth: 1,
            titleColor: "#ffffff",
            bodyColor: "#ffffff",
            titleFont: { weight: 'bold', size: 18 },
            bodyFont: { size: 16 },
            footerFont: { size: 15, weight: 'normal' },
            footerColor: "#ffffff",
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              footer: function (tooltipItems) {
                const label = tooltipItems[0].label;
                const explanation = monthlyExplanation[label];
                return explanation ? `\n${explanation}` : "";
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { font: { size: 15, weight: '700' }, color: textColor }
          },
          yMonthly: {
            type: 'linear',
            position: 'left',
            min: 0,
            max: 30, // その月の内定者数の上限を30に固定
            grid: { color: gridColor },
            ticks: { font: { size: 15 }, color: textColor },
            title: {
              display: true,
              text: 'その月の内定者数 (人)',
              font: { size: 16, weight: 'bold' },
              color: textColor
            }
          },
          yCumulative: {
            type: 'linear',
            position: 'right',
            min: 0,
            max: 30, // 累計内定者数の上限を30に固定
            grid: { drawOnChartArea: false },
            ticks: { font: { size: 15 }, color: textColor },
            title: {
              display: true,
              text: '累計内定者数 (人)',
              font: { size: 16, weight: 'bold' },
              color: textColor
            }
          }
        }
      }
    });
  }
}

/**
 * 個人面談スケジュールの初期化 (モーダル開閉、イベントハンドラ設定)
 */
function initSchedule() {
  const toggleBtn = document.getElementById("toggle-schedule");
  const modal = document.getElementById("schedule-modal");
  const closeBtn = document.getElementById("close-schedule");
  const overlay = document.getElementById("schedule-modal-overlay");

  if (!toggleBtn || !modal || !closeBtn || !overlay) return;

  // モーダルを開く
  const openModal = () => {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden"; // 背景スクロール無効化
  };

  // モーダルを閉じる
  const closeModal = () => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = ""; // スクロール復元
  };

  toggleBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);

  // Escキーで閉じる
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) {
      closeModal();
    }
  });

  // スケジュールデータの読み込みと描画
  loadScheduleData();
}

/**
 * スケジュールデータの読み込みとテーブル描画
 */
function loadScheduleData() {
  if (typeof scheduleData !== "undefined") {
    renderScheduleTable(scheduleData);
  } else {
    // schedule.js が読み込めなかった場合のフォールバック
    const fallbackData = {
      "startTime": "1440",
      "participants": [
        "佐藤 様",
        "鈴木 様",
        "高橋 様",
        "田中 様",
        "伊藤 様",
        "渡辺 様"
      ]
    };
    renderScheduleTable(fallbackData);
  }
}

/**
 * 開始時間のパース (例: "1440" or 1440 -> { hours: 14, minutes: 40 })
 */
function parseStartTime(timeVal) {
  let timeStr = String(timeVal).replace(":", "").trim();
  if (timeStr.length === 3) {
    timeStr = "0" + timeStr;
  }
  if (timeStr.length !== 4) {
    return { hours: 14, minutes: 0 }; // デフォルト fallback
  }
  const hours = parseInt(timeStr.substring(0, 2), 10);
  const minutes = parseInt(timeStr.substring(2, 4), 10);
  return {
    hours: isNaN(hours) ? 14 : hours,
    minutes: isNaN(minutes) ? 0 : minutes
  };
}

/**
 * 分を加算する処理
 */
function addMinutes(hours, minutes, minsToAdd) {
  const totalMins = hours * 60 + minutes + minsToAdd;
  const newHours = Math.floor(totalMins / 60) % 24;
  const newMins = totalMins % 60;
  return { hours: newHours, minutes: newMins };
}

/**
 * 時間表示フォーマット (HH:MM)
 */
function formatTime(hours, minutes) {
  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  return `${hh}:${mm}`;
}

/**
 * テーブルのHTML要素生成とバインド
 */
function renderScheduleTable(data) {
  const tbody = document.getElementById("schedule-table-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  const start = parseStartTime(data.startTime);
  const participants = data.participants || [];

  participants.forEach((name, index) => {
    // 10分刻みで時間を計算
    const timeObj = addMinutes(start.hours, start.minutes, index * 10);
    const timeFormatted = formatTime(timeObj.hours, timeObj.minutes);

    const tr = document.createElement("tr");

    // 時間のセル (SVG時計アイコン入り)
    const tdTime = document.createElement("td");
    tdTime.innerHTML = `
      <span class="schedule-time">
        <span class="schedule-time-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </span>
        ${timeFormatted}〜
      </span>
    `;

    // 名前のセル
    const tdName = document.createElement("td");
    tdName.innerHTML = `<span class="schedule-name">${name}</span>`;

    tr.appendChild(tdTime);
    tr.appendChild(tdName);
    tbody.appendChild(tr);
  });
}
