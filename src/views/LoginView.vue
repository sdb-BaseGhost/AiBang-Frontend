<template>
  <div class="login-page">
    <div class="login-left">
      <div class="brand-content">
        <div class="brand-icon">
          <el-icon :size="56"><View /></el-icon>
        </div>
        <h1>管理系统</h1>
        <p>Management System</p>
        <div class="brand-desc">
          <p>高效 · 安全 · 智能的后台管理平台</p>
        </div>
      </div>
    </div>

    <div class="login-right">
      <div class="login-panel">
        <div class="panel-header">
          <h2>欢迎登录</h2>
          <p>请输入您的账号和密码</p>
        </div>

        <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form">
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              size="large"
              prefix-icon="User"
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <div class="form-actions">
            <label class="remember-label">
              <el-checkbox v-model="rememberMe" />
              <span>记住密码</span>
            </label>
            <a href="#" class="forgot-link">忘记密码？</a>
          </div>

          <el-button
            type="primary"
            :loading="loading"
            size="large"
            class="submit-btn"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form>

        <div class="panel-footer">
          <span>还没有账号？</span>
          <a href="#" class="register-link">联系管理员</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { loginApi } from '@/api/user'
import { View } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref(null)
const loading = ref(false)
const rememberMe = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

const handleLogin = () => {
  if (!loginFormRef.value) return

  loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 调用 POST /api/auth/login
        // 响应拦截器已提取 data 字段: { accessToken, refreshToken, expiresIn, user }
        const res = await loginApi({ username: loginForm.username, password: loginForm.password })
        // 保存 accessToken、refreshToken 和用户信息
        userStore.login(res.accessToken, res.refreshToken, res.user)
        ElMessage.success('登录成功')
        router.push('/home')
      } catch (err) {
        // 响应拦截器已通过 ElMessage 显示错误，此处仅记录日志
        console.error('登录失败:', err)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, #4a6cf7 0%, #3652d4 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
}

.brand-content {
  text-align: center;
  color: #fff;
}

.brand-icon {
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  backdrop-filter: blur(10px);
}

.brand-content h1 {
  margin: 0 0 12px;
  font-size: 36px;
  font-weight: 700;
  letter-spacing: 2px;
}

.brand-content > p {
  margin: 0;
  font-size: 16px;
  opacity: 0.8;
  letter-spacing: 4px;
}

.brand-desc {
  margin-top: 40px;
  padding-top: 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.brand-desc p {
  margin: 0;
  font-size: 15px;
  opacity: 0.7;
  letter-spacing: 1px;
}

.login-right {
  width: 520px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  background: #fff;
}

.login-panel {
  width: 100%;
  max-width: 400px;
}

.panel-header {
  margin-bottom: 40px;
}

.panel-header h2 {
  margin: 0 0 10px;
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
}

.panel-header p {
  margin: 0;
  font-size: 15px;
  color: #9ca3af;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.remember-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
}

.forgot-link {
  font-size: 14px;
  color: #4a6cf7;
  text-decoration: none;
}

.forgot-link:hover {
  color: #3652d4;
}

.submit-btn {
  width: 100%;
  height: 44px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  background: linear-gradient(135deg, #4a6cf7 0%, #3652d4 100%);
  border: none;
  margin-top: 8px;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.95;
}

.panel-footer {
  margin-top: 32px;
  font-size: 14px;
  color: #6b7280;
}

.register-link {
  color: #4a6cf7;
  text-decoration: none;
  font-weight: 500;
  margin-left: 4px;
}

.register-link:hover {
  color: #3652d4;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #4a6cf7;
  border-color: #4a6cf7;
}
</style>