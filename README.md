# GitHub 统计数据生成器

一个基于 Node.js 的应用程序，用于自动生成和存储 GitHub 统计数据，包括提交热力图和用户统计信息。

## 📊 项目概述

这个仓库包含了收集、处理和存储 GitHub 统计数据的工具，以 JSON 格式保存。它被设计用来自动收集 GitHub 活动数据并生成可视化内容，如提交热力图。

## 🗂️ 仓库结构

```
GitHub-stats-data/
├── .github/                    # GitHub Actions 工作流
├── node_modules/              # Node.js 依赖包
├── commit-heatmap.json        # 生成的提交热力图数据
├── github-stats.json          # GitHub 统计信息
├── generate-stats.js          # 生成统计数据的主脚本
├── package.json               # Node.js 项目配置
└── package-lock.json          # 依赖锁定文件
```

## ✨ 主要功能

- **提交热力图生成**: 自动生成提交活动热力图
- **GitHub 统计收集**: 收集全面的 GitHub 用户统计信息
- **JSON 数据存储**: 将所有统计数据存储为易于使用的 JSON 格式
- **自动化更新**: 使用 GitHub Actions 定期更新数据
- **数据安全**: 支持私有仓库统计，保护个人数据隐私

## 🚀 快速开始

### 系统要求

- Node.js (>= 18.0.0)
- npm 或 yarn
- GitHub Personal Access Token

### 安装步骤

1. 克隆仓库:
```bash
git clone https://github.com/SnowDreamXUE/GitHub-stats-data.git
cd GitHub-stats-data
```

2. 安装依赖:
```bash
npm install
```

3. 设置环境变量:
```bash
export GITHUB_TOKEN=your_github_token
export USERNAME=your_github_username
```

### 使用方法

运行统计生成脚本:
```bash
npm start
# 或者
node generate-stats.js
```

脚本将会:
- 收集您的 GitHub 活动数据
- 生成提交热力图数据
- 更新 JSON 文件中的最新统计信息
- 将数据保存到 `github-stats.json` 和 `commit-heatmap.json`

## 📊 生成的数据

### `github-stats.json`
包含基本的 GitHub 统计信息：
- 用户基本信息（姓名、关注者、关注数）
- 仓库总数和统计
- 提交统计（总提交数、过去一年提交数）
- 星标和分叉统计
- 数据更新时间

### `commit-heatmap.json`
包含详细的提交活动数据用于热力图可视化：
- 每日提交计数
- 活动模式分析
- 贡献时间线
- 提交强度等级 (0-4)

## 🔧 技术依赖

项目使用以下主要依赖：
- `@octokit/rest` - GitHub API 客户端
- 支持 ES6 模块语法
- 内置北京时间处理

## 🤖 自动化功能

此仓库包含 GitHub Actions 工作流（在 `.github/` 目录中）来：
- 定期自动更新统计数据
- 保持数据的时效性
- 生成更新的可视化数据

## 📈 使用场景

- 个人 GitHub 活动跟踪
- 个人网站数据源
- GitHub 贡献分析
- 活动模式可视化
- 统计仪表板后端数据
- 开发者简历数据支持

## 🛠️ 开发指南

要修改或扩展统计收集功能：

1. 编辑 `generate-stats.js` 添加新的指标
2. 自定义 JSON 输出的数据结构
3. 调整 GitHub Actions 工作流的更新频率
4. 修改提交强度等级算法

## 🔒 数据安全特性

- 支持私有仓库统计
- 敏感信息过滤（如头像、登录名等）
- API 访问限制保护
- 北京时间记录，符合本地化需求

## 📊 数据示例

生成的统计数据包括：
- 总提交数、总仓库数
- 获得的星标数和分叉数
- 过去一年的活动数据
- 按日期的提交热力图

## 📄 开源协议

本项目采用 MIT 协议开源。详情请查看 LICENSE 文件。

---

**注意**: 这是一个自动化数据收集仓库。JSON 文件会定期更新最新的 GitHub 统计数据。

**最后更新**: 数据每日自动更新，使用北京时间记录。
