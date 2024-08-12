# github-action-merged-as-administrator

[![Admin Override Check](https://github.com/JustinDFuller/github-action-merged-as-administrator/actions/workflows/example.yml/badge.svg)](https://github.com/JustinDFuller/github-action-merged-as-administrator/actions/workflows/example.yml)
[Github Marketplace](https://github.com/marketplace/actions/github-action-merged-as-administrator)

Figure out if a PR was Merged as Administrator (Overriding Branch Protections)

## Example

```yaml
name: Admin Override Check

on:
  pull_request:
    types: [closed]

jobs:
  check_admin_override:
    runs-on: ubuntu-latest
    steps:
      - name: Check for Merged as Administrator
        uses: JustinDFuller/github-action-merged-as-administrator@v0
        id: merged_as_admin
        with:
          GITHUB_TOKEN: ${{ secrets.ACTION_SECRET }}

      - name: Alert if Merged as Administrator
        if: ${{ steps.merged_as_admin.outputs.overridden == 'true' }}
        run: echo "User '${{ steps.merged_as_admin.outputs.overridden_by }}' merged PR https://github.com/JustinDFuller/github-action-merged-as-administrator/pull/${{ steps.merged_as_admin.outputs.overridden_pr }} using administrator priveleges."
```

Instead of an echo you migh send a [Slack Message](https://github.com/marketplace/actions/slack-send).

The available output variables are:

```yaml
overridden:
    description: "True if merged as administrator. False if not."
overridden_by:
    description: "The Github Username that used administrator priveleges to merge a PR."
overridden_pr:
    description: "The Github PR number that merged with administrator priveleges."
has_required_checks:
    description: "True if all the required checks passed."
has_required_reviews:
    description: "True if all the required reviews are present."
```

## Required Permissions

This action requires elevated repository-level read-only permissions that cannot be granted via the default Actions permissions.

Required Permissions:
* `Administration`: Read-only permissions to view the repository's administration settings. This gives access to view the Github Branch Protection rules and Administrators. (Required)
* `Checks`: Read-only permissions to view the repository's check statuses. This gives access to view the Pull Request's checks to know if they passed.

### How to Setup

First, you must create the token.

1. Click on your user icon at the top-right of Github.
2. In the menu that opens, click `Settings` (near the bottom).
3. On the left-side menu, click `Developer Settings` (at the very bottom).
4. On the page that opens, click `Personal Access Tokens`.
5. On the dropdown that opens, click `Fine-grained Tokens`.
6. On the page that opens, click `Generate new token` at the top right.
7. Give it a name, description, expiration, and select the repository to apply it to.
8. Click `repository permissions`.
9. Change `Administration` to Read-only.
10. Change `Commit Statuses` to Read-only.
11. Click `Generate token`.
12. Copy the token to your clipboard.

Then, you must make it available to Github Actions as a Secret.

1. Open your repository.
2. Click `Settings`.
3. Click `Secrets and Variables` (in the security section).
4. Click `Actions`.
5. Click `New Repository Secret`
6. Create a secret name, maybe `MERGED_AS_ADMINISTRATOR_TOKEN`.
7. Paste the secret in the `Secret` input.
8. Click `Add Secret`.

In your `action.yml` file, use the secret variable:

```yaml
GITHUB_TOKEN: ${{ secrets.MERGED_AS_ADMINISTRATOR_TOKEN }}
```

It should now work!