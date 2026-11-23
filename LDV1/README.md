# LUMA — Public Results Website (UI milestone)

A responsive Next.js starter implementing the agreed LUMA public-facing design.

## Included
- Modern minimal monochrome design (desktop + mobile)
- Hero drawer navigation with the six agreed sections
- Today's results and seven draw shortcuts
- Result history date selector with honest empty/archive states
- Number search across the bundled verified result records
- Daily draw schedule
- Print / Save as PDF action
- Notification preference toggles (local prototype state)
- Light/dark mode toggle
- Share result action (Web Share API where available; clipboard fallback)

## Run locally
1. Install Node.js 18.17+.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open http://localhost:3000.

## Important before launch
The bundled result data is a snapshot from the supplied reference page dated 15-11-2026, not a live feed. Only the three published winning-number sets are populated. The remaining four are intentionally marked as awaiting publication. Confirm the draw values and dates with the client before production.

The history section is deliberately not populated with invented past results. Official PDF downloads, push/email/SMS delivery, admin login, database persistence, and live result publishing are not connected in this public UI milestone. The Downloads page currently offers browser Print / Save as PDF, not original downloadable PDFs.

## Recommended next integration milestone
Connect Supabase/PostgreSQL tables for draws, results, prize tiers, historical records, PDF assets, user notification preferences, and admin audit logs. Add authenticated admin publishing with validation, preview, approval, and correction history.
