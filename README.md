# SILKLY ART — Curated Silk Editions

[silklyart.com](https://silklyart.com) 的官方原始碼。靜態三語策展型網站，
把東方絲綢限量海報呈現給全球藝術藏家、美術館、品牌方。

- **目標域名**：`silklyart.com`（在 GitHub Pages 設定，CNAME 檔案已 commit）
- **部署平台**：GitHub Pages（push `main` 即自動部署，CNAME 指向 silklyart.com）
- **設計系統**：`assets/css/style.css`（核心色票 — 朱紅 `#9E2B25`、墨黑 `#1a1a1a`、金 `#C5A572`）
- **語言切換**：`<html lang>` 標籤 + 頂部 nav，三語共用同一份 main.js

## 頁面結構

| 檔案 | 頁面 | EN / MO / ZH |
|------|------|--------------|
| `index.html` | 首頁 | 三語齊 |
| `exhibitions.html` | 展覽 | 三語齊 |
| `works.html` | 作品系列 | 三語齊 |
| `provenance.html` | 來源與工藝 | 三語齊 |
| `artists.html` | 駐站藝術家 | 三語齊 |
| `publications.html` | 出版品 | 三語齊 |
| `about.html` | 關於策展 | 三語齊 |

| 目錄 | 內容 |
|------|------|
| `mo/` | 繁體中文（澳門式）— 與根目錄同結構 |
| `zh/` | 简体中文 — 與根目錄同結構 |
| `assets/` | CSS / JS / logo / 海報圖（hero 用） |
| `design/` | art direction 文件、原始素材 |

## 互動策略（純前端、無後台）

- **送出提案**：`works.html` 的「Register Interest / 登記意向」→ 專屬系列感知 modal
  （採集訪客姓名 + Email，預填 mailto 給策展團隊）
- **聯絡策展**：任何頁面的 mailto → Contact modal（mailto 預填 + 三語 fallback）
- **真機無 mail app**：全域 mailto fallback modal（計時 1 秒，無失焦即彈）

**信箱不公開**：策展團隊 Email 永遠只藏在 `href` 內，從不顯在 innerText。

## 與其他專案的關係（鐵規）

- `seanown-website`（中文個人站，`seanown.org`，Netlify）
- `English-site`（英文個人站，`ownsean.com`，Netlify，Gary Vee 風）
- `LYS`（`lys` 本地資料夾／即將部署的姊妹站）

三者**完全獨立** — 不同 repo、不同部署管線、不同 domain、不同設計系統。
本 repo 內 JS / CSS 不引用他人，他人也絕不引用本 repo。

## 上線後迭代

- [ ] 展覽實況照片（待策展團隊拍攝）
- [ ] 海報系列實品圖（敦煌／故宮／南天門首批待拍）
- [ ] 直播工作室 video 嵌入（待拍攝）
- [ ] 多語 SEO（中英葡，待定位葡語是否上線）
- [ ] 三語皆加 og:image 自訂文案（目前共用）

## 技術約束

- 純靜態、無構建步驟、無 npm install
- 唯一依賴：`assets/css/style.css` + `assets/js/main.js`（單一檔，~470 行）
- 圖片皆 WebP（多尺寸：原圖 + sm）
- 表單一律走 mailto（無第三方服務）
- 所有 mailto 都有可見 fallback（無聲失敗禁制）
