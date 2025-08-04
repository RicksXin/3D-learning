# 3D 项目

基于 Three.js 的 3D 项目，使用 Vite 构建。

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 代码格式化

项目使用 Prettier 进行代码格式化：

```bash
# 格式化所有文件
npm run format

# 检查文件是否已格式化
npm run format:check
```

### VS Code 配置

项目包含 VS Code 工作区设置，启用保存时自动格式化。确保安装了 Prettier 扩展：

- 扩展 ID: `esbenp.prettier-vscode`

### 格式化规则

- 使用单引号
- 行宽 80 字符
- 2 空格缩进
- 使用分号
- ES5 尾随逗号
