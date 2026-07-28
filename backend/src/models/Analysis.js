// const mongoose = require("mongoose");

// const analysisSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//       index: true
//     },
//     resumeText: {
//       type: String,
//       required: true
//     },
//     jobDescription: {
//       type: String,
//       required: true
//     },
//     matchScore: {
//       type: Number,
//       required: true,
//       min: 0,
//       max: 100
//     },
//     cosineSimilarity: {
//       type: Number,
//       required: true,
//       min: 0,
//       max: 1
//     },
//     matchedSkills: {
//       type: [String],
//       default: []
//     },
//     missingSkills: {
//       type: [String],
//       default: []
//     },
//     suggestions: {
//       type: [String],
//       default: []
//     },
//     metrics: {
//       precision: { type: Number, default: 0 },
//       recall: { type: Number, default: 0 },
//       f1Score: { type: Number, default: 0 },
//       keywordCoverage: { type: Number, default: 0 }
//     }
//   },
//   {
//     timestamps: true
//   }
// );

// module.exports = mongoose.model("Analysis", analysisSchema);



const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    // Raw Inputs
    resumeText: {
      type: String,
      required: true
    },
    jobDescription: {
      type: String,
      required: true
    },

    // Optional: normalized versions (for debugging + re-analysis)
    normalizedResume: {
      type: String
    },
    normalizedJD: {
      type: String
    },

    // Scores
    matchScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      index: true
    },
    cosineSimilarity: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    },

    // Skills
    matchedSkills: {
      type: [String],
      default: [],
      index: true
    },
    missingSkills: {
      type: [String],
      default: []
    },

    // 🔥 NEW: inferred skills (from patterns like "managed" → leadership)
    inferredSkills: {
      type: [String],
      default: []
    },

    // Suggestions
    suggestions: {
      type: [String],
      default: []
    },

    // Metrics
    metrics: {
      precision: { type: Number, default: 0 },
      recall: { type: Number, default: 0 },
      f1Score: { type: Number, default: 0 },
      keywordCoverage: { type: Number, default: 0 }
    },

    // 🔥 NEW: skill-level breakdown (great for UI + debugging)
    skillBreakdown: [
      {
        skill: String,
        matched: Boolean,
        source: String // "exact" | "synonym" | "inferred"
      }
    ],

    // 🔥 NEW: model / logic versioning
    analysisVersion: {
      type: String,
      default: "v2_semantic"
    },

    scoreBreakdown: {
      ml: { type: Number, default: 0 },
      tfidf: { type: Number, default: 0 },
      semantic: { type: Number, default: 0 },
      skills: { type: Number, default: 0 }
    },

    // 🔥 NEW: optional flags
    flags: {
      hasStrongMatch: { type: Boolean, default: false },
      hasSkillGaps: { type: Boolean, default: true }
    }
  },
  {
    timestamps: true
  }
);

// 🔥 Indexing for performance
analysisSchema.index({ user: 1, createdAt: -1 });
analysisSchema.index({ matchScore: -1 });

// 🔥 Optional virtual (nice for frontend)
analysisSchema.virtual("isHighMatch").get(function () {
  return this.matchScore >= 70;
});

module.exports = mongoose.model("Analysis", analysisSchema);