/**
 * ============================================
 * 动态学时折线图数据看板组件 (LineDashboard.vue)
 * ============================================
 *
 * 业务场景：
 * 展示学生过去一周每天完成的学习打卡学时
 * 通过折线图直观展示学习时长的变化趋势
 *
 * 技术栈：
 * - Vue 3 组合式 API (Composition API)
 * - ECharts 5.x 图表库
 * - Element Plus 组件库
 *
 * 核心功能：
 * - 渲染一周学时变动趋势折线图
 * - 支持图表自适应窗口大小
 * - 提供静态数据展示表格
 * - 响应式设计，适配不同屏幕尺寸
 */
<template>
  <div class="dashboard-container">
    <!-- 看板标题卡片 -->
    <el-card class="header-card">
      <template #header>
        <div class="card-header">
          <span class="title">📈 学时变动趋势看板</span>
          <div class="header-right">
            <el-select
              v-model="selectedUserId"
              placeholder="选择用户"
              filterable
              style="width: 200px"
              @change="handleUserChange"
            >
              <el-option
                v-for="u in userList"
                :key="u.userId"
                :label="u.nickname ? `${u.nickname} (${u.username})` : u.username"
                :value="u.userId"
              />
            </el-select>
          </div>
        </div>
      </template>
    </el-card>

    <!-- 图表卡片 -->
    <el-card class="chart-card">
      <!-- ============================================ -->
      <!-- 折线图渲染容器 -->
      <!-- ============================================ -->
      <!-- ref 属性用于获取 DOM 元素的引用 -->
      <!-- ECharts 需要一个具体的 DOM 容器来渲染图表 -->
      <!-- 容器必须有固定的高度，否则图表无法正常显示 -->
      <!-- ============================================ -->
      <div ref="chartRef" class="chart-container"></div>
    </el-card>

    <!-- 数据统计卡片区域 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #67c23a;">
              <el-icon :size="24"><Timer /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ totalHours }} 分钟</div>
              <div class="stat-label">本周总学时</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #409eff;">
              <el-icon :size="24"><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ averageHours }} 分钟</div>
              <div class="stat-label">日均学时</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #e6a23c;">
              <el-icon :size="24"><Trophy /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ maxHours }} 分钟</div>
              <div class="stat-label">最高单日学时</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    
  </div>
</template>

<script setup>
/**
 * ============================================
 * 组合式 API (Composition API) 脚本部分
 * ============================================
 */

// ============================================
// 导入 Vue 3 组合式 API 核心函数
// ============================================
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

// 导入 Element Plus 图标组件
import { Timer, TrendCharts, Trophy, CircleCheckFilled, CircleCloseFilled } from '@element-plus/icons-vue'

// ============================================
// 导入 ECharts 图表库
// ============================================
import * as echarts from 'echarts'

// 导入 API
import { getDashboard, getAdminUserList } from '@/api/user'

// ============================================
// 响应式状态变量定义
// ============================================

const chartRef = ref(null)
let chartInstance = null

// 用户选择
const userList = ref([])
const selectedUserId = ref(null)

/**
 * weeklyData - 一周学时数据
 * 初始为空数组，数据将从后端 API 获取
 */
const weeklyData = ref([])

// ============================================
// 计算属性
// ============================================

/**
 * chartData - 图表展示数据
 *
 * 从 weeklyData 中提取学时数据，用于图表渲染
 * 使用 computed 确保数据变化时图表自动更新
 */
const chartData = computed(() => {
  return weeklyData.value.map(item => item.hours)
})

/**
 * totalHours - 本周总学时
 *
 * 使用 reduce() 方法累加一周的学时
 * reduce() 方法对数组中的每个元素执行一个累加器函数
 */
const totalHours = computed(() => {
  return weeklyData.value.reduce((sum, item) => sum + item.hours, 0).toFixed(1)
})

/**
 * averageHours - 日均学时
 *
 * 计算每天的平均学习时长
 * 注意：这里除以 7（一周的天数）
 */
const averageHours = computed(() => {
  const total = weeklyData.value.reduce((sum, item) => sum + item.hours, 0)
  return (total / 7).toFixed(1)
})

/**
 * maxHours - 最高单日学时
 *
 * 使用 Math.max() 找出一周中最高的学习时长
 * 通过 map() 提取所有学时值，然后使用扩展运算符传递给 Math.max()
 */
const maxHours = computed(() => {
  return Math.max(...weeklyData.value.map(item => item.hours))
})

// ============================================
// 方法函数
// ============================================

/**
 * getTagType - 获取标签类型
 *
 * 根据学时数返回不同的标签类型
 * 用于在表格中展示不同的颜色标签
 *
 * @param {number} hours - 学习时长
 * @returns {string} Element Plus 标签类型
 */
const getTagType = (hours) => {
  if (hours >= 4) return 'success'    // 绿色：高学时
  if (hours >= 2) return 'warning'    // 橙色：中等学时
  return 'info'                       // 灰色：低学时
}

/**
 * initChart - 初始化 ECharts 折线图
 *
 * 这是本组件的核心函数，负责：
 * 1. 获取 DOM 容器
 * 2. 初始化 ECharts 实例
 * 3. 配置图表选项
 * 4. 渲染图表
 */
/**
 * 日期字符串转星期标签
 * "2026-06-16" → "周一" / "6/16"
 */
const formatDateLabel = (dateStr) => {
  const d = new Date(dateStr)
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${d.getMonth() + 1}/${d.getDate()} ${weekDays[d.getDay()]}`
}

/**
 * 从后端获取仪表盘数据并更新 weeklyData
 * 调用 GET /api/admin/dashboard?userId=xxx
 */
const fetchData = async () => {
  if (!selectedUserId.value) return
  try {
    const data = await getDashboard({ userId: selectedUserId.value })
    if (data.weeklyTrend && data.weeklyTrend.length) {
      weeklyData.value = data.weeklyTrend.map(item => ({
        day: formatDateLabel(item.date),
        hours: item.hours,
        status: item.hours > 0 ? '已完成' : '未完成'
      }))
    }
  } catch (err) {
    console.error('获取学时看板数据失败:', err)
    // 使用默认数据兜底
    weeklyData.value = [
      { day: '周一', hours: 0, status: '未完成' },
      { day: '周二', hours: 0, status: '未完成' },
      { day: '周三', hours: 0, status: '未完成' },
      { day: '周四', hours: 0, status: '未完成' },
      { day: '周五', hours: 0, status: '未完成' },
      { day: '周六', hours: 0, status: '未完成' },
      { day: '周日', hours: 0, status: '未完成' },
    ]
  }
}

const initChart = () => {
  if (!chartRef.value) {
    console.error('图表容器 DOM 元素未找到')
    return
  }

  chartInstance = echarts.init(chartRef.value)

  const option = {
    // ============================================
    // 标题配置 (title)
    // ============================================
    // 控制图表标题的显示和样式
    title: {
      text: '一周学时变动趋势',           // 主标题文本
      left: 'center',                     // 标题水平居中对齐
      textStyle: {
        fontSize: 16,                      // 标题字体大小
        fontWeight: 'bold',               // 标题字体加粗
        color: '#303133'                  // 标题字体颜色（深灰色）
      }
    },

    // ============================================
    // 提示框配置 (tooltip)
    // ============================================
    // 鼠标悬停时显示的提示信息
    tooltip: {
      trigger: 'axis',                    // 触发类型：坐标轴触发
      backgroundColor: 'rgba(255, 255, 255, 0.9)', // 提示框背景色（半透明白色）
      borderColor: '#ccc',               // 提示框边框颜色
      borderWidth: 1,                    // 提示框边框宽度
      textStyle: {
        color: '#333'                    // 提示框文字颜色
      },
      // 自定义提示框内容格式
      // params 是当前悬停点的数据
      formatter: (params) => {
        const data = params[0]
        return `
          <div style="font-weight: bold; margin-bottom: 5px;">${data.name}</div>
          <div>学习时长：${data.value} 分钟</div>
        `
      }
    },

    // ============================================
    // 网格配置 (grid)
    // ============================================
    // 控制图表绘图区域的大小和位置
    grid: {
      left: '10%',      // 绘图区域左边距（相对于容器宽度）
      right: '10%',     // 绘图区域右边距
      top: '20%',       // 绘图区域上边距（为标题留出空间）
      bottom: '10%',    // 绘图区域下边距（为 X 轴标签留出空间）
      containLabel: true // 是否包含坐标轴标签
    },

    // ============================================
    // X 轴配置 (xAxis)
    // ============================================
    // 横坐标配置，展示一周的日期
    xAxis: {
      type: 'category',           // 类目轴：适用于离散数据
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], // X 轴数据
      axisLabel: {
        color: '#666',            // X 轴标签颜色
        fontSize: 12              // X 轴标签字体大小
      },
      axisLine: {
        lineStyle: {
          color: '#ddd'           // X 轴轴线颜色
        }
      },
      axisTick: {
        show: false                // 隐藏 X 轴刻度线
      }
    },

    // ============================================
    // Y 轴配置 (yAxis)
    // ============================================
    // 纵坐标配置，代表学习学时
    yAxis: {
      type: 'value',              // 数值轴：适用于连续数值数据
      name: '学习时长（分钟）',    // Y 轴名称
      nameTextStyle: {
        color: '#666',            // Y 轴名称颜色
        fontSize: 12              // Y 轴名称字体大小
      },
      axisLabel: {
        color: '#666',            // Y 轴标签颜色
        fontSize: 12              // Y 轴标签字体大小
      },
      axisLine: {
        show: false                // 隐藏 Y 轴轴线
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',       // Y 轴分隔线颜色（浅灰色）
          type: 'dashed'          // 分隔线类型：虚线
        }
      }
    },

    // ============================================
    // 图表系列配置 (series)
    // ============================================
    // 这是图表数据和样式的核心配置
    series: [
      {
        name: '学习时长',          // 系列名称（用于 tooltip 显示）
        type: 'line',             // 图表类型：折线图（作业要求）
        data: chartData.value,    // 数据源：使用计算属性的值
        smooth: true,             // 平滑曲线：使折线更加平滑美观（作业要求）
        symbol: 'circle',         // 数据点形状：圆形
        symbolSize: 8,            // 数据点大小
        lineStyle: {
          color: '#67c23a',       // 折线颜色：企业绿色（作业要求）
          width: 3                // 折线宽度
        },
        itemStyle: {
          color: '#67c23a',       // 数据点颜色：企业绿色
          borderColor: '#fff',    // 数据点边框颜色：白色
          borderWidth: 2          // 数据点边框宽度
        },
        areaStyle: {
          // 区域填充样式：渐变色
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(103, 194, 58, 0.4)' },   // 渐变起始色（较深）
            { offset: 1, color: 'rgba(103, 194, 58, 0.05)' }   // 渐变结束色（较浅）
          ])
        },
        emphasis: {
          // 高亮状态配置（鼠标悬停时）
          itemStyle: {
            color: '#67c23a',
            borderColor: '#67c23a',
            borderWidth: 4
          }
        }
      }
    ]
  }

  // ============================================
  // 第四步：应用配置项，渲染图表
  // ============================================
  // setOption() 方法用于将配置项应用到 ECharts 实例
  // 调用此方法后，图表会立即渲染到 DOM 容器中
  chartInstance.setOption(option)

  // 打印日志，便于调试
  console.log('折线图初始化完成')
}

/**
 * handleWindowResize - 窗口大小变化处理函数
 *
 * 当浏览器窗口大小变化时，重新调整图表大小
 * 确保图表始终自适应容器大小
 * 这是响应式设计的重要组成部分
 */
const handleWindowResize = () => {
  // 判断图表实例是否存在
  if (chartInstance) {
    // 调用 ECharts 的 resize() 方法重新调整图表大小
    // ECharts 会自动根据容器的当前大小重新渲染图表
    chartInstance.resize()
  }
}

// ============================================
// 生命周期钩子
// ============================================

/** 用户切换时重新加载数据 */
const handleUserChange = async () => {
  await fetchData()
  if (chartInstance) {
    updateChart()
  }
}

/** 更新图表数据（不重新初始化） */
const updateChart = () => {
  if (!chartInstance) return
  chartInstance.setOption({
    xAxis: { data: weeklyData.value.map(item => item.day) },
    series: [{ data: chartData.value }]
  })
}

/**
 * onMounted - 组件挂载完成后执行
 *
 * 生命周期说明：
 * - 模板已经渲染到 DOM 中
 * - 所有的响应式数据已经绑定完成
 * - 可以安全地访问 DOM 元素
 * - 是初始化 ECharts 的最佳时机
 */
onMounted(async () => {
  // 先获取用户列表，自动选中第一个
  try {
    const userData = await getAdminUserList({ page: 1, size: 999 })
    userList.value = userData.records
    if (userList.value.length > 0) {
      selectedUserId.value = userList.value[0].userId
    }
  } catch (err) {
    console.error('获取用户列表失败:', err)
  }

  // 再从后端获取数据
  await fetchData()
  // 数据加载完成后初始化折线图
  initChart()

  // 添加窗口大小变化监听器
  window.addEventListener('resize', handleWindowResize)

  console.log('LineDashboard 组件已挂载')
})

/**
 * onBeforeUnmount - 组件卸载前执行
 *
 * 生命周期说明：
 * - 组件即将从 DOM 中移除
 * - 是清理资源的最佳时机
 * - 防止内存泄漏
 */
onBeforeUnmount(() => {
  // 移除窗口大小变化监听器
  // 防止组件卸载后仍然占用资源
  window.removeEventListener('resize', handleWindowResize)

  // 销毁 ECharts 实例
  // 释放 ECharts 占用的所有资源
  // 如果不销毁，可能会导致内存泄漏
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }

  console.log('LineDashboard 组件即将卸载，资源已清理')
})
</script>

<style scoped>
/* 容器样式 */
.dashboard-container {
  padding: 20px;
}

/* 头部卡片样式 */
.header-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

/* 卡片头部样式 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 头部右侧 */
.header-right {
  display: flex;
  align-items: center;
}

/* 标题样式 */
.title {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}

/* 副标题样式 */
.subtitle {
  font-size: 14px;
  color: #909399;
}

/* 图表卡片样式 */
.chart-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

/* ============================================ */
/* 图表容器样式 */
/* ============================================ */
/* 必须设置固定高度，否则 ECharts 无法正常渲染 */
/* height: 400px 确保图表有足够的显示空间 */
/* width: 100% 确保图表宽度自适应父容器 */
/* ============================================ */
.chart-container {
  height: 400px;
  width: 100%;
  min-width: 300px; /* 最小宽度，防止图表被过度压缩 */
}

/* 统计卡片行样式 */
.stats-row {
  margin-bottom: 20px;
}

/* 统计卡片样式 */
.stat-card {
  margin-bottom: 20px;
  border-radius: 8px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

/* 统计内容布局 */
.stat-content {
  display: flex;
  align-items: center;
}

/* 统计图标样式 */
.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

/* 统计信息样式 */
.stat-info {
  margin-left: 15px;
}

/* 统计数值样式 */
.stat-value {
  font-size: 22px;
  font-weight: bold;
  color: #303133;
}

/* 统计标签样式 */
.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

/* 表格卡片样式 */
.table-card {
  border-radius: 8px;
}

/* 表格卡片标题样式 */
.card-header-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

/* 响应式设计：在小屏幕上调整布局 */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .title {
    font-size: 18px;
  }

  .chart-container {
    height: 300px;
  }
}
</style>