import * as core from "@actions/core";
import * as github from "@actions/github";

async function run() {
  try {
    const token = core.getInput("GITHUB_TOKEN");
    const octokit = github.getOctokit(token);
    const context = github.context;

    const { owner, repo } = context.repo;
    const prNumber = context.payload.pull_request?.number;
    const mergedBy = context.payload.pull_request?.merged_by.login;

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

    if (isMergedByAdmin && (failedOrMissingChecks || !hasRequiredReviews)) {
      core.setOutput("overridden", "true");
      core.setOutput("overridden_by", mergedBy);
      core.setOutput("overridden_pr", prNumber);
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
