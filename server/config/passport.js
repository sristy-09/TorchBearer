import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL, // e.g. http://localhost:3000/api/auth/google/callback
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1. Check if user already exists by googleId
        let user = await User.findOne({ googleId: profile.id });

        if (user) return done(null, { user, isNew: false });

        // 2. Check if an account with same email already exists (manual signup)
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Link Google to existing account
          user.googleId = profile.id;
          if (!user.avatar) user.avatar = profile.photos[0]?.value || "";
          await user.save();
          return done(null, { user, isNew: false });
        }

        // 3. Create a brand new user from Google profile
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0]?.value || "",
          // no role, no password - user must complete profile after first login
        });

        return done(null, { user, isNew: true });
      } catch (err) {
        return done(err, null);
      }
    },
  ),
);

export default passport;
