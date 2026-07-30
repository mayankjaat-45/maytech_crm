import mongoose from "mongoose";

export const leadSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      trim: true,
      default: "",
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    companyName: {
      type: String,
      trim: true,
      default: "",
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

    /*
     * Internal CRM leads will contain the user who added the lead.
     * Public website leads can have addedBy as null.
     */
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
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
        "CRM_Developement",
        "portfolio_website",
        "other",
      ],
      default: "not_sure",
    },

    /*
     * Exact service information coming from the website.
     * Example:
     * websiteServiceName: React JS Website Development
     * websiteServiceSlug: react-js-website-development
     */
    websiteServiceName: {
      type: String,
      trim: true,
      default: "",
    },

    websiteServiceSlug: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    /*
     * Stores the page from which the enquiry was submitted.
     */
    websitePageUrl: {
      type: String,
      trim: true,
      default: "",
    },

    requirementNote: {
      type: String,
      trim: true,
      default: "",
    },

    estimatedBudget: {
      type: Number,
      default: 0,
      min: 0,
    },

    convertedAmount: {
      type: Number,
      default: 0,
      min: 0,
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
  {
    timestamps: true,
  },
);

leadSchema.index({ source: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ addedBy: 1 });
leadSchema.index({ callStatus: 1 });
leadSchema.index({ leadStatus: 1 });
leadSchema.index({ serviceRequired: 1 });
leadSchema.index({ followUpDate: 1 });
leadSchema.index({ email: 1 });
leadSchema.index({ createdAt: -1 });

const Lead = mongoose.model("Lead", leadSchema);

export default Lead;
