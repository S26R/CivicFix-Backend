import cron from "node-cron";
import Issue from "../models/issue.model.js";
import User from "../models/user.model.js";
import axios from "axios";
import FormData from "form-data";

let isRunning = false;

const issueCronJob = {
  start: () => {
    console.log("Issue verification cron job initialized.");

    cron.schedule("*/4 * * * *", async () => {
      if (isRunning) {
        console.log("Previous cron execution still running. Skipping this run.");
        return;
      }

      isRunning = true;
      console.log("Running issue verification cron job...");

      try {
        const raisedIssues = await Issue.find({
          status: "raised",
          uploadedBy: { $exists: true, $ne: null },
        });

        if (raisedIssues.length === 0) {
          console.log("No raised issues to process.");
          return;
        }

        for (const issue of raisedIssues) {
          try {
            console.log(`Processing issue ${issue._id}...`);

            // Step 1: Mark as verifying
            issue.status = "verifying";
            issue.statusHistory.push({
              status: "verifying",
              changedBy: "system",
              changedAt: new Date(),
            });
            await issue.save();

            // Step 2: Prepare FormData payload
            const formData = new FormData();
            formData.append("description", issue.topic);
            formData.append(
              "image_url",
              issue.media.find((m) => m.type === "image")?.url || ""
            );
            formData.append(
              "video_url",
              issue.media.find((m) => m.type === "video")?.url || ""
            );
            formData.append("audio_url", issue.audio?.url || "");

            // Step 3: Call AI service
            let verifyResponse;
            try {
              const { data } = await axios.post(
                "https://civicfix-ai.onrender.com/predict_all", // or your live endpoint
                formData,
                {
                  headers: formData.getHeaders(), // important for form-data
                  timeout: 1500000,
                }
              );
              verifyResponse = data;
            } catch (err) {
              console.warn(
                `AI service unavailable for issue ${issue._id}:`,
                err.response?.data || err.message
              );
              // Reset status back to raised so it can be retried next cycle
              issue.status = "raised";
              issue.statusHistory.push({
                status: "raised",
                changedBy: "system",
                changedAt: new Date(),
              });
              await issue.save();
              continue;
            }

            // Step 4: Get department from AI response
            const assignedDeptName = verifyResponse?.final_departments?.[0] || null;
            if (!assignedDeptName) {
              issue.status = "rejected";
              issue.statusHistory.push({
                status: "rejected",
                changedBy: "system",
                changedAt: new Date(),
              });
              await issue.save();
              console.log(`Issue ${issue._id} rejected (AI gave no department).`);
              continue;
            }

            // Step 5: Find matching department user
            const departmentUser = await User.findOne({
              departmentName: assignedDeptName,
              role: "department",
            });

            if (!departmentUser) {
              console.warn(
                `No department user found for "${assignedDeptName}", rejecting issue.`
              );
              issue.status = "rejected";
              issue.statusHistory.push({
                status: "rejected",
                changedBy: "system",
                changedAt: new Date(),
              });
              await issue.save();
              continue;
            }

            // Step 6: Assign department properly
            issue.assignedDepartment = departmentUser._id;
            issue.assignedByAuthority = null; // system assigned
            issue.assignedDepartmentName = assignedDeptName;

            issue.assignmentHistory.push({
              assignedDepartment: departmentUser._id,
              assignedBy: null, // system
              assignedAt: new Date(),
            });

            issue.status = "assigned";
            issue.statusHistory.push({
              status: "assigned",
              changedBy: "system",
              changedAt: new Date(),
            });

            await issue.save();

            // Step 7: Update department user’s assignedIssues
            const deptHasIssue = departmentUser.assignedIssues.some(
              (ai) => ai.issue && ai.issue.toString() === issue._id.toString()
            );
            if (!deptHasIssue) {
              departmentUser.assignedIssues.push({
                issue: issue._id,
                assignedBy: null, // system
                assignedAt: new Date(),
              });
              await departmentUser.save();
            }

            console.log(`✅ Issue ${issue._id} assigned to ${assignedDeptName}`);
          } catch (innerErr) {
            console.error(
              `❌ Failed processing issue ${issue._id}:`,
              innerErr.message
            );
            issue.status = "rejected";
            issue.statusHistory.push({
              status: "rejected",
              changedBy: "system",
              changedAt: new Date(),
            });
            await issue.save();
          }
        }
      } catch (err) {
        console.error("Cron job failed:", err.message);
      } finally {
        isRunning = false;
      }
    });
  },
};

export default issueCronJob;
