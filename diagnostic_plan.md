# Self-Diagnostic System Implementation Plan

This plan outlines the steps to implement a diagnostic system to identify the root cause of 500 errors in Vercel.

## Proposed Changes

### [Component Name] Server Core
#### [MODIFY] [index.js](file:///c:/projects/mix%20sales/server/index.js)
- Update `dotenv` logic to only run in non-production.
- Add `/api/health` endpoint for env checking.

### [Component Name] API Routes
#### [MODIFY] [analyze.js](file:///c:/projects/mix%20sales/server/routes/analyze.js)
#### [MODIFY] [analyzePrep.js](file:///c:/projects/mix%20sales/server/routes/analyzePrep.js)
#### [MODIFY] [proposals.js](file:///c:/projects/mix%20sales/server/routes/proposals.js)
#### [MODIFY] [clients.js](file:///c:/projects/mix%20sales/server/routes/clients.js)
#### [MODIFY] [dashboard.js](file:///c:/projects/mix%20sales/server/routes/dashboard.js)
- Update all `catch` blocks to return detailed JSON including `message`, `stack` (conditionally), and `failedAt`.

## Verification Plan
1. Check `/api/health` on Vercel.
2. Trigger an error (e.g., by using an invalid prompt) and verify the detailed JSON response.
