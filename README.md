# personal-site

极简深空风个人主页 · Vite + Three.js · **一镜到底**连续镜头。

**预览：** https://yourling.github.io/personal-site/

> 若链接尚未生效：打开仓库 **Settings → Pages**，Source 选 **GitHub Actions**（推荐），或 **Deploy from a branch** → `main` / `/docs`。启用一次后，后续 push 会自动更新。

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

`vite.config.js` 中 `base: '/personal-site/'`。推送到 `main` 后 Actions 会构建；`docs/` 为静态产物备份，便于分支 Pages。
