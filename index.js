"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var core = require("@actions/core");
var github = require("@actions/github");
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var token, octokit, context, _a, owner, repo, prNumber, mergedBy, branchProtection, statusChecks, hasRequiredReviews, isAdmin, isMergedByAdmin, combinedStatus_1, failedOrMissingChecks, error_1;
        var _b, _c, _d, _e, _f, _g;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    _h.trys.push([0, 4, , 5]);
                    token = core.getInput("GITHUB_TOKEN");
                    octokit = github.getOctokit(token);
                    context = github.context;
                    _a = context.repo, owner = _a.owner, repo = _a.repo;
                    prNumber = (_b = context.payload.pull_request) === null || _b === void 0 ? void 0 : _b.number;
                    mergedBy = (_c = context.payload.pull_request) === null || _c === void 0 ? void 0 : _c.merged_by.login;
                    return [4 /*yield*/, octokit.rest.repos.getBranchProtection({
                            owner: owner,
                            repo: repo,
                            branch: (_d = context.payload.pull_request) === null || _d === void 0 ? void 0 : _d.base.ref,
                        })];
                case 1:
                    branchProtection = (_h.sent()).data;
                    statusChecks = ((_e = branchProtection.required_status_checks) === null || _e === void 0 ? void 0 : _e.contexts) || [];
                    hasRequiredReviews = ((_f = branchProtection.required_pull_request_reviews) === null || _f === void 0 ? void 0 : _f.dismiss_stale_reviews) ||
                        false;
                    return [4 /*yield*/, octokit.rest.repos.getCollaboratorPermissionLevel({
                            owner: owner,
                            repo: repo,
                            username: mergedBy,
                        })];
                case 2:
                    isAdmin = _h.sent();
                    isMergedByAdmin = isAdmin.data.permission === "admin";
                    return [4 /*yield*/, octokit.rest.repos.getCombinedStatusForRef({
                            owner: owner,
                            repo: repo,
                            ref: (_g = context.payload.pull_request) === null || _g === void 0 ? void 0 : _g.head.sha,
                        })];
                case 3:
                    combinedStatus_1 = (_h.sent()).data;
                    failedOrMissingChecks = statusChecks.some(function (check) {
                        return !combinedStatus_1.statuses
                            .map(function (status) { return status.context; })
                            .includes(check);
                    });
                    if (isMergedByAdmin && (failedOrMissingChecks || !hasRequiredReviews)) {
                        core.setOutput("override_detected", "true");
                        console.log("PR #".concat(prNumber, " was merged by admin ").concat(mergedBy, ", bypassing branch protection rules."));
                    }
                    else {
                        core.setOutput("override_detected", "false");
                        console.log("PR #".concat(prNumber, " was merged following branch protection rules."));
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _h.sent();
                    core.setFailed("Action failed with error: ".concat(error_1.message));
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
run();
