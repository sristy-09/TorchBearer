import type { Space } from "../types/space";

interface Props {
  space: Space;
}

export default function SpaceCard({ space }: Props) {
  return (
    <div className="rounded-2xl border p-5 bg-white shadow-sm hover:shadow-md transition">
      <h2 className="font-bold text-xl">
        {space.title}
      </h2>

      <p className="text-gray-500 mt-2 line-clamp-3">
        {space.description}
      </p>

      <div className="mt-4 text-sm text-gray-400">
        by {space.createdBy?.name}
      </div>
    </div>
  );
}