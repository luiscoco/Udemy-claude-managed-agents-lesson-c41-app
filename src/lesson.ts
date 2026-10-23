import { text, number, flag, list, object, hash, report, unique, safePath, type Lesson, type Input } from "./core";

// A focused local experiment derived from this lesson’s reviewed presentation.
export const lesson: Lesson = {
  number: 41,
  title: "External Policy Decision Services",
  description: "Imagine an agent wants to update a protected report. The organization already has centralized rules about who may change which resource.",
  concepts: ["External policy decisions need exact bindings", "Timeouts fail closed", "Delivery and effect success differ"],
  scope: "Executes a local normalized policy adapter with request/digest binding. It does not call an OPA, Cedar, or remote gateway. Each run starts from a fresh local seed. The run journal stores results, not production workflow state.",
  cases: [{"id": "0", "label": "Accept a bound policy decision", "input": {"operation": "read_report", "policyAvailable": true, "matchingDigest": true}, "expected": "passed", "checks": {"allowed": true}}, {"id": "1", "label": "Fail closed on policy outage", "input": {"operation": "read_report", "policyAvailable": false, "matchingDigest": true}, "expected": "rejected", "checks": {"allowed": false}}, {"id": "2", "label": "Reject a mismatched decision", "input": {"operation": "read_report", "policyAvailable": true, "matchingDigest": false}, "expected": "rejected", "checks": {"allowed": false}}],
  async run(input) {

const action={principalId:"demo-user",tenantId:"demo",operation:text(input,"operation"),resource:"owned-report"},digest=hash(JSON.stringify(action));
const available=flag(input,"policyAvailable"),bound=flag(input,"matchingDigest");
const allowed=available&&bound&&action.operation==="read_report";
return report(allowed?"passed":"rejected",allowed?"Accepted a scoped policy decision":"Policy unavailable, unbound, or denied",{allowed,actionDigest:digest,policyVersion:available?"local-policy-v1":null,providerConfirmation:"not sent"},["Capture trusted principal and action context","Bind the decision to the exact digest","Deny when unavailable or mismatched","Recheck current state before dispatch"]);

  }
};
