import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchPostsByTopic } from "../../../store/Slice/postsSlice";

export const usePosts = (topicId: string | undefined) => {
  const dispatch = useAppDispatch();
  const { posts, loading, error } = useAppSelector((state) => state.posts);

  useEffect(() => {
    if (topicId) {
      dispatch(fetchPostsByTopic(topicId));
    }
  }, [dispatch, topicId]);

  return { posts, loading, error };
};
