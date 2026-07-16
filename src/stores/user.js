import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API_BASE = 'http://localhost:3002/api'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('qi_token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('qi_user') || 'null'))
  const currentEnterprise = ref(JSON.parse(localStorage.getItem('qi_enterprise') || 'null'))

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => userInfo.value?.role === 'admin')

  // 登录
  async function login(username, password) {
    const res = await axios.post(`${API_BASE}/auth/login`, { username, password })
    token.value = res.data.token
    userInfo.value = res.data.user
    localStorage.setItem('qi_token', res.data.token)
    localStorage.setItem('qi_user', JSON.stringify(res.data.user))
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
    return res.data
  }

  // 注册
  async function register(data) {
    const res = await axios.post(`${API_BASE}/auth/register`, data)
    return res.data
  }

  // 获取当前企业信息
  async function fetchCurrentEnterprise() {
    if (!token.value) return
    // Mock 数据，不调用后端
    const mockEnterprise = {
      id: 'ent_001',
      name: userInfo.value?.name || '示例企业',
      industry: '信息技术',
      regions: ['全国'],
      business_scope: '提供智能制造、数字化转型等企业服务',
      description: '专注于为企业提供数字化解决方案',
    }
    currentEnterprise.value = mockEnterprise
    localStorage.setItem('qi_enterprise', JSON.stringify(mockEnterprise))
  }

  // 切换企业
  function switchEnterprise(enterprise) {
    currentEnterprise.value = enterprise
    localStorage.setItem('qi_enterprise', JSON.stringify(enterprise))
  }

  // 登出
  function logout() {
    token.value = ''
    userInfo.value = null
    currentEnterprise.value = null
    localStorage.removeItem('qi_token')
    localStorage.removeItem('qi_user')
    localStorage.removeItem('qi_enterprise')
    delete axios.defaults.headers.common['Authorization']
  }

  // 初始化 axios header
  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  return {
    token,
    userInfo,
    currentEnterprise,
    isLoggedIn,
    isAdmin,
    login,
    register,
    fetchCurrentEnterprise,
    switchEnterprise,
    logout,
  }
})