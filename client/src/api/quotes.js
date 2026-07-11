import client from './client';

export const getQuotes = async () => {
  const res = await client.get('/api/quotes');
  return res.data?.quotes || [];
};

export const saveQuotes = async (quotes) => {
  const res = await client.put('/api/quotes', { quotes });
  return res.data?.quotes || quotes;
};
