import mongoose from "mongoose";

export const leadSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    source: {
      type: String,
      enum: [
        "google_maps",
        "referral",
        "instagram",
        "facebook",
        "website",
        "whatsapp",
        "other",
      ],
      default: "google_maps",
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    callStatus: {
      type: String,
      enum: [
        "not_called",
        "called",
        "not_picked",
        "busy",
        "wrong_number",
        "whatsapp_sent",
        "meeting_scheduled",
      ],
      default: "not_called",
    },

    leadStatus: {
      type: String,
      enum: [
        "new",
        "contacted",
        "requirement_asked",
        "interested",
        "not_interested",
        "follow_up",
        "proposal_sent",
        "converted",
        "lost",
        "invalid_number",
      ],
      default: "new",
    },

    serviceRequired: {
      type: String,
      enum: [
        "not_sure",
        "website_development",
        "website_redesign",
        "seo",
        "google_ads",
        "landing_page",
        "ecommerce_website",
        "portfolio_website",
        "other",
      ],
      default: "not_sure",
    },

    requirementNote: {
      type: String,
      trim: true,
      default: "",
    },

    estimatedBudget: {
      type: Number,
      default: 0,
    },

    convertedAmount: {
      type: Number,
      default: 0,
    },

    convertedAt: {
      type: Date,
      default: null,
    },

    lostReason: {
      type: String,
      trim: true,
      default: "",
    },
    followUpDate: {
      type: Date,
      default: null,
    },
    lastContactedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// leadSchema.index({ phone: 1 });

leadSchema.index({ source: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ callStatus: 1 });
leadSchema.index({ leadStatus: 1 });
leadSchema.index({ followUpDate: 1 });

const Lead = mongoose.model("Lead", leadSchema);

export default Lead;
