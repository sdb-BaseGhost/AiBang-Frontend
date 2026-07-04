import request from '@/utils/request'

// ==================== 认证相关 (共用) ====================

/** 登录 */
export function loginApi(data) {
  return request.post('/auth/login', data)
}

/** 注册 */
export function registerApi(data) {
  return request.post('/auth/register', data)
}

/** 刷新 Token */
export function refreshTokenApi(data) {
  return request.post('/auth/refresh', data)
}

/** 获取当前用户信息 */
export function getMe() {
  return request.get('/auth/me')
}

// ==================== 用户资料管理 (共用) ====================

/** 更新个人资料 */
export function updateProfile(data) {
  return request.put('/user/profile', data)
}

/** 修改密码 */
export function changePassword(data) {
  return request.put('/user/password', data)
}

// ==================== 管理员 - 用户管理 ====================

/** 获取用户列表（管理版） */
export function getAdminUserList(params) {
  return request.get('/admin/users', { params })
}

/** 获取用户详情（管理版） */
export function getAdminUserDetail(userId) {
  return request.get(`/admin/user/${userId}`)
}

/** 修改用户角色 */
export function updateUserRole(userId, data) {
  return request.put(`/admin/user/${userId}/role`, data)
}

/** 禁用/启用用户 */
export function updateUserStatus(userId, data) {
  return request.put(`/admin/user/${userId}/status`, data)
}

/** 重置用户密码 */
export function resetUserPassword(userId) {
  return request.post(`/admin/user/${userId}/reset-password`)
}

/** 批量导入用户 */
export function importUsers(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/admin/user/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/** 导出用户数据 */
export function exportUsers(params) {
  return request.get('/admin/user/export', {
    params,
    responseType: 'blob'
  })
}

// ==================== 管理员 - 仪表盘 ====================

/** 获取仪表盘统计数据 */
export function getDashboard(params) {
  return request.get('/admin/dashboard', { params })
}

/** 获取用户增长趋势 */
export function getUserTrend(params) {
  return request.get('/admin/user-trend', { params })
}

/** 获取学习活跃度排行 */
export function getLearningRanking(params) {
  return request.get('/admin/learning-ranking', { params })
}

/** 获取学习记录（已完成的章节记录） */
export function getLearningRecords(params) {
  return request.get('/admin/learning-records', { params })
}

// ==================== 管理员 - 技能树管理 ====================

/** 获取技能分类列表 */
export function getSkillCategories() {
  return request.get('/admin/skill/categories')
}

/** 创建技能分类 */
export function createSkillCategory(data) {
  return request.post('/admin/skill/category', data)
}

/** 更新技能分类 */
export function updateSkillCategory(categoryId, data) {
  return request.put(`/admin/skill/category/${categoryId}`, data)
}

/** 删除技能分类 */
export function deleteSkillCategory(categoryId) {
  return request.delete(`/admin/skill/category/${categoryId}`)
}

/** 获取技能列表（管理版） */
export function getSkillList(params) {
  return request.get('/admin/skill/list', { params })
}

/** 创建技能 */
export function createSkill(data) {
  return request.post('/admin/skill', data)
}

/** 更新技能 */
export function updateSkill(skillId, data) {
  return request.put(`/admin/skill/${skillId}`, data)
}

/** 删除技能 */
export function deleteSkill(skillId) {
  return request.delete(`/admin/skill/${skillId}`)
}

/** 获取技能统计 */
export function getSkillStats() {
  return request.get('/admin/skill/stats')
}

// ==================== 管理员 - 系统配置 ====================

/** 获取系统配置 */
export function getSystemConfig() {
  return request.get('/admin/config')
}

/** 更新系统配置 */
export function updateSystemConfig(data) {
  return request.put('/admin/config', data)
}

// ==================== 管理员 - 日志 ====================

/** 获取操作日志 */
export function getOperationLogs(params) {
  return request.get('/admin/logs/operation', { params })
}

/** 获取 AI 调用日志 */
export function getAiLogs(params) {
  return request.get('/admin/logs/ai', { params })
}

// ==================== 文件上传 ====================

/** 上传头像 */
export function uploadAvatar(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/file/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/** 上传简历文件 */
export function uploadResume(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/file/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
