import Issue from "../models/issue.model.js";
import userModel from "../models/user.model.js";
import User from "../models/user.model.js";
// controllers/admin.analytics.controller.js


export const getAnalyticsData = async (req, res) => {
  try {
    // 1) Basic status counts
    const countsByStatusAgg = Issue.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // 2) Counts by department
    const countsByDepartmentAgg = Issue.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } },
    ]);

    // 3) Counts by severity
    const countsBySeverityAgg = Issue.aggregate([
      { $group: { _id: "$severity", count: { $sum: 1 } } },
    ]);

    // 4) Issues over time (monthly buckets last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5); // includes this month -> 6 months range
    const issuesOverTimeAgg = Issue.aggregate([
      { $match: { createdAt: { $gte: new Date(sixMonthsAgo.setHours(0,0,0,0)) } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // 5) Average resolution time (for resolved issues) in hours
    const avgResolutionAgg = Issue.aggregate([
      { $match: { status: "resolved", createdAt: { $exists: true }, updatedAt: { $exists: true } } },
      {
        $project: {
          diffHours: {
            $divide: [{ $subtract: ["$updatedAt", "$createdAt"] }, 1000 * 60 * 60],
          },
        },
      },
      { $group: { _id: null, avgHours: { $avg: "$diffHours" }, count: { $sum: 1 } } },
    ]);

    // 6) Top reporters (users who uploaded most issues) - top 5
    const topReportersAgg = Issue.aggregate([
      { $group: { _id: "$uploadedBy", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      // lookup user details
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          userId: "$user._id",
          name: { $ifNull: ["$user.email", "$user.phone"] },
          count: 1,
        },
      },
    ]);

    // 7) Top upvoted issues (top 5)
    const topUpvotedAgg = Issue.aggregate([
      { $project: { topic: 1, upvotesCount: { $size: { $ifNull: ["$upvotes", []] } }, createdAt: 1 } },
      { $sort: { upvotesCount: -1, createdAt: -1 } },
      { $limit: 5 },
    ]);

    // 8) Hotspots — cluster by rounding coordinates (grid -> counts per grid cell)
    const hotspotsAgg = Issue.aggregate([
      { $match: { location: { $exists: true, $ne: null } } },
      {
        $project: {
          lat: { $arrayElemAt: ["$location.coordinates", 1] },
          lng: { $arrayElemAt: ["$location.coordinates", 0] },
        },
      },
      // round to 2 decimal (~1km) for grouping (tune precision as needed)
      {
        $project: {
          latRound: { $round: ["$lat", 2] },
          lngRound: { $round: ["$lng", 2] },
        },
      },
      {
        $group: {
          _id: { lat: "$latRound", lng: "$lngRound" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // 9) total count
    const totalAgg = Issue.aggregate([{ $count: "total" }]);

    // run all aggregations in parallel
    const [
      countsByStatus,
      countsByDepartment,
      countsBySeverity,
      issuesOverTime,
      avgResolution,
      topReporters,
      topUpvoted,
      hotspots,
      totalResult,
    ] = await Promise.all([
      countsByStatusAgg,
      countsByDepartmentAgg,
      countsBySeverityAgg,
      issuesOverTimeAgg,
      avgResolutionAgg,
      topReportersAgg,
      topUpvotedAgg,
      hotspotsAgg,
      totalAgg,
    ]);

    const total = totalResult.length ? totalResult[0].total : 0;
    const avgResolutionHours = avgResolution.length ? avgResolution[0].avgHours : null;

    // shape the response nicely
    const response = {
      total,
      byStatus: countsByStatus.reduce((acc, cur) => ({ ...acc, [cur._id]: cur.count }), {}),
      byDepartment: countsByDepartment.reduce((acc, cur) => ({ ...acc, [cur._id]: cur.count }), {}),
      bySeverity: countsBySeverity.reduce((acc, cur) => ({ ...acc, [cur._id]: cur.count }), {}),
      issuesOverTime: issuesOverTime.map(i => ({ year: i._id.year, month: i._id.month, count: i.count })),
      avgResolutionHours,
      topReporters,
      topUpvoted,
      hotspots: hotspots.map(h => ({ lat: h._id.lat, lng: h._id.lng, count: h.count })),
    };

    res.json({ success: true, data: response });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ success: false, message: "Analytics error", error: err.message });
  }
};



export const getAllIssuesForAuthority = async (req, res) => {
  try {
    const issues = await Issue.find();
    res.json(issues);
  } catch (error) {
    console.error("Failed to fetch issues:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

export const getAllCitizen = async (req, res) => {
  try {
    // Filter out authority users
    const users = await userModel
      .find({ role: { $nin: ["authority", "department"] } }) // adjust if your schema uses a different field
      .select("-password"); // exclude password field only

    res.json(users);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
export const getAllDepartment = async (req, res) => {
  try {
    // Filter out authority users
    const users = await userModel
      .find({ role: { $nin: ["authority", "citizen"] } }) // adjust if your schema uses a different field
      .select("-password"); // exclude password field only

    res.json(users);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};


//Update Issues Status By issueID only work for authority  also a logs the status history feature so that we can track

export const updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log("Request Body:", req.body); // Debugging line
    console.log("Issue ID:", id); // Debugging line
    
    const { status } = req.body || {};
    
    const authorityId = req.user.id; // from auth middleware

    const allowedStatuses = ["in-progress", "resolved", "rejected"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }

    // Update main status
    issue.status = status;

    // Push into statusHistory
    issue.statusHistory.push({
      status,
      changedBy: authorityId,
      changedAt: new Date()
    });

    await issue.save();

    res.json({
      success: true,
      message: "Issue status updated successfully",
      issue
    });
  } catch (error) {
    console.error("Error updating issue status:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// PUT /admin/issues/:id/assign






export const assignIssueToDepartment = async (req, res) => {
  try {
    const { id } = req.params; // issue ID
    const { departmentId } = req.body; // department to assign

    const authorityId = req.user.id; // logged-in authority

    // Check if department exists
    const departmentUser = await User.findOne({ _id: departmentId, role: "department" });
    if (!departmentUser) {
      return res.status(404).json({ message: "Department user not found" });
    }

    // Check if authority exists
    const authorityUser = await User.findOne({ _id: authorityId, role: "authority" });
    if (!authorityUser) {
      return res.status(403).json({ message: "You are not authorized to assign issues" });
    }

    // Find the issue
    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    // Check if issue is already assigned to this department
    if (issue.assignedDepartment?.toString() === departmentId) {
      return res.status(200).json({
        message: "This issue is already assigned to the selected department",
        issue
      });
    }

    // Assign department and authority in Issue
    // Assign department and authority in Issue
issue.assignedDepartment = departmentUser._id;
issue.assignedByAuthority = authorityUser._id;

// Log assignment in issue history
issue.assignmentHistory.push({
  assignedDepartment: departmentUser._id,
  assignedBy: authorityUser._id,
  assignedAt: new Date()
});

// ✅ Make sure to update status directly
issue.status = "assigned";

// Log status change to "assigned"
issue.statusHistory.push({
  status: "assigned",
  changedBy: authorityUser._id,
  changedAt: new Date()
});

await issue.save();


    // Update department user's assignedIssues only if not already present
   const deptHasIssue = departmentUser.assignedIssues.some(
  ai => ai.issue && ai.issue.toString() === issue._id.toString()
);
    if (!deptHasIssue) {
      departmentUser.assignedIssues.push({
        issue: issue._id,
        assignedBy: authorityUser._id,
        assignedAt: new Date()
      });
      await departmentUser.save();
    }

    // Update authority user's delegatedIssues only if not already present
    const authorityHasDelegated = authorityUser.delegatedIssues.some(
  di =>
    di.issue &&
    di.assignedDepartment &&
    di.issue.toString() === issue._id.toString() &&
    di.assignedDepartment.toString() === departmentUser._id.toString()
);
    if (!authorityHasDelegated) {
      authorityUser.delegatedIssues.push({
        issue: issue._id,
        assignedDepartment: departmentUser._id,
        assignedAt: new Date()
      });
      await authorityUser.save();
    }

    res.json({ message: "Issue assigned successfully", issue });
  } catch (err) {
    console.error("Error assigning issue:", err);
    res.status(500).json({ message: "Error assigning issue", error: err.message });
  }
};




export const getIssuesByStatus = async (req, res) => {
  try {
    const { status } = req.query;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status query param is required",
      });
    }

    // Find issues by status (case-insensitive)
    const issues = await Issue.find({ status: status.toLowerCase() }).sort({
      createdAt: -1,
    });

    return res.json({
      success: true,
      count: issues.length,
      issues,
    });
  } catch (error) {
    console.error("Error fetching issues by status:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching issues",
    });
  }
};






