import { apiClient } from "../../../store/Slice/authSlice"
export const getComments = async (postId: string) => {
  const res = await apiClient.get(
    `/api/comments/${postId}`
  );
  return res.data.data;
};

export const addComment = async (
  postId: string,
  text: string
) => {
  const res = await apiClient.post(
    `/api/comments/create/${postId}`,
    { text }
  );
  return res.data.data;
};

export const deleteComment = async (id: string) => {
  const res = await apiClient.delete(
    `/api/comments/${id}`
  );
  return res.data;
};

export const editComment = async (
  id: string,
  text: string
) => {
  const res = await apiClient.put(
    `/api/comments/edit/${id}`,
    { text }
  );
  return res.data.data;
};

export const replyToComment = async (
  id: string,
  text: string
) => {
  const res = await apiClient.post(
    `/api/comments/reply/${id}`,
    { text }
  );
  return res.data.data;
};