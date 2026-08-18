/*
============================================================
KUNIO STORY
分岐・ポイント専用ファイル
============================================================

文章は content/text.js。
ここでは
・次に進むノード
・ポイント
・フラグ
・背景
・立ち絵状態
だけを管理します。
============================================================
*/

window.GORILLA_FLOW = {

  startNode: "prologue_meet",

  nodes: {

    prologue_meet: {
      background: "cityDay",
      standing: "normal",
      choices: {
        a: {
          next: "cafe_intro",
          score: {trust: 2, love: 1}
        },
        b: {
          next: "cafe_intro",
          score: {chaos: 1, gorilla: 2}
        },
        c: {
          next: "cafe_intro",
          score: {trust: 1, dark: 1}
        }
      }
    },

    cafe_intro: {
      background: "cafe",
      standing: "normal",
      choices: {
        a: {
          next: "cafe_normal",
          score: {trust: 1, love: 1}
        },
        b: {
          next: "cafe_weird",
          score: {chaos: 2, gorilla: 1}
        },
        c: {
          next: "cafe_masculine",
          score: {love: 1, dark: 1, gorilla: 1}
        }
      }
    },

    cafe_normal: {
      background: "cafe",
      standing: "close",
      choices: {
        a: {
          next: "date_select",
          score: {trust: 2}
        },
        b: {
          next: "date_select",
          score: {trust: 2, love: 1}
        },
        c: {
          next: "date_select",
          score: {chaos: 1, love: 1}
        }
      }
    },

    cafe_weird: {
      background: "cafe",
      standing: "close",
      choices: {
        a: {
          next: "date_select",
          score: {chaos: 1, gorilla: 2},
          flags: {pokeca: true}
        },
        b: {
          next: "date_select",
          score: {chaos: 2, dark: 1, gorilla: 3},
          flags: {collarInterest: true}
        },
        c: {
          next: "date_select",
          score: {chaos: 3, gorilla: 4}
        }
      }
    },

    cafe_masculine: {
      background: "cafe",
      standing: "serious",
      choices: {
        a: {
          next: "date_select",
          score: {muscle: 2, gorilla: 3}
        },
        b: {
          next: "date_select",
          score: {trust: 3, love: 2}
        },
        c: {
          next: "date_select",
          score: {chaos: 1, trust: 1}
        }
      }
    },

    date_select: {
      background: "cityDay",
      standing: "normal",
      choices: {
        a: {
          next: "date_normal",
          score: {love: 1}
        },
        b: {
          next: "date_gym",
          score: {muscle: 2, gorilla: 4},
          flags: {gym: true}
        },
        c: {
          next: "date_chaos",
          score: {chaos: 2, dark: 1, gorilla: 3},
          flags: {leaveItToGorilla: true}
        }
      }
    },

    date_normal: {
      background: "cityDay",
      standing: "normal",
      choices: {
        a: {
          next: "relationship",
          score: {love: 2, trust: 1}
        },
        b: {
          next: "relationship",
          score: {chaos: 1, gorilla: 2},
          flags: {pokeca: true}
        },
        c: {
          next: "relationship",
          score: {trust: 2, love: 1}
        }
      }
    },

    date_gym: {
      background: "gym",
      standing: "power",
      choices: {
        a: {
          next: "relationship",
          score: {trust: 2, muscle: 2}
        },
        b: {
          next: "relationship",
          score: {chaos: 2, gorilla: 5, muscle: 3},
          flags: {competition: true}
        },
        c: {
          next: "relationship",
          score: {love: 2, muscle: 2}
        }
      }
    },

    date_chaos: {
      background: "cityNight",
      standing: "serious",
      choices: {
        a: {
          next: "relationship",
          score: {trust: 2, chaos: 2, dark: 2, gorilla: 2}
        },
        b: {
          next: "relationship",
          score: {trust: 2, chaos: 1}
        },
        c: {
          next: "relationship",
          score: {trust: 1, chaos: 1, gorilla: 1}
        }
      }
    },

    relationship: {
      background: "cafe",
      standing: "close",
      choices: {
        a: {
          next: "gap_scene",
          score: {love: 3, trust: 1}
        },
        b: {
          next: "gap_scene",
          score: {love: 2, dark: 1, trust: 1}
        },
        c: {
          next: "arm_scene",
          score: {chaos: 2, gorilla: 4},
          flags: {arm: true}
        }
      }
    },

    arm_scene: {
      background: "gym",
      standing: "power",
      choices: {
        a: {
          next: "gap_scene",
          score: {love: 2, chaos: 2, gorilla: 5, muscle: 2},
          flags: {arm: true}
        },
        b: {
          next: "gap_scene",
          score: {love: 1, chaos: 1},
          flags: {arm: true}
        },
        c: {
          next: "gap_scene",
          score: {trust: 2, love: 1, chaos: 1},
          flags: {arm: true}
        }
      }
    },

    gap_scene: {
      background: "cityNight",
      standing: "serious",
      choices: {
        a: {
          next: "night_scene",
          score: {trust: 3, love: 2}
        },
        b: {
          next: "night_scene",
          score: {trust: 3, love: 2, dark: 1}
        },
        c: {
          next: "night_scene",
          score: {chaos: 2, gorilla: 1, love: 1}
        }
      }
    },

    night_scene: {
      background: "cityNight",
      standing: "close",
      choices: {
        a: {
          next: "night_walk",
          score: {love: 2, trust: 1}
        },
        b: {
          next: "hotel_scene",
          score: {dark: 3, trust: 1, gorilla: 1},
          flags: {nightTrust: true}
        },
        c: {
          next: "final_choice",
          score: {trust: 2}
        }
      }
    },

    night_walk: {
      background: "cityNight",
      standing: "close",
      choices: {
        a: {
          next: "final_choice",
          score: {love: 3, trust: 1}
        },
        b: {
          next: "final_choice",
          score: {love: 2, trust: 2}
        },
        c: {
          next: "final_choice",
          score: {chaos: 3, gorilla: 4}
        }
      }
    },

    hotel_scene: {
      background: "hotel",
      standing: "dark",
      choices: {
        a: {
          next: "final_choice",
          score: {trust: 2, dark: 2}
        },
        b: {
          next: "final_choice",
          score: {trust: 2, dark: 3, chaos: 2, gorilla: 2},
          flags: {darkTrust: true}
        },
        c: {
          next: "final_choice",
          score: {trust: 3, love: 2}
        }
      }
    },

    final_choice: {
      background: "cityNight",
      standing: "normal",
      choices: {
        a: {
          end: true,
          score: {love: 2, trust: 1}
        },
        b: {
          end: true,
          score: {chaos: 1, muscle: 2, gorilla: 3}
        },
        c: {
          end: true,
          score: {chaos: 3, gorilla: 4, dark: 1},
          flags: {finalLeaveToGorilla: true}
        }
      }
    }
  }
};
