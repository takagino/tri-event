class ColorManager {
  constructor() {
    // Keep all the color schemes here
    this.colorSchemes = [
      // === 1. 鮮やかなグラデーション (Vibrant & Smooth) ===
      {
        name: 'Synthwave Sunset',
        colors: ['#F9209D', '#FF5B50', '#FF9A00', '#FFD500', '#F0E68C'],
      },
      {
        name: 'Toxic Lime',
        colors: ['#00FF00', '#7FFF00', '#ADFF2F', '#FFFF00', '#F0E68C'],
      },
      {
        name: 'Electric Blue',
        colors: ['#0000FF', '#007FFF', '#00BFFF', '#00FFFF', '#AFEEEE'],
      },
      {
        name: 'Plasma Haze',
        colors: ['#FF00FF', '#EE82EE', '#DA70D6', '#BA55D3', '#9370DB'],
      },
      {
        name: 'Fire Gradient',
        colors: ['#FFFF00', '#FFD700', '#FFA500', '#FF4500', '#FF0000'],
      },
      {
        name: 'Ice Gradient',
        colors: ['#E0FFFF', '#AFEEEE', '#7FFFD4', '#40E0D0', '#00CED1'],
      },
      {
        name: 'Ocean Deep',
        colors: ['#00FFFF', '#00CED1', '#48D1CC', '#20B2AA', '#40E0D0'],
      },
      {
        name: 'Warm Peach',
        colors: ['#FFE4B5', '#FFDAB9', '#FFA07A', '#FF7F50', '#FF6347'],
      },
      {
        name: 'Lavender Field',
        colors: ['#D8BFD8', '#DDA0DD', '#EE82EE', '#DA70D6', '#BA55D3'],
      },
      {
        name: 'Nebula Haze',
        colors: ['#8A2BE2', '#9932CC', '#FF00FF', '#FF69B4', '#DB7093'],
      },

      // === 2. 高コントラスト (High Contrast) ===
      {
        name: 'Cyberpunk Neon',
        colors: ['#FF00FF', '#00FFFF', '#FFFF00', '#00FF00', '#FF007F'],
      },
      {
        name: 'RGB (Bright)',
        colors: ['#FF3333', '#33FF33', '#3333FF', '#F0F0F0'],
      },
      {
        name: 'Ice & Fire',
        colors: ['#FF4500', '#FFD700', '#00FFFF', '#4682B4', '#B0E0E6'],
      },
      {
        name: 'Pop Art',
        colors: ['#FFD600', '#FF00FF', '#00FFFF', '#00FF00'],
      },
      {
        name: 'Spectrum',
        colors: [
          '#FF0000',
          '#FF7F00',
          '#FFFF00',
          '#00FF00',
          '#0000FF',
          '#9400D3',
        ],
      },

      // === 3. アースカラー系 (明るめ) ===
      {
        name: 'Bright Desert',
        colors: [
          '#F5DEB3',
          '#FFEBCD',
          '#FFDEAD',
          '#F4A460',
          '#E9967A',
          '#CD5C5C',
        ],
      },
      {
        name: 'Spring Forest',
        colors: ['#98FB98', '#3CB371', '#7CFC00', '#ADFF2F', '#90EE90'],
      },
      {
        name: 'Bright Autumn',
        colors: ['#FFD700', '#FFA500', '#FF8C00', '#FF4500', '#DC143C'],
      },
      {
        name: 'Savanna Gold',
        colors: [
          '#FFF8DC',
          '#FFEFD5',
          '#F5DEB3',
          '#DEB887',
          '#DAA520',
          '#FFC107',
        ],
      },
      {
        name: 'Sakura Bright',
        colors: ['#FFF5E4', '#FFE3E1', '#FFD1D1', '#FF9494', '#F08080'],
      },

      // === 4. 単色系・パステル (白・黒を含まない) ===
      {
        name: 'Heatwave (Red)',
        colors: ['#FFEBEE', '#FFCDD2', '#EF9A9A', '#E53935', '#FF1744'],
      },
      {
        name: 'Matrix (Green)',
        colors: ['#C8E6C9', '#A5D6A7', '#81C784', '#7CFC00', '#00FF00'],
      },
      {
        name: 'Gold (Yellow)',
        colors: ['#FFFACD', '#FFEFD5', '#FFD700', '#FFC107', '#FFA000'],
      },
      {
        name: 'Sapphire (Blue)',
        colors: ['#E3F2FD', '#BBDEFB', '#90CAF9', '#64B5F6', '#2196F3'],
      },
      {
        name: 'Amethyst (Purple)',
        colors: ['#F3E5F5', '#E1BEE7', '#CE93D8', '#BA68C8', '#AB47BC'],
      },
      {
        name: 'Faded Pastel',
        colors: ['#FFDFD3', '#D3DFFF', '#DFFFD3', '#FFFDD3', '#FADADD'],
      },
      {
        name: 'Moonlight (Pale)',
        colors: ['#F0F8FF', '#E6E6FA', '#D6D6FF', '#B0C4DE', '#C0D0E0'],
      },
      {
        name: 'Rose Quartz',
        colors: ['#FFF0F5', '#FFE4E1', '#FFC0CB', '#FFB6C1', '#FF69B4'],
      },
      {
        name: 'Industrial Fire',
        colors: ['#C0C0C0', '#A9A9A9', '#778899', '#FFA07A', '#FF7F50'],
      },
      {
        name: 'Oceanic Blues',
        colors: ['#E0FFFF', '#AFEEEE', '#00BFFF', '#4169E1', '#0000CD'],
      },
    ];
  }

  // ★ Method to get a random palette (as p5.Color objects) and its name
  getRandomPalette() {
    const scheme = random(this.colorSchemes);
    const palette = scheme.colors.map((c) => color(c)); // Convert hex to p5.Color
    return { name: scheme.name, colors: palette };
  }
}
