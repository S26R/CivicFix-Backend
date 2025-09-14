import Issue from "../models/issue.model.js";

// 🔹 Get all issues for the logged-in department
export const getDepartmentIssues = async (req, res) => {
  try {
    const user = req.user;

    if (!user || user.role !== "department") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Fetch only issues that have assignmentHistory not empty
    const issues = await Issue.find({
      assignmentHistory: { $exists: true, $not: { $size: 0 } },
      assignedDepartment: user.id, // assigned to this department user
    })
      .populate("uploadedBy", "name email")
      .populate("assignedByAuthority", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, issues });
  } catch (error) {
    console.error("Error fetching department issues:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// 🔹 Update the status of a specific issue
export const updateDepartmentIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user;
    console.log("User making the request:", user);

    if (!user || user.role !== "department") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const issue = await Issue.findById(id);
    if (!issue) return res.status(404).json({ success: false, message: "Issue not found" });
console.log("Issue assignedDepartment:", issue.assignedDepartment);

    if (!issue.assignedDepartment || issue.assignedDepartment.toString() !== user.id) {
  return res.status(403).json({ success: false, message: "You are not assigned to this issue" });
}


    issue.status = status;
    issue.statusHistory.push({ status, changedBy: user._id });
    await issue.save();

    res.json({ success: true, message: "Issue status updated", issue });
  } catch (error) {
    console.error("Error updating issue status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
