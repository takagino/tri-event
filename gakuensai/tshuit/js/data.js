/**
 * ----------------------------------------------------------------
 * データ定義
 * ----------------------------------------------------------------
 */

const designs = [
  { file: 'umatonin_black', text: '馬トニン（黒）' },
  { file: 'crowd_human', text: '群像 人間' },
  { file: 'crowd_bird', text: '群像 鳥' },
  { file: 'photo_cat_black', text: '写真 猫（黒）' },
  { file: 'photo_dog_black', text: '写真 犬（黒）' },
  { file: 'photo_woman_black', text: '写真 女性（黒）' },
  { file: 'graphic_bomb', text: '爆弾' },
  { file: 'graphic_chemical', text: '化学' },
  { file: 'graphic_sawirl', text: '渦巻き' },
  { file: 'graphic_starfish', text: 'ヒトデ' },
  { file: 'animal_friendship_black', text: '友達（黒）' },
  { file: 'animal_brotherhood_black', text: '兄弟（黒）' },
  { file: 'animal_horse_black', text: '馬（黒）' },
  { file: 'animal_flamingo_black', text: 'フラミンゴ（黒）' },
  { file: 'animal_buddy', text: 'バディ' },
  { file: 'animal_friends', text: '仲良し' },
  { file: 'animal_nose', text: '鼻' },
  { file: 'animal_octopus_black', text: 'タコ（黒）' },
  { file: 'bird_piyo_black', text: 'ぴよ（黒）' },
  { file: 'bird_mame_black', text: 'まめ（黒）' },
  { file: 'vehicle01', text: '乗り物01' },
  { file: 'vehicle02', text: '乗り物02' },
  { file: 'vehicle03', text: '乗り物03' },
  { file: 'vehicle04', text: '乗り物04' },
  { file: 'vehicle05', text: '乗り物05' },
  { file: 'flower01', text: '花01' },
  { file: 'flower02', text: '花02' },
  { file: 'flower03', text: '花03' },
  { file: 'town_street_black', text: '裏道（黒）' },
  { file: 'town_trip_black', text: '旅（黒）' },
  { file: 'town_home_black', text: '街並み（黒）' },
  { file: 'town_man_black', text: '黄昏（黒）' },
  { file: 'town_music01_black', text: '歌手 女性（黒）' },
  { file: 'town_music02_black', text: '歌手 男性（黒）' },
  { file: 'trident01_black', text: 'トライデント01（黒）' },
  { file: 'trident02_black', text: 'トライデント02（黒）' },
  { file: 'trident03_black', text: 'トライデント03（黒）' },
  { file: 'trident04_black', text: 'トライデント04（黒）' },
  { file: 'trident05_black', text: 'トライデント05（黒）' },
  { file: 'trident_kishi', text: 'トライデント06' },
];

// 価格表
const prices = {
  longT: { white: 2000, color: 2700 },
  shortT: { white: 1800, color: 2500 },
  flatPouch: { natural: 1100, color: 1800 },
  dailyPouch: { natural: 1200, color: 1900 },
  sacoche: { natural: 1200, color: 1900 },
  towel: { white: 1000 },
};

// アイテム一覧 (prices を参照するため、prices の後に定義)
const items = {
  longT: {
    text: 'ロングTシャツ',
    colors: [
      {
        color: 'ffffff',
        text: 'ホワイト',
        file: 'white',
        price: prices.longT.white,
      },
      {
        color: '000000',
        text: 'ブラック',
        file: 'black',
        price: prices.longT.color,
      },
      {
        color: 'c7c7c7',
        text: 'グレー',
        file: 'gray',
        price: prices.longT.color,
      },
      {
        color: '363928',
        text: 'アーミーグリーン',
        file: 'army_green',
        price: prices.longT.color,
      },
      {
        color: '111739',
        text: 'ネイビー',
        file: 'navy',
        price: prices.longT.color,
      },
      {
        color: '3f60c5',
        text: 'ブルー',
        file: 'blue',
        price: prices.longT.color,
      },
      // {
      //   color: '0096bd',
      //   text: 'ターコイズ',
      //   file: 'turquoise',
      //   price: prices.longT.color,
      // },
      {
        color: '2e1c72',
        text: 'パープル',
        file: 'purple',
        price: prices.longT.color,
      },
      // {
      //   color: 'f9cc01',
      //   text: 'デイジー',
      //   file: 'daisy',
      //   price: prices.longT.color,
      // },
      // {
      //   color: 'efd657',
      //   text: 'イエロー',
      //   file: 'yellow',
      //   price: prices.longT.color,
      // },
      {
        color: 'ef4f12',
        text: 'オレンジ',
        file: 'orange',
        price: prices.longT.color,
      },
      {
        color: 'de1e1b',
        text: 'レッド',
        file: 'red',
        price: prices.longT.color,
      },
      {
        color: '6e1d23',
        text: 'バーガンディ',
        file: 'burgundy',
        price: prices.longT.color,
      },
      // {
      //   color: 'e068a3',
      //   text: 'ピンク',
      //   file: 'pink',
      //   price: prices.longT.color,
      // },
      // {
      //   color: 'eecfd5',
      //   text: 'ライトピンク',
      //   file: 'light_pink',
      //   price: prices.longT.color,
      // },
    ],
  },
  shortT: {
    text: '半袖Tシャツ',
    colors: [
      {
        color: 'ffffff',
        text: 'ホワイト',
        file: 'white',
        price: prices.shortT.white,
      },
      {
        color: '000000',
        text: 'ブラック',
        file: 'black',
        price: prices.shortT.color,
      },
      {
        color: 'c7c7c7',
        text: 'グレー',
        file: 'gray',
        price: prices.shortT.color,
      },
      {
        color: '363928',
        text: 'アーミーグリーン',
        file: 'army_green',
        price: prices.shortT.color,
      },
      {
        color: '111739',
        text: 'ネイビー',
        file: 'navy',
        price: prices.shortT.color,
      },
      {
        color: '3f60c5',
        text: 'ブルー',
        file: 'blue',
        price: prices.shortT.color,
      },
      {
        color: '0096bd',
        text: 'ターコイズ',
        file: 'turquoise',
        price: prices.shortT.color,
      },
      {
        color: '2e1c72',
        text: 'パープル',
        file: 'purple',
        price: prices.shortT.color,
      },
      {
        color: 'f9cc01',
        text: 'デイジー',
        file: 'daisy',
        price: prices.shortT.color,
      },
      {
        color: 'efd657',
        text: 'イエロー',
        file: 'yellow',
        price: prices.shortT.color,
      },
      {
        color: 'ef4f12',
        text: 'オレンジ',
        file: 'orange',
        price: prices.shortT.color,
      },
      {
        color: 'de1e1b',
        text: 'レッド',
        file: 'red',
        price: prices.shortT.color,
      },
      {
        color: '6e1d23',
        text: 'バーガンディ',
        file: 'burgundy',
        price: prices.shortT.color,
      },
      {
        color: 'e068a3',
        text: 'ピンク',
        file: 'pink',
        price: prices.shortT.color,
      },
      {
        color: 'eecfd5',
        text: 'ライトピンク',
        file: 'light_pink',
        price: prices.shortT.color,
      },
    ],
  },
  flatPouch: {
    text: 'フラットポーチ',
    colors: [
      {
        color: 'e8e2d2',
        text: 'ナチュラル',
        file: 'natural',
        price: prices.flatPouch.natural,
      },
      {
        color: '000000',
        text: 'ブラック',
        file: 'black',
        price: prices.flatPouch.color,
      },
      {
        color: '111739',
        text: 'ネイビー',
        file: 'navy',
        price: prices.flatPouch.color,
      },
    ],
  },
  dailyPouch: {
    text: 'デイリーポーチ',
    colors: [
      {
        color: 'e8e2d2',
        text: 'ナチュラル',
        file: 'natural',
        price: prices.dailyPouch.natural,
      },
      {
        color: '000000',
        text: 'ブラック',
        file: 'black',
        price: prices.dailyPouch.color,
      },
      {
        color: '111739',
        text: 'ネイビー',
        file: 'navy',
        price: prices.dailyPouch.color,
      },
    ],
  },
  sacoche: {
    text: 'サコッシュ',
    colors: [
      {
        color: 'e8e2d2',
        text: 'ナチュラル',
        file: 'natural',
        price: prices.sacoche.natural,
      },
      {
        color: '000000',
        text: 'ブラック',
        file: 'black',
        price: prices.sacoche.color,
      },
      {
        color: '111739',
        text: 'ネイビー',
        file: 'navy',
        price: prices.sacoche.color,
      },
    ],
  },
  towel: {
    text: 'タオル',
    colors: [
      {
        color: 'ffffff',
        text: 'ホワイト',
        file: 'white',
        price: prices.towel.white,
      },
    ],
  },
};

// Google Form 設定
const GOOGLE_FORM_BASE_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSfAhM068p3GgVOS9hGZKPcHGHhHArVV7aMNavgl-AVG-fABPQ/viewform?usp=header';

const FORM_FIELD_MAPPING = {
  item: 'entry.60526283',
  color: 'entry.1390317263',
  design: 'entry.1444093927',
  price: 'entry.59921916',
};
