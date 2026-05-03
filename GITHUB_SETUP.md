# TabSweep GitHub 仓库创建指引

## 步骤 1: 登录 GitHub
访问 https://github.com 并登录你的账号。

## 步骤 2: 创建新仓库
1. 点击右上角的 "+" 按钮
2. 选择 "New repository"

## 步骤 3: 填写仓库信息

| 字段 | 值 |
|------|-----|
| Repository name | `tab-sweep` |
| Description | `A beautiful Chrome extension to manage and clean your tabs` |
| Visibility | 建议选择 **Public**（公开） |

⚠️ **重要**: 不要勾选 "Add a README file"，因为项目已经包含了 README.md。

## 步骤 4: 连接本地仓库并推送

在终端中执行以下命令（将 `YOUR_USERNAME` 替换为你的 GitHub 用户名）：

```bash
cd "/Users/alexyo/AI Project/tab-manager/tab-manager-plugin"

# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/tab-sweep.git

# 推送到 GitHub
git push -u origin main
```

## 步骤 5: 验证

推送成功后，访问 `https://github.com/YOUR_USERNAME/tab-sweep` 查看你的仓库。

## 安装插件到 Chrome

1. 打开 Chrome，访问 `chrome://extensions`
2. 开启右上角的 **Developer mode**（开发者模式）
3. 点击 **Load unpacked**
4. 选择项目中的 `extension` 文件夹

## 开发命令

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build
```

## 项目结构

```
tab-manager-plugin/
├── src/                    # Vue 3 源代码
│   ├── components/         # Vue 组件
│   │   ├── TabCard.vue    # Tab 卡片组件
│   │   ├── ViewToggle.vue # 视图切换组件
│   │   └── ReadLater.vue  # 稍后阅读组件
│   ├── stores/            # Pinia 状态管理
│   │   └── tabStore.js    # Tab 状态管理
│   ├── App.vue            # 主应用组件
│   └── main.js            # 入口文件
├── extension/              # Chrome 扩展文件
│   ├── manifest.json      # 扩展配置
│   ├── background.js      # Service Worker
│   └── icons/             # 图标文件
├── package.json           # 项目配置
├── vite.config.js         # Vite 构建配置
└── README.md              # 项目文档
```

## 功能特性

✅ 点击卡片直接跳转 Tab
✅ 双视图切换（全部标签 / 按窗口分组）
✅ 移除右下角统计信息
✅ 稍后阅读本地存储
✅ 归档内容支持删除
✅ 卡片化 UI 设计
✅ 绿色主题图标
