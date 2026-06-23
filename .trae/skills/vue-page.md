# Skill: vue-page
## 适用场景
快速创建符合当前项目规范的 Vue 3 页面组件

## 代码模板
```vue
<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ pageTitle }}</span>
        </div>
      </template>
      <el-table :data="tableData" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
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
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ElCard from 'element-plus/es/components/card'
import ElTable, { ElTableColumn } from 'element-plus/es/components/table'
import ElPagination from 'element-plus/es/components/pagination'
import ElButton from 'element-plus/es/components/button'

// 变量定义
const pageTitle = ref('${pageTitle}')
const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 方法定义
const handleEdit = (row) => {
  console.log('编辑', row)
}

const handleDelete = (row) => {
  console.log('删除', row)
}

const fetchData = async () => {
  // TODO: 调用 api/${apiName} 接口获取数据
  // const res = await ${apiName}Api.list({ page: currentPage.value, size: pageSize.value })
  // tableData.value = res.data.records
  // total.value = res.data.total
}

// 生命周期
onMounted(() => {
  fetchData()
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

约束条件（AI 必须遵守）
必须使用 <script setup> 语法，禁止使用 Options API
必须使用 Element Plus 组件，禁止手写原生 HTML 样式
API 请求必须调用 api/ 目录下已封装的方法，禁止直接写 axios
样式必须加 scoped，禁止全局污染
必须包含分页、列表、增删改基础结构
