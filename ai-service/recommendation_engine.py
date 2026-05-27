"""
Recommendation Engine
Uses TF-IDF vectorization and cosine similarity
to match user skills/interests against space content.

Performance: spaces and the TF-IDF matrix are cached in memory
and only rebuilt when the space count changes or the cache is
older than CACHE_TTL_SECONDS (default 60 s).
"""

import time
from typing import List, Tuple, Dict, Any, Set, Optional

import numpy as np
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


CACHE_TTL_SECONDS = 60


class RecommendationEngine:
    def __init__(self, mongo_uri: str, db_name: str = "torchbearer"):
        if not mongo_uri:
            raise ValueError("MONGO_URI environment variable is not set.")

        self.client = MongoClient(mongo_uri)
        self.db = self.client[db_name]
        self.spaces_collection = self.db["spaces"]

        # ── Cache ─────────────────────────────
        self._cached_spaces: List[Dict[str, Any]] = []
        self._cached_vectorizer: Optional[TfidfVectorizer] = None
        self._cached_space_vectors = None
        self._cache_timestamp: float = 0.0
        self._cache_space_count: int = 0

        try:
            self.client.admin.command("ping")
            print("✅ MongoDB connected successfully")
        except ConnectionFailure as exc:
            raise ConnectionError(f"❌ Cannot connect to MongoDB: {exc}") from exc

        self._refresh_cache()

    # ── Cache Management ─────────────────────────────

    def _is_cache_stale(self) -> bool:
        age = time.time() - self._cache_timestamp
        if age > CACHE_TTL_SECONDS:
            return True

        current_count = self.spaces_collection.count_documents({})
        if current_count != self._cache_space_count:
            return True

        return False

    def _refresh_cache(self) -> None:
        spaces = self._fetch_spaces()
        corpus = [self._build_searchable_text(s) for s in spaces]

        vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            min_df=1,
            sublinear_tf=True,
        )

        space_vectors = vectorizer.fit_transform(corpus) if corpus else None

        self._cached_spaces = spaces
        self._cached_vectorizer = vectorizer
        self._cached_space_vectors = space_vectors
        self._cache_timestamp = time.time()
        self._cache_space_count = len(spaces)

        print(f"🔄 Cache refreshed — {len(spaces)} spaces indexed")

    def _get_cache(self):
        if self._is_cache_stale():
            self._refresh_cache()

        return (
            self._cached_spaces,
            self._cached_vectorizer,
            self._cached_space_vectors,
        )

    # ── MongoDB Fetch ─────────────────────────────

    def _fetch_spaces(self) -> List[Dict[str, Any]]:
        pipeline = [
            {
                "$lookup": {
                    "from": "users",
                    "localField": "createdBy",
                    "foreignField": "_id",
                    "as": "creator",
                }
            },
            {
                "$project": {
                    "_id": 1,
                    "title": 1,
                    "name": 1,
                    "description": 1,
                    "tags": {"$ifNull": ["$tags", []]},
                    "creator": {"$arrayElemAt": ["$creator.name", 0]},
                }
            },
        ]
        return list(self.spaces_collection.aggregate(pipeline))

    # ── Text Processing ─────────────────────────────

    def _build_searchable_text(self, space: Dict[str, Any]) -> str:
        parts = []

        title = space.get("title") or space.get("name") or ""
        if title:
            parts.extend([title.lower()] * 5)

        description = space.get("description", "")
        if description:
            parts.append(description.lower())

        tags = space.get("tags", [])
        if tags:
            normalized_tags = []
            for tag in tags:
                tag_lower = tag.lower()
                normalized_tags.append(tag_lower)
                normalized_tags.append(tag_lower.replace(" ", ""))
                normalized_tags.append(tag_lower.replace("/", " "))

            parts.extend([" ".join(normalized_tags)] * 8)

        return " ".join(parts)

    # ── Public API ─────────────────────────────

    def recommend(
        self,
        query_terms: List[str],
        top_n: int = 5,
    ) -> Tuple[List[Dict[str, Any]], int]:

        spaces, vectorizer, space_vectors = self._get_cache()

        if not spaces or space_vectors is None:
            return [], 0

        # Build query text (NO fuzzy logic anymore)
        query_text = " ".join(term.lower() for term in query_terms)

        query_vector = vectorizer.transform([query_text])

        similarity_scores = cosine_similarity(
            query_vector,
            space_vectors
        ).flatten()

        ranked_indices = np.argsort(similarity_scores)[::-1]

        results = []

        for idx in ranked_indices[:top_n]:
            score = float(similarity_scores[idx])
            space = spaces[idx]

            title = (space.get("title") or space.get("name") or "").lower()
            tags_lower = [t.lower() for t in (space.get("tags") or [])]
            tags_nospace = [t.replace(" ", "") for t in tags_lower]
            tags_words = set(word for tag in tags_lower for word in tag.split())
            title_words = set(title.split())

            boost = 0.0
            for term in query_terms:
                term = term.lower()

                if term in tags_lower or term in tags_nospace:
                    boost += 0.2
                elif term in tags_words or term in title_words:
                    boost += 0.2
                elif term in title:
                    boost += 0.2
                elif any(term in tag for tag in tags_lower):
                    boost += 0.2

            boosted_score = min(score + boost, 1.0)

            if boosted_score <= 0.01:
                continue

            results.append({
                "id": str(space["_id"]),
                "title": space.get("title") or space.get("name") or "Untitled",
                "description": space.get("description") or "",
                "tags": space.get("tags") or [],
                "similarity_score": round(boosted_score, 4),
                "created_by": space.get("creator") or None,
            })

        results.sort(key=lambda r: r["similarity_score"], reverse=True)

        return results, len(spaces)