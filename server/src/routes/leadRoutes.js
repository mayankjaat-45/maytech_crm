import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createBulkLeads,
  createLead,
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
leadRoutes.get("/dashboard/stats", protect, getDashboardStats);
leadRoutes.get("/follow-ups", protect, getFollowUpLeads);
leadRoutes.get("/my-leads", protect, getMyLeads);
leadRoutes.get("/converted", protect, getConvertedLeads);

leadRoutes.post("/", protect, createLead);
leadRoutes.post("/bulk", protect, createBulkLeads);

leadRoutes.get("/", protect, getLeads);
leadRoutes.get("/:id", protect, getLeadById);

leadRoutes.put("/:id", protect, updateLead);
leadRoutes.delete("/:id", protect, deleteLead);

export default leadRoutes;
