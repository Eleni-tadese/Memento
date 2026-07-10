import client from './client';

export const getProfile = async () => {
  const response = await client.get('/api/profile');
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await client.put('/api/profile', data);
  return response.data;
};

export const uploadAvatarPhoto = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  // Do NOT manually set Content-Type — axios must auto-set it with the multipart boundary
  const response = await client.post('/api/profile/avatar', formData);
  return response.data;
};
