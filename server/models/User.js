import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true, // allows multiple null values
    },

    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
      // No longer globally required — Google users won't have one
    },

    role: {
      type: String,
      enum: {
        values: ["admin", "student", "alumni"],
        message: "Role must be either admin, student or alumni",
      },
      required: false, // remove required - Google users complete this later
    },

    // Profile fields
    batchYear: {
      type: Number,
    },

    registrationNumber: {
      type: Number,
    },

    department: {
      type: String,
      trim: true,
    },

    skills: {
      type: [String],
      default: [],
    },

    interests: {
      type: [String],
      default: [],
    },

    // Profile picture URL (optional)
    avatar: {
      type: String,
      default: "",
    },

    // Social media links
    socialLinks: {
      facebook: {
        type: String,
        default: "",
      },
      instagram: {
        type: String,
        default: "",
      },
      linkedin: {
        type: String,
        default: "",
      },
      github: {
        type: String,
        default: "",
      },
    },

    //forgot password fields
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    }
  },
  { timestamps: true },
);

// ── Hash password before saving ──────────────────────────────
userSchema.pre("save", async function () {
  // Only hash if password was modified (new user or password update)
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// ── Instance method: compare plain password with hashed ──────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model("User", userSchema);
