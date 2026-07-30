import Lead from "../models/Lead.js";

const WEBSITE_SERVICE_MAP = {
  "react-js-website-development": "website_development",
  "next-js-website-development": "website_development",
  "wordpress-website-development": "website_development",
  "website-development": "website_development",
  "web-development": "website_development",

  "website-redesign": "website_redesign",
  "website-redesign-service": "website_redesign",

  seo: "seo",
  "seo-optimization": "seo",
  "search-engine-optimization": "seo",

  "google-ads": "google_ads",
  "google-ads-management": "google_ads",

  "landing-page": "landing_page",
  "landing-page-design": "landing_page",
  "landing-page-development": "landing_page",

  "ecommerce-website": "ecommerce_website",
  "ecommerce-website-development": "ecommerce_website",

  "crm-development": "CRM_Developement",
  "crm-developement": "CRM_Developement",
  "custom-crm-development": "CRM_Developement",

  "portfolio-website": "portfolio_website",
  "business-portfolio-website": "portfolio_website",
  "business-portfolio-websites": "portfolio_website",
};

const ALLOWED_SERVICES = [
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
];

const cleanPhone = (phone) => {
  return String(phone || "").replace(/\D/g, "");
};

const cleanText = (value, maxLength = 5000) => {
  return String(value || "")
    .trim()
    .slice(0, maxLength);
};

const cleanEmail = (email) => {
  return String(email || "")
    .trim()
    .toLowerCase();
};

const isValidEmail = (email) => {
  if (!email) return true;

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const escapeRegex = (value) => {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const parseBudget = (value) => {
  if (value === undefined || value === null || String(value).trim() === "") {
    return 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) && value >= 0 ? value : 0;
  }

  const normalizedValue = String(value).replaceAll(",", "");
  const matches = normalizedValue.match(/\d+(\.\d+)?/g);

  if (!matches?.length) {
    return 0;
  }

  const budget = Number(matches[0]);

  return Number.isFinite(budget) && budget >= 0 ? budget : 0;
};

const normalizeService = ({ serviceRequired, serviceSlug, serviceName }) => {
  const requiredService = cleanText(serviceRequired, 100);

  if (ALLOWED_SERVICES.includes(requiredService)) {
    return requiredService;
  }

  const normalizedSlug = cleanText(
    serviceSlug || serviceRequired,
    200,
  ).toLowerCase();

  if (WEBSITE_SERVICE_MAP[normalizedSlug]) {
    return WEBSITE_SERVICE_MAP[normalizedSlug];
  }

  const normalizedName = cleanText(serviceName, 200).toLowerCase();

  if (
    normalizedName.includes("react") ||
    normalizedName.includes("next") ||
    normalizedName.includes("wordpress") ||
    normalizedName.includes("web development") ||
    normalizedName.includes("website development")
  ) {
    return "website_development";
  }

  if (normalizedName.includes("redesign")) {
    return "website_redesign";
  }

  if (normalizedName.includes("portfolio")) {
    return "portfolio_website";
  }

  if (
    normalizedName.includes("ecommerce") ||
    normalizedName.includes("e-commerce")
  ) {
    return "ecommerce_website";
  }

  if (normalizedName.includes("landing")) {
    return "landing_page";
  }

  if (
    normalizedName.includes("google ads") ||
    normalizedName.includes("google ad")
  ) {
    return "google_ads";
  }

  if (normalizedName.includes("seo")) {
    return "seo";
  }

  if (normalizedName.includes("crm")) {
    return "CRM_Developement";
  }

  return "other";
};

const getPaginationValues = (page, limit) => {
  const currentPage = Math.max(Number(page) || 1, 1);
  const pageLimit = Math.min(Math.max(Number(limit) || 20, 1), 1000);

  return {
    currentPage,
    pageLimit,
    skip: (currentPage - 1) * pageLimit,
  };
};

const sendControllerError = (res, error) => {
  console.log("LEAD CONTROLLER ERROR:", error);

  if (error?.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Lead with this phone number already exists",
    });
  }

  if (error?.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message:
        Object.values(error.errors || {})
          .map((item) => item.message)
          .join(", ") || "Invalid lead data",
    });
  }

  return res.status(500).json({
    success: false,
    message: error?.message || "Something went wrong",
  });
};

/* =========================================================
   PUBLIC WEBSITE LEAD
   POST /api/leads/website
========================================================= */

export const createWebsiteLead = async (req, res) => {
  try {
    const {
      name,
      fullName,
      customerName: submittedCustomerName,
      phone,
      email,
      companyName,

      serviceName,
      serviceSlug,
      serviceRequired,

      estimatedBudget,
      budget,

      requirement,
      requirementNote,
      message,

      pageUrl,
      websitePageUrl,

      // Honeypot field. It should remain empty for real users.
      website,
    } = req.body || {};

    if (website) {
      return res.status(200).json({
        success: true,
        message: "Enquiry received successfully",
      });
    }

    const customerName = cleanText(
      submittedCustomerName || fullName || name,
      150,
    );

    const cleanedPhone = cleanPhone(phone);
    const normalizedEmail = cleanEmail(email);

    if (!customerName || customerName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Valid name is required",
      });
    }

    if (!cleanedPhone || cleanedPhone.length < 10 || cleanedPhone.length > 15) {
      return res.status(400).json({
        success: false,
        message: "Valid phone number is required",
      });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Valid email address is required",
      });
    }

    const exactServiceName = cleanText(
      serviceName || serviceRequired || "Website Enquiry",
      200,
    );

    const normalizedService = normalizeService({
      serviceRequired,
      serviceSlug,
      serviceName: exactServiceName,
    });

    const finalRequirement = cleanText(
      requirementNote || requirement || message,
      5000,
    );

    const finalCompanyName = cleanText(companyName, 200);

    const finalServiceSlug = cleanText(
      serviceSlug || serviceRequired,
      200,
    ).toLowerCase();

    const finalPageUrl = cleanText(websitePageUrl || pageUrl, 1000);

    const finalBudget = parseBudget(
      estimatedBudget !== undefined ? estimatedBudget : budget,
    );

    const existingLead = await Lead.findOne({
      phone: cleanedPhone,
    });

    const websiteNote = [
      "Lead received from MayTech Solutions website.",
      `Customer: ${customerName}`,
      normalizedEmail ? `Email: ${normalizedEmail}` : "",
      finalCompanyName ? `Company: ${finalCompanyName}` : "",
      exactServiceName ? `Selected service: ${exactServiceName}` : "",
      finalPageUrl ? `Submitted from: ${finalPageUrl}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    /*
     * When the same phone number submits again,
     * update the existing lead instead of creating a duplicate.
     */
    if (existingLead) {
      const previousSource = existingLead.source;

      existingLead.customerName = customerName;

      if (normalizedEmail) {
        existingLead.email = normalizedEmail;
      }

      if (finalCompanyName) {
        existingLead.companyName = finalCompanyName;
      }

      existingLead.source = "website";
      existingLead.serviceRequired = normalizedService;
      existingLead.websiteServiceName = exactServiceName;
      existingLead.websiteServiceSlug = finalServiceSlug;
      existingLead.websitePageUrl = finalPageUrl;

      if (finalRequirement) {
        existingLead.requirementNote = finalRequirement;
      }

      if (finalBudget > 0) {
        existingLead.estimatedBudget = finalBudget;
      }

      const updatedNote = [
        existingLead.note,
        previousSource !== "website"
          ? `Previous source: ${previousSource}`
          : "",
        websiteNote,
      ]
        .filter(Boolean)
        .join("\n\n");

      existingLead.note = updatedNote.slice(-10000);

      await existingLead.save();

      return res.status(200).json({
        success: true,
        message: "Your enquiry has been updated successfully",
        leadId: existingLead._id,
      });
    }

    const lead = await Lead.create({
      customerName,
      phone: cleanedPhone,
      email: normalizedEmail,
      companyName: finalCompanyName,

      source: "website",
      note: websiteNote,

      assignedTo: null,
      addedBy: null,

      callStatus: "not_called",
      leadStatus: "new",

      serviceRequired: normalizedService,
      websiteServiceName: exactServiceName,
      websiteServiceSlug: finalServiceSlug,
      websitePageUrl: finalPageUrl,

      requirementNote: finalRequirement,
      estimatedBudget: finalBudget,

      convertedAmount: 0,
      convertedAt: null,
      followUpDate: null,
      lastContactedAt: null,
    });

    return res.status(201).json({
      success: true,
      message: "Enquiry submitted successfully",
      leadId: lead._id,
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

/* =========================================================
   CREATE INTERNAL CRM LEAD
========================================================= */

export const createLead = async (req, res) => {
  try {
    const {
      customerName,
      phone,
      email,
      companyName,
      source,
      note,
      assignedTo,
      serviceRequired,
      requirementNote,
      estimatedBudget,
    } = req.body || {};

    const cleanedPhone = cleanPhone(phone);
    const normalizedEmail = cleanEmail(email);

    if (!cleanedPhone || cleanedPhone.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Valid phone number is required",
      });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Valid email address is required",
      });
    }

    const existingLead = await Lead.findOne({
      phone: cleanedPhone,
    });

    if (existingLead) {
      return res.status(409).json({
        success: false,
        message: "Lead with this phone number already exists",
      });
    }

    const normalizedService = normalizeService({
      serviceRequired,
    });

    const lead = await Lead.create({
      customerName: cleanText(customerName, 150),
      phone: cleanedPhone,
      email: normalizedEmail,
      companyName: cleanText(companyName, 200),

      source: source || "google_maps",
      note: cleanText(note, 5000),

      assignedTo: assignedTo || null,
      addedBy: req.user._id,

      serviceRequired: serviceRequired ? normalizedService : "not_sure",

      requirementNote: cleanText(requirementNote, 5000),
      estimatedBudget: parseBudget(estimatedBudget),
    });

    const populatedLead = await Lead.findById(lead._id)
      .populate("assignedTo", "name email phone role")
      .populate("addedBy", "name email phone role");

    return res.status(201).json({
      success: true,
      message: "Lead added successfully",
      lead: populatedLead,
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

/* =========================================================
   BULK CREATE LEADS
========================================================= */

export const createBulkLeads = async (req, res) => {
  try {
    const { numbers, source, note, assignedTo } = req.body || {};

    if (!Array.isArray(numbers) || numbers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Numbers array is required",
      });
    }

    let created = 0;
    let duplicates = 0;
    let invalid = 0;

    const createdLeads = [];

    for (const number of numbers) {
      const cleanedPhone = cleanPhone(number);

      if (
        !cleanedPhone ||
        cleanedPhone.length < 10 ||
        cleanedPhone.length > 15
      ) {
        invalid += 1;
        continue;
      }

      const exists = await Lead.exists({
        phone: cleanedPhone,
      });

      if (exists) {
        duplicates += 1;
        continue;
      }

      const lead = await Lead.create({
        phone: cleanedPhone,
        source: source || "google_maps",
        note: cleanText(note, 5000),
        assignedTo: assignedTo || null,
        addedBy: req.user._id,
      });

      created += 1;
      createdLeads.push(lead);
    }

    return res.status(201).json({
      success: true,
      message: "Bulk upload completed",
      created,
      duplicates,
      invalid,
      leads: createdLeads,
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

/* =========================================================
   GET ALL LEADS
========================================================= */

export const getLeads = async (req, res) => {
  try {
    const {
      search,
      source,
      callStatus,
      leadStatus,
      serviceRequired,
      assignedTo,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (search) {
      const searchRegex = {
        $regex: escapeRegex(search.trim()),
        $options: "i",
      };

      query.$or = [
        { phone: searchRegex },
        { customerName: searchRegex },
        { email: searchRegex },
        { companyName: searchRegex },
        { requirementNote: searchRegex },
      ];
    }

    if (source) query.source = source;
    if (callStatus) query.callStatus = callStatus;
    if (leadStatus) query.leadStatus = leadStatus;
    if (serviceRequired) query.serviceRequired = serviceRequired;
    if (assignedTo) query.assignedTo = assignedTo;

    const { currentPage, pageLimit, skip } = getPaginationValues(page, limit);

    const [leads, total] = await Promise.all([
      Lead.find(query)
        .populate("assignedTo", "name email phone role")
        .populate("addedBy", "name email phone role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit),

      Lead.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      leads,
      pagination: {
        total,
        page: currentPage,
        limit: pageLimit,
        pages: Math.ceil(total / pageLimit),
      },
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

/* =========================================================
   GET SINGLE LEAD
========================================================= */

export const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate("assignedTo", "name email phone role")
      .populate("addedBy", "name email phone role");

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    return res.status(200).json({
      success: true,
      lead,
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

/* =========================================================
   UPDATE LEAD
========================================================= */

export const updateLead = async (req, res) => {
  try {
    const allowedFields = [
      "customerName",
      "email",
      "companyName",

      "source",
      "note",
      "assignedTo",

      "callStatus",
      "leadStatus",

      "serviceRequired",
      "websiteServiceName",
      "websiteServiceSlug",
      "websitePageUrl",

      "requirementNote",
      "estimatedBudget",
      "convertedAmount",
      "convertedAt",

      "lostReason",
      "followUpDate",
    ];

    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (req.body.customerName !== undefined) {
      updateData.customerName = cleanText(req.body.customerName, 150);
    }

    if (req.body.email !== undefined) {
      const normalizedEmail = cleanEmail(req.body.email);

      if (!isValidEmail(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message: "Valid email address is required",
        });
      }

      updateData.email = normalizedEmail;
    }

    if (req.body.companyName !== undefined) {
      updateData.companyName = cleanText(req.body.companyName, 200);
    }

    if (req.body.note !== undefined) {
      updateData.note = cleanText(req.body.note, 10000);
    }

    if (req.body.requirementNote !== undefined) {
      updateData.requirementNote = cleanText(req.body.requirementNote, 5000);
    }

    if (req.body.serviceRequired !== undefined) {
      updateData.serviceRequired = normalizeService({
        serviceRequired: req.body.serviceRequired,
      });
    }

    if (req.body.estimatedBudget !== undefined) {
      updateData.estimatedBudget = parseBudget(req.body.estimatedBudget);
    }

    if (req.body.convertedAmount !== undefined) {
      updateData.convertedAmount = parseBudget(req.body.convertedAmount);
    }

    if (req.body.assignedTo === "") {
      updateData.assignedTo = null;
    }

    if (req.body.followUpDate === "") {
      updateData.followUpDate = null;
    }

    if (req.body.callStatus && req.body.callStatus !== "not_called") {
      updateData.lastContactedAt = new Date();
    }

    if (req.body.leadStatus === "converted" && !req.body.convertedAt) {
      updateData.convertedAt = new Date();
    }

    if (
      req.body.leadStatus &&
      req.body.leadStatus !== "converted" &&
      req.body.convertedAt === undefined
    ) {
      updateData.convertedAt = null;
    }

    if (
      req.body.leadStatus &&
      req.body.leadStatus !== "lost" &&
      req.body.lostReason === undefined
    ) {
      updateData.lostReason = "";
    }

    const lead = await Lead.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("assignedTo", "name email phone role")
      .populate("addedBy", "name email phone role");

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      lead,
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

/* =========================================================
   DELETE LEAD
========================================================= */

export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

/* =========================================================
   DASHBOARD STATISTICS
========================================================= */

export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalLeads,
      notCalled,
      called,
      notPicked,
      interested,
      followUp,
      todayFollowUps,
      proposalSent,
      converted,
      lost,
      revenueData,
      estimatedBudgetData,
    ] = await Promise.all([
      Lead.countDocuments(),

      Lead.countDocuments({
        callStatus: "not_called",
      }),

      Lead.countDocuments({
        callStatus: "called",
      }),

      Lead.countDocuments({
        callStatus: "not_picked",
      }),

      Lead.countDocuments({
        leadStatus: "interested",
      }),

      Lead.countDocuments({
        leadStatus: "follow_up",
      }),

      Lead.countDocuments({
        followUpDate: {
          $gte: today,
          $lt: tomorrow,
        },
      }),

      Lead.countDocuments({
        leadStatus: "proposal_sent",
      }),

      Lead.countDocuments({
        leadStatus: "converted",
      }),

      Lead.countDocuments({
        leadStatus: "lost",
      }),

      Lead.aggregate([
        {
          $match: {
            leadStatus: "converted",
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: "$convertedAmount",
            },
          },
        },
      ]),

      Lead.aggregate([
        {
          $group: {
            _id: null,
            totalEstimatedBudget: {
              $sum: "$estimatedBudget",
            },
          },
        },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalLeads,
        not_called: notCalled,
        called,
        notPicked,
        interested,
        followUp,
        todayFollowUps,
        proposalSent,
        converted,
        lost,
        totalRevenue: revenueData[0]?.totalRevenue || 0,
        totalEstimatedBudget: estimatedBudgetData[0]?.totalEstimatedBudget || 0,
      },
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

/* =========================================================
   FOLLOW-UP LEADS
========================================================= */

export const getFollowUpLeads = async (req, res) => {
  try {
    const { type = "today" } = req.query;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const query = {
      followUpDate: {
        $ne: null,
      },
    };

    if (type === "today") {
      query.followUpDate = {
        $gte: todayStart,
        $lt: tomorrowStart,
      };
    }

    if (type === "pending") {
      query.followUpDate = {
        $lt: todayStart,
      };

      query.leadStatus = {
        $nin: ["converted", "lost", "invalid_number"],
      };
    }

    if (type === "upcoming") {
      query.followUpDate = {
        $gte: tomorrowStart,
      };

      query.leadStatus = {
        $nin: ["converted", "lost", "invalid_number"],
      };
    }

    const leads = await Lead.find(query)
      .populate("assignedTo", "name email phone role")
      .populate("addedBy", "name email phone role")
      .sort({ followUpDate: 1 });

    return res.status(200).json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

/* =========================================================
   MY ASSIGNED LEADS
========================================================= */

export const getMyLeads = async (req, res) => {
  try {
    const {
      search,
      callStatus,
      leadStatus,
      serviceRequired,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {
      assignedTo: req.user._id,
    };

    if (search) {
      const searchRegex = {
        $regex: escapeRegex(search.trim()),
        $options: "i",
      };

      query.$or = [
        { phone: searchRegex },
        { customerName: searchRegex },
        { email: searchRegex },
        { companyName: searchRegex },
      ];
    }

    if (callStatus) query.callStatus = callStatus;
    if (leadStatus) query.leadStatus = leadStatus;
    if (serviceRequired) query.serviceRequired = serviceRequired;

    const { currentPage, pageLimit, skip } = getPaginationValues(page, limit);

    const [leads, total] = await Promise.all([
      Lead.find(query)
        .populate("assignedTo", "name email phone role")
        .populate("addedBy", "name email phone role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit),

      Lead.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      leads,
      pagination: {
        total,
        page: currentPage,
        limit: pageLimit,
        pages: Math.ceil(total / pageLimit),
      },
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

/* =========================================================
   CONVERTED LEADS
========================================================= */

export const getConvertedLeads = async (req, res) => {
  try {
    const {
      search,
      serviceRequired,
      assignedTo,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {
      leadStatus: "converted",
    };

    if (search) {
      const searchRegex = {
        $regex: escapeRegex(search.trim()),
        $options: "i",
      };

      query.$or = [
        { phone: searchRegex },
        { customerName: searchRegex },
        { email: searchRegex },
        { companyName: searchRegex },
      ];
    }

    if (serviceRequired) {
      query.serviceRequired = serviceRequired;
    }

    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    const { currentPage, pageLimit, skip } = getPaginationValues(page, limit);

    const [leads, total] = await Promise.all([
      Lead.find(query)
        .populate("assignedTo", "name email phone role")
        .populate("addedBy", "name email phone role")
        .sort({
          convertedAt: -1,
          updatedAt: -1,
        })
        .skip(skip)
        .limit(pageLimit),

      Lead.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      leads,
      pagination: {
        total,
        page: currentPage,
        limit: pageLimit,
        pages: Math.ceil(total / pageLimit),
      },
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
};
