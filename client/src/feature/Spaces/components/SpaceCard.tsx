import { useNavigate } from "react-router";
import type { Space } from "../types/space";

interface Props {
  space: Space;
}

export default function SpaceCard({ space }: Props) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/space/${space._id}/topics`);
  };

  return (
    <div
      onClick={handleClick}
      className="group border border-gray-200 rounded-lg p-6 bg-white hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
    >
      <h2 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
        {space.title}
      </h2>

      <p className="text-gray-600 mt-2 text-sm line-clamp-2 leading-relaxed">
        {space.description}
      </p>

      <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
        Created by {space.createdBy?.name}
      </div>
    </div>
  );
}