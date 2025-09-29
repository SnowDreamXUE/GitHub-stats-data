# GitHub 统计数据生成器

一个基于 Node.js 的自动化工具，用于生成和维护个人 GitHub 统计数据，包括提交热力图、代码库统计和活动分析。通过 GitHub Actions 实现每日自动更新。

## 📊 项目概述

这个项目自动收集你的 GitHub 活动数据，生成详细的统计信息和可视化数据，为个人主页、简历或其他项目提供准确的开发者数据支撑。

## ✨ 主要功能

- **📈 全面统计收集**：提交数、仓库数、星标数、关注者等
- **🔥 提交热力图**：生成类似 GitHub 贡献图的热力图数据
- **⏰ 自动化更新**：每日北京时间 00:20 自动运行
- **🌏 时区支持**：所有时间数据使用北京时间
- **🔒 隐私保护**：支持私有仓库统计，过滤敏感信息
- **📄 JSON 输出**：标准化数据格式，便于集成

## 🗂️ 项目结构

```
GitHub-stats-data/
├── .github/
│   └── workflows/
│       └── generate-stats.yml    # GitHub Actions 工作流
├── generate-stats.js              # 主统计脚本
├── github-stats.json             # 生成的统计数据
├── commit-heatmap.json           # 提交热力图数据
├── version.json                  # 版本和更新时间信息
└── README.md                     # 项目文档
```

## 📄 生成的数据文件

### github-stats.json
包含主要的统计信息：
```json
{
  "user": {
    "name": "user.name",
    "public_repos": 15,
    "followers": 28,
    "following": 42
  },
  "stats": {
    "total_commits": 1250,
    "total_repos": 12,
    "total_stars": 68,
    "total_forks": 15,
    "last_year_commits": 580
  },
  "last_updated": "2025-09-29",
  "last_updated_beijing": "2025-09-29"
}
```

### commit-heatmap.json
用于生成提交热力图：
```json
{
  "data": [
    {
      "date": "2024-09-29",
      "count": 5,
      "level": 2
    }
  ],
  "total_commits": 580,
  "generated_at": "2025-09-29"
}
```

### version.json
版本和更新时间信息：
```json
{
  "last_updated": "2025-09-29"
}
```

## ⚙️ 快速开始

### GitHub Actions 配置

需要在仓库的 **Settings > Secrets and variables > Actions** 中配置：

| 密钥名称 | 用途 | 权限要求 |
|---------|------|----------|
| `STATS_TOKEN` | 获取统计数据 | `repo` (访问私有仓库) |
| `PUSH_TOKEN` | 推送更新数据 | `repo` (推送到当前仓库) |

### 运行时间
- **自动运行**：每天北京时间 00:20 (UTC 16:20)
- **手动触发**：在 Actions 页面手动运行

## 📊 数据统计说明

### 提交统计逻辑
- **总提交数**：通过 GitHub Contributors API 获取
- **年度提交数**：统计过去 365 天的提交
- **热力图等级**：
  - Level 0: 0 提交
  - Level 1: 1-2 提交
  - Level 2: 3-5 提交
  - Level 3: 6-9 提交
  - Level 4: 10+ 提交

### 仓库筛选
- ✅ 统计：用户创建的原始仓库
- ❌ 排除：Fork 的仓库（避免重复计算）
- ✅ 包含：私有仓库（需要相应权限）

### API 优化
- 智能请求间隔（100-300ms）
- 失败重试机制
- 分页处理优化
- 北京时间统一处理

## 🚀 使用场景

### 个人展示
- **GitHub Profile README**：展示开源贡献统计
- **个人网站**：通过 API 调用展示数据
- **技术简历**：提供量化的开发经验数据

### 数据集成
```javascript
// 获取统计数据示例
fetch('https://raw.githubusercontent.com/SnowDreamXUE/GitHub-stats-data/main/github-stats.json')
  .then(response => response.json())
  .then(data => {
    console.log(`总提交数: ${data.stats.total_commits}`);
    console.log(`年度提交: ${data.stats.last_year_commits}`);
  });

// 获取版本信息示例
fetch('https://raw.githubusercontent.com/SnowDreamXUE/GitHub-stats-data/main/version.json')
  .then(response => response.json())
  .then(version => {
    console.log(`最后更新: ${version.last_updated}`);
  });
```

### 可视化展示
- 使用 `commit-heatmap.json` 生成贡献热力图
- 集成到 Vue/React 等前端框架
- 制作个人开发者仪表板

## 🔧 自定义配置

### 修改统计项目
在 `generate-stats.js` 中可以自定义：
- 添加新的统计指标
- 修改数据结构
- 调整时间范围
- 自定义输出格式

### 调整运行频率
修改 `.github/workflows/generate-stats.yml` 中的 cron 表达式：
```yaml
# 每天运行改为每周运行
- cron: '20 16 * * 0'  # 每周日运行
```

## 🔍 故障排除

### 常见问题

**Token 权限不足**
```
Error: Bad credentials
```
解决：确保 Token 具有 `repo` 权限

**API 限制**
```
Error: API rate limit exceeded
```
解决：脚本已内置请求间隔，通常会自动恢复

**私有仓库访问**
```
Error: Not Found
```
解决：确保 Token 具有访问私有仓库的权限

### 调试模式
取消注释脚本中的 `console.log` 语句查看详细执行日志。

## 📈 数据准确性说明

- **提交统计**：基于 Git 提交记录，排除合并提交
- **仓库统计**：实时获取，包括私有仓库
- **时间处理**：统一使用北京时间 (UTC+8)
- **更新频率**：每日更新，确保数据时效性

## 📄 开源协议

本项目采用 [MIT License](LICENSE) 开源协议。

## 🔗 相关链接

- [GitHub API 文档](https://docs.github.com/en/rest)
- [Octokit.js](https://github.com/octokit/octokit.js)
- [GitHub Actions](https://docs.github.com/en/actions)

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给个 Star！**

<!-- 动态显示最后更新时间 -->
<script>
fetch('https://raw.githubusercontent.com/SnowDreamXUE/GitHub-stats-data/main/version.json')
  .then(response => response.json())
  .then(data => {
    document.getElementById('last-updated').textContent = `最后更新：${data.last_updated}`;
  })
  .catch(() => {
    document.getElementById('last-updated').textContent = '最后更新：由 GitHub Actions 自动维护';
  });
</script>

<p id="last-updated">最后更新：正在加载...</p>

</div>
