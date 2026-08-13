/*
============================================================
KUNIO STORY V1.1
文章編集専用ファイル
============================================================

ここは自由に編集OKです。

変更してよい：
・セリフ
・ナレーション
・選択肢
・タイトル
・END文章
・ボタン表示文

変更しない：
・キー名（prologue_meet など）
・a / b / c
・{ } や ,

ゲームの分岐やポイントは config/story-flow.js に分離されています。
============================================================
*/

window.GORILLA_TEXT = {

  ui: {
    brand: "KUNIO STORY",
    titleKicker: "A DAY WITH KUNIO",
    title: "今日は、俺に任せる？",
    lead: "待ち合わせから始まる、くにおとの一日。\n何を選ぶかで、見える顔も、たどり着く夜も変わります。",
    start: "くにおに会いに行く",

    nameKicker: "BEFORE THE DATE",
    nameQuestion: "今日は、なんて呼ばれたい？",
    nameHelp: "入力した名前はゲーム中だけ使用します。",
    namePlaceholder: "例：さくら",
    nameSubmit: "この名前で待ち合わせへ",
    nameSkip: "名前を入れずに始める",

    next: "続ける",
    ending: "この一日の結末を見る",

    xLink: "Xでくにおを見る",
    retry: "もう一度、違う一日を過ごす",
    collection: "END COLLECTION",

    collectionTitle: "ENDING COLLECTION",
    collectionHelp: "発見済み END：{found} / {total}",
    found: "FOUND",
    unknown: "？？？",
    notFound: "未発見",

    gorillaWarning: "警告\nゴリラレベルが規定値を超えました。",
    trueWarningTitle: "判定不能",
    trueWarningLead: "筋肉と混沌とユーモアを選び続けた結果、\nシステムが“くにお”を正常に認識できなくなりました。",
    trueWarningButton: "それでも進む"
  },

  nodes: {

    prologue_meet: {
      chapter: "PROLOGUE",
      title: "待ち合わせ",
      speaker: "くにお",
      text: "「○○、お待たせ。」\n\n写真で見るより、近くで見るくにおは――かなり大きい。",
      choices: {
        a: "思っていたより優しそう",
        b: "写真より圧がありますね",
        c: "ちょっと緊張してきた"
      }
    },

    cafe_intro: {
      chapter: "CHAPTER 1",
      title: "俺ってどんな人？",
      speaker: "くにお",
      text: "カフェに入ると、俺はあなたの歩幅に合わせて席まで向かう。\n\n「○○。せっかくだから、俺に聞きたいこと何でも聞いていいよ。」",
      choices: {
        a: "普段の俺について聞く",
        b: "俺の変なところを知りたい",
        c: "男らしいところを知りたい"
      }
    },

    cafe_normal: {
      chapter: "CHAPTER 1",
      title: "意外と普通？",
      speaker: "くにお",
      text: "「休みの日？ 普通にご飯食べて、カード触って、筋トレしてるよ。」\n\n……普通の定義に若干の違和感がある。",
      choices: {
        a: "休みの日をもっと聞く",
        b: "どうしてセラピストをしているの？",
        c: "意外とちゃんとしてるんですね"
      }
    },

    cafe_weird: {
      chapter: "CHAPTER 1",
      title: "俺の世界",
      speaker: "くにお",
      text: "「変なところ？」\n\n俺が少し考える。\n\n「ポケカが好きなのと……○○に首輪つけて散歩とか？」",
      choices: {
        a: "ポケカの方を詳しく",
        b: "今さらっと首輪って言いました？",
        c: "もっと変なのあります？"
      }
    },

    cafe_masculine: {
      chapter: "CHAPTER 1",
      title: "見た目の奥",
      speaker: "くにお",
      text: "「男らしいところかあ。」\n\n少し照れたように笑う。\n\n「力仕事なら任せて。あと、○○が嫌な思いすることはなるべく避けたい。」",
      choices: {
        a: "筋肉について聞く",
        b: "そういう気遣いは嬉しい",
        c: "見た目はちょっと怖いけど"
      }
    },

    date_select: {
      chapter: "CHAPTER 2",
      title: "今日は何する？",
      speaker: "くにお",
      text: "店を出ると、俺が振り返る。\n\n「さて○○。ここからどうしようか？」",
      choices: {
        a: "普通のデートがしたい",
        b: "俺と筋トレしてみたい",
        c: "今日は俺に全部任せる"
      }
    },

    date_normal: {
      chapter: "CHAPTER 2",
      title: "普通のデート",
      speaker: "くにお",
      text: "「普通のデート？」\n\n一瞬だけ俺の表情が固まる。\n\n「俺に“普通”を求めるとは、なかなか勇気あるね。」",
      choices: {
        a: "街をゆっくり歩く",
        b: "ポケカショップへ行く",
        c: "もう少しカフェで話す"
      }
    },

    date_gym: {
      chapter: "CHAPTER 2",
      title: "俺のホーム",
      speaker: "くにお",
      text: "ジムへ着いた瞬間、俺の目が少しだけ輝いた。\n\n「○○。ようこそ。」\n\nなぜかラスボスの城に招待された気分になる。",
      choices: {
        a: "俺に教えてもらう",
        b: "何か勝負してみる",
        c: "筋トレしてる俺を眺める"
      }
    },

    date_chaos: {
      chapter: "CHAPTER 2",
      title: "俺に任せる",
      speaker: "くにお",
      text: "「……本当に俺に任せるの？」\n\nいつもより少しだけ真面目な声になる。",
      choices: {
        a: "任せます",
        b: "やっぱり優しめでお願いします",
        c: "行き先だけ教えて"
      }
    },

    relationship: {
      chapter: "CHAPTER 3",
      title: "恋人っぽいこと",
      speaker: "くにお",
      text: "少し時間が経ったころ、俺が言う。\n\n「○○。俺さ、今日はちゃんと恋人っぽいこともしたいんだ。」",
      choices: {
        a: "手をつなぐ？",
        b: "ハグ？",
        c: "もしかして……腕相撲？"
      }
    },

    arm_scene: {
      chapter: "CHAPTER 3",
      title: "やっぱり腕相撲",
      speaker: "くにお",
      text: "「正解。」\n\nなぜか俺はとても満足そうだ。\n\n目の前に腕が差し出される。",
      choices: {
        a: "本気で勝ちにいく",
        b: "わざと負けてあげる",
        c: "恋人っぽさについて話し合う"
      }
    },

    gap_scene: {
      chapter: "CHAPTER 4",
      title: "見た目とのギャップ",
      speaker: "くにお",
      text: "ふざけた空気が少し落ち着く。\n\n「○○が楽しそうなら、俺はそれが一番いいよ。」\n\n低い声は、思っていたよりずっと穏やかだった。",
      choices: {
        a: "思ってたより優しいんですね",
        b: "もっと俺のこと知りたい",
        c: "その顔で言うとギャップがすごい"
      }
    },

    night_scene: {
      chapter: "CHAPTER 5",
      title: "夜",
      speaker: "くにお",
      text: "気づけば街は夜になっていた。\n\n「○○。もう少し一緒にいる？」",
      choices: {
        a: "もう少し一緒にいたい",
        b: "このあとは俺に任せる",
        c: "今日はここまでにする"
      }
    },

    night_walk: {
      chapter: "CHAPTER 5",
      title: "もう少しだけ",
      speaker: "くにお",
      text: "夜の街を並んで歩く。\n\n「○○、今日どうだった？」",
      choices: {
        a: "手をつないでほしい",
        b: "俺の声、落ち着く",
        c: "次はもっと変なデートがしたい"
      }
    },

    hotel_scene: {
      chapter: "CHAPTER 5",
      title: "俺のもう一つの顔",
      speaker: "くにお",
      text: "落ち着いた部屋に入る。\n\n俺はいつもの調子を少しだけ抑えて言った。\n\n「ここから先も、嫌なことは嫌って言ってね。○○のペースでいこう。」",
      choices: {
        a: "ゆっくりお願いします",
        b: "俺に任せてみる",
        c: "もう少し話してから"
      }
    },

    final_choice: {
      chapter: "FINAL CHAPTER",
      title: "今日の最後に",
      speaker: "くにお",
      text: "別れ際、俺が笑う。\n\n「○○。また俺と遊んでくれる？」",
      choices: {
        a: "また普通にデートしたい",
        b: "次は俺に勝ちたい",
        c: "次も俺に全部任せたい"
      }
    }
  },

  endings: {

    normal: {
      label: "NORMAL DATE END",
      title: "思ったより、普通に楽しかった",
      line: "「○○。俺、普通のデートもできるでしょ？」",
      body: "たぶん普通だった。\n少なくとも俺はそう思っている。"
    },

    muscle: {
      label: "MUSCLE END",
      title: "気づいたらジムにいた",
      line: "「○○。次はBIG3測ろうね。」",
      body: "恋愛ゲームを始めたはずなのに、次回の目標重量が決まった。"
    },

    pokeca: {
      label: "POKÉCA END",
      title: "恋より先にデッキが完成した",
      line: "「○○。そのカード俺のデッキに入る。」",
      body: "二人の距離より先に、デッキの完成度が上がった。"
    },

    love: {
      label: "LOVE END",
      title: "見た目より、ずっと優しい",
      line: "「○○。こういう時間、俺も好きだよ。」",
      body: "最初に感じた圧は、いつの間にか安心感に変わっていた。"
    },

    armLove: {
      label: "ARM WRESTLING LOVE END",
      title: "恋とは、腕相撲のあとに始まる",
      line: "「○○。次は俺に勝ってね。」",
      body: "手をつなぐ前に腕相撲をした。\n順番は少しおかしい。でも悪くない。"
    },

    dark: {
      label: "DARK END",
      title: "俺のもう一つの一面",
      line: "「○○。ちゃんと確認しながらいくから安心して。」",
      body: "ふざけた俺とは違う、静かで頼もしい一面を知った夜。"
    },

    collar: {
      label: "COLLAR END",
      title: "禁断の装備を手に入れた",
      line: "「○○。赤と黒、どっちがいい？」",
      body: "レア度：★★★★★\n防御力：0\n俺への信頼度：+50"
    },

    true: {
      label: "GORILLA SECRET END",
      title: "くにおは、ゴリラになった",
      line: "「……○○。ここまで来たら、もう“くにお”じゃないな。」",
      body: "GORILLA LEVEL：MAX\n筋肉と混沌とユーモアを選び続けた結果、最後に表示された名前は――「ゴリラ」。"
    }
  }
};
