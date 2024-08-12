import * as core from "@actions/core";
import * as github from "@actions/github";

async function run() {
  try {
    const token = core.getInput("GITHUB_TOKEN");
    if (!token) {
      throw new Error("Missing input GITHUB_TOKEN");
    }

    const octokit = github.getOctokit(token);
    if (!octokit) {
      throw new Error("Error initializing octokit");
    }

    const context = github.context;
    if (!context) {
      throw new Error("Error initializing github context for action");
    }

    const owner = core.getInput("owner") || context.repo.owner;
    if (!owner) {
      throw new Error("Missing repo owner");
    }

    const repo = core.getInput("repo") || context.repo.repo;
    if (!repo) {
      throw new Error("Missing repo");
    }

    const prNumber =
      core.getInput("pr_number") || context.payload.pull_request?.number;
    if (!prNumber) {
      throw new Error("Missing PR number");
    }

    const mergedBy = context.payload.pull_request?.merged_by?.login;
    if (!mergedBy) {
      core.notice("Stopping because the PR was not merged.");

      return;
    }

    // Get branch protection rules
    const { data: branchProtection } =
      await octokit.rest.repos.getBranchProtection({
        owner,
        repo,
        branch: context.payload.pull_request?.base.ref,
      });

    const statusChecks =
      branchProtection.required_status_checks?.contexts || [];
    const hasRequiredReviews =
      branchProtection.required_pull_request_reviews?.dismiss_stale_reviews ||
      false;

    // Check if the PR has been merged by an admin
    const isAdmin = await octokit.rest.repos.getCollaboratorPermissionLevel({
      owner,
      repo,
      username: mergedBy,
    });

    const isMergedByAdmin = isAdmin.data.permission === "admin";

    // Determine if status checks were bypassed
    const { data: combinedStatus } =
      await octokit.rest.repos.getCombinedStatusForRef({
        owner,
        repo,
        ref: context.payload.pull_request?.head.sha,
      });

    const failedOrMissingChecks = statusChecks.some(
      (check) =>
        !combinedStatus.statuses
          .map((status) => status.context)
          .includes(check),
    );

    core.setOutput("overridden_by", mergedBy);
    core.setOutput("overridden_pr", prNumber);
    core.setOutput("has_required_checks", !failedOrMissingChecks);
    core.setOutput("has_required_reviews", hasRequiredReviews);

    if (isMergedByAdmin && (failedOrMissingChecks || !hasRequiredReviews)) {
      core.setOutput("overridden", "true");
      console.log(
        `PR #${prNumber} was merged by admin ${mergedBy}, bypassing branch protection rules.`,
      );
    } else {
      core.setOutput("overridden", "false");
      console.log(
        `PR #${prNumber} was merged following branch protection rules.`,
      );
    }
  } catch (error) {
    core.setFailed(`Action failed with error: ${error.message}`);
  }
}

run();
