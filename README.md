# 照片隐私分析器

这是一个基于Next.js和React构建的网页应用程序，可以帮助用户分析照片中的元数据（EXIF、IPTC、XMP数据等），以了解照片可能泄露的个人隐私信息。灵感来源于 [They See Your Photos](https://theyseeyourphotos.com/)，UI设计风格参考 [Raphael.app](https://raphael.app/)。

## 特点

- 🔒 **完全本地分析**: 所有照片分析在用户浏览器中本地完成，不上传到服务器
- 📊 **全面元数据检测**: 显示照片中的位置信息、设备信息、时间信息等
- 🔍 **隐私风险提示**: 自动识别和提示可能存在的隐私风险
- 📱 **响应式设计**: 适配各种设备屏幕大小
- ⚡ **高效性能**: 使用Next.js和React提供快速的用户体验
- 🎨 **现代UI**: 采用类似Raphael.app的现代简洁设计风格

## 技术栈

- **前端框架**: Next.js 14
- **UI组件**: React 18
- **样式**: TailwindCSS 3
- **照片处理**: exifr
- **文件上传**: react-dropzone

## 本地开发

### 前提条件

- Node.js 18.0.0 或更高版本
- npm 或 yarn 或 pnpm

### 安装步骤

1. 克隆仓库
   ```bash
   git clone https://github.com/yourusername/photo-analyzer.git
   cd photo-analyzer
   ```

2. 安装依赖
   ```bash
   npm install
   # 或
   yarn install
   # 或
   pnpm install
   ```

3. 启动开发服务器
   ```bash
   npm run dev
   # 或
   yarn dev
   # 或
   pnpm dev
   ```

4. 打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 构建生产版本

```bash
npm run build
npm run start
# 或
yarn build
yarn start
# 或
pnpm build
pnpm start
```

## 项目结构

```
/src
  /app                 # Next.js 应用路由
    /page.tsx          # 首页
    /about/page.tsx    # 关于页面
    /privacy/page.tsx  # 隐私政策页面
  /components          # React 组件
    /ui                # 通用UI组件
    /layout            # 布局组件
    /features          # 功能组件
  /lib                 # 工具库和辅助函数
```

## 隐私声明

本应用程序仅在用户本地浏览器中处理照片，不会将照片或提取的元数据上传到任何服务器。所有分析过程完全在用户设备上进行，确保用户隐私安全。

## 许可证

MIT
