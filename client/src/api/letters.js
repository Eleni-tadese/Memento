import client from './client'

export const getLetters = async () => {
  const { data } = await client.get('/api/letters')
  return data
}

export const getLetter = async (id) => {
  const { data } = await client.get(`/api/letters/${id}`)
  return data
}

export const createLetter = async (payload) => {
  const { data } = await client.post('/api/letters', payload)
  return data
}

export const updateLetter = async (id, payload) => {
  const { data } = await client.put(`/api/letters/${id}`, payload)
  return data
}

export const deleteLetter = async (id) => {
  const { data } = await client.delete(`/api/letters/${id}`)
  return data
}

export const pinLetter = async (id, pin) => {
  const { data } = await client.patch(`/api/letters/${id}/pin`, { pin })
  return data
}
