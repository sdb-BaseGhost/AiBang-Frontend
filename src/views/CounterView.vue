<template>
  <div class="page-container">
    <div class="nav">
      <router-link to="/counter">ref 计数器</router-link>
      <router-link to="/user-form">reactive 表单</router-link>
    </div>
    <el-card>
      <template #header>
        <span>ref 计数器演示</span>
      </template>

      <div class="counter-box">
        <p class="hint">点击数字自增</p>
        <span class="number" @click="count++">{{ count }}</span>
      </div>

      <el-divider />

      <div class="explain">
        <h4>ref 要点</h4>
        <ul>
          <li>适用于基本类型（string / number / boolean）</li>
          <li>模板中自动解包，直接写 <code>{{ count }}</code></li>
          <li>JS 中需要 <code>count.value</code> 访问</li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// ref 包装基本类型
const count = ref(0)
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

.counter-box {
  text-align: center;
  padding: 40px 0;
}

.hint {
  color: #909399;
  margin-bottom: 16px;
}

.number {
  font-size: 72px;
  font-weight: bold;
  color: #409eff;
  cursor: pointer;
  user-select: none;
  transition: transform 0.15s;
}

.number:active {
  transform: scale(1.2);
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
