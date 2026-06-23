import request from '@/utils/request'

export const noteApi = {
  list(params) {
    return request.get('/notes', { params })
  },
  get(id) {
    return request.get(`/notes/${id}`)
  },
  create(data) {
    return request.post('/notes', data)
  },
  update(id, data) {
    return request.put(`/notes/${id}`, data)
  },
  delete(id) {
    return request.delete(`/notes/${id}`)
  }
}

export default noteApi