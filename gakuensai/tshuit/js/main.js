/**
 * ----------------------------------------------------------------
 * メインスクリプト (ロジック)
 * * ※ このスクリプトは data.js の後に読み込むこと
 * ----------------------------------------------------------------
 */
document.addEventListener('DOMContentLoaded', () => {
  // --- DOM要素のキャッシュ ---
  const itemSelect = document.getElementById('item-select');
  const colorSwatchesContainer = document.getElementById('color-swatches');
  const previewImage = document.getElementById('preview-image');
  const designImage = document.getElementById('design-image');
  const prevDesignButton = document.getElementById('prev-design');
  const nextDesignButton = document.getElementById('next-design');

  const designColorSwitcher = document.getElementById('design-color-switcher');

  // サマリー表示用
  const summaryItem = document.getElementById('summary-item');
  const summaryColor = document.getElementById('summary-color');
  const summaryDesign = document.getElementById('summary-design');
  const summaryPrice = document.getElementById('summary-price');

  // モーダル用
  const openFormButton = document.getElementById('open-form-button');
  const modalOverlay = document.getElementById('modal-overlay');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const formIframe = document.getElementById('form-iframe');
  const iframeLoader = document.getElementById('iframe-loader');

  // --- アプリケーションの状態 ---
  let currentDesignIndex = 0; // 0 = 'デザインなし'
  let currentDesignColor = 'black'; // 'black' または 'white'

  // --- 初期化関数 ---

  /**
   * アイテム選択 <select> を初期化
   */
  function initializeItemSelect() {
    Object.keys(items).forEach((key) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = items[key].text;
      itemSelect.appendChild(option);
    });
  }

  // --- UI更新関数 ---

  /**
   * 選択されたアイテムに基づき、色見本を再構築する
   */
  function updateColorSwatches() {
    const currentType = itemSelect.value;
    const colors = items[currentType].colors;

    colorSwatchesContainer.innerHTML = ''; // 既存の色見本をクリア

    colors.forEach((color, index) => {
      const label = document.createElement('label');
      label.className = 'color-label';
      label.title = color.text;

      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'color';
      radio.value = color.file;

      if (index === 0) {
        radio.checked = true; // 最初の色をデフォルト選択
      }

      const swatch = document.createElement('div');
      swatch.className = 'color-swatch';
      swatch.style.backgroundColor = `#${color.color}`;

      label.appendChild(radio);
      label.appendChild(swatch);
      colorSwatchesContainer.appendChild(label);
    });

    // 色見本を更新したら、ベース画像とサマリーも更新
    updateBaseImage();
  }

  /**
   * ベース画像 (Tシャツ等) を更新する
   */
  function updateBaseImage() {
    const currentType = itemSelect.value;
    const selectedRadio = document.querySelector('input[name="color"]:checked');
    if (!selectedRadio) return;

    const currentColorFile = selectedRadio.value;
    const imagePath = `images/${currentType}/${currentColorFile}.png`;
    previewImage.src = imagePath;

    // altテキストも更新
    const colorObj = items[currentType].colors.find(
      (c) => c.file === currentColorFile
    );
    const colorText = colorObj ? colorObj.text : currentColorFile;
    const itemText = items[currentType].text;
    previewImage.alt = `${itemText}（${colorText}）`;

    // 関連するUIも更新
    updateDesignImageVisibility();
    updateSummary();
  }

  /**
   * デザイン画像を更新する (白黒切り替えロジックを含む)
   */
  function updateDesignImage() {
    const selectedDesign = designs[currentDesignIndex];
    // ファイル名が '_black' で終わるか (白黒バリエーションがあるか)
    const hasColorVariants = selectedDesign.file.endsWith('_black');

    if (hasColorVariants) {
      // 白黒バリエーションあり
      designColorSwitcher.style.display = 'flex'; // 切り替えUIを表示

      // ボタンの active クラスを更新
      updateDesignColorButtons();

      // 'white' が選ばれていれば '_white', それ以外は '_black'
      const colorSuffix = currentDesignColor === 'white' ? '_white' : '_black';
      // ベースファイル名 (例: 'photo_cat_black' -> 'photo_cat')
      const baseFile = selectedDesign.file.replace('_black', '');

      const imagePath = `images/design/${baseFile}${colorSuffix}.png`;
      designImage.src = imagePath;
      designImage.alt = selectedDesign.text; // altはサマリーで処理
    } else {
      // 1色のみ (または 'none')
      designColorSwitcher.style.display = 'none'; // 切り替えUIを非表示
      // currentDesignColor = 'black'; // 1色のデザインに切り替わったら黒にリセット

      if (selectedDesign.file === 'none') {
        designImage.src = '';
        designImage.alt = '';
      } else {
        const imagePath = `images/design/${selectedDesign.file}.png`;
        designImage.src = imagePath;
        designImage.alt = selectedDesign.text;
      }
    }
    updateDesignImageVisibility(); // opacity 制御はそのまま実行
  }

  /**
   * 白黒ボタンの見た目(activeクラス)を更新する
   */
  function updateDesignColorButtons() {
    const buttons = designColorSwitcher.querySelectorAll('.design-color-btn');
    buttons.forEach((btn) => {
      if (btn.dataset.color === currentDesignColor) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  /**
   * デザイン画像の表示/非表示を切り替える
   */
  function updateDesignImageVisibility() {
    const selectedDesign = designs[currentDesignIndex];

    const designControlGroup = prevDesignButton.closest('.control-group');
    designControlGroup.style.display = 'block';

    if (selectedDesign.file === 'none') {
      designImage.style.opacity = '0';
    } else {
      designImage.style.opacity = '1';
    }
  }

  /**
   * 「現在の選択」サマリーを更新 (白黒テキスト差し替えを含む)
   */
  function updateSummary() {
    const currentType = itemSelect.value;
    const selectedRadio = document.querySelector('input[name="color"]:checked');
    const selectedDesign = designs[currentDesignIndex];
    const colorObj = items[currentType].colors.find(
      (c) => c.file === selectedRadio.value
    );

    summaryItem.textContent = items[currentType].text;
    summaryColor.textContent = colorObj ? colorObj.text : '---';

    // デザイン名 (白黒差し替え処理)
    let designText = selectedDesign.text;
    if (selectedDesign.file.endsWith('_black')) {
      if (currentDesignColor === 'white') {
        designText = designText.replace('（黒）', '（白）');
      }
      // 'black' の場合は元のテキスト (（黒）) のまま
    }
    summaryDesign.textContent = designText;

    const price = colorObj ? colorObj.price : 0;
    summaryPrice.textContent = price.toLocaleString();
  }

  // --- モーダル関数 ---

  /**
   * Google Form モーダルを開き、選択内容を自動入力する
   */
  function openModal() {
    iframeLoader.style.display = 'block';
    formIframe.style.visibility = 'hidden';

    const params = new URLSearchParams();
    params.append(FORM_FIELD_MAPPING.item, summaryItem.textContent);
    params.append(FORM_FIELD_MAPPING.color, summaryColor.textContent);
    params.append(FORM_FIELD_MAPPING.design, summaryDesign.textContent);
    params.append(FORM_FIELD_MAPPING.price, summaryPrice.textContent);

    const separator = GOOGLE_FORM_BASE_URL.includes('?') ? '&' : '?';
    const finalUrl = `${GOOGLE_FORM_BASE_URL}${separator}${params.toString()}`;

    formIframe.src = finalUrl;
    modalOverlay.style.display = 'flex';
  }

  /**
   * モーダルを閉じる
   */
  function closeModal() {
    modalOverlay.style.display = 'none';
    formIframe.src = '';
  }

  // iframe読み込み完了時にローダーを非表示
  formIframe.onload = () => {
    iframeLoader.style.display = 'none';
    formIframe.style.visibility = 'visible';
  };

  // --- イベントリスナーの設定 ---

  // アイテム変更
  itemSelect.addEventListener('change', () => {
    updateColorSwatches();
  });

  // カラー変更
  colorSwatchesContainer.addEventListener('change', updateBaseImage);

  // デザイン「次へ」
  nextDesignButton.addEventListener('click', () => {
    currentDesignIndex++;
    if (currentDesignIndex >= designs.length) {
      currentDesignIndex = 0;
    }
    // currentDesignColor = 'black'; // ★削除: ここで色をリセットしない
    updateDesignImage();
    updateSummary();
  });

  // デザイン「前へ」
  prevDesignButton.addEventListener('click', () => {
    currentDesignIndex--;
    if (currentDesignIndex < 0) {
      currentDesignIndex = designs.length - 1;
    }
    // currentDesignColor = 'black'; // ★削除: ここで色をリセットしない
    updateDesignImage();
    updateSummary();
  });

  // 白黒切り替えボタン (イベント委任)
  designColorSwitcher.addEventListener('click', (e) => {
    if (
      e.target.classList.contains('design-color-btn') &&
      !e.target.classList.contains('active')
    ) {
      const color = e.target.dataset.color; // 'white' or 'black'
      currentDesignColor = color;
      updateDesignImage(); // 画像を更新
      updateSummary(); // サマリーテキストを更新
    }
  });

  // フォームボタン
  openFormButton.addEventListener('click', openModal);
  modalCloseBtn.addEventListener('click', closeModal);

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });

  // --- 初期表示の実行 ---
  initializeItemSelect();
  updateColorSwatches();
  updateDesignImage();
  updateSummary();
});
