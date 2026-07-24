/**
 * 就職実績ダッシュボード用 静的データ (Webデザイン学科 特化版)
 * 2024年卒〜2027年卒のデータを定義しています。
 * 卒年ごとの切り替えボタンによって、表示するデータが自動的に切り替わります。
 */
const careerData = {
  meta: {
    schoolName: "トライデントコンピュータ専門学校",
    departmentName: "Webデザイン学科",
    updatedDate: "2026年5月22日現在"
  },

  // 各年度のデータ
  years: {
    "2023": {
      summary: {
        employmentRate: 100.0,
        industryRate: 55.5,
        averageApplied: 3.2,
        maxApplied: 8,
        totalGraduates: 18,
        securedPaths: 18
      },
      jobTypeBreakdown: [
        { name: "Webデザイナー", percentage: 33.3, count: 6, color: "#2563eb" },
        { name: "Webエンジニア", percentage: 22.2, count: 4, color: "#0d9488" },
        { name: "Webディレクター", percentage: 0.0, count: 0, color: "#7c3aed" },
        { name: "Webマーケター", percentage: 0.0, count: 0, color: "#ea580c" },
        { name: "Web関連の営業", percentage: 11.1, count: 2, color: "#be123c" },
        { name: "IT系", percentage: 16.7, count: 3, color: "#4338ca" },
        { name: "一般職", percentage: 16.7, count: 3, color: "#4b5563" }
      ],
      regionBreakdown: [
        { name: "名古屋", percentage: 55.6, count: 10, color: "#2563eb" },
        { name: "愛知県", percentage: 11.1, count: 2, color: "#3b82f6" },
        { name: "岐阜県", percentage: 5.6, count: 1, color: "#0d9488" },
        { name: "三重県", percentage: 0.0, count: 0, color: "#059669" },
        { name: "東京都", percentage: 16.7, count: 3, color: "#7c3aed" },
        { name: "その他", percentage: 11.1, count: 2, color: "#4b5563" }
      ],
      industryBreakdown: [
        { name: "Web制作会社", percentage: 80.0, count: 8, color: "#2563eb" },
        { name: "印刷会社", percentage: 0.0, count: 0, color: "#b45309" },
        { name: "ECサイト運営会社", percentage: 10.0, count: 1, color: "#0d9488" },
        { name: "自社サービス運営会社", percentage: 10.0, count: 1, color: "#7c3aed" },
        { name: "一般企業", percentage: 0.0, count: 0, color: "#4b5563" }
      ],
      monthlyTrends: {
        months: ["〜3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月", "1月", "2月", "3月"],
        monthlyCount: [1, 0, 1, 2, 0, 2, 2, 2, 0, 3, 1, 3, 1],
        cumulativeCount: [1, 1, 2, 4, 4, 6, 8, 10, 10, 13, 14, 17, 18]
      },
    },
    "2024": {
      summary: {
        employmentRate: 100.0,
        industryRate: 68.4,
        averageApplied: 6.2,
        maxApplied: 19,
        totalGraduates: 18,
        securedPaths: 18
      },
      jobTypeBreakdown: [
        { name: "Webデザイナー", percentage: 33.3, count: 6, color: "#2563eb" },
        { name: "Webエンジニア", percentage: 33.3, count: 6, color: "#0d9488" },
        { name: "Webディレクター", percentage: 0.0, count: 0, color: "#7c3aed" },
        { name: "Webマーケター", percentage: 5.6, count: 1, color: "#ea580c" },
        { name: "Web関連の営業", percentage: 5.6, count: 1, color: "#be123c" },
        { name: "IT系", percentage: 0.0, count: 0, color: "#4338ca" },
        { name: "一般職", percentage: 22.2, count: 4, color: "#4b5563" }
      ],
      regionBreakdown: [
        { name: "名古屋", percentage: 55.6, count: 10, color: "#2563eb" },
        { name: "愛知県", percentage: 16.7, count: 3, color: "#3b82f6" },
        { name: "岐阜県", percentage: 5.6, count: 1, color: "#0d9488" },
        { name: "三重県", percentage: 0.0, count: 0, color: "#059669" },
        { name: "東京都", percentage: 16.7, count: 3, color: "#7c3aed" },
        { name: "その他", percentage: 5.6, count: 1, color: "#4b5563" }
      ],
      industryBreakdown: [
        { name: "Web制作会社", percentage: 64.3, count: 9, color: "#2563eb" },
        { name: "印刷会社", percentage: 14.3, count: 2, color: "#b45309" },
        { name: "ECサイト運営会社", percentage: 0.0, count: 0, color: "#0d9488" },
        { name: "自社サービス運営会社", percentage: 21.4, count: 3, color: "#7c3aed" },
        { name: "一般企業", percentage: 0.0, count: 0, color: "#4b5563" }
      ],
      monthlyTrends: {
        months: ["〜3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月", "1月", "2月", "3月"],
        monthlyCount: [1, 0, 2, 2, 2, 0, 3, 2, 1, 1, 1, 2, 1],
        cumulativeCount: [1, 1, 3, 5, 7, 7, 10, 12, 13, 14, 15, 17, 18]
      },
    },
    "2025": {
      summary: {
        employmentRate: 100.0,
        industryRate: 65.2,
        averageApplied: 3.4,
        maxApplied: 9,
        totalGraduates: 23,
        securedPaths: 23
      },
      jobTypeBreakdown: [
        { name: "Webデザイナー", percentage: 26.1, count: 6, color: "#2563eb" },
        { name: "Webエンジニア", percentage: 26.1, count: 6, color: "#0d9488" },
        { name: "Webディレクター", percentage: 8.7, count: 2, color: "#7c3aed" },
        { name: "Webマーケター", percentage: 4.3, count: 1, color: "#ea580c" },
        { name: "Web関連の営業", percentage: 0.0, count: 0, color: "#be123c" },
        { name: "IT系", percentage: 17.4, count: 4, color: "#4338ca" },
        { name: "一般職", percentage: 17.4, count: 4, color: "#4b5563" }
      ],
      regionBreakdown: [
        { name: "名古屋", percentage: 65.2, count: 15, color: "#2563eb" },
        { name: "愛知県", percentage: 8.7, count: 2, color: "#3b82f6" },
        { name: "岐阜県", percentage: 0.0, count: 0, color: "#0d9488" },
        { name: "三重県", percentage: 13.0, count: 3, color: "#059669" },
        { name: "東京都", percentage: 8.7, count: 2, color: "#7c3aed" },
        { name: "その他", percentage: 4.3, count: 1, color: "#4b5563" }
      ],
      industryBreakdown: [
        { name: "Web制作会社", percentage: 80.0, count: 12, color: "#2563eb" },
        { name: "印刷会社", percentage: 13.3, count: 2, color: "#b45309" },
        { name: "ECサイト運営会社", percentage: 0.0, count: 0, color: "#0d9488" },
        { name: "自社サービス運営会社", percentage: 6.7, count: 1, color: "#7c3aed" },
        { name: "一般企業", percentage: 0.0, count: 0, color: "#4b5563" }
      ],
      monthlyTrends: {
        months: ["〜3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月", "1月", "2月", "3月"],
        monthlyCount: [0, 0, 1, 3, 1, 1, 6, 2, 2, 0, 4, 2, 1],
        cumulativeCount: [0, 0, 1, 4, 5, 6, 12, 14, 16, 16, 20, 22, 23]
      },
    },
    "2026": {
      summary: {
        employmentRate: 5.2,
        industryRate: 100.0,
        averageApplied: 1.8,
        maxApplied: 6,
        totalGraduates: 19,
        securedPaths: 2
      },
      jobTypeBreakdown: [
        { name: "Webデザイナー", percentage: 50.0, count: 1, color: "#2563eb" },
        { name: "Webエンジニア", percentage: 50.0, count: 1, color: "#0d9488" },
        { name: "Webディレクター", percentage: 0, count: 0, color: "#7c3aed" },
        { name: "Webマーケター", percentage: 0, count: 0, color: "#ea580c" },
        { name: "Web関連の営業", percentage: 0, count: 0, color: "#be123c" },
        { name: "IT系", percentage: 0, count: 0, color: "#4338ca" },
        { name: "一般職", percentage: 0, count: 0, color: "#4b5563" }
      ],
      regionBreakdown: [
        { name: "名古屋", percentage: 100, count: 2, color: "#2563eb" },
        { name: "愛知県", percentage: 0, count: 0, color: "#3b82f6" },
        { name: "岐阜県", percentage: 0, count: 0, color: "#0d9488" },
        { name: "三重県", percentage: 0, count: 0, color: "#059669" },
        { name: "東京都", percentage: 0, count: 0, color: "#7c3aed" },
        { name: "その他", percentage: 0, count: 0, color: "#4b5563" }
      ],
      industryBreakdown: [
        { name: "Web制作会社", percentage: 100, count: 2, color: "#2563eb" },
        { name: "印刷会社", percentage: 0, count: 0, color: "#b45309" },
        { name: "ECサイト運営会社", percentage: 0, count: 0, color: "#0d9488" },
        { name: "自社サービス運営会社", percentage: 0, count: 0, color: "#7c3aed" },
        { name: "一般企業", percentage: 0, count: 0, color: "#4b5563" }
      ],
      monthlyTrends: {
        months: ["〜3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月", "1月", "2月", "3月"],
        monthlyCount: [0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        cumulativeCount: [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
      },
    }
  }
};
