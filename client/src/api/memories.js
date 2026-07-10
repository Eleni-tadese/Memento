import client from './client';

export const getMemories = async (params = {}) => {
  const response = await client.get('/api/memories', { params });
  return response.data;
};

export const getMemory = async (id) => {
  const response = await client.get(`/api/memories/${id}`);
  return response.data;
};

export const createMemory = async (formData) => {
  const response = await client.post('/api/memories', formData);
  return response.data;
};

export const updateMemory = async (id, data) => {
  const response = await client.patch(`/api/memories/${id}`, data);
  return response.data;
};

export const deleteMemory = async (id) => {
  const response = await client.delete(`/api/memories/${id}`);
  return response.data;
};

export const uploadMedia = async (memoryId, formData) => {
  const response = await client.post(`/api/memories/${memoryId}/media`, formData);
  return response.data;
};

export const deleteMedia = async (mediaId) => {
  const response = await client.delete(`/api/media/${mediaId}`);
  return response.data;
};

export const getAllPhotos = async () => {
  const response = await client.get('/api/memories/photos');
  return response.data;
};

export const addComment = async (memoryId, commentText) => {
  const response = await client.post(`/api/memories/${memoryId}/comments`, {
    body: commentText,
  });
  return response.data;
};
