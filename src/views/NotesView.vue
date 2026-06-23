<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ pageTitle }}</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增笔记
          </el-button>
        </div>
      </template>
      
      <el-input
        v-model="searchText"
        placeholder="搜索笔记标题"
        style="width: 300px; margin-bottom: 20px"
        clearable
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button icon="Search" @click="handleSearch" />
        </template>
      </el-input>
      
      <el-table :data="tableData" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="warning" link @click="handleView(row)">查看</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin-top: 20px; text-align: right"
      />
    </el-card>
    
    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入笔记标题" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="formData.category" placeholder="请选择分类">
            <el-option label="技术笔记" value="技术笔记" />
            <el-option label="学习心得" value="学习心得" />
            <el-option label="工作记录" value="工作记录" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="formData.content"
            type="textarea"
            :rows="5"
            placeholder="请输入笔记内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
    
    <!-- 查看详情弹窗 -->
    <el-dialog title="笔记详情" :visible.sync="viewDialogVisible" width="600px">
      <div class="note-detail">
        <h3>{{ viewData.title }}</h3>
        <div class="detail-meta">
          <span class="category">{{ viewData.category }}</span>
          <span class="time">{{ viewData.createTime }}</span>
        </div>
        <div class="detail-content">{{ viewData.content }}</div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { noteApi } from '@/api/note'

// 变量定义
const pageTitle = ref('学习笔记')
const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchText = ref('')

// 弹窗相关
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const formRef = ref(null)
const editId = ref(null)

const formData = reactive({
  title: '',
  category: '',
  content: ''
})

const viewData = reactive({
  title: '',
  category: '',
  content: '',
  createTime: ''
})

const formRules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { max: 100, message: '标题长度不能超过100个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' }
  ]
}

// 模拟数据
const mockNotes = [
  { id: 1, title: 'Vue3 Composition API 学习', category: '技术笔记', content: 'Vue3 Composition API 是 Vue3 的核心特性，提供了更灵活的代码组织方式。', createTime: '2024-01-15 10:30:00' },
  { id: 2, title: 'Element Plus 使用总结', category: '技术笔记', content: 'Element Plus 是 Vue3 的 UI 组件库，提供了丰富的组件。', createTime: '2024-01-14 15:20:00' },
  { id: 3, title: '每日工作总结', category: '工作记录', content: '完成了用户管理模块的开发和测试。', createTime: '2024-01-13 18:45:00' },
  { id: 4, title: 'JavaScript 异步编程', category: '学习心得', content: 'Promise、async/await 的使用方法和最佳实践。', createTime: '2024-01-12 09:15:00' },
  { id: 5, title: 'CSS Grid 布局', category: '技术笔记', content: 'CSS Grid 是一种强大的布局方式，可以轻松实现复杂的网格布局。', createTime: '2024-01-11 14:00:00' },
  { id: 6, title: '项目复盘', category: '工作记录', content: '回顾本周项目进展，总结经验教训。', createTime: '2024-01-10 17:30:00' },
  { id: 7, title: 'TypeScript 入门', category: '学习心得', content: 'TypeScript 的基本语法和类型系统。', createTime: '2024-01-09 11:20:00' },
  { id: 8, title: 'Git 常用命令', category: '技术笔记', content: 'git add、commit、push、pull 等常用命令。', createTime: '2024-01-08 16:40:00' },
  { id: 9, title: '阅读笔记', category: '学习心得', content: '阅读《代码整洁之道》的心得体会。', createTime: '2024-01-07 10:00:00' },
  { id: 10, title: '会议记录', category: '工作记录', content: '参加项目周会，讨论下周计划。', createTime: '2024-01-06 09:30:00' },
  { id: 11, title: 'Node.js 学习', category: '技术笔记', content: 'Node.js 基础和 Express 框架入门。', createTime: '2024-01-05 14:50:00' },
  { id: 12, title: '代码审查要点', category: '工作记录', content: '代码审查时需要关注的重点问题。', createTime: '2024-01-04 15:30:00' }
]

// 方法定义
const handleAdd = () => {
  editId.value = null
  dialogTitle.value = '新增笔记'
  formData.title = ''
  formData.category = ''
  formData.content = ''
  dialogVisible.value = true
}

const handleEdit = (row) => {
  editId.value = row.id
  dialogTitle.value = '编辑笔记'
  formData.title = row.title
  formData.category = row.category
  formData.content = row.content
  dialogVisible.value = true
}

const handleView = (row) => {
  viewData.title = row.title
  viewData.category = row.category
  viewData.content = row.content
  viewData.createTime = row.createTime
  viewDialogVisible.value = true
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm(
    '确定要删除这条笔记吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      tableData.value = tableData.value.filter(item => item.id !== row.id)
      total.value = tableData.value.length
      ElMessage.success('删除成功')
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (editId.value) {
          const index = tableData.value.findIndex(item => item.id === editId.value)
          if (index !== -1) {
            tableData.value[index] = {
              ...tableData.value[index],
              title: formData.title,
              category: formData.category,
              content: formData.content
            }
          }
          ElMessage.success('编辑成功')
        } else {
          const newNote = {
            id: Date.now(),
            title: formData.title,
            category: formData.category,
            content: formData.content,
            createTime: new Date().toLocaleString('zh-CN')
          }
          tableData.value.unshift(newNote)
          total.value = tableData.value.length
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
      } catch (error) {
        ElMessage.error('操作失败')
      }
    }
  })
}

const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

const handleSizeChange = () => {
  currentPage.value = 1
  fetchData()
}

const handleCurrentChange = () => {
  fetchData()
}

const fetchData = async () => {
  let data = [...mockNotes]
  
  if (searchText.value) {
    data = data.filter(item => 
      item.title.toLowerCase().includes(searchText.value.toLowerCase())
    )
  }
  
  total.value = data.length
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  tableData.value = data.slice(start, end)
}

// 生命周期
onMounted(() => {
  fetchData()
})

// 计算属性
const dialogTitle = ref('')
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

.note-detail {
  padding: 10px;
}

.note-detail h3 {
  margin: 0 0 16px;
  font-size: 18px;
  color: #303133;
}

.detail-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #909399;
}

.detail-meta .category {
  background-color: #ecf5ff;
  color: #409eff;
  padding: 4px 12px;
  border-radius: 4px;
}

.detail-content {
  font-size: 14px;
  line-height: 1.8;
  color: #606266;
  white-space: pre-wrap;
}
</style>