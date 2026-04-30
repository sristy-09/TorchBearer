import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchTopicsBySpace } from "../../../store/Slice/topicsSlice";

export const useTopics = (spaceId: string | undefined) => {
  const dispatch = useAppDispatch();
  const { topics, loading, error } = useAppSelector((state) => state.topics);

  useEffect(() => {
    if (spaceId) {
      dispatch(fetchTopicsBySpace(spaceId));
    }
  }, [dispatch, spaceId]);

  return { topics, loading, error };
};
