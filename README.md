# shimomuras.github.io

個人ホームページ（GitHub Pages 用）。
HTML を編集せず、**`data/` 内の md ファイルに1行追加するだけ**で業績・News・写真を更新できます。

## 更新方法

### 1. 業績を追加する（最重要）

`data/achievements/` に年ごとのファイルがあります（例: `2026.md`）。
該当するセクションの下に **1行** 追加するだけです。

```
日付 | タイトル | 著者 | 掲載先 | リンク(省略可)
```

例:

```
## Journal papers and Conference proceedings

June | Design of quantum dot networks ... | Kazuki Yamanouchi, *Suguru Shimomura*, Yusuke Ogura | Journal of the Optical Society of America B | https://doi.org/10.1364/JOSAB.537531

## 国内学会・研究会

3月 | 空間フォトニックイジングマシンの検証 | *下村 優*, 谷田 純 | 第72回応用物理学会春季学術講演会, 15p-K508-8
```

- 著者名を `*...*` で囲むと**下線**になります（自分の名前用）。
- 日付は `June` / `Jun.` / `3月` のいずれでも可（News の並び替えに使われます）。
- リンクは `https://` で始まる場合のみ末尾に置いてください。省略可。

**新しい年を始めるとき**: `data/achievements/2027.md` のようにファイルを作るだけです。
1行目に `# 2027`、その下に `## セクション名` を書いてください（`2026.md` をコピーすると簡単です）。
HTML や JS の変更は不要です（2016年〜翌年まで自動で探索します）。

### 2. Latest News（トップページ）

**業績は自動で反映されます。** `data/achievements/` に追加した項目が、日付の新しい順に
トップページの Latest News に最大6件表示されます。

業績以外のお知らせ（受賞・着任・メディア掲載など）は `data/news.md` に追加します:

```
2026-04-01 | ホームページをリニューアルしました。
2026-05-10 | ○○賞を受賞しました。 | https://example.com
```

### 3. Work（写真）

1. 写真を `figure/work/` に置く
2. `data/work.md` に1行追加する

```
figure/work/lab2026.jpg | 研究室の様子 (2026)
```

## ローカルでの確認

md ファイルを fetch で読み込むため、`file://` で開くと表示されません。
リポジトリ直下で以下を実行し、ブラウザで http://localhost:8000 を開いてください。

```
python3 -m http.server
```

## 構成

```
index.html            トップ（紺色基調・インタラクティブな波面・Latest News）
information.html      経歴・受賞など（直接編集）
achievements.html     業績（data/achievements/*.md を自動描画）
work.html             写真（data/work.md を自動描画）
assets/js/site.js     md の読み込み・描画（FIRST_YEAR=2016 を変更すると探索範囲が変わる）
assets/js/wavefield.js トップの「デジタル波面」。固定点で "Photonics" を表示し（基準輝度は低めで、波が通ると強く変調）、
                       カーソルのパルス波面と干渉する。文字を変える場合は下記参照
assets/css/style.css   スタイル（紺色基調。配色は先頭の :root 変数を変更）
data/                 ★更新するのは基本ここだけ
.nojekyll             GitHub Pages の Jekyll 処理を無効化
```

## トップの波面の文字を変える

`make_textpoints.py`（リポジトリ同梱）の `text = "Photonics"` を書き換えて実行すると
`textpoints.js` が再生成されます。その中身（`const TEXT_POINTS = [...]`）を
`assets/js/wavefield.js` の冒頭にある同名の行と差し替えてください。
実行には Python と Pillow が必要です（`pip install pillow`）。
