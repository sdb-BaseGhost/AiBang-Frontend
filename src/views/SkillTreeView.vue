<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>技能树管理</span>
          <div class="header-right">
            <el-select
              v-model="filterCategoryId"
              placeholder="按分类筛选"
              clearable
              style="width: 150px; margin-right: 12px"
              @change="handleSearch"
            >
              <el-option
                v-for="cat in categories"
                :key="cat.categoryId"
                :label="cat.name"
                :value="cat.categoryId"
              />
            </el-select>
            <el-select
              v-model="filterLevel"
              placeholder="按等级筛选"
              clearable
              style="width: 130px; margin-right: 12px"
              @change="handleSearch"
            >
              <el-option label="入门" value="BEGINNER" />
              <el-option label="中级" value="INTERMEDIATE" />
              <el-option label="高级" value="ADVANCED" />
              <el-option label="专家" value="EXPERT" />
            </el-select>
            <el-input
              v-model="searchKeyword"
              placeholder="搜索技能名称"
              clearable
              style="width: 200px; margin-right: 12px"
              prefix-icon="Search"
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            />
            <el-button type="primary" @click="handleAddSkill">
              <el-icon><Plus /></el-icon>
              新增技能
            </el-button>
            <el-button type="success" @click="handleAddCategory" style="margin-left: 8px">
              <el-icon><FolderAdd /></el-icon>
              新增分类
            </el-button>
          </div>
        </div>
      </template>

      

      <!-- 技能数据表格 -->
      <el-table v-loading="loading" :data="skillList" border stripe row-key="skillId">
        <el-table-column label="序号" width="70">
          <template #default="{ $index }">
            {{ (pagination.page - 1) * pagination.pageSize + $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="技能名称" min-width="120" />
        <el-table-column prop="categoryName" label="分类" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.categoryName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="levelLabel" label="等级" width="80">
          <template #default="{ row }">
            <el-tag :type="levelTagType(row.level)">{{ row.levelLabel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="userCount" label="学习人数" width="100" />
        <el-table-column prop="completionRate" label="完成率" width="100">
          <template #default="{ row }">
            <el-progress :percentage="row.completionRate || 0" :stroke-width="6" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEditSkill(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDeleteSkill(row)">删除</el-button>
          </template>
        </el-table-column>
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

    <!-- 新增/编辑技能对话框 -->
    <el-dialog v-model="skillDialogVisible" :title="skillDialogTitle" width="500px" destroy-on-close>
      <el-form ref="skillFormRef" :model="skillForm" :rules="skillRules" label-width="100px">
        <el-form-item label="技能名称" prop="name">
          <el-input v-model="skillForm.name" placeholder="请输入技能名称" />
        </el-form-item>
        <el-form-item label="所属分类" prop="categoryId">
          <el-select v-model="skillForm.categoryId" placeholder="请选择分类" style="width: 100%">
            <el-option
              v-for="cat in categories"
              :key="cat.categoryId"
              :label="cat.name"
              :value="cat.categoryId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="等级" prop="level">
          <el-select v-model="skillForm.level" placeholder="请选择等级" style="width: 100%">
            <el-option label="入门" value="BEGINNER" />
            <el-option label="中级" value="INTERMEDIATE" />
            <el-option label="高级" value="ADVANCED" />
            <el-option label="专家" value="EXPERT" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="skillForm.description" type="textarea" :rows="3" placeholder="请输入技能描述" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="skillForm.sortOrder" :min="0" :max="999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="skillDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitSkill">确定</el-button>
      </template>
    </el-dialog>

    <!-- 新增/编辑分类对话框 -->
    <el-dialog v-model="categoryDialogVisible" :title="categoryDialogTitle" width="450px" destroy-on-close>
      <el-form ref="categoryFormRef" :model="categoryForm" :rules="categoryRules" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="categoryForm.icon" placeholder="图标标识，如 code、monitor" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="categoryForm.sortOrder" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="categoryForm.description" type="textarea" :rows="2" placeholder="请输入分类描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCategory">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus, FolderAdd } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getSkillCategories, createSkillCategory, updateSkillCategory, deleteSkillCategory,
  getSkillList, createSkill, updateSkill, deleteSkill
} from '@/api/user'

// ==================== 响应式状态 ====================
const loading = ref(false)
const searchKeyword = ref('')
const filterCategoryId = ref('')
const filterLevel = ref('')
const skillList = ref([])
const categories = ref([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 技能对话框
const skillDialogVisible = ref(false)
const skillDialogTitle = ref('')
const editSkillId = ref(null)
const skillFormRef = ref(null)
const skillForm = reactive({
  name: '',
  categoryId: null,
  level: 'BEGINNER',
  description: '',
  sortOrder: 0
})
const skillRules = {
  name: [{ required: true, message: '请输入技能名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  level: [{ required: true, message: '请选择等级', trigger: 'change' }]
}

// 分类对话框
const categoryDialogVisible = ref(false)
const categoryDialogTitle = ref('')
const editCategoryId = ref(null)
const categoryFormRef = ref(null)
const categoryForm = reactive({
  name: '',
  icon: '',
  sortOrder: 0,
  description: ''
})
const categoryRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

// ==================== 辅助函数 ====================
const levelTagType = (level) => {
  const map = { BEGINNER: 'info', INTERMEDIATE: '', ADVANCED: 'warning', EXPERT: 'danger' }
  return map[level] || ''
}

// ==================== 数据加载 ====================

/** 获取技能分类列表 */
const fetchCategories = async () => {
  try {
    const data = await getSkillCategories()
    categories.value = data
  } catch (err) {
    console.error('获取技能分类失败:', err)
  }
}

/** 获取技能列表 */
const fetchSkills = async () => {
  loading.value = true
  try {
    const data = await getSkillList({
      page: pagination.page,
      size: pagination.pageSize,
      categoryId: filterCategoryId.value || undefined,
      level: filterLevel.value || undefined,
      keyword: searchKeyword.value || undefined
    })
    skillList.value = data.records
    pagination.total = data.total
  } catch (err) {
    console.error('获取技能列表失败:', err)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchSkills()
}

const handleSizeChange = () => {
  pagination.page = 1
  fetchSkills()
}

const handleCurrentChange = () => {
  fetchSkills()
}

// ==================== 技能 CRUD ====================

const handleAddSkill = () => {
  editSkillId.value = null
  skillDialogTitle.value = '新增技能'
  skillForm.name = ''
  skillForm.categoryId = null
  skillForm.level = 'BEGINNER'
  skillForm.description = ''
  skillForm.sortOrder = 0
  skillDialogVisible.value = true
}

const handleEditSkill = (row) => {
  editSkillId.value = row.skillId
  skillDialogTitle.value = '编辑技能'
  skillForm.name = row.name
  skillForm.categoryId = row.categoryId
  skillForm.level = row.level
  skillForm.description = row.description
  skillForm.sortOrder = 0
  skillDialogVisible.value = true
}

const handleDeleteSkill = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除技能「${row.name}」吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteSkill(row.skillId)
    ElMessage.success('删除成功')
    fetchSkills()
  } catch (err) {
    if (err !== 'cancel') {
      console.error('删除技能失败:', err)
    }
  }
}

const submitSkill = async () => {
  if (!skillFormRef.value) return
  try {
    await skillFormRef.value.validate()
    const payload = {
      name: skillForm.name,
      categoryId: skillForm.categoryId,
      level: skillForm.level,
      description: skillForm.description,
      sortOrder: skillForm.sortOrder
    }
    if (editSkillId.value) {
      await updateSkill(editSkillId.value, payload)
      ElMessage.success('编辑成功')
    } else {
      await createSkill(payload)
      ElMessage.success('新增成功')
    }
    skillDialogVisible.value = false
    fetchSkills()
  } catch (err) {
    // 表单验证失败时会 reject
    if (err !== false) {
      console.error('保存技能失败:', err)
    }
  }
}

// ==================== 分类 CRUD ====================

const handleAddCategory = () => {
  editCategoryId.value = null
  categoryDialogTitle.value = '新增分类'
  categoryForm.name = ''
  categoryForm.icon = ''
  categoryForm.sortOrder = 0
  categoryForm.description = ''
  categoryDialogVisible.value = true
}

const submitCategory = async () => {
  if (!categoryFormRef.value) return
  try {
    await categoryFormRef.value.validate()
    const payload = {
      name: categoryForm.name,
      icon: categoryForm.icon,
      sortOrder: categoryForm.sortOrder,
      description: categoryForm.description
    }
    if (editCategoryId.value) {
      await updateSkillCategory(editCategoryId.value, payload)
      ElMessage.success('分类更新成功')
    } else {
      await createSkillCategory(payload)
      ElMessage.success('分类创建成功')
    }
    categoryDialogVisible.value = false
    fetchCategories()
  } catch (err) {
    if (err !== false) {
      console.error('保存分类失败:', err)
    }
  }
}

// ==================== 生命周期 ====================
onMounted(() => {
  fetchCategories()
  fetchSkills()
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

.header-right {
  display: flex;
  align-items: center;
}

.category-stats {
  margin-bottom: 20px;
}

.category-card {
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 12px;
  transition: background 0.2s;
}

.category-card:hover {
  background: #ecf5ff;
}

.cat-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.cat-count {
  font-size: 12px;
  color: #909399;
}

.cat-rate {
  font-size: 12px;
  color: #67c23a;
  margin-top: 2px;
}
</style>
