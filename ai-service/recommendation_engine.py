"""
Recommendation Engine
Uses TF-IDF vectorization and cosine similarity
to match user skills/interests against space content.
"""

from typing import List, Tuple, Dict, Any

import numpy as np
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class RecommendationEngine:
    def __init__(self, mongo_uri: str, db_name: str = "torchbearer"):
        """
        Initialize MongoDB connection.
        """

        if not mongo_uri:
            raise ValueError("MONGO_URI environment variable is not set.")

        self.client = MongoClient(mongo_uri)
        self.db = self.client[db_name]
        self.spaces_collection = self.db["spaces"]

        # Verify MongoDB connection
        try:
            self.client.admin.command("ping")
            print("✅ MongoDB connected successfully")

        except ConnectionFailure as exc:
            raise ConnectionError(
                f"❌ Cannot connect to MongoDB: {exc}"
            ) from exc

    def _fetch_spaces(self) -> List[Dict[str, Any]]:
        """
        Fetch all spaces from MongoDB.

        Expected fields:
        - _id
        - title
        - description
        - tags
        - createdBy
        """

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
                    # Use $ifNull so spaces without tags field return []
                    "tags": {"$ifNull": ["$tags", []]},
                    "creator": {
                        "$arrayElemAt": ["$creator.name", 0]
                    },
                }
            },
        ]

        return list(self.spaces_collection.aggregate(pipeline))

    def _build_searchable_text(
        self,
        space: Dict[str, Any]
    ) -> str:
        """
        Build searchable text from:
        - title
        - description
        - tags
        """

        parts = []

        # Title
        title = (
            space.get("title")
            or space.get("name")
            or ""
        )

        if title:
            normalized_title = title.lower()

            # Weight title heavily
            parts.extend([normalized_title] * 5)

        # Description
        description = space.get("description", "")

        if description:
            parts.append(description.lower())

        # Tags
        tags = space.get("tags", [])

        normalized_tags = []

        for tag in tags:
            tag_lower = tag.lower()

            normalized_tags.append(tag_lower)
            normalized_tags.append(
                tag_lower.replace(" ", "")
            )
            normalized_tags.append(
                tag_lower.replace("/", " ")
            )

        if normalized_tags:
            tag_text = " ".join(normalized_tags)

            # Weight tags heavily
            parts.extend([tag_text] * 8)

        return " ".join(parts)

    def recommend(
        self,
        query_terms: List[str],
        top_n: int = 5,
    ) -> Tuple[List[Dict[str, Any]], int]:
        """
        Recommendation workflow:

        1. Fetch spaces
        2. Build searchable corpus
        3. Vectorize with TF-IDF
        4. Compute cosine similarity
        5. Return top matches
        """

        spaces = self._fetch_spaces()

        if not spaces:
            return [], 0

        # Build corpus
        corpus = [
            self._build_searchable_text(space)
            for space in spaces
        ]

        # Process query terms
        processed_terms = []

        for term in query_terms:
            term_lower = term.lower()

            processed_terms.append(term_lower)
            processed_terms.append(
                term_lower.replace(" ", "")
            )
            processed_terms.append(
                term_lower.replace("/", " ")
            )

        query_text = " ".join(processed_terms)

        # Add query to corpus
        all_documents = corpus + [query_text]

        # TF-IDF Vectorizer
        vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            min_df=1,
            sublinear_tf=True,
        )

        # Transform documents
        tfidf_matrix = vectorizer.fit_transform(
            all_documents
        )

        # Separate vectors
        space_vectors = tfidf_matrix[:-1]
        query_vector = tfidf_matrix[-1]

        # Similarity calculation
        similarity_scores = cosine_similarity(
            query_vector,
            space_vectors
        ).flatten()

        # Rank results
        ranked_indices = np.argsort(
            similarity_scores
        )[::-1]

        results = []

        for idx in ranked_indices[:top_n]:
            score = float(similarity_scores[idx])

            # Ignore very weak matches
            if score <= 0.01:
                break

            space = spaces[idx]

            results.append(
                {
                    "id": str(space["_id"]),
                    "title": (
                        space.get("title")
                        or space.get("name")
                        or "Untitled"
                    ),
                    "description": space.get("description") or "",
                    "tags": space.get("tags") or [],
                    "similarity_score": round(score, 4),
                    "created_by": space.get("creator") or None,
                }
            )

        return results, len(spaces)