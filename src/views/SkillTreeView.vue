<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>技能树管理</span>
          <div class="header-right">
            <!-- ============================================ -->
            <!-- 搜索过滤输入框 -->
            <!-- ============================================ -->
            <!-- v-model 绑定 searchKeyword 响应式变量 -->
            <!-- 用户在输入框中输入关键字时，searchKeyword 会自动更新 -->
            <!-- 由于 filteredTableData 计算属性依赖 searchKeyword -->
            <!-- 所以 searchKeyword 变化时，filteredTableData 会自动重新计算 -->
            <!-- 表格绑定的是 filteredTableData，因此表格会自动刷新显示过滤后的数据 -->
            <!-- ============================================ -->
            <el-input
              v-model="searchKeyword"
              placeholder="输入技能名称或分类进行搜索"
              clearable
              style="width: 280px; margin-right: 12px"
              prefix-icon="Search"
            />
            <el-select
              v-model="filterCategory"
              placeholder="按分类筛选"
              clearable
              style="width: 150px; margin-right: 12px"
              @change="handleFilterChange"
            >
              <el-option label="前端" value="前端" />
              <el-option label="后端" value="后端" />
              <el-option label="DevOps" value="DevOps" />
              <el-option label="数据库" value="数据库" />
              <el-option label="其他" value="其他" />
            </el-select>
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              新增技能
            </el-button>
          </div>
        </div>
      </template>

      <!-- ============================================ -->
      <!-- 技能数据表格 -->
      <!-- ============================================ -->
      <!-- :data 绑定 filteredTableData 计算属性，而非原始数组 -->
      <!-- 这样当 searchKeyword 或 filterCategory 变化时 -->
      <!-- filteredTableData 会自动重新计算，表格会自动更新 -->
      <!-- ============================================ -->
      <el-table v-loading="loading" :data="filteredTableData" border stripe row-key="id">
        <el-table-column prop="id" label="ID" width="80" />
        <!-- 技能项（技能名称） -->
        <el-table-column prop="name" label="技能项" min-width="120" />
        <!-- 技能大类（分类） -->
        <el-table-column prop="category" label="技能大类" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="等级" width="100">
          <template #default="{ row }">
            <el-rate v-model="row.level" disabled :max="5" />
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <!-- 更新时间 -->
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50]"
        :total="filteredTableData.length"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; justify-content: flex-end"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="技能名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入技能名称" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%">
            <el-option label="前端" value="前端" />
            <el-option label="后端" value="后端" />
            <el-option label="DevOps" value="DevOps" />
            <el-option label="数据库" value="数据库" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="等级" prop="level">
          <el-rate v-model="form.level" :max="5" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入技能描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
/**
 * ============================================
 * 技能树管理页面 - 组合式 API (Composition API)
 * ============================================
 * 核心功能：使用 computed 实现表格数据的实时过滤检索
 *
 * 关键知识点：
 * 1. ref - 创建响应式基本类型变量（如 searchKeyword）
 * 2. reactive - 创建响应式对象（如 pagination）
 * 3. computed - 创建计算属性，自动监听依赖变化并重新计算
 * 4. filter() - JavaScript 数组方法，根据条件过滤元素
 */

// ============================================
// 导入 Vue 3 组合式 API 核心函数
// ============================================
import { ref, reactive, computed, watch, onMounted } from 'vue'
// 导入 Element Plus 图标组件
import { Plus, Search } from '@element-plus/icons-vue'
// 导入 Element Plus 消息提示和确认框
import { ElMessage, ElMessageBox } from 'element-plus'

// ============================================
// 响应式状态变量定义
// ============================================

// 表格加载状态，控制 loading 动画的显示
const loading = ref(false)

// 技能列表数据（用于分页后的当前页数据展示）
const skillList = ref([])

// ============================================
// 核心：搜索过滤关键字（响应式变量）
// ============================================
// 使用 ref 创建响应式变量，初始值为空字符串
// 当用户在输入框中输入内容时，v-model 会自动更新此变量的值
// filteredTableData 计算属性会监听此变量的变化
// ============================================
const searchKeyword = ref('')

// 对话框显示状态
const dialogVisible = ref(false)
// 对话框标题（新增/编辑）
const dialogTitle = ref('')
// 当前编辑的技能 ID（null 表示新增模式）
const editId = ref(null)
// 表单引用，用于表单验证
const formRef = ref(null)
// 分类筛选下拉框的值
const filterCategory = ref('')

// 分页配置（使用 reactive 创建响应式对象）
const pagination = reactive({
  page: 1,        // 当前页码
  pageSize: 10,   // 每页显示条数
  total: 0        // 总条数（会根据过滤结果动态更新）
})

let allData = [
  { id: 1, name: 'Vue3', category: '前端', level: 5, description: 'Vue3 组合式 API、响应式原理、组件化开发', updateTime: '2024-06-01 10:00:00' },
  { id: 2, name: 'React', category: '前端', level: 4, description: 'React Hooks、状态管理、虚拟 DOM', updateTime: '2024-06-02 11:00:00' },
  { id: 3, name: 'TypeScript', category: '前端', level: 4, description: '类型系统、泛型、装饰器', updateTime: '2024-06-03 12:00:00' },
  { id: 4, name: 'Node.js', category: '后端', level: 4, description: 'Express/Koa 框架、中间件、异步编程', updateTime: '2024-06-04 13:00:00' },
  { id: 5, name: 'MySQL', category: '数据库', level: 3, description: 'SQL 查询优化、索引、事务', updateTime: '2024-06-05 14:00:00' },
  { id: 6, name: 'Docker', category: 'DevOps', level: 3, description: '容器化部署、Dockerfile、Compose', updateTime: '2024-06-06 15:00:00' },
  { id: 7, name: 'Git', category: 'DevOps', level: 4, description: '分支管理、合并策略、工作流', updateTime: '2024-06-07 16:00:00' },
  { id: 8, name: 'CSS3', category: '前端', level: 4, description: 'Flex/Grid 布局、动画、响应式设计', updateTime: '2024-06-08 17:00:00' },
  { id: 9, name: 'Python', category: '后端', level: 3, description: 'Flask/Django、数据处理、脚本编写', updateTime: '2024-06-09 18:00:00' },
  { id: 10, name: 'Redis', category: '数据库', level: 3, description: '缓存策略、数据结构、分布式锁', updateTime: '2024-06-10 19:00:00' },
  { id: 11, name: 'Nginx', category: 'DevOps', level: 3, description: '反向代理、负载均衡、HTTPS 配置', updateTime: '2024-06-11 20:00:00' },
  { id: 12, name: 'Webpack', category: '前端', level: 3, description: '模块打包、Loader、Plugin 配置', updateTime: '2024-06-12 21:00:00' },
]

// ============================================
// 核心：计算属性 filteredTableData（实时过滤检索）
// ============================================
/**
 * filteredTableData - 计算属性（computed）
 *
 * 工作原理：
 * 1. computed 会自动收集内部使用的响应式依赖（searchKeyword、filterCategory）
 * 2. 当 searchKeyword 或 filterCategory 发生变化时
 * 3. computed 会自动重新计算，返回新的过滤结果
 * 4. 表格绑定了 filteredTableData，因此会自动刷新显示
 *
 * 与 watch 的区别：
 * - watch：需要手动指定监听目标，并且需要手动更新数据
 * - computed：自动追踪依赖，自动计算，使用更简洁
 *
 * 过滤逻辑：
 * - 同时支持关键字搜索和分类筛选
 * - 关键字搜索：在技能名称（name）和分类（category）中进行模糊匹配
 * - 分类筛选：精确匹配分类
 * - 两个条件可以同时生效，实现组合过滤
 */
const filteredTableData = computed(() => {
  // 第一步：根据关键字进行过滤
  // 如果 searchKeyword 为空或 null，则不进行关键字过滤，返回所有数据
  // 否则，使用 filter() 方法过滤出包含关键字的项
  let result = allData

  // 关键字过滤：搜索技能名称或分类中是否包含输入的关键字
  if (searchKeyword.value) {
    // 将关键字转换为小写，实现不区分大小写的搜索
    const keyword = searchKeyword.value.toLowerCase().trim()

    // 使用 filter() 方法遍历每个技能项
    // includes() 方法检查字符串是否包含指定的子字符串
    // 这里同时搜索 name（技能项）和 category（技能大类）字段
    result = result.filter(item =>
      item.name.toLowerCase().includes(keyword) ||
      item.category.toLowerCase().includes(keyword)
    )
  }

  // 第二步：根据分类进行精确过滤
  // 如果用户选择了分类，则只保留该分类下的技能
  if (filterCategory.value) {
    result = result.filter(item => item.category === filterCategory.value)
  }

  // 第三步：返回过滤后的数据
  // 注意：分页总数会通过模板中的 filteredTableData.length 自动计算
  // 这里不需要手动设置 pagination.total，保持计算属性的纯净性
  return result
})

const form = reactive({
  name: '',
  category: '',
  level: 3,
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入技能名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  level: [{ required: true, message: '请选择等级', trigger: 'change' }]
}

/**
 * fetchList - 获取技能列表数据（分页处理）
 *
 * 此函数负责：
 * 1. 从 filteredTableData（过滤后的数据）中获取当前页的数据
 * 2. 实现分页逻辑，根据当前页码和每页显示条数进行切片
 * 3. 模拟异步加载效果（实际项目中应该是 API 请求）
 *
 * 注意：过滤逻辑已经在 filteredTableData 计算属性中完成
 *       这里只需要负责分页展示
 */
const fetchList = () => {
  loading.value = true
  // 模拟 API 请求延迟（实际项目中应替换为真实的 API 调用）
  setTimeout(() => {
    // filteredTableData 是计算属性，会根据 searchKeyword 和 filterCategory 自动更新
    // 我们只需要对过滤后的数据进行分页处理即可
    const filtered = filteredTableData.value

    // 分页切片：根据当前页码计算起始和结束索引
    const start = (pagination.page - 1) * pagination.pageSize
    const end = start + pagination.pageSize

    // 将分页后的数据赋值给 skillList，用于表格渲染
    skillList.value = filtered.slice(start, end)
    loading.value = false
  }, 300)
}

const handleFilterChange = () => {
  pagination.page = 1
  fetchList()
}

// ============================================
// 监听搜索关键字变化，自动刷新列表
// ============================================
/**
 * watch - 监听 searchKeyword 的变化
 *
 * 当用户在输入框中输入内容时：
 * 1. v-model 自动更新 searchKeyword 的值
 * 2. watch 监听到变化，执行回调函数
 * 3. 回调函数将页码重置为第 1 页（因为过滤后数据量可能变化）
 * 4. 调用 fetchList() 重新获取并展示过滤后的数据
 *
 * immediate: false 表示组件初始化时不立即执行（默认值）
 * 如果设置为 true，则组件初始化时会立即执行一次回调
 */
watch(searchKeyword, (newValue, oldValue) => {
  // 当搜索关键字变化时，重置到第 1 页
  // 因为过滤后数据量可能减少，避免停留在不存在的页码
  pagination.page = 1
  // 重新获取列表数据（此时 filteredTableData 会自动重新计算）
  fetchList()
})

const handleAdd = () => {
  editId.value = null
  dialogTitle.value = '新增技能'
  form.name = ''
  form.category = ''
  form.level = 3
  form.description = ''
  dialogVisible.value = true
}

const handleEdit = (row) => {
  editId.value = row.id
  dialogTitle.value = '编辑技能'
  form.name = row.name
  form.category = row.category
  form.level = row.level
  form.description = row.description
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该技能吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    allData = allData.filter(item => item.id !== row.id)
    ElMessage.success('删除成功')
    fetchList()
  } catch {
    // cancelled
  }
}

const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (!valid) return

    if (editId.value) {
      const index = allData.findIndex(item => item.id === editId.value)
      if (index !== -1) {
        allData[index] = {
          ...allData[index],
          name: form.name,
          category: form.category,
          level: form.level,
          description: form.description,
          updateTime: new Date().toLocaleString('zh-CN')
        }
      }
      ElMessage.success('编辑成功')
    } else {
      const newId = allData.length ? Math.max(...allData.map(s => s.id)) + 1 : 1
      allData.push({
        id: newId,
        name: form.name,
        category: form.category,
        level: form.level,
        description: form.description,
        updateTime: new Date().toLocaleString('zh-CN')
      })
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchList()
  })
}

const handleSizeChange = () => {
  pagination.page = 1
  fetchList()
}

const handleCurrentChange = () => {
  fetchList()
}

onMounted(() => {
  fetchList()
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

/* 搜索输入框样式优化 */
:deep(.el-input__wrapper) {
  border-radius: 20px;
}

/* 搜索图标样式 */
:deep(.el-input__prefix) {
  display: flex;
  align-items: center;
}
</style>
