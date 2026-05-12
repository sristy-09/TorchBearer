import axios from "axios";

export const toggleLike = async (postId: string) => {
  const res = await axios.put(`/posts/${postId}/like`);
  return res.data;
};