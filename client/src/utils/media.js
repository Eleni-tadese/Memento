export const getVideoPoster = (item) => {
  if (!item?.thumbnail_url || item.thumbnail_url === item.media_url) return undefined;
  const url = item.thumbnail_url.toLowerCase();
  if (url.includes('.mp4') || url.includes('.webm') || url.includes('.mov')) return undefined;
  return item.thumbnail_url;
};
