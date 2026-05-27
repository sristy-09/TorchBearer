/**
 * Recommendation Controller
 * Proxies recommendation requests to the FastAPI AI microservice.
 */
import { User } from "../models/User.js";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

/* ─────────────────────────────────────────────────────────────
   Helper — call FastAPI and return parsed response
───────────────────────────────────────────────────────────── */
async function callFastAPI(payload) {
  const aiResponse = await fetch(`${AI_SERVICE_URL}/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await aiResponse.json().catch(() => ({}));

  if (!aiResponse.ok) {
    // Log the real FastAPI error so you can see it in the server console
    console.error("[AI Service Error]", aiResponse.status, JSON.stringify(data));
    const detail = data.detail || data.message || "AI service returned an error.";
    const err = new Error(detail);
    err.status = aiResponse.status;
    err.detail = detail;
    throw err;
  }

  return data;
}

/* ─────────────────────────────────────────────────────────────
   POST /api/recommendations
   Manual search — frontend sends skills/interests explicitly.
───────────────────────────────────────────────────────────── */
export const getRecommendations = async (req, res) => {
  try {
    const { skills, interests, top_n } = req.body;

    const hasSkills = Array.isArray(skills) && skills.length > 0;
    const hasInterests = Array.isArray(interests) && interests.length > 0;

    if (!hasSkills && !hasInterests) {
      return res.status(400).json({
        success: false,
        message: "At least one skill or interest is required.",
      });
    }

    const data = await callFastAPI({
      skills: hasSkills ? skills : undefined,
      interests: hasInterests ? interests : undefined,
      top_n: top_n || 5,
    });

    return res.status(200).json(data);
  } catch (error) {
    if (error.cause?.code === "ECONNREFUSED") {
      return res.status(503).json({
        success: false,
        message: "Recommendation service is currently unavailable. Make sure the AI service is running on port 8000.",
      });
    }
    return res.status(error.status || 500).json({
      success: false,
      message: error.detail || error.message || "Error fetching recommendations.",
    });
  }
};

/* ─────────────────────────────────────────────────────────────
   GET /api/recommendations/me
   Auto recommendations — Express reads the logged-in user's
   profile (skills for alumni, interests for students) and
   calls FastAPI. No body needed from the frontend.
───────────────────────────────────────────────────────────── */
export const getMyRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("skills interests role");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const skills = user.skills ?? [];
    const interests = user.interests ?? [];

    // No profile data yet — return empty gracefully, don't call FastAPI
    if (skills.length === 0 && interests.length === 0) {
      return res.status(200).json({
        success: true,
        query_terms: [],
        recommendations: [],
        total_spaces_analyzed: 0,
      });
    }

    // Alumni → match by skills, students → match by interests
    const aiPayload =
      user.role === "alumni"
        ? { skills, top_n: 5 }
        : { interests, top_n: 5 };

    const data = await callFastAPI(aiPayload);
    return res.status(200).json(data);

  } catch (error) {
    if (error.cause?.code === "ECONNREFUSED") {
      // AI service is down — return empty silently so the page still loads
      return res.status(200).json({
        success: true,
        query_terms: [],
        recommendations: [],
        total_spaces_analyzed: 0,
      });
    }
    return res.status(error.status || 500).json({
      success: false,
      message: error.detail || error.message || "Error fetching automatic recommendations.",
    });
  }
};
