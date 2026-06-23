<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>学习记录</span>
          <el-input
            v-model="searchText"
            placeholder="搜索用户名"
            style="width: 200px"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button icon="Search" @click="handleSearch" />
            </template>
          </el-input>
        </div>
      </template>

      <el-table v-loading="loading" :data="recordList" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="course" label="课程名称" />
        <el-table-column prop="progress" label="学习进度" width="160">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :color="row.progress === 100 ? '#67c23a' : '#409eff'" />
          </template>
        </el-table-column>
        <el-table-column prop="score" label="成绩" width="80">
          <template #default="{ row }">
            <span :style="{ color: row.score >= 60 ? '#67c23a' : '#f56c6c' }">{{ row.score }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="studyTime" label="学习时长" width="100" />
        <el-table-column prop="updateTime" label="更新时间" width="180" />
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; justify-content: flex-end"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

const loading = ref(false)
const searchText = ref('')
const recordList = ref([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const mockRecords = [
  { id: 1, username: 'admin', course: 'Vue3 从入门到精通', progress: 100, score: 95, status: '已完成', studyTime: '36h', updateTime: '2024-06-01 10:00:00' },
  { id: 2, username: 'admin', course: 'TypeScript 实战', progress: 80, score: 88, status: '学习中', studyTime: '24h', updateTime: '2024-06-02 11:00:00' },
  { id: 3, username: 'user1', course: 'React 基础教程', progress: 100, score: 92, status: '已完成', studyTime: '30h', updateTime: '2024-06-03 12:00:00' },
  { id: 4, username: 'user1', course: 'Node.js 后端开发', progress: 45, score: 0, status: '学习中', studyTime: '12h', updateTime: '2024-06-04 13:00:00' },
  { id: 5, username: 'user2', course: 'CSS 高级布局', progress: 100, score: 78, status: '已完成', studyTime: '18h', updateTime: '2024-06-05 14:00:00' },
  { id: 6, username: 'user3', course: 'JavaScript 异步编程', progress: 60, score: 0, status: '学习中', studyTime: '15h', updateTime: '2024-06-06 15:00:00' },
  { id: 7, username: 'user3', course: 'Webpack 配置实践', progress: 100, score: 85, status: '已完成', studyTime: '20h', updateTime: '2024-06-07 16:00:00' },
  { id: 8, username: 'user4', course: 'Git 工作流', progress: 100, score: 90, status: '已完成', studyTime: '8h', updateTime: '2024-06-08 17:00:00' },
  { id: 9, username: 'user5', course: 'Docker 容器化入门', progress: 30, score: 0, status: '未开始', studyTime: '0h', updateTime: '2024-06-09 18:00:00' },
  { id: 10, username: 'user5', course: 'Linux 基础命令', progress: 100, score: 82, status: '已完成', studyTime: '10h', updateTime: '2024-06-10 19:00:00' },
  { id: 11, username: 'user6', course: 'Python 数据分析', progress: 55, score: 0, status: '学习中', studyTime: '16h', updateTime: '2024-06-11 20:00:00' },
  { id: 12, username: 'user7', course: 'Vue3 从入门到精通', progress: 100, score: 96, status: '已完成', studyTime: '38h', updateTime: '2024-06-12 21:00:00' },
  { id: 13, username: 'user8', course: 'Element Plus 组件库', progress: 70, score: 0, status: '学习中', studyTime: '14h', updateTime: '2024-06-13 22:00:00' },
  { id: 14, username: 'user9', course: 'Pinia 状态管理', progress: 100, score: 88, status: '已完成', studyTime: '6h', updateTime: '2024-06-14 23:00:00' },
  { id: 15, username: 'user10', course: 'Vue Router 进阶', progress: 20, score: 0, status: '未开始', studyTime: '2h', updateTime: '2024-06-15 09:00:00' },
]

const statusTagType = (status) => {
  if (status === '已完成') return 'success'
  if (status === '学习中') return 'primary'
  return 'info'
}

const fetchRecords = () => {
  loading.value = true
  setTimeout(() => {
    let data = mockRecords
    if (searchText.value) {
      data = data.filter(r => r.username.toLowerCase().includes(searchText.value.toLowerCase()))
    }
    pagination.total = data.length
    const start = (pagination.page - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    recordList.value = data.slice(start, end)
    loading.value = false
  }, 300)
}

const handleSearch = () => {
  pagination.page = 1
  fetchRecords()
}

const handleSizeChange = () => {
  pagination.page = 1
  fetchRecords()
}

const handleCurrentChange = () => {
  fetchRecords()
}

onMounted(() => {
  fetchRecords()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
