# CHAPTER 4: SYSTEM DESIGN

## 4.1 Design Overview

TorchBearer implements a comprehensive **AI-Powered Educational Content Recommendation System** with a layered architecture similar to video processing pipelines. This design ensures modularity, scalability, and maintainability.

---

## 4.2 System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                        TORCHBEARER SYSTEM ARCHITECTURE              │
└──────────────────────────────────────────────────────────────────────┘

                              USER LAYER
                           (User Interaction)
                                 ▼
                         ┌────────────────┐
                         │   User Input   │
                         │  (Credentials, │
                         │   Preferences) │
                         └────────┬───────┘
                                  │
                         ┌────────▼────────┐
                         │   Web Browser   │
                         │  (React Client) │
                         └────────┬────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │   Client-Side Processing  │
                    │  ┌─────────────────────┐  │
                    │  │  JWT Token Storage  │  │
                    │  │  Form Validation    │  │
                    │  │  UI State Mgmt      │  │
                    │  └─────────────────────┘  │
                    └─────────────────────────┘
                                  │
                         ┌────────▼────────────────────┐
                         │   HTTPS Request             │
                         │   Authorization Header      │
                         │   (Bearer JWT Token)        │
                         └────────┬───────────────────┘
                                  │
┌─────────────────────────────────▼──────────────────────────────────┐
│                      BACKEND APPLICATION LAYER                      │
│                    (Express.js, Node.js Server)                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              API GATEWAY & MIDDLEWARE LAYER               │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  1. JWT Verification Middleware                          │   │
│  │     ├─ Extract token from Authorization header           │   │
│  │     ├─ Verify signature with secret key                  │   │
│  │     ├─ Check token expiration                            │   │
│  │     └─ Extract userId and role                           │   │
│  │                                                            │   │
│  │  2. CORS Handler                                          │   │
│  │     ├─ Validate origin domain                            │   │
│  │     ├─ Allow credentials in requests                      │   │
│  │     └─ Handle preflight requests                         │   │
│  │                                                            │   │
│  │  3. Request Logging                                       │   │
│  │     ├─ Log HTTP method and endpoint                      │   │
│  │     ├─ Track response time                                │   │
│  │     └─ Monitor error rates                               │   │
│  │                                                            │   │
│  │  4. Error Handler                                         │   │
│  │     ├─ Catch exceptions                                   │   │
│  │     ├─ Format error responses                             │   │
│  │     └─ Send appropriate status codes                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  ROUTE HANDLERS LAYER                      │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                            │   │
│  │  Authentication Routes:                                   │   │
│  │  ├─ POST /api/auth/login                                 │   │
│  │  ├─ POST /api/auth/register                              │   │
│  │  └─ POST /api/auth/logout                                │   │
│  │                                                            │   │
│  │  Content Routes:                                          │   │
│  │  ├─ GET /api/content                                     │   │
│  │  ├─ GET /api/content/:id                                 │   │
│  │  └─ POST /api/content/search                             │   │
│  │                                                            │   │
│  │  Recommendation Routes:                                   │   │
│  │  ├─ GET /api/recommendations                             │   │
│  │  ├─ GET /api/recommendations/trending                    │   │
│  │  └─ POST /api/recommendations/refresh                    │   │
│  │                                                            │   │
│  │  Rating Routes:                                           │   │
│  │  ├─ POST /api/ratings                                    │   │
│  │  ├─ GET /api/ratings/user/:userId                        │   │
│  │  └─ PUT /api/ratings/:ratingId                           │   │
│  │                                                            │   │
│  │  User Profile Routes:                                     │   │
│  │  ├─ GET /api/users/profile                               │   │
│  │  ├─ PUT /api/users/profile                               │   │
│  │  └─ GET /api/users/analytics                             │   │
│  │                                                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            CONTROLLERS & BUSINESS LOGIC LAYER             │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                            │   │
│  │  AuthController:                                          │   │
│  │  ├─ validateCredentials()                                 │   │
│  │  ├─ hashPassword()                                        │   │
│  │  ├─ generateJWT()                                         │   │
│  │  └─ verifyJWT()                                           │   │
│  │                                                            │   │
│  │  ContentController:                                       │   │
│  │  ├─ fetchContent()                                        │   │
│  │  ├─ filterByCategory()                                    │   │
│  │  ├─ searchContent()                                       │   │
│  │  └─ getContentDetails()                                   │   │
│  │                                                            │   │
│  │  RecommendationController:                                │   │
│  │  ├─ callAIService()                                       │   │
│  │  ├─ enrichRecommendations()                               │   │
│  │  ├─ cacheResults()                                        │   │
│  │  └─ trackRecommendationAccuracy()                         │   │
│  │                                                            │   │
│  │  RatingController:                                        │   │
│  │  ├─ validateRating()                                      │   │
│  │  ├─ storeRating()                                         │   │
│  │  ├─ updateUserVector()                                    │   │
│  │  └─ triggerModelUpdate()                                  │   │
│  │                                                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              DATA ACCESS LAYER (DAO/Services)             │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                            │   │
│  │  User Service:                                            │   │
│  │  ├─ findUserByUsername()                                  │   │
│  │  ├─ createUser()                                          │   │
│  │  └─ updateUserProfile()                                   │   │
│  │                                                            │   │
│  │  Content Service:                                         │   │
│  │  ├─ getAllContent()                                       │   │
│  │  ├─ findContentById()                                     │   │
│  │  └─ getContentByCategory()                                │   │
│  │                                                            │   │
│  │  Rating Service:                                          │   │
│  │  ├─ saveRating()                                          │   │
│  │  ├─ getUserRatingHistory()                                │   │
│  │  └─ calculateAverageRating()                              │   │
│  │                                                            │   │
│  │  Recommendation Service:                                  │   │
│  │  ├─ cacheRecommendations()                                │   │
│  │  ├─ getRecommendationsTTL()                               │   │
│  │  └─ invalidateCache()                                     │   │
│  │                                                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
                                 ▼
        ┌────────────────────────────────────────────┐
        │   INTER-SERVICE COMMUNICATION LAYER        │
        │                                            │
        │  ┌──────────────┐    ┌──────────────┐    │
        │  │  Connection  │    │  Connection  │    │
        │  │  Pool to DB  │    │  Pool to AI  │    │
        │  └──────────────┘    └──────────────┘    │
        │         │                    │             │
        │         │                    │             │
        │    ┌────▼────┐          ┌────▼────────┐   │
        │    │ MongoDB │          │ FastAPI     │   │
        │    │ Driver  │          │ HTTP Client │   │
        │    └────┬────┘          └────┬────────┘   │
        │         │                    │             │
        └─────────┼────────────────────┼─────────────┘
                  │                    │
                  ▼                    ▼
        ┌──────────────────┐  ┌──────────────────────────┐
        │  MongoDB Server  │  │   FastAPI AI Service     │
        │                  │  │   (Python, scikit-learn) │
        │ Collections:     │  │                          │
        │ ├─ Users         │  │  /recommend Endpoint     │
        │ ├─ Content       │  │                          │
        │ ├─ Ratings       │  │  ML Model Pipeline:      │
        │ ├─ Sessions      │  │  ├─ Data Normalization  │
        │ ├─ Learning_     │  │  ├─ Feature Engineering │
        │ │  Progress      │  │  ├─ Similarity Calc.    │
        │ └─ Recommend-    │  │  ├─ Score Prediction    │
        │    ations        │  │  └─ Ranking & Filtering │
        │                  │  │                          │
        └──────────────────┘  └──────────────────────────┘
```

---

## 4.3 Main Processing Pipeline

The system follows a structured pipeline for processing user requests and generating recommendations:

### 4.3.1 User Registration & Authentication Pipeline

```
┌─────────────────────────────────────────────────────────┐
│         USER REGISTRATION & LOGIN PIPELINE              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  STEP 1: User Input                                    │
│  ├─ Username/Email                                     │
│  ├─ Password                                           │
│  └─ Full Name (registration only)                      │
│         ▼                                              │
│  STEP 2: Client-Side Validation                        │
│  ├─ Validate email format                              │
│  ├─ Check password strength                            │
│  └─ Minimum field requirements                         │
│         ▼                                              │
│  STEP 3: Send HTTP Request                             │
│  ├─ POST /api/auth/login (with credentials)            │
│  ├─ OR POST /api/auth/register (for new user)          │
│  └─ HTTPS with TLS encryption                          │
│         ▼                                              │
│  STEP 4: Backend Input Validation                       │
│  ├─ Verify email is valid format                       │
│  ├─ Check password meets complexity requirements       │
│  └─ Sanitize inputs to prevent injection               │
│         ▼                                              │
│  STEP 5: Database Query                                │
│  ├─ Find user in MongoDB by username/email             │
│  └─ (Index lookup - O(log n) complexity)               │
│         ▼                                              │
│  STEP 6: Authentication (Login Only)                    │
│  ├─ Compare provided password with stored hash         │
│  ├─ Use bcrypt.compare() for timing-safe comparison    │
│  └─ If mismatch: Return 401 Unauthorized               │
│         ▼                                              │
│  STEP 7: Create User (Registration Only)                │
│  ├─ Hash password with bcrypt (10 salt rounds)         │
│  ├─ Create user document with metadata                 │
│  ├─ Set created_at timestamp                           │
│  └─ Save to MongoDB                                     │
│         ▼                                              │
│  STEP 8: JWT Token Generation                          │
│  ├─ Create token payload:                              │
│  │  {                                                  │
│  │    userId: "507f1f77bcf86cd799439011",              │
│  │    role: "user",                                    │
│  │    iat: 1234567890,                                 │
│  │    exp: 1234654290  (24 hours later)                │
│  │  }                                                  │
│  ├─ Sign with HMAC-SHA256                              │
│  └─ Generate: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  │
│         ▼                                              │
│  STEP 9: Send Response                                  │
│  ├─ Return HTTP 200/201                                │
│  ├─ Include JWT token                                  │
│  ├─ Include user metadata (id, username, role)         │
│  └─ HTTPS encryption                                   │
│         ▼                                              │
│  STEP 10: Client Storage                                │
│  ├─ Save JWT in localStorage                           │
│  ├─ Update React authentication state                  │
│  ├─ Set isAuthenticated = true                         │
│  └─ Redirect to dashboard                              │
│                                                        │
└─────────────────────────────────────────────────────────┘
```

### 4.3.2 Recommendation Generation Pipeline

```
┌──────────────────────────────────────────────────────────┐
│      RECOMMENDATION GENERATION PIPELINE                  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  USER INTERACTION LAYER                                 │
│  ┌────────────────────────────────────────┐            │
│  │ User clicks "Get Recommendations"      │            │
│  └────────────┬─────────────────────────┘            │
│               ▼                                        │
│  REQUEST PREPARATION                                  │
│  ┌────────────────────────────────────────┐            │
│  │ 1. Extract JWT from localStorage       │            │
│  │ 2. Create HTTP headers:                │            │
│  │    Authorization: Bearer {token}       │            │
│  │ 3. Set Content-Type: application/json  │            │
│  └────────────┬─────────────────────────┘            │
│               ▼                                        │
│  API REQUEST TRANSMISSION                             │
│  ┌────────────────────────────────────────┐            │
│  │ GET /api/recommendations               │            │
│  │ (HTTPS Request with JWT)               │            │
│  └────────────┬─────────────────────────┘            │
│               │                                       │
│  ═════════════════════════════════════════            │
│  NETWORK TRANSMISSION (HTTPS/TLS 1.3)                │
│  ═════════════════════════════════════════            │
│               │                                       │
│               ▼                                        │
│  BACKEND PROCESSING LAYER                             │
│  ┌──────────────────────────────────────┐            │
│  │ STAGE 1: Request Validation          │            │
│  ├──────────────────────────────────────┤            │
│  │ ✓ Extract JWT from Authorization     │            │
│  │ ✓ Verify signature: jwt.verify()     │            │
│  │ ✓ Check expiration timestamp         │            │
│  │ ✓ Extract userId from token payload  │            │
│  │ ✓ Check if token not blacklisted     │            │
│  │                                       │            │
│  │ If any check fails → 401 Unauthorized │            │
│  └──────────────────────────────────────┘            │
│               ▼                                        │
│  ┌──────────────────────────────────────┐            │
│  │ STAGE 2: Data Retrieval              │            │
│  ├──────────────────────────────────────┤            │
│  │ 1. Query user profile:               │            │
│  │    db.users.findById(userId)         │            │
│  │    → Get preferences (category,      │            │
│  │       difficulty, max_duration)      │            │
│  │                                       │            │
│  │ 2. Query user rating history:        │            │
│  │    db.ratings.find(                  │            │
│  │      {user_id: userId}               │            │
│  │    )                                  │            │
│  │    → Get [(contentId, score), ...]   │            │
│  │                                       │            │
│  │ 3. Query all content:                │            │
│  │    db.content.find({})               │            │
│  │    → Get available items with        │            │
│  │       metadata                        │            │
│  │                                       │            │
│  │ 4. Check recommendation cache:       │            │
│  │    cache.get(userId)                 │            │
│  │    → If valid TTL (< 1hr),           │            │
│  │       return cached results          │            │
│  │                                       │            │
│  └──────────────────────────────────────┘            │
│               ▼                                        │
│  ┌──────────────────────────────────────┐            │
│  │ STAGE 3: Feature Engineering         │            │
│  ├──────────────────────────────────────┤            │
│  │ Prepare data for ML model:           │            │
│  │                                       │            │
│  │ 1. User Vector:                      │            │
│  │    ├─ Normalize ratings to [0, 1]   │            │
│  │    └─ One-hot encode preferences    │            │
│  │                                       │            │
│  │ 2. Content Metadata:                 │            │
│  │    ├─ Extract difficulty level       │            │
│  │    ├─ Extract category               │            │
│  │    └─ Extract duration               │            │
│  │                                       │            │
│  │ 3. Build request payload:            │            │
│  │    {                                  │            │
│  │      "user_id": "xxx",                │            │
│  │      "ratings": [...],                │            │
│  │      "preferences": {...},            │            │
│  │      "content": [...]                 │            │
│  │    }                                  │            │
│  │                                       │            │
│  └──────────────────────────────────────┘            │
│               ▼                                        │
│  ┌──────────────────────────────────────┐            │
│  │ STAGE 4: AI Service Call             │            ��
│  ├──────────────────────────────────────┤            │
│  │ POST http://fastapi:8000/recommend  │            │
│  │ Content-Type: application/json       │            │
│  │ [JSON payload from Stage 3]          │            │
│  │                                       │            │
│  │ Timeout: 5 seconds                   │            │
│  │ Retry: 3 attempts with exponential   │            │
│  │        backoff                        │            │
│  │                                       │            │
│  └──────────────────────────────────────┘            │
│               │                                       │
│  ═════════════════════════════════════════            │
│  INTER-SERVICE HTTP REQUEST (REST API)               │
│  ═════════════════════════════════════════            │
│               │                                       │
│               ▼                                        │
│  AI MICROSERVICE (FASTAPI + PYTHON)                  │
│  ┌──────────────────────────────────────┐            │
│  │ STAGE 5: ML Model Processing         │            │
│  ├──────────────────────────────────────┤            │
│  │                                       │            │
│  │ 1. Load Pre-trained Model:           │            │
│  │    model = joblib.load(               │            │
│  │      'collaborative_filtering.pkl'   │            │
│  │    )                                  │            │
│  │                                       │            │
│  │ 2. Data Normalization:                │            │
│  │    ratings_norm = (ratings - mean)   │            │
│  │                   / std_dev           │            │
│  │                                       │            │
│  │ 3. Calculate User Similarity:         │            │
│  │    for each user_j:                   │            │
│  │      sim(user_i, user_j) =            │            │
│  │        cosine_similarity(             │            │
│  │          ratings_i, ratings_j         │            │
│  │        )                              │            │
│  │    Results: [0.92, 0.87, 0.76, ...]  │            │
│  │                                       │            │
│  │ 4. Find Similar Users:                │            │
│  │    similar_users =                    │            │
│  │      top_k(sim_scores, k=5)           │            │
│  │                                       │            │
│  └──────────────────────────────────────┘            │
│               ▼                                        │
│  ┌──────────────────────────────────────┐            │
│  │ STAGE 6: Prediction & Ranking        │            │
│  ├──────────────────────────────────────┤            │
│  │                                       │            │
│  │ for each content_item:                │            │
│  │                                       │            │
│  │ 1. Skip if already rated by user     │            │
│  │                                       │            │
│  │ 2. Get similar users' ratings:       │            │
│  │    ratings_sim_users = [             │            │
│  │      model['users'][sim_user_1]      │            │
│  │        ['ratings'][content_item],    │            │
│  │      model['users'][sim_user_2]      │            │
│  │        ['ratings'][content_item]     │            │
│  │    ]                                  │            │
│  │                                       │            │
│  │ 3. Calculate weighted score:         │            │
│  │    score = Σ(sim_weight × rating)    │            │
│  │            / Σ|sim_weight|            │            │
│  │                                       │            │
│  │    Example:                           │            │
│  │    (0.92 × 5 + 0.87 × 4)              │            │
│  │    / (0.92 + 0.87) = 4.48             │            │
│  │                                       │            │
│  │ 4. Apply Diversity Penalty:           │            │
│  │    if category already_recommended:  │            │
│  │      score × 0.7  (30% penalty)      │            │
│  │                                       │            │
│  │ 5. Apply Preference Filters:          │            │
│  │    if difficulty > user_max:         │            │
│  │      skip  (too hard)                 │            │
│  │    if duration > max_duration:        │            │
│  │      skip  (too long)                 │            │
│  │                                       │            │
│  │ 6. Calculate Confidence Score:        │            │
│  │    confidence = sigmoid(score)        │            │
│  │    Range: [0, 1]                      │            │
│  │                                       │            │
│  └──────────────────────────────────────┘            │
│               ▼                                        │
│  ┌──────────────────────────────────────┐            │
│  │ STAGE 7: Results Generation          │            │
│  ├──────────────────────────────────────┤            │
│  │                                       │            │
│  │ 1. Filter by Confidence Threshold:    │            │
│  │    if confidence < 0.6:               │            │
│  │      skip (low confidence)            │            │
│  │                                       │            │
│  │ 2. Sort by Score (descending):        │            │
│  │    recommendations =                  │            │
│  │      sorted(candidates,               │            │
│  │             key=lambda x: x['score'], │            │
│  │             reverse=True)             │            │
│  │                                       │            │
│  │ 3. Select Top-K:                      │            │
│  │    top_10 = recommendations[:10]      │            │
│  │                                       │            │
│  │ 4. Build Response:                    │            │
│  │    {                                  │            │
│  │      "recommendations": [             │            │
│  │        {                              │            │
│  │          "content_id": "xxx",         │            │
│  │          "title": "...",              │            │
│  │          "score": 0.92,               │            │
│  │          "reason": "Similar users..." │            │
│  │        },                             │            │
│  │        ...                            │            │
│  │      ]                                │            │
│  │    }                                  │            │
│  │                                       │            │
│  └──────────────────────────────────────┘            │
│               ▼                                        │
│  FastAPI HTTP Response (200 OK)                       │
│  [JSON with recommendations array]                    │
│               │                                       │
│  ═════════════════════════════════════════            │
│  INTER-SERVICE HTTP RESPONSE                         │
│  ═════════════════════════════════════════            │
│               │                                       │
│               ▼                                        │
│  ┌──────────────────────────────────────┐            │
│  │ STAGE 8: Response Enrichment         │            │
│  ├──────────────────────────────────────┤            │
│  │                                       │            │
│  │ 1. Receive AI response                │            │
│  │                                       │            │
│  │ 2. For each recommendation:           │            │
│  │    ├─ Fetch full content details      │            │
│  │    ├─ Get description and image URLs  │            │
│  │    ├─ Fetch current ratings           │            │
│  │    └─ Add "reason for recommendation" │            │
│  │                                       │            │
│  │ 3. Enrich with user data:             │            │
│  │    ├─ Check if already bookmarked     │            │
│  │    ├─ Add progress if previously      │            │
│  │    │  started                          │            │
│  │    └─ Add user's previous rating      │            │
│  │                                       │            │
│  │ 4. Store in Cache:                    │            │
│  │    cache.set(userId, recommendations,│            │
│  │               ttl=3600)  // 1 hour    │            │
│  │                                       │            │
│  │ 5. Store in Database:                 │            │
│  │    db.recommendations.insertOne({     │            │
│  │      user_id: userId,                 │            │
│  │      recommendations: [...],          │            │
│  │      generated_at: timestamp,         │            │
│  │      algorithm: "collaborative_       │            │
│  │                  filtering"           │            │
│  │    })                                 │            │
│  │                                       │            │
│  └──────────────────────────────────────┘            │
│               ▼                                        │
│  ┌──────────────────────────────────────┐            │
│  │ STAGE 9: API Response Formatting     │            │
│  ├──────────────────────────────────────┤            │
│  │                                       │            │
│  │ HTTP/1.1 200 OK                       │            │
│  │ Content-Type: application/json        │            │
│  │ Content-Length: xxxx                  │            │
│  │ Cache-Control: max-age=3600           │            │
│  │                                       │            │
│  │ {                                     │            │
│  │   "success": true,                    │            │
│  │   "data": {                           │            │
│  │     "recommendations": [              │            │
│  │       {                               │            │
│  │         "id": "507f1f77bcf86cd799",   │            │
│  │         "title": "React Advanced",    │            │
│  │         "category": "Programming",    │            │
│  │         "difficulty": "advanced",     │            │
│  │         "duration_minutes": 240,      │            │
│  │         "confidence_score": 0.92,     │            │
│  │         "rating_avg": 4.7,            │            │
│  │         "total_ratings": 892,         │            │
│  │         "description": "...",         │            │
│  │         "image_url": "...",           │            │
│  │         "reason": "92% of users       │            │
│  │                    similar to you    │            │
│  │                    rated this 4.8/5"  │            │
│  │       },                              │            │
│  │       ...                             │            │
│  │     ],                                │            │
│  │     "generated_at": "2026-05-24T...", │            │
│  │     "cached": false                   │            │
│  │   }                                   │            │
│  │ }                                     │            │
│  │                                       │            │
│  └──────────────────────────────────────┘            │
│               ▼                                        │
│  ═════════════════════════════════════════            │
│  HTTPS RESPONSE TRANSMISSION                         │
│  ═════════════════════════════════════════            │
│               ▼                                        │
│  ┌──────────────────────────────────────┐            │
│  │ FRONTEND PROCESSING & RENDERING      │            │
│  ├──────────────────────────────────────┤            │
│  │                                       │            │
│  │ 1. Receive JSON response              │            │
│  │                                       │            │
│  │ 2. Validate response structure        │            │
│  │    ├─ Check for errors                │            │
│  │    ├─ Verify data types               │            │
│  │    └─ Check recommendation count      │            │
│  │                                       │            │
│  │ 3. Update React State:                │            │
│  │    setRecommendations(data.data.      │            │
│  │                       recommendations)│            │
│  │    setLoading(false)                  │            │
│  │                                       │            │
│  │ 4. Render UI Components:              │            │
│  │    ├─ Map recommendations to          │            │
│  │    │  RecommendationCard components   │            │
│  │    ├─ Display confidence scores       │            │
│  │    ├─ Add "Start Learning" buttons    │            │
│  │    └─ Show "Similar users liked this" │            │
│  │       badges                          │            │
│  │                                       │            │
│  │ 5. Display Results to User:           │            │
│  │    ✓ Show recommendation cards        │            │
│  │    ✓ Show loading animation ends      │            │
│  │    ✓ Scroll to recommendations        │            │
│  │    ✓ Track view event                 │            │
│  │                                       │            │
│  │ 6. Monitor User Interactions:         │            │
│  │    ├─ Track clicks on recommendations │            │
│  │    ├─ Record impressions              │            │
│  │    └─ Send analytics events           │            │
│  │                                       │            │
│  └──────────────────────────────────────┘            │
│                                                      │
│  USER SEES PERSONALIZED RECOMMENDATIONS ⭐           │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 4.4 Component Interaction Diagram

```
┌───────────────────────────────────────────────────────────┐
│              COMPONENT INTERACTIONS                        │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ┌────────────────────────────────────────────┐          │
│  │         React Frontend Components          │          │
│  ├────────────────────────────────────────────┤          │
│  │                                            │          │
│  │  ├─ LoginPage                              │          │
│  │  │  └─ Calls: AuthService.login()          │          │
│  │  │              ↓                          │          │
│  │  ├─ Dashboard                              │          │
│  │  │  └─ Calls: RecommendationService        │          │
│  │  │           .getRecommendations()         │          │
│  │  │              ↓                          │          │
│  │  ├─ RecommendationCard                     │          │
│  │  │  └─ Displays content with score        │          │
│  │  │                                        │          │
│  │  ├─ RatingModal                            │          │
│  │  │  └─ Calls: RatingService.submitRating() │          │
│  │  │              ↓                          │          │
│  │  └─ ProfilePage                            │          │
│  │     └─ Calls: UserService.getProfile()     │          │
│  │                                            │          │
│  └────────────────────────────────────────────┘          │
│           │                    │                 │       │
│           │ HTTP Requests      │ State Updates   │       │
│           │ with JWT           │ (React Hooks)   │       │
│           ▼                    ▼                 ▼       │
│  ┌────────────────────────────────────────────┐          │
│  │    API Service Layer (HTTP Client)         │          │
│  ├────────────────────────────────────────────┤          │
│  │                                            │          │
│  │  ├─ AuthService                            │          │
│  │  │  ├─ login()                             │          │
│  │  │  ├─ register()                          │          │
│  │  │  └─ logout()                            │          │
│  │  │                                         │          │
│  │  ├─ RecommendationService                  │          │
│  │  │  ├─ getRecommendations()                │          │
│  │  │  ├─ refreshRecommendations()            │          │
│  │  │  └─ getTrendingContent()                │          │
│  │  │                                         │          │
│  │  ├─ RatingService                          │          │
│  │  │  ├─ submitRating()                      │          │
│  │  │  ├─ getUserRatings()                    │          │
│  │  │  └─ updateRating()                      │          │
│  │  │                                         │          │
│  │  ├─ ContentService                         │          │
│  │  │  ├─ getContent()                        │          │
│  │  │  ├─ searchContent()                     │          │
│  │  │  └─ getContentById()                    │          │
│  │  │                                         │          │
│  │  ├─ UserService                            │          │
│  │  │  ├─ getProfile()                        │          │
│  │  │  ├─ updateProfile()                     │          │
│  │  │  └─ getAnalytics()                      │          │
│  │  │                                         │          │
│  │  └─ HTTP Client                            │          │
│  │     ├─ attach JWT to requests              │          │
│  │     ├─ handle errors                       │          │
│  │     └─ retry logic                         │          │
│  │                                            │          │
│  └────────────────────────────────────────────┘          │
│                    │                                     │
│                    │ HTTP/REST                           │
│                    │ Bearer JWT Token                    │
│                    ▼                                     │
│  ┌────────────────────────────────────────────┐          │
│  │     Express.js Backend Routes              │          │
│  ├────────────────────────────────────────────┤          │
│  │                                            │          │
│  │  POST /api/auth/login ────┐               │          │
│  │  POST /api/auth/register ─┤               │          │
│  │                           ▼               │          │
│  │                    AuthController          │          │
│  │                                            │          │
│  │  GET /api/recommendations ─┐              │          │
│  │  POST /api/recommendations/refresh        │          │
│  │                            ├──→ Recommendation       │
│  │  GET /api/content ────────┤    Controller │          │
│  │  POST /api/content/search ┤               │          │
│  │                           ▼               │          │
│  │                    ContentController       │          │
│  │                                            │          │
│  │  POST /api/ratings ───────┐               │          │
│  │  GET /api/ratings/user ───┤──→ Rating     │          │
│  │  PUT /api/ratings/:id ────┤    Controller │          │
│  │                           ▼               │          │
│  │                                            │          │
│  │  GET /api/users/profile ──┐               │          │
│  │  PUT /api/users/profile ──┤──→ User       │          │
│  │  GET /api/users/analytics ┘    Controller │          │
│  │                                            │          │
│  └────────────────────────────────────────────┘          │
│           │              │                      │       │
│           │ Call         │ Call                  │       │
│           ▼              ▼                      ▼       │
│  ┌─────────────────┐  ┌────────────────────┐   ┌──────┐ │
│  │ Recommendation  │  │ Rating             │   │ User  │ │
│  │ Service         │  │ Service            │   │ Serive│ │
│  │ (Business Logic)│  │ (Business Logic)   │   │       │ │
│  └────────┬────────┘  └────────┬──────────┘   └───┬──┘ │
│           │                    │                  │   │
│           └────────┬───────────┴──────┬──────────┘   │
│                    │                  │               │
│            ┌───────▼──────────────────▼────────┐     │
│            │  Data Access Layer (MongoDB)      │     │
│            ├───────────────────────────────────┤     │
│            │                                   │     │
│            │  • Find user by ID                │     │
│            │  • Get user ratings               │     │
│            │  • Get all content                │     │
│            │  • Store recommendations          │     │
│            │  • Update user preferences        │     │
│            │                                   │     │
│            └───────┬──────────────────────────┘     │
│                    │                                 │
│                    │ Database Queries                │
│                    │ (MongoDB Driver)                │
│                    ▼                                 │
│            ┌──────────────────┐                     │
│            │  MongoDB Server  │                     │
│            │                  │                     │
│            │  Collections:    │                     │
│            │  ├─ Users        │                     │
│            │  ├─ Content      │                     │
│            │  ├─ Ratings      │                     │
│            │  └─ Recommend-   │                     │
│            │     ations       │                     │
│            └──────────────────┘                     │
│                                                     │
│                    ┌─────────────────┐             │
│                    │  INDEPENDENT    │             │
│                    │  SERVICE CALL   │             │
│                    └────────┬────────┘             │
│                             │                      │
│            ┌────────────────▼───────────────┐     │
│            │  FastAPI AI Recommendation     │     │
│            │  Service (Python)              │     │
│            │                                │     │
│            │  POST /recommend               │     │
│            │  ├─ Load ML Model              │     │
│            │  ├─ Calculate Similarities     │     │
│            │  ├─ Generate Predictions       │     │
│            │  └─ Rank Recommendations       │     │
│            │                                │     │
│            └────────────────────────────────┘     │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## 4.5 Data Processing Flow Diagram

```
USER INPUT FLOW:
┌─────────────┐
│  User Data  │
└──────┬──────┘
       │
       ├─→ ┌─────────────────┐
       │   │ Validation &    │
       │   │ Sanitization    │
       │   └────────┬────────┘
       │            │
       ├─→ ┌────────▼────────┐
       │   │ Authentication  │
       │   │ (Password Hash) │
       │   └────────┬────────┘
       │            │
       └─→ ┌────────▼────────────┐
           │ Data Storage in DB  │
           └────────┬────────────┘
                    │
              ┌─────▼─────┐
              │ Indexed   │
              │ Document  │
              └───────────┘


RECOMMENDATION GENERATION FLOW:
┌─────────────────────────────────┐
│ User Rating History             │
│ + User Preferences              │
│ + Content Catalog Metadata      │
└────────────────┬────────────────┘
                 │
         ┌───────▼────────┐
         │ Feature        │
         │ Engineering    │
         │ - Normalize    │
         │ - Encode       │
         │ - Transform    │
         └───────┬────────┘
                 │
         ┌───────▼─────────────┐
         │ ML Model Input      │
         │ Vectors ready for   │
         │ processing          │
         └───────┬─────────────┘
                 │
         ┌───────▼────────────────┐
         │ Similarity Calculation │
         │ cosine_similarity()    │
         │ User-to-user matrix    │
         └───────┬────────────────┘
                 │
         ┌───────▼──────────────┐
         │ Prediction Engine    │
         │ Weighted Average     │
         │ Score Calculation    │
         └───────┬──────────────┘
                 │
         ┌───────▼─────────────┐
         │ Filtering & Ranking │
         │ - Threshold check   │
         │ - Diversity penalty │
         │ - Sort by score     │
         └───────┬─────────────┘
                 │
         ┌───────▼──────────────┐
         │ Top-10 Results       │
         │ with confidence      │
         │ scores               │
         └──────────────────────┘
```

---

## 4.6 Summary

This system architecture ensures:

✅ **Scalability** - Microservices can be scaled independently
✅ **Reliability** - JWT stateless authentication eliminates session management
✅ **Performance** - Caching and indexing optimize response times
✅ **Security** - Multiple layers of validation and encryption
✅ **Maintainability** - Clear separation of concerns across layers
✅ **Extensibility** - Easy to add new features and services

The pipeline-based approach mirrors video processing systems, ensuring each stage is validated before moving to the next, resulting in a robust and production-ready application.
