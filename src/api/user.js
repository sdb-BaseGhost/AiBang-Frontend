import request from '@/utils/request'

// Mock 用户数据（API 层兜底）
const mockUsers = [
  { id: 1, username: 'admin', email: 'admin@example.com', phone: '13800138001', status: 1, createTime: '2024-01-01 10:00:00' },
  { id: 2, username: 'user1', email: 'user1@example.com', phone: '13800138002', status: 1, createTime: '2024-01-02 11:00:00' },
  { id: 3, username: 'user2', email: 'user2@example.com', phone: '13800138003', status: 0, createTime: '2024-01-03 12:00:00' },
  { id: 4, username: 'user3', email: 'user3@example.com', phone: '13800138004', status: 1, createTime: '2024-01-04 13:00:00' },
  { id: 5, username: 'user4', email: 'user4@example.com', phone: '13800138005', status: 1, createTime: '2024-01-05 14:00:00' },
  { id: 6, username: 'user5', email: 'user5@example.com', phone: '13800138006', status: 0, createTime: '2024-01-06 15:00:00' },
  { id: 7, username: 'user6', email: 'user6@example.com', phone: '13800138007', status: 1, createTime: '2024-01-07 16:00:00' },
  { id: 8, username: 'user7', email: 'user7@example.com', phone: '13800138008', status: 1, createTime: '2024-01-08 17:00:00' },
  { id: 9, username: 'user8', email: 'user8@example.com', phone: '13800138009', status: 0, createTime: '2024-01-09 18:00:00' },
  { id: 10, username: 'user9', email: 'user9@example.com', phone: '13800138010', status: 1, createTime: '2024-01-10 19:00:00' },
  { id: 11, username: 'user10', email: 'user10@example.com', phone: '13800138011', status: 1, createTime: '2024-01-11 20:00:00' },
  { id: 12, username: 'user11', email: 'user11@example.com', phone: '13800138012', status: 1, createTime: '2024-01-12 21:00:00' },
]

// 登录
export function loginApi(data) {
  return request.post('/login', data).catch(() => {
    // Mock 兜底：模拟登录成功
    const { username } = data
    return {
      token: 'mock-token-' + Date.now(),
      userInfo: { id: 1, username, role: 'admin' }
    }
  })
}

// 获取用户列表
export function getUserList(params) {
  return request.get('/users', { params }).catch(() => {
    // Mock 兜底：从本地数据筛选 + 分页
    let filtered = mockUsers
    if (params?.username) {
      filtered = mockUsers.filter(u =>
        u.username.toLowerCase().includes(params.username.toLowerCase())
      )
    }
    const page = params?.page || 1
    const pageSize = params?.pageSize || 10
    const start = (page - 1) * pageSize
    return {
      list: filtered.slice(start, start + pageSize),
      total: filtered.length
    }
  })
}
