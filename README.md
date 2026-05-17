# tauri-svelte-sample

Tauri 2 + SvelteKit + TypeScript で作ったミニマルな簡易ノード&エッジエディタ。

![Svelte](https://img.shields.io/badge/Svelte-5-FF3E00?logo=svelte&logoColor=white)
![Tauri](https://img.shields.io/badge/Tauri-2-24C8DB?logo=tauri&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)

## 機能

- キャンバスをクリックしてノードを追加
- ノードをドラッグして移動
- ノード右端のコネクタから別ノードへドラッグしてエッジをベジェ曲線で接続

## 技術スタック

| レイヤー       | 技術                       |
| -------------- | -------------------------- |
| デスクトップ   | Tauri 2 (Rust + WebView)   |
| フロントエンド | SvelteKit + adapter-static |
| 描画           | SVG（ライブラリ不使用）    |
| パッケージ管理 | Bun                        |

## セットアップ

### 前提条件

- [Rust](https://www.rust-lang.org/tools/install)
- [Bun](https://bun.sh/)
- [Tauri 2の前提条件](https://v2.tauri.app/start/prerequisites/)

### 開発

```bash
bun install
bun run tauri dev
```

### ビルド

```bash
bun run tauri build
```

## ライセンス

MIT
