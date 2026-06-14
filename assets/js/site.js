/* ============================================================
 * site.js — data/*.md を読み込んでページに描画する
 *
 * 業績の書式 (data/achievements/YYYY.md):
 *   # 2025                ← 年（ファイル名と同じ）
 *   ## セクション名        ← Journal papers / International Conferences / 国内学会・研究会 など
 *   日付 | タイトル | 著者 | 掲載先 | リンク(省略可)
 *
 *   著者名を *...* で囲むと下線になります（例: *Suguru Shimomura*）
 *
 * News の書式 (data/news.md):
 *   YYYY-MM-DD | 本文 | リンク(省略可)
 *
 * Work の書式 (data/work.md):
 *   画像パス | キャプション
 * ============================================================ */

const FIRST_YEAR = 2016; // 業績の最初の年。これ以前の年を追加する場合はここを変更

/* ---------- utilities ---------- */

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* *name* → <u>name</u> （エスケープ後に適用） */
function fmtInline(s) {
  return esc(s).replace(/\*([^*]+)\*/g, "<u>$1</u>");
}

const MONTHS = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

/* "June" / "Jun." / "3月" / "2025-06-15" などから月（と日）を取り出す */
function parseMonthDay(str) {
  if (!str) return { m: 0, d: 0 };
  const jp = str.match(/(\d{1,2})\s*月/);
  if (jp) return { m: +jp[1], d: 0 };
  const iso = str.match(/(\d{4})-(\d{1,2})(?:-(\d{1,2}))?/);
  if (iso) return { m: +iso[2], d: +(iso[3] || 0) };
  const en = str.toLowerCase().match(/[a-z]{3,}/);
  if (en && MONTHS[en[0].slice(0, 3)] !== undefined)
    return { m: MONTHS[en[0].slice(0, 3)], d: 0 };
  return { m: 0, d: 0 };
}

async function fetchText(url) {
  try {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) return null;
    return await res.text();
  } catch (e) {
    return null;
  }
}

/* ---------- markdown (pipe形式) parser ---------- */

/* 1年分のmdをパース → { year, sections: [{name, entries:[{date,title,authors,venue,link}]}] } */
function parseAchievementsMd(text, fallbackYear) {
  const sections = [];
  let year = fallbackYear;
  let current = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("##")) {
      current = { name: line.replace(/^#+\s*/, ""), entries: [] };
      sections.push(current);
    } else if (line.startsWith("#")) {
      const y = line.replace(/^#+\s*/, "");
      if (/^\d{4}$/.test(y)) year = y;
    } else if (line.includes("|")) {
      const parts = line.split("|").map((p) => p.trim());
      if (parts.length < 2) continue;
      if (!current) {
        current = { name: "", entries: [] };
        sections.push(current);
      }
      let link = "";
      if (parts.length > 4 && /^https?:\/\//.test(parts[parts.length - 1])) {
        link = parts.pop();
      } else if (/^https?:\/\//.test(parts[parts.length - 1]) && parts.length > 3) {
        link = parts.pop();
      }
      current.entries.push({
        date: parts[0] || "",
        title: parts[1] || "",
        authors: parts[2] || "",
        venue: parts.slice(3).join(" | ") || "",
        link,
      });
    }
  }
  return { year, sections: sections.filter((s) => s.entries.length || s.name) };
}

/* 全年の業績を取得（存在する年だけ）。新しい年順 */
async function loadAllAchievements() {
  const thisYear = new Date().getFullYear();
  const years = [];
  for (let y = thisYear + 1; y >= FIRST_YEAR; y--) years.push(y);
  const results = await Promise.all(
    years.map(async (y) => {
      const text = await fetchText(`data/achievements/${y}.md`);
      return text ? parseAchievementsMd(text, String(y)) : null;
    })
  );
  return results.filter(Boolean);
}

/* ---------- achievements page ---------- */

function sectionTag(name) {
  const n = name.toLowerCase();
  if (n.includes("journal")) return "Journal";
  if (n.includes("international")) return "Conference";
  if (n.includes("book")) return "Book";
  if (name.includes("国内")) return "国内発表";
  return name || "News";
}

async function renderAchievements(rootId) {
  const root = document.getElementById(rootId);
  if (!root) return;
  const data = await loadAllAchievements();
  if (!data.length) {
    root.innerHTML =
      '<p class="empty-note">業績データを読み込めませんでした。ローカルで確認する場合は <code>python3 -m http.server</code> などのローカルサーバーを使ってください。</p>';
    return;
  }
  root.innerHTML = "";
  const nonEmpty = data.filter(
    (yr) => yr.sections.reduce((a, s) => a + s.entries.length, 0) > 0
  );
  nonEmpty.forEach((yr, i) => {
    const total = yr.sections.reduce((a, s) => a + s.entries.length, 0);
    const det = document.createElement("details");
    det.className = "year";
    if (i === 0) det.open = true;
    let inner = `<summary>${esc(yr.year)} <span class="count">${total} item${total === 1 ? "" : "s"}</span></summary><div class="year-body">`;
    for (const sec of yr.sections) {
      if (!sec.entries.length) continue;
      if (sec.name) inner += `<h3>${esc(sec.name)}</h3>`;
      for (const e of sec.entries) {
        inner += `<div class="entry">
          <div class="date">${esc(e.date)}</div>
          <div>
            <div class="title">${fmtInline(e.title)}</div>
            ${e.authors ? `<div class="authors">${fmtInline(e.authors)}</div>` : ""}
            ${e.venue || e.link
              ? `<div class="venue">${fmtInline(e.venue)}${
                  e.link
                    ? `${e.venue ? "<br>" : ""}<a href="${esc(e.link)}" target="_blank" rel="noopener">${esc(e.link)}</a>`
                    : ""
                }</div>`
              : ""}
          </div>
        </div>`;
      }
    }
    inner += "</div>";
    det.innerHTML = inner;
    root.appendChild(det);
  });
}

/* ---------- latest news (index) ---------- */

async function renderNews(rootId, maxItems = 6) {
  const root = document.getElementById(rootId);
  if (!root) return;

  const items = [];

  // 1) 手動News (data/news.md)
  const manual = await fetchText("data/news.md");
  if (manual) {
    for (const raw of manual.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith("#") || !line.includes("|")) continue;
      const parts = line.split("|").map((p) => p.trim());
      const ymd = parts[0].match(/(\d{4})/);
      const { m, d } = parseMonthDay(parts[0]);
      let link = "";
      if (parts.length > 2 && /^https?:\/\//.test(parts[parts.length - 1]))
        link = parts.pop();
      items.push({
        y: ymd ? +ymd[1] : 0, m, d,
        dateLabel: parts[0],
        tag: "News",
        html: `${fmtInline(parts.slice(1).join(" | "))}${
          link ? ` <a href="${esc(link)}" target="_blank" rel="noopener">[link]</a>` : ""
        }`,
      });
    }
  }

  // 2) 業績から自動反映
  const data = await loadAllAchievements();
  for (const yr of data) {
    for (const sec of yr.sections) {
      for (const e of sec.entries) {
        const { m, d } = parseMonthDay(e.date);
        items.push({
          y: +yr.year, m, d,
          dateLabel: `${esc(e.date)} ${esc(yr.year)}`,
          tag: sectionTag(sec.name),
          html: `<span class="title">${fmtInline(e.title)}</span>${
            e.venue ? ` <span class="venue">— ${fmtInline(e.venue)}</span>` : ""
          }`,
        });
      }
    }
  }

  items.sort((a, b) => b.y - a.y || b.m - a.m || b.d - a.d);
  const top = items.slice(0, maxItems);

  if (!top.length) {
    root.innerHTML = '<li class="loading">No news yet.</li>';
    return;
  }
  root.innerHTML = top
    .map(
      (it) => `<li>
        <div class="news-date">${it.dateLabel}</div>
        <div class="news-body"><span class="news-tag">${esc(it.tag)}</span>${it.html}</div>
      </li>`
    )
    .join("");
}

/* ---------- work page ---------- */

async function renderWork(rootId) {
  const root = document.getElementById(rootId);
  if (!root) return;
  const text = await fetchText("data/work.md");
  const sections = [];   // [{ title, imgs: [] }]
  let current = null;
  if (text) {
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line) continue;
      if (line.startsWith("##")) {
        // 見出し（フォルダのタイトル）
        current = { title: line.replace(/^#+\s*/, ""), imgs: [] };
        sections.push(current);
        continue;
      }
      if (line.startsWith("#")) continue;             // コメント行
      // 「画像パス」または旧形式「画像パス | キャプション」の両方に対応（キャプションは無視）
      const img = line.split("|")[0].trim();
      if (!img) continue;
      if (!current) { current = { title: "", imgs: [] }; sections.push(current); }
      current.imgs.push(img);
    }
  }
  const blocks = [];
  for (const sec of sections) {
    if (!sec.imgs.length) continue;
    if (sec.title) blocks.push(`<h2 class="work-title">${esc(sec.title)}</h2>`);
    blocks.push(
      `<div class="work-grid">` +
      sec.imgs.map((img) =>
        `<figure class="work-card"><img src="${esc(img)}" alt="" loading="lazy"></figure>`
      ).join("") +
      `</div>`
    );
  }
  root.innerHTML = blocks.length
    ? blocks.join("")
    : `<p class="empty-note">写真はまだありません。<code>data/work.md</code> に<br><code>## 見出し（都市・日付）</code><br>と<code>figure/work/photo1.jpg</code>（画像パス）を追加してください。</p>`;
}
