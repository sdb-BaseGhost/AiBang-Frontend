<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>学习记录</span>
          <div class="header-right">
            <el-select
              v-model="filterUserId"
              placeholder="按用户筛选"
              clearable
              filterable
              style="width: 200px"
              @change="handleSearch"
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

      <el-table v-loading="loading" :data="recordList" border stripe>
        <el-table-column label="序号" width="70" align="center">
          <template #default="{ $index }">
            {{ (pagination.page - 1) * pagination.pageSize + $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="用户" min-width="160">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="32" :src="row.avatar" />
              <div class="user-info">
                <div class="nickname">{{ row.nickname || row.username }}</div>
                <div class="username">@{{ row.username }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="chapterTitle" label="章节" min-width="180" show-overflow-tooltip />
        <el-table-column prop="skillName" label="所属技能" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.skillName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="得分" width="100" align="center">
          <template #default="{ row }">
            <span :style="{ color: row.score >= 80 ? '#67c23a' : '#e6a23c', fontWeight: 600 }">
              {{ row.score }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="完成时间" width="170" />
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
import { getLearningRecords, getAdminUserList } from '@/api/user'

const loading = ref(false)
const recordList = ref([])
const userList = ref([])
const filterUserId = ref('')

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

/** 加载用户列表（用于筛选下拉框） */
const fetchUsers = async () => {
  try {
    const data = await getAdminUserList({ page: 1, size: 999 })
    userList.value = data.records
  } catch (err) {
    console.error('获取用户列表失败:', err)
  }
}

/** 加载学习记录 */
const fetchRecords = async () => {
  loading.value = true
  try {
    const data = await getLearningRecords({
      page: pagination.page,
      size: pagination.pageSize,
      userId: filterUserId.value || undefined
    })
    recordList.value = data.records
    pagination.total = data.total
  } catch (err) {
    console.error('获取学习记录失败:', err)
  } finally {
    loading.value = false
  }
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
  fetchUsers()
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

.rank-num {
  display: inline-block;
  width: 28px;
  height: 28px;
  line-height: 28px;
  text-align: center;
  border-radius: 50%;
  font-weight: bold;
  font-size: 14px;
  color: #909399;
  background: #f0f0f0;
}

.rank-num.rank-top {
  color: #fff;
  background: linear-gradient(135deg, #409eff, #79bbff);
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-info .nickname {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.user-info .username {
  font-size: 12px;
  color: #909399;
}

.hours-value {
  font-weight: 600;
  color: #409eff;
  font-size: 15px;
}
</style>
