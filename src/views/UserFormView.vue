<template>
  <div class="page-container">
    <div class="nav">
      <router-link to="/counter">ref 计数器</router-link>
      <router-link to="/user-form">reactive 表单</router-link>
    </div>
    <el-card>
      <template #header>
        <span>reactive 用户信息表单演示</span>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        style="max-width: 500px"
      >
        <!-- 昵称 -->
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称" />
        </el-form-item>

        <!-- 手机号 -->
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="11" />
        </el-form-item>

        <!-- 邮箱 -->
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>

        <!-- 性别 -->
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="form.gender">
            <el-radio value="male">男</el-radio>
            <el-radio value="female">女</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 系统角色 -->
        <el-form-item label="系统角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="超级管理员" value="admin" />
            <el-option label="普通用户" value="user" />
            <el-option label="访客" value="guest" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit">提交</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-divider />

      <div class="explain">
        <h4>reactive 要点</h4>
        <ul>
          <li>适用于对象 / 数组等引用类型</li>
          <li>直接访问属性，无需 <code>.value</code></li>
          <li>不能解构（会丢失响应性），需要 <code>toRefs</code></li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

const formRef = ref(null)

// reactive 包装对象类型
const form = reactive({
  nickname: '',
  phone: '',
  email: '',
  gender: '',
  role: ''
})

// 手机号校验
const phoneValidator = (rule, value, callback) => {
  if (!value) return callback(new Error('请输入手机号'))
  if (!/^1[3-9]\d{9}$/.test(value)) return callback(new Error('手机号格式不正确'))
  callback()
}

// 邮箱校验
const emailValidator = (rule, value, callback) => {
  if (!value) return callback(new Error('请输入邮箱'))
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return callback(new Error('邮箱格式不正确'))
  callback()
}

const rules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, validator: phoneValidator, trigger: 'blur' }
  ],
  email: [
    { required: true, validator: emailValidator, trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  role: [
    { required: true, message: '请选择系统角色', trigger: 'change' }
  ]
}

const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('提交成功！')
      console.log('表单数据:', { ...form })
    }
  })
}

const handleReset = () => {
  formRef.value.resetFields()
}
</script>

<style scoped>
.page-container {
  padding: 20px;
  max-width: 700px;
  margin: 0 auto;
}

.nav {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.nav a {
  color: #409eff;
  text-decoration: none;
  font-size: 14px;
}

.nav a.router-link-active {
  font-weight: bold;
  border-bottom: 2px solid #409eff;
  padding-bottom: 2px;
}

.explain {
  color: #606266;
}

.explain h4 {
  margin-bottom: 8px;
}

.explain ul {
  padding-left: 20px;
  line-height: 2;
}

.explain code {
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
  color: #e6a23c;
}
</style>
