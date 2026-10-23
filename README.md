# C41 · External Policy Decision Services

Executes a local normalized policy adapter with request/digest binding. It does not call an OPA, Cedar, or remote gateway. Each run starts from a fresh local seed. The run journal stores results, not production workflow state.

## Concepts students will learn

- External policy decisions need exact bindings
- Timeouts fail closed
- Delivery and effect success differ

## Configure and run

Use Node.js 24 or later. In PowerShell, from this repository's folder:

```powershell
node --version
npm ci
Copy-Item .env.example .env
notepad .env
```

No API key is required for the local experiment. Optional live commentary requires your own API key, agent ID and environment ID. It explains the local result; it does not activate the integration discussed in the lesson.

For the optional live path, set your API key, then run npm run setup if you do not already have resource IDs. The script creates the environment before a text-only agent, saves each ID immediately, and reuses IDs already configured. It uses CLAUDE_MODEL or the source default; choose a model available to your account. An uncertain network failure may have created a resource: inspect your account before retrying.

```powershell
npm start
```

Open `http://127.0.0.1:3041`. Navigation leads to `/guide.html#learning`, `/guide.html#run-guide`, `/architecture.html`, and the application lab. If you change `PORT`, use the configured port. Keep the terminal running; stop with Ctrl+C. `npm run dev` also starts the web application.

Select the first scenario, inspect its editable fields, press Run experiment, and compare the outcome and evidence with the table above. Select another scenario to investigate the boundary condition.

## Create your .env file

Copy `.env.example` to `.env` and enter your own values. Do not commit the real file. Restart the server after editing it. The example contains safe placeholders; optional settings may be left blank to use source defaults. Resource IDs and keys stay on the server.

```dotenv
ANTHROPIC_API_KEY=your_api_key
CLAUDE_MANAGED_AGENT_ID=your_agent_id
CLAUDE_MANAGED_ENVIRONMENT_ID=your_environment_id
PORT=3041
```

## How the app was build

### 1. Bind the action context to a digest

The action includes the fixed demo principal and tenant, the requested operation and an owned resource. Hashing this object identifies the exact decision context.

Source: [src/lesson.ts](src/lesson.ts#L13)

```typescript
const action = {
    principalId: "demo-user",
    tenantId: "demo",
    operation: text(input, "operation"),
    resource: "owned-report",
  },
  digest = hash(JSON.stringify(action));
```

### 2. Fail closed when policy is unavailable or mismatched

The supplied policy must be available, bound to the expected digest and authorize read_report. providerConfirmation stays not sent; the reducer evaluates the decision contract without contacting a policy service.

Source: [src/lesson.ts](src/lesson.ts#L14) · selected statements

```typescript
const available = flag(input, "policyAvailable"),
  bound = flag(input, "matchingDigest");

const allowed = available && bound && action.operation === "read_report";

return report(
  allowed ? "passed" : "rejected",
  allowed
    ? "Accepted a scoped policy decision"
    : "Policy unavailable, unbound, or denied",
  {
    allowed,
    actionDigest: digest,
    policyVersion: available ? "local-policy-v1" : null,
    providerConfirmation: "not sent",
  },
  [
    "Capture trusted principal and action context",
    "Bind the decision to the exact digest",
    "Deny when unavailable or mismatched",
    "Recheck current state before dispatch",
  ],
);
```

### Check your understanding

Run **Accept a bound policy decision** in the application. Compare the result with these scenario expectations:

```json
{
  "input": {
    "operation": "read_report",
    "policyAvailable": true,
    "matchingDigest": true
  },
  "expectedOutcome": "passed",
  "checkEvidence": {
    "allowed": true
  }
}
```

Then try **Fail closed on policy outage**. Its expected outcome is `rejected`; identify the condition or evidence field that explains the difference.

## Validation

```powershell
npm test
python scripts/verify-walkthrough.py
```

The source hash check detects when walkthrough excerpts need refreshing. Browser verification covers page navigation, readable text, mobile layout, dark mode, diagram and image routes. Local scenarios and live provider calls are recorded separately in the workspace verification report; local success is not evidence of a live provider operation.

## Repository contents

Application sources, student web pages, safe configuration example and documentation images are included. `node_modules`, `presentation`, `output`, `reviewed`, `v3`, `teaching-material`, build output, local journals, credentials and local resource files are ignored. Existing teaching videos and presentations remain in the original workspace.
