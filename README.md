# personal-site

极简深空风个人主页 · Vite + Three.js · **一镜到底**连续镜头。

预览：https://yourling.github.io/personal-site/

## 本地开发

```bash
npm install
npm run dev
```

构建：

```bash
npm run build
npm run preview
```

## 交互

- **滚动**：长页面滚动驱动相机沿 `CatmullRomCurve3` 路径前进（无切镜）
- **自动播放**：右上角按钮缓慢推进镜头；用户再次滚动会暂停自动播放
- **导航**：顶栏可跳转到各分区进度点（仍沿同一条曲线平滑移动）

分区顺序：Hero → About → Projects → Skills → Contact（文案均为占位，可直接改 `index.html`）。

## 部署

推送到 `main` 后，GitHub Actions 会构建并以 `gh-pages` 分支发布到 GitHub Pages。
`vite.config.js` 中 `base: '/personal-site/'` 对应该仓库的 Project Pages 路径。
