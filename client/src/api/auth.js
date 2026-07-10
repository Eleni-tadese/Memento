import client from './client';

export const signup = async (email, password, display_name) => {
  const response = await client.post('/api/auth/signup', {
    email,
    password,
    display_name,
  });
  return response.data;
};

export const login = async (email, password) => {
  const response = await client.post('/api/auth/login', {
    email,
    password,
  });
  return response.data;
};

export const getInviteLink = async () => {
  const response = await client.get('/api/auth/invite-link');
  return response.data;
};

export const joinWithToken = async (token, email, password, display_name) => {
  const response = await client.post(`/api/auth/join/${token}`, {
    email,
    password,
    display_name,
  });
  return response.data;
};
