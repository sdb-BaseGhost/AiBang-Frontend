<template>
  <div class="users-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <div class="header-right">
            <el-select v-model="filterRole" placeholder="角色筛选" clearable style="width: 120px; margin-right: 8px" @change="handleSearch">
              <el-option label="学生" value="STUDENT" />
              <el-option label="管理员" value="ADMIN" />
            </el-select>
            <el-input
              v-model="searchText"
              placeholder="搜索用户名/昵称/邮箱"
              style="width: 200px; margin-right: 12px"
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            >
              <template #append>
                <el-button icon="Search" @click="handleSearch" />
              </template>
            </el-input>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="userList" border style="width: 100%">
        <el-table-column prop="userId" label="ID" width="70" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="email" label="邮箱" show-overflow-tooltip />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="row.role === 'ADMIN' ? 'danger' : 'primary'">
              {{ row.role === 'ADMIN' ? '管理员' : '学生' }}
            </el-tag>
          </template>
        </el-table-column>
      
        <el-table-column prop="totalStudyHours" label="学习时长(h)" width="110" />
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button type="warning" link @click="handleResetPwd(row)">重置密码</el-button>
            <el-button type="info" link @click="handleChangeRole(row)">修改角色</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; justify-content: flex-end"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 修改角色对话框 -->
    <el-dialog v-model="roleDialogVisible" title="修改用户角色" width="400px" destroy-on-close>
      <el-form label-width="80px">
        <el-form-item label="用户">
          <span>{{ currentUser?.nickname || currentUser?.username }}</span>
        </el-form-item>
        <el-form-item label="角色">
          <el-radio-group v-model="editRole">
            <el-radio value="STUDENT">学生</el-radio>
            <el-radio value="ADMIN">管理员</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRoleChange">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAdminUserList, updateUserRole, updateUserStatus, resetUserPassword } from '@/api/user'

const loading = ref(false)
const searchText = ref('')
const filterRole = ref('')
const filterStatus = ref('')
const userList = ref([])

const roleDialogVisible = ref(false)
const currentUser = ref(null)
const editRole = ref('')

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

/**
 * 获取用户列表
 * 调用 GET /api/admin/user/list
 */
const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await getAdminUserList({
      page: pagination.page,
      size: pagination.pageSize,
      keyword: searchText.value || undefined,
      role: filterRole.value || undefined,
      status: filterStatus.value || undefined,
      sortBy: 'createTime',
      sortOrder: 'desc'
    })
    // 响应拦截器已提取 data 字段: { records, total, current, size, pages }
    userList.value = res.records
    pagination.total = res.total
  } catch (err) {
    console.error('获取用户列表失败:', err)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchUsers()
}

const handleSizeChange = () => {
  pagination.page = 1
  fetchUsers()
}

const handleCurrentChange = () => {
  fetchUsers()
}

/**
 * 禁用/启用用户
 * 调用 PUT /api/admin/user/{userId}/status
 */
const handleToggleStatus = async (row) => {
  const newStatus = row.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE'
  const action = newStatus === 'DISABLED' ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定要${action}用户「${row.nickname || row.username}」吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await updateUserStatus(row.userId, { status: newStatus })
    ElMessage.success(`${action}成功`)
    fetchUsers()
  } catch (err) {
    if (err !== 'cancel') {
      console.error(`${action}用户失败:`, err)
    }
  }
}

/**
 * 重置用户密码
 * 调用 POST /api/admin/user/{userId}/reset-password
 */
const handleResetPwd = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要重置用户「${row.nickname || row.username}」的密码吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res = await resetUserPassword(row.userId)
    ElMessage.success(`密码已重置，临时密码: ${res.tempPassword}`)
  } catch (err) {
    if (err !== 'cancel') {
      console.error('重置密码失败:', err)
    }
  }
}

/**
 * 修改用户角色
 * 调用 PUT /api/admin/user/{userId}/role
 */
const handleChangeRole = (row) => {
  currentUser.value = row
  editRole.value = row.role
  roleDialogVisible.value = true
}

const submitRoleChange = async () => {
  try {
    await updateUserRole(currentUser.value.userId, { role: editRole.value })
    ElMessage.success('角色修改成功')
    roleDialogVisible.value = false
    fetchUsers()
  } catch (err) {
    console.error('修改角色失败:', err)
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.users-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
}
</style>
