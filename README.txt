KUNIO STORY V1.2

【方向性】
くにお1人にフォーカスした、本格ADV / ノベルゲーム寄りのブラウザゲーム。

【V1.2 UI変更】
・会話UIをADV風の名前プレート＋会話ボックスへ変更
・セリフをタイプライター表示
・タップで全文表示
・セリフ表示完了後に選択肢を表示
・章が変わる時にCHAPTER演出
・場面移動で暗転
・ENDはイベントCG中心の画面
・プロフィール誘導ボタンを完全削除
・END画面の最下部にだけ控えめなXリンクを表示

【X】
https://x.com/EVILKING_KRKS

【通常キャラクター】
名前：くにお
一人称：俺

【GORILLA LEVEL】
筋肉、腕相撲、ポケカ、首輪、変な選択肢などで上昇。

最大GORILLAポイントに到達した1ルートのみSECRET END。

SECRET ENDのみ最終画面の名前：
くにお → ゴリラ

【END】
01 NORMAL DATE END
02 MUSCLE END
03 POKÉCA END
04 LOVE END
05 ARM WRESTLING LOVE END
06 DARK END
07 COLLAR END
08 GORILLA SECRET END

【文章編集】
content/text.js

【分岐】
config/story-flow.js

【背景・立ち絵】
config/scene-config.js

【END CG / X URL】
config/game-config.js

【ゲームシステム】
js/game.js

【キャッシュ】
?v=1.2 を付与済み。


【V1.4】
・主人公は女性の自己投影型として文章を全面修正
・「俺」はくにお本人のセリフ内だけに統一
・全選択肢に専用リアクション追加
・選択 → くにおの反応 → 続ける → 次シーン の順へ変更
・ENDING COLLECTIONのFOUND済みタイトルをクリック可能に変更
・発見済みENDを選ぶと、そのENDの宣材写真(CG)を再表示
・未発見ENDは従来通り「？？？」で選択不可
