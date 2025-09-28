import { Octokit } from '@octokit/rest';
import fs from 'fs';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const username = process.env.USERNAME;

// 辅助函数：获取北京时间
function getBeijingTime() {
  return new Date().toLocaleString('zh-CN', { 
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit',
  });
}

// 辅助函数：获取北京时间的ISO字符串
function getBeijingISOString() {
  return new Date().toLocaleString('en-CA', { 
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit'
  });
}

async function generateStats() {
  try {
    // console.log(`[${getBeijingTime()}] Generating stats for user: ${username}`);
    
    // 获取用户信息
    const { data: user } = await octokit.rest.users.getByUsername({
      username: username
    });

    // 获取用户的所有仓库（包括private）
    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
      type: 'all',
      per_page: 100,
      sort: 'updated'
    });

    // console.log(`[${getBeijingTime()}] Found ${repos.length} repositories`);

    // 获取提交统计数据
    const commitStats = await getCommitStats(repos);
    
    // 获取语言统计
    const languageStats = await getLanguageStats(repos);
    
    // 构建完整的统计数据
    const statsData = {
      user: {
        // login: user.login,
        name: user.name,
        // avatar_url: user.avatar_url,
        public_repos: user.public_repos,
        followers: user.followers,
        following: user.following,
        // created_at: user.created_at ? user.created_at.split('T')[0] : null, 
      },
      stats: {
        total_commits: commitStats.totalCommits,
        total_repos: repos.filter(repo => !repo.fork).length,
        total_stars: repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
        total_forks: repos.reduce((sum, repo) => sum + repo.forks_count, 0),
        // commit_frequency: commitStats.commitFrequency,
        last_year_commits: commitStats.lastYearCommits,
        // active_days_last_year: commitStats.activeDaysLastYear,
        // max_commits_per_day: commitStats.maxCommitsPerDay,
        // avg_commits_per_active_day: commitStats.avgCommitsPerActiveDay
      },
      // languages: languageStats,
      // repositories: repos
      //   .filter(repo => !repo.fork && !repo.private)
      //   .map(repo => ({
      //     name: repo.name,
      //     stars: repo.stargazers_count,
      //     forks: repo.forks_count,
      //     language: repo.language,
      //     updated_at:  repo.updated_at ? repo.updated_at.split('T')[0] : null, 
      //   })),
      last_updated: getBeijingISOString(),
      last_updated_beijing: getBeijingTime()
    };

    // 写入JSON文件
    fs.writeFileSync('github-stats.json', JSON.stringify(statsData, null, 2));
    
    // 生成适合前端图表展示的提交热力图数据
    const heatmapData = generateHeatmapData(commitStats.dailyCommits);
    fs.writeFileSync('commit-heatmap.json', JSON.stringify(heatmapData, null, 2));
    
    // console.log(`[${getBeijingTime()}] Stats generated successfully!`);
    // console.log(`Total commits (all time): ${statsData.stats.total_commits}`);
    // console.log(`Last year commits: ${statsData.stats.last_year_commits}`);
    // console.log(`Total repositories: ${statsData.stats.total_repos}`);
    
  } catch (error) {
    console.error(`[${getBeijingTime()}] Error generating stats:`, error);
    process.exit(1);
  }
}

async function getCommitStats(repos) {
  let totalCommits = 0;
  let lastYearCommits = 0;
  const dailyCommits = {};
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  for (const repo of repos) {
    try {
      // 只统计用户自己的仓库，跳过fork的仓库以避免重复计算
      if (repo.fork) {
        // console.log(`[${getBeijingTime()}] Skipping forked repo: ${repo.name}`);
        continue;
      }
      
      // console.log(`[${getBeijingTime()}] Processing repo: ${repo.name} (private: ${repo.private})`);
      
      // 方案二：分别获取总提交数和最近一年提交数
      const repoStats = await getRepoCommitStats(repo, oneYearAgo);
      
      totalCommits += repoStats.totalCommits;
      lastYearCommits += repoStats.lastYearCommits;
      
      // 合并每日提交数据
      for (const [date, count] of Object.entries(repoStats.dailyCommits)) {
        dailyCommits[date] = (dailyCommits[date] || 0) + count;
      }
      
      // 避免API限制，添加延迟
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } catch (error) {
      // console.log(`[${getBeijingTime()}] Error accessing repo ${repo.name}: ${error.message}`);
      console.log(`[${getBeijingTime()}] Error accessing: ${error.message}`);
      continue;
    }
  }

  // 计算额外统计信息
  const activeDaysLastYear = Object.keys(dailyCommits).length;
  const maxCommitsPerDay = Math.max(...Object.values(dailyCommits), 0);
  const avgCommitsPerActiveDay = activeDaysLastYear > 0 
    ? (lastYearCommits / activeDaysLastYear).toFixed(2) 
    : 0;

  return {
    totalCommits,
    lastYearCommits,
    dailyCommits,
    commitFrequency: calculateCommitFrequency(dailyCommits),
    activeDaysLastYear,
    maxCommitsPerDay,
    avgCommitsPerActiveDay
  };
}

async function getRepoCommitStats(repo, oneYearAgo) {
  let totalCommits = 0;
  let lastYearCommits = 0;
  const dailyCommits = {};
  
  try {
    // 1. 获取仓库的总提交数（使用contributors API更高效）
    const { data: contributors } = await octokit.rest.repos.listContributors({
      owner: repo.owner.login,
      repo: repo.name,
      per_page: 100
    });
    
    // 找到当前用户的贡献数据
    const userContribution = contributors.find(c => c.login === username);
    if (userContribution) {
      totalCommits = userContribution.contributions;
    }
    
    // 2. 获取最近一年的详细提交数据
    let page = 1;
    let hasMore = true;
    
    while (hasMore && page <= 10) {
      const { data: commits } = await octokit.rest.repos.listCommits({
        owner: repo.owner.login,
        repo: repo.name,
        author: username,
        since: oneYearAgo.toISOString(),
        per_page: 100,
        page: page
      });

      if (commits.length === 0) {
        hasMore = false;
        break;
      }

      for (const commit of commits) {
        const date = new Date(commit.commit.author.date);
        const dateKey = date.toISOString().split('T')[0];
        
        dailyCommits[dateKey] = (dailyCommits[dateKey] || 0) + 1;
        lastYearCommits++;
      }

      page++;
      if (commits.length < 100) hasMore = false;
    }
    
  } catch (error) {
    // console.log(`[${getBeijingTime()}] Error getting commit stats for ${repo.name}: ${error.message}`);
    console.log(`[${getBeijingTime()}] Error getting commit stats: ${error.message}`);
    
    // 如果contributors API失败，回退到只统计最近一年的方法
    let page = 1;
    let hasMore = true;
    
    while (hasMore && page <= 5) {
      try {
        const { data: commits } = await octokit.rest.repos.listCommits({
          owner: repo.owner.login,
          repo: repo.name,
          author: username,
          per_page: 100,
          page: page
        });

        if (commits.length === 0) {
          hasMore = false;
          break;
        }

        for (const commit of commits) {
          const date = new Date(commit.commit.author.date);
          const dateKey = date.toISOString().split('T')[0];
          
          totalCommits++;
          
          if (date >= oneYearAgo) {
            dailyCommits[dateKey] = (dailyCommits[dateKey] || 0) + 1;
            lastYearCommits++;
          }
        }

        page++;
        if (commits.length < 100) hasMore = false;
        
      } catch (innerError) {
        // console.log(`[${getBeijingTime()}] Fallback method also failed for ${repo.name}`);
        console.log(`[${getBeijingTime()}] Fallback method also failed`);
        break;
      }
    }
  }
  
  return {
    totalCommits,
    lastYearCommits,
    dailyCommits
  };
}

async function getLanguageStats(repos) {
  const languageStats = {};
  
  for (const repo of repos) {
    try {
      if (repo.fork) continue;
      
      const { data: languages } = await octokit.rest.repos.listLanguages({
        owner: repo.owner.login,
        repo: repo.name
      });

      for (const [language, bytes] of Object.entries(languages)) {
        languageStats[language] = (languageStats[language] || 0) + bytes;
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      // console.log(`[${getBeijingTime()}] Skipping languages for ${repo.name}: ${error.message}`);
      continue;
    }
  }

  // 转换为百分比
  const totalBytes = Object.values(languageStats).reduce((sum, bytes) => sum + bytes, 0);
  const languagePercentages = {};
  
  for (const [language, bytes] of Object.entries(languageStats)) {
    languagePercentages[language] = {
      bytes: bytes,
      percentage: ((bytes / totalBytes) * 100).toFixed(2)
    };
  }

  return languagePercentages;
}

function calculateCommitFrequency(dailyCommits) {
  const days = Object.keys(dailyCommits).length;
  const totalCommits = Object.values(dailyCommits).reduce((sum, count) => sum + count, 0);
  
  return days > 0 ? (totalCommits / days).toFixed(2) : 0;
}

function generateHeatmapData(dailyCommits) {
  const heatmapData = [];
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  // 生成过去一年每一天的数据
  for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
    const dateKey = d.toISOString().split('T')[0];
    const count = dailyCommits[dateKey] || 0;
    
    heatmapData.push({
      date: dateKey,
      count: count,
      level: getCommitLevel(count)
    });
  }
  
  return {
    data: heatmapData,
    total_commits: Object.values(dailyCommits).reduce((sum, count) => sum + count, 0),
    generated_at: getBeijingISOString()
  };
}

function getCommitLevel(count) {
  if (count === 0) return 0;
  if (count < 3) return 1;
  if (count < 6) return 2;
  if (count < 10) return 3;
  return 4;
}

generateStats();
