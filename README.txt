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


【V1.4.1 立ち絵サイズ調整】
・立ち絵の基本高さ 76% → 88%
・最大横幅 98% → 120%
・通常立ち絵 scale 1.05
・全シーン x=50 で画面中央へ統一
・close / power / serious / dark は場面に応じて少し大きさを変化
・小さい画面でも立ち絵が縮みすぎないよう調整


【V1.5 UI全面改修】
・黒 / グレー / ゴールド基調のADVデザイン
・タイトル画面の情報量を整理
・会話ウィンドウをゲーム寄りに再設計
・選択肢に軽い順次表示演出
・上部UIを控えめに変更
・GORILLA LEVEL上昇時に軽い反応演出
・ENDING COLLECTIONを2列ギャラリー化
・発見済みENDは宣材写真を薄くサムネイル表示


【V1.6 UIセルフレビュー改良】
PASS 1:
・iPhoneのタップ領域を拡大
・本文/選択肢の文字サイズを再調整
・会話欄が縦に溢れる場合に内部スクロール可能
・ENDING COLLECTIONをスクロール対応
・小型iPhoneではEND一覧を1列化

PASS 2:
・タイトル画面に背景＋くにお立ち絵を表示
・タイトル専用の暗め演出を追加
・safe areaを左右にも対応
・エンディング画面のリンク余白を調整
・prefers-reduced-motion対応
