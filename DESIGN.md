# 騒音計ウェブアプリ 設計書

## 概要

スマートフォンのマイクを使用してリアルタイムで騒音レベル(dB)を測定するPWAウェブアプリ。
GitHub Pages でホスティング、GitHub Actions で自動デプロイ。

---

## 技術スタック

| カテゴリ | 技術 | 理由 |
|---------|------|------|
| フレームワーク | React + TypeScript | 状態管理が容易 |
| ビルドツール | Vite | 高速、静的ビルド対応 |
| グラフ | Chart.js | 軽量 |
| スタイル | Tailwind CSS | 迅速なUI構築 |
| ホスティング | GitHub Pages | 無料、HTTPS対応 |
| CI/CD | GitHub Actions | 自動ビルド・デプロイ |
| データ保存 | localStorage | シンプル、履歴保存用 |

---

## ディレクトリ構成

```
noise-meter/
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Actions設定
├── src/
│   ├── App.tsx              # メインコンポーネント
│   ├── main.tsx             # エントリーポイント
│   ├── components/
│   │   ├── DecibelDisplay.tsx   # dB数値表示
│   │   ├── LevelMeter.tsx       # 音量バー
│   │   ├── RealtimeChart.tsx    # グラフ
│   │   └── StatsPanel.tsx       # 統計パネル
│   ├── hooks/
│   │   └── useAudioMeter.ts     # マイク・dB計算
│   └── index.css
├── public/
│   ├── manifest.json        # PWAマニフェスト
│   └── icons/               # アプリアイコン
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 機能一覧

| 機能 | 説明 |
|------|------|
| リアルタイム測定 | 現在のdB値を大きく表示 |
| レベルメーター | 色付きバーで視覚化 |
| 統計表示 | 最大/最小/平均/測定時間 |
| グラフ | 直近30秒の推移 |
| リセット | 統計をクリア |
| PWA | ホーム画面追加可能 |

---

## 画面デザイン

```
┌─────────────────────────┐
│       騒音計            │
├─────────────────────────┤
│                         │
│         72.5            │  ← dB値
│          dB             │
│                         │
│  ████████████░░░░░░░░   │  ← レベルメーター
│                         │
├─────────────────────────┤
│ Max: 85.2   Min: 45.1   │
│ Avg: 68.3   Time: 00:45 │
├─────────────────────────┤
│   [リアルタイムグラフ]    │
│   ～～～～～～～～～～    │
├─────────────────────────┤
│      [ リセット ]        │
└─────────────────────────┘
```

---

## dB計算ロジック

```typescript
const calculateDecibels = (analyser: AnalyserNode): number => {
  const dataArray = new Float32Array(analyser.fftSize);
  analyser.getFloatTimeDomainData(dataArray);

  const rms = Math.sqrt(
    dataArray.reduce((sum, val) => sum + val * val, 0) / dataArray.length
  );

  const db = 20 * Math.log10(rms + 1e-10);
  return Math.max(0, Math.min(120, db + 94));
};
```

---

## 騒音レベル基準

| dB範囲 | 色 | 説明 |
|--------|-----|------|
| 0-40 | 緑 | 静か |
| 40-60 | 黄 | 普通 |
| 60-80 | オレンジ | やや大きい |
| 80+ | 赤 | うるさい |

---

## GitHub Actions 設定

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4
```

---

## Vite設定（GitHub Pages用）

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/リポジトリ名/',  // GitHub Pagesのパス
})
```

---

## 実装ステップ

1. プロジェクト初期化（Vite + React + TypeScript）
2. Tailwind CSS セットアップ
3. マイク入力・dB計算フック作成
4. UI コンポーネント実装
5. グラフ実装（Chart.js）
6. PWA マニフェスト作成
7. GitHub Actions 設定
8. デプロイ・動作確認

---

## 注意事項

- **HTTPS必須**: GitHub Pages はHTTPS対応なのでマイクアクセス可能
- **マイク許可**: ユーザーの許可が必要
- **精度**: 機種により異なる（相対比較向け）
