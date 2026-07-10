import api from './client'

export const getMessages = async (after = null) => {
  const params = after ? { after } : {}
  const { data } = await api.get('/api/messages', { params })
  return data
}

export const sendMessage = async ({ content = '', mediaUrl = null, mediaType = null, replyToId = null } = {}) => {
  const { data } = await api.post('/api/messages', { content, mediaUrl, mediaType, replyToId })
  return data
}

export const editMessage = async (id, content) => {
  const { data } = await api.put(`/api/messages/${id}`, { content })
  return data
}

export const deleteMessage = async (id) => {
  const { data } = await api.delete(`/api/messages/${id}`)
  return data
}

export const markRead = async () => {
  const { data } = await api.patch('/api/messages/read')
  return data
}

export const uploadMessageMedia = async (file, onProgress) => {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post('/api/messages/upload', form, {
    onUploadProgress: (e) => {
      if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total))
    },
  })
  return data
}
