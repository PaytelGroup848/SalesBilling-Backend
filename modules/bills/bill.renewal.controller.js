const Bill = require("./bill.model");
const Client = require("../clients/client.model");
const { ROLES } = require("../../constants/roles");

// Get upcoming renewals for sales person
const getSalesUpcomingRenewals = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query; // Default 30 days

    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + parseInt(days));

    const filter = {
      createdBy: userId,
      status: "approved",
      renewalDate: {
        $gte: today,
        $lte: futureDate,
      },
    };

    const renewals = await Bill.find(filter)
      .populate("client", "companyName representativeName email phone")
      .populate("createdBy", "name email")
      .sort({ renewalDate: 1 });

    res.json({
      success: true,
      count: renewals.length,
      renewals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all upcoming renewals (for superadmin & accountant)
const getAllUpcomingRenewals = async (req, res) => {
  try {
    const { days = 30, salesPerson, client, service } = req.query;

    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + parseInt(days));

    const filter = {
      status: "approved",
      renewalDate: {
        $gte: today,
        $lte: futureDate,
      },
    };

    // Optional filters
    if (salesPerson) {
      filter.createdBy = salesPerson;
    }

    if (client) {
      filter.client = client;
    }

    if (service) {
      filter.service = service;
    }

    const renewals = await Bill.find(filter)
      .populate("client", "companyName representativeName email phone address")
      .populate("createdBy", "name email role")
      .sort({ renewalDate: 1 });

    // Get sales persons for filter dropdown
    const salesPersons = await require("../users/user.model").find(
      { role: ROLES.SALES },
      "name email",
    );

    res.json({
      success: true,
      count: renewals.length,
      renewals,
      salesPersons,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get renewal stats (counts by time period)
const getRenewalStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const isSuperAdmin = req.user.role === ROLES.SUPERADMIN;
    const isAccountant = req.user.role === ROLES.ACCOUNTANT;

    const today = new Date();
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const sixtyDaysFromNow = new Date(today);
    sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);

    const baseFilter = {
      status: "approved",
    };

    // If sales, only his own clients
    if (req.user.role === ROLES.SALES) {
      baseFilter.createdBy = userId;
    }

    // Counts for different periods
    const [next7Days, next30Days, next60Days, totalActive] = await Promise.all([
      Bill.countDocuments({
        ...baseFilter,
        renewalDate: { $gte: today, $lte: sevenDaysFromNow },
      }),
      Bill.countDocuments({
        ...baseFilter,
        renewalDate: { $gte: today, $lte: thirtyDaysFromNow },
      }),
      Bill.countDocuments({
        ...baseFilter,
        renewalDate: { $gte: today, $lte: sixtyDaysFromNow },
      }),
      Bill.countDocuments({
        ...baseFilter,
        renewalDate: { $gte: today },
      }),
    ]);

    res.json({
      success: true,
      stats: {
        next7Days,
        next30Days,
        next60Days,
        totalActive,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getSalesUpcomingRenewals,
  getAllUpcomingRenewals,
  getRenewalStats,
};
