/*
============================================================
KUNIO STORY
背景・立ち絵設定
============================================================

立ち絵差分を増やす場合は、
src を別PNGへ差し替えるだけでゲーム本体は変更不要です。
============================================================
*/

window.GORILLA_SCENES = {

  backgrounds: {
    cityDay:   "assets/backgrounds/city-day.webp",
    cafe:      "assets/backgrounds/cafe.webp",
    gym:       "assets/backgrounds/gym.webp",
    cityNight: "assets/backgrounds/city-night.webp",
    hotel:     "assets/backgrounds/hotel.webp"
  },

  standing: {

    normal: {
      src: "assets/standing/gorilla/normal.png",
      scale: 1.05,
      x: 50,
      y: 100,
      filter: "none"
    },

    close: {
      src: "assets/standing/gorilla/normal.png",
      scale: 1.16,
      x: 50,
      y: 101,
      filter: "none"
    },

    power: {
      src: "assets/standing/gorilla/normal.png",
      scale: 1.12,
      x: 50,
      y: 100,
      filter: "contrast(1.04) saturate(1.06)"
    },

    serious: {
      src: "assets/standing/gorilla/normal.png",
      scale: 1.08,
      x: 50,
      y: 100,
      filter: "brightness(.92) contrast(1.08)"
    },

    dark: {
      src: "assets/standing/gorilla/normal.png",
      scale: 1.12,
      x: 50,
      y: 101,
      filter: "brightness(.72) contrast(1.16)"
    }
  }
};
