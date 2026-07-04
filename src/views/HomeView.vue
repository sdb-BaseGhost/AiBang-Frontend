<template>
  <div class="home-container">
    <!-- 统计卡片区域 -->
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #409EFF;">
              <el-icon :size="30"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ dashboard.userStats?.totalUsers ?? '-' }}</div>
              <div class="stat-label">用户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :md="12">
        <el-card class="chart-card">
          <template #header>
            <span class="card-header">近 7 天 AI Token 消耗趋势</span>
          </template>
          <div ref="lineChartRef1" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card class="chart-card">
          <template #header>
            <span class="card-header">近 7 天用户活跃趋势</span>
          </template>
          <div ref="lineChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 技能完成率排行 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :md="12">
        <el-card class="chart-card">
          <template #header>
            <span class="card-header">🔥 技能完成率排行 Top</span>
          </template>
          <div v-if="dashboard.skillStats?.topSkills?.length" class="skill-rank-list">
            <div v-for="(skill, index) in dashboard.skillStats.topSkills" :key="index" class="skill-rank-item">
              <span class="rank-badge" :class="{ 'rank-top': index < 3 }">{{ index + 1 }}</span>
              <span class="skill-name">{{ skill.skillName }}</span>
              <el-progress :percentage="skill.completionRate" :stroke-width="10" style="flex: 1; margin: 0 12px;" />
              <!-- <span class="skill-rate">{{ skill.completionRate }}%</span> -->
            </div>
          </div>
          <el-empty v-else description="暂无数据" :image-size="60" />
        </el-card>
      </el-col>
      
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { User } from '@element-plus/icons-vue'
import { getDashboard } from '@/api/user'

const lineChartRef1 = ref(null)
const lineChartRef = ref(null)
let lineChart1 = null
let lineChart = null

// 仪表盘数据
const dashboard = reactive({
  userStats: null,
  learningStats: null,
  aiStats: null,
  skillStats: null,
  weeklyTrend: []
})

// 日期格式化: "2026-06-16" → "6/16"
const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

// 初始化 AI Token 消耗趋势折线图（使用 weeklyTrend 中的 tokens 数据）
const initTokenLineChart = () => {
  if (!lineChartRef1.value) return
  lineChart1 = echarts.init(lineChartRef1.value)
  const dates = dashboard.weeklyTrend.map(item => formatDate(item.date))
  const tokenData = dashboard.weeklyTrend.map(item => item.tokens || 0)
  lineChart1.setOption({
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        const data = params[0]
        return `${data.axisValue}<br/>Token 消耗: ${data.value.toLocaleString()} tokens`
      }
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: { color: '#666' }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#666',
        formatter: '{value} tokens'
      }
    },
    grid: { left: '10%', right: '5%', top: '10%', bottom: '15%' },
    series: [{
      data: tokenData,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { color: '#409EFF', width: 2 },
      itemStyle: { color: '#409EFF' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(64,158,255,0.3)' },
          { offset: 1, color: 'rgba(64,158,255,0.05)' }
        ])
      }
    }]
  })
}

// 初始化用户活跃趋势折线图（使用 weeklyTrend 中的 users 数据）
const initLineChart = () => {
  if (!lineChartRef.value) return
  lineChart = echarts.init(lineChartRef.value)
  const dates = dashboard.weeklyTrend.map(item => formatDate(item.date))
  const userData = dashboard.weeklyTrend.map(item => item.users)
  lineChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: { color: '#666' }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#666' }
    },
    grid: { left: '10%', right: '5%', top: '10%', bottom: '15%' },
    series: [{
      data: userData,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { color: '#67C23A', width: 2 },
      itemStyle: { color: '#67C23A' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(103,194,58,0.3)' },
          { offset: 1, color: 'rgba(103,194,58,0.05)' }
        ])
      }
    }]
  })
}

const handleResize = () => {
  lineChart1?.resize()
  lineChart?.resize()
}

const fetchDashboard = async () => {
  try {
    // 调用 GET /api/admin/dashboard
    // 响应拦截器已提取 data 字段
    const data = await getDashboard()
    Object.assign(dashboard, data)
    // 数据加载完成后初始化图表
    initTokenLineChart()
    initLineChart()
  } catch (err) {
    console.error('获取仪表盘数据失败:', err)
  }
}

onMounted(() => {
  fetchDashboard()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  lineChart1?.dispose()
  lineChart?.dispose()
})
</script>

<style scoped>
.home-container {
  padding: 20px;
}

.stat-card {
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  margin-bottom: 20px;
  border-radius: 8px;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.stat-info {
  margin-left: 15px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.chart-row {
  margin-top: 20px;
}

.chart-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.chart-container {
  height: 350px;
  width: 100%;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

/* 技能排行列表 */
.skill-rank-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skill-rank-item {
  display: flex;
  align-items: center;
}

.rank-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  color: #909399;
  margin-right: 12px;
  flex-shrink: 0;
}

.rank-badge.rank-top {
  background-color: #409eff;
  color: #fff;
}

.skill-name {
  width: 100px;
  font-size: 14px;
  color: #303133;
  flex-shrink: 0;
}

.skill-rate {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  width: 50px;
  text-align: right;
  flex-shrink: 0;
}

/* 今日概况 */
.today-overview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.overview-item {
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.overview-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 8px;
}

.overview-value {
  font-size: 22px;
  font-weight: bold;
  color: #303133;
}
</style>