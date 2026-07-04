import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('accessToken') || '')
  const refreshToken = ref(localStorage.getItem('refreshToken') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => userInfo.value?.role === 'ADMIN')

  function setToken(newToken) {
    token.value = newToken
    localStorage.setItem('accessToken', newToken)
  }

  function setRefreshToken(newRefreshToken) {
    refreshToken.value = newRefreshToken
    localStorage.setItem('refreshToken', newRefreshToken)
  }

  function setUserInfo(info) {
    userInfo.value = info
    localStorage.setItem('userInfo', JSON.stringify(info))
  }

  /**
   * 登录成功后保存 token 和用户信息
   * @param {string} accessToken - JWT 访问令牌
   * @param {string} refreshTokenVal - 刷新令牌
   * @param {object} info - 用户信息 { userId, username, nickname, avatar, role }
   */
  function login(accessToken, refreshTokenVal, info) {
    setToken(accessToken)
    setRefreshToken(refreshTokenVal)
    setUserInfo(info)
  }

  function logout() {
    token.value = ''
    refreshToken.value = ''
    userInfo.value = {}
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userInfo')
  }

  return {
    token,
    refreshToken,
    userInfo,
    isLoggedIn,
    isAdmin,
    setToken,
    setRefreshToken,
    setUserInfo,
    login,
    logout
  }
})