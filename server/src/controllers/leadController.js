import Lead from "../models/Lead.js";

const cleanPhone = (phone) => {
  return String(phone || "").replace(/\D/g, "");
};

export const createLead = async (req, res) => {
  try {
    const { phone, source, note, assignedTo } = req.body || {};

    const cleanedPhone = cleanPhone(phone);

    if (!cleanedPhone || cleanedPhone.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Valid phone number is required",
      });
    }

    const existingLead = await Lead.findOne({ phone: cleanedPhone });

    if (existingLead) {
      return res.status(400).json({
        success: false,
        message: "Lead with this phone number already exists",
      });
    }

    const lead = await Lead.create({
      phone: cleanedPhone,
      source: source || "google_maps",
      note: note || "",
      assignedTo: assignedTo || null,
      addedBy: req.user._id,
    });

    const populatedLead = await Lead.findById(lead._id)
      .populate("assignedTo", "name email phone role")
      .populate("addedBy", "name email phone role");

    res.status(201).json({
      success: true,
      message: "Lead added successfully",
      lead: populatedLead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createBulkLeads = async (req, res) => {
  try {
    const { numbers, source, note, assignedTo } = req.body;

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
      if (!cleanedPhone || cleanedPhone.length < 10) {
        invalid++;
        continue;
      }

      const exists = await Lead.findOne({ phone: cleanedPhone });

      if (exists) {
        duplicates++;
        continue;
      }

      const lead = await Lead.create({
        phone: cleanedPhone,
        source: source || "google_maps",
        note: note || "",
        assignedTo: assignedTo || null,
        addedBy: req.user._id,
      });

      created++;
      createdLeads.push(lead);
    }

    res.status(201).json({
      success: true,
      message: "Bulk upload completed",
      created,
      duplicates,
      invalid,
      leads: createdLeads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

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
      query.phone = { $regex: search, $options: "i" };
    }

    if (source) query.source = source;
    if (callStatus) query.callStatus = callStatus;

    if (leadStatus) query.leadStatus = leadStatus;
    if (serviceRequired) query.serviceRequired = serviceRequired;
    if (assignedTo) query.assignedTo = assignedTo;

    const skip = (Number(page) - 1) * Number(limit);

    const leads = await Lead.find(query)
      .populate("assignedTo", "name email phone role")
      .populate("addedBy", "name email phone role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Lead.countDocuments(query);

    res.status(200).json({
      success: true,
      leads,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

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

    res.status(200).json({
      success: true,
      lead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateLead = async (req, res) => {
  try {
    const allowedFields = [
      "source",
      "note",
      "assignedTo",
      "callStatus",
      "leadStatus",
      "serviceRequired",
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

    if (req.body.estimatedBudget !== undefined) {
      updateData.estimatedBudget = Number(req.body.estimatedBudget || 0);
    }

    if (req.body.convertedAmount !== undefined) {
      updateData.convertedAmount = Number(req.body.convertedAmount || 0);
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

    res.status(200).json({
      success: true,
      message: "Lead Updated Successfully",
      lead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//delete lead
export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lead Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();

    const not_called = await Lead.countDocuments({ callStatus: "not_called" });

    const called = await Lead.countDocuments({ callStatus: "called" });

    const notPicked = await Lead.countDocuments({ callStatus: "not_picked" });

    const interested = await Lead.countDocuments({ leadStatus: "interested" });

    const followUp = await Lead.countDocuments({
      leadStatus: "follow_up",
    });

    const proposalSent = await Lead.countDocuments({
      leadStatus: "proposal_sent",
    });

    const converted = await Lead.countDocuments({ leadStatus: "converted" });

    const lost = await Lead.countDocuments({ leadStatus: "lost" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayFollowUps = await Lead.countDocuments({
      followUpDate: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    const revenueData = await Lead.aggregate([
      {
        $match: {
          leadStatus: "converted",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$convertedAmount" },
          totalEstimatedBudget: { $sum: "$estimatedBudget" },
        },
      },
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;
    const totalEstimatedBudget = revenueData[0]?.totalEstimatedBudget || 0;

    res.status(200).json({
      success: true,
      stats: {
        totalLeads,
        not_called,
        called,
        notPicked,
        interested,
        followUp,
        todayFollowUps,
        proposalSent,
        converted,
        lost,
        totalRevenue,
        totalEstimatedBudget,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getFollowUpLeads = async (req, res) => {
  try {
    const { type = "today" } = req.query;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const query = {
      followUpDate: { $ne: null },
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

    res.status(200).json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

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
      query.phone = { $regex: search, $options: "i" };
    }

    if (callStatus) query.callStatus = callStatus;
    if (leadStatus) query.leadStatus = leadStatus;
    if (serviceRequired) query.serviceRequired = serviceRequired;

    const skip = (Number(page) - 1) * Number(limit);

    const leads = await Lead.find(query)
      .populate("assignedTo", "name email role")
      .populate("addedBy", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Lead.countDocuments(query);

    res.status(200).json({
      success: true,
      leads,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

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
      query.phone = { $regex: search, $options: "i" };
    }

    if (serviceRequired) query.serviceRequired = serviceRequired;
    if (assignedTo) query.assignedTo = assignedTo;

    const skip = (Number(page) - 1) * Number(limit);

    const leads = await Lead.find(query)
      .populate("assignedTo", "name email phone role")
      .populate("addedBy", "name email phone role")
      .sort({ convertedAt: -1, updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Lead.countDocuments(query);

    res.status(200).json({
      success: true,
      leads,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
