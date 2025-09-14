import Issue from "../models/issue.model.js";
import userModel from "../models/user.model.js";
import User from "../models/user.model.js";
export const getAnalyticsData = async (req, res) => {
  try {
    const [
      statusCounts,
      deptCounts,
      severityCounts,
      trend,
      totalUsers,
      activeUsers,
    ] = await Promise.all([
      Issue.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Issue.aggregate([{ $group: { _id: "$department", count: { $sum: 1 } } }]),
      Issue.aggregate([{ $group: { _id: "$severity", count: { $sum: 1 } } }]),
      Issue.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Issue.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Issue.aggregate([
        { $group: { _id: "$location.coordinates", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      userModel.countDocuments(),
      userModel.countDocuments({
        lastActive: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
    ]);

    res.json({
      success: true,
      data: {
        statusCounts,
        deptCounts,
        severityCounts,
        trend,
        users: { total: totalUsers, active: activeUsers },
      },
    });
  } catch (error) {
    console.error("Analytics fetch failed:", error);
    res.status(500).json({ success: false, error: "Server error" });
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

export const getAllUsers = async (req, res) => {
  try {
    // Filter out authority users
    const users = await userModel
      .find({ role: { $ne: "authority" } }) // adjust if your schema uses a different field
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









