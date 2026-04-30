import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchSpaces } from "../../../store/Slice/spacesSlice";
import SpaceCard from "./SpaceCard";

export default function SpacesGrid() {
  const dispatch = useAppDispatch();
  const { spaces, loading } = useAppSelector(
    (state) => state.spaces
  );

  useEffect(() => {
    dispatch(fetchSpaces());
  }, [dispatch]);

  if (loading) return <p>Loading spaces...</p>;

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {spaces.map((space) => (
        <SpaceCard
          key={space._id}
          space={space}
        />
      ))}
    </div>
  );
}