# TabSweep - Chrome Tab Manager

基于 [tab-out](https://github.com/zarazhangrui/tab-out) 设计的 Chrome 标签页清理插件，通过分组卡片界面帮助你高效管理和清理浏览器标签页。

![TabSweep](extension/icons/icon128.png)

## ✨ 功能特性

🗂️ **智能分组** - 按域名自动分组，主页（Gmail/YouTube/X 等）单独聚合显示

📑 **重复检测** - 自动检测重复标签页，一键清理重复项

📌 **稍后阅读** - 保存标签页到稍后阅读，保存后自动关闭该标签

🔄 **双视图模式** - 支持"全部标签"和"按窗口分组"两种视图

🗑️ **一键全关** - 按分组一键关闭该域名下的所有标签页

🎨 **瀑布流布局** - 仿 tab-out 的卡片瀑布流设计，视觉更清晰

🔒 **隐私优先** - 所有数据本地存储，无云端同步

## 安装方法

### 从源码安装

```bash
# 1. 进入项目目录
cd /Users/alexyo/AI\ Project/tab-manager/tab-manager-plugin

# 2. 安装依赖
npm install

# 3. 构建扩展
npm run build

# 4. 在 Chrome 中加载
# 打开 chrome://extensions/
# 开启"开发者模式"
# 点击"加载已解压的扩展程序"
# 选择 extension/ 目录
```

### 开发模式

```bash
npm run dev    # 启动开发服务器（热更新）
npm run build  # 构建生产版本
```

## 使用说明

### 管理标签页

- **查看分组**：标签页按域名自动分组显示，同一分组在一个卡片内
- **切换标签**：点击标签行即可跳转到该标签页
- **关闭标签**：悬停显示关闭按钮，点击 × 关闭
- **保存稍后阅读**：点击书签图标保存，保存后自动关闭该标签
- **切换视图**：顶部切换"All Tabs" / "By Window"

### 分组卡片操作

- **Close all**：关闭该分组下所有标签页
- **Fix dupes**：清理该分组中的重复标签页
- **展开更多**：分组默认显示 8 个，点击"+N more"展开全部

### 稍后阅读侧边栏

- **打开侧边栏**：点击右上角书签按钮
- **打开已保存**：点击保存项在新标签页中打开
- **归档**：点击归档按钮标记已读
- **删除**：永久删除已归档项目

## 技术栈

- **Vue 3** - Composition API
- **Vite** - 快速构建工具
- **Pinia** - Vue 状态管理
- **Chrome Extension MV3** - 最新扩展规范

## 项目结构

```
tab-manager-plugin/
├── src/
│   ├── components/
│   │   ├── GroupCard.vue    # 分组卡片组件（仿 tab-out）
│   │   ├── TabRow.vue       # 标签行组件
│   │   ├── ViewToggle.vue   # 视图切换按钮
│   │   └── ReadLater.vue    # 稍后阅读侧边栏
│   ├── stores/
│   │   └── tabStore.js     # Pinia 状态管理
│   ├── App.vue              # 主应用组件
│   └── main.js              # 入口文件
├── extension/
│   ├── manifest.json        # Chrome 扩展配置
│   ├── background.js        # Service Worker
│   └── icons/               # 扩展图标（16/48/128）
├── generate-icons.js        # 图标生成脚本
├── package.json
├── vite.config.js
└── README.md
```

## 图标生成

```bash
node generate-icons.js
```

生成 `extension/icons/` 目录下的三个尺寸图标，设计简洁，表达"标签清理"核心功能。

## 许可证

MIT License

## 致谢

设计灵感来自 [tab-out](https://github.com/zarazhangrui/tab-out)，感谢出色原始设计！
