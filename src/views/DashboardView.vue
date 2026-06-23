/**
 * ============================================
 * 学时看板展示页面 (DashboardView.vue)
 * ============================================
 *
 * 用途：展示 LineDashboard 组件的页面
 * 路由：/dashboard
 */
<template>
  <div class="page-container">
    <LineDashboard />
  </div>
</template>

<script setup>
/**
 * 导入 LineDashboard 组件
 * 使用 @/ 别名指向 src 目录
 */
import LineDashboard from '@/components/LineDashboard.vue'
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f0f2f5;
}
</style>