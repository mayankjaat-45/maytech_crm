import express from "express";
import rateLimit from "express-rate-limit";

import { protect } from "../middleware/authMiddleware.js";

import {
  createBulkLeads,
  createLead,
  createWebsiteLead,
  deleteLead,
  getConvertedLeads,
  getDashboardStats,
  getFollowUpLeads,
  getLeadById,
  getLeads,
  getMyLeads,
  updateLead,
} from "../controllers/leadController.js";

const leadRoutes = express.Router();

const websiteLeadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many enquiry submissions. Please try again after some time.",
  },
});

/* =========================================================
   PUBLIC WEBSITE ROUTES
   No authentication required
========================================================= */

/*
 * Browser test route:
 * GET /api/leads/website
 */
leadRoutes.get("/website", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "MayTech CRM website lead API is working",
    method: "Send a POST request to create a website lead",
  });
});

/*
 * Website form submission:
 * POST /api/leads/website
 */
leadRoutes.post("/website", websiteLeadLimiter, createWebsiteLead);

/* =========================================================
   AUTHENTICATION MIDDLEWARE
   Everything below this line is protected
========================================================= */

leadRoutes.use(protect);

/* Dashboard and categorized leads */
leadRoutes.get("/dashboard/stats", getDashboardStats);
leadRoutes.get("/follow-ups", getFollowUpLeads);
leadRoutes.get("/my-leads", getMyLeads);
leadRoutes.get("/converted", getConvertedLeads);

/* Create leads */
leadRoutes.post("/bulk", createBulkLeads);
leadRoutes.post("/", createLead);

/* Read leads */
leadRoutes.get("/", getLeads);

/*
 * Keep dynamic routes after all fixed routes such as
 * /website, /follow-ups, /converted, etc.
 */
leadRoutes.get("/:id", getLeadById);

/* Update and delete */
leadRoutes.put("/:id", updateLead);
leadRoutes.delete("/:id", deleteLead);

export default leadRoutes;
