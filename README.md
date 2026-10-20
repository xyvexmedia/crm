# XYVEX CRM + FINANCE MANAGEMENT SYSTEM
> **Client Management • Finance • Payments • Expenses • Profit**
> Production-ready Web Application tailored for **XYVEX**, a digital marketing, advertising, design, and creative agency.

---

## 💎 Visual Identity: Dark Liquid Glass
The interface utilizes a custom **Dark Liquid Glass / Frosted Glass** design system:
- **Base Background:** Deepest charcoal `#050505` with subtle atmospheric radial glow (`#050505`, `#080808`, `#0C0C0C`).
- **Translucent Panels:** `background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.035))` with `backdrop-filter: blur(24px) saturate(120%)`.
- **Subtle Borders:** `1px solid rgba(255,255,255,0.11)`.
- **Restrained Motion:** Entrance fade, sheen reflections, and full `prefers-reduced-motion` compliance.

---

## 📊 Core Business Accounting Logic
Strict distinction between committed budgets, actual cashflow, and true profitability:
- **Client Budget:** Total agreed contract amount for services.
- **Amount Received:** Realized cash collected from client (payments cleared).
- **Pending Amount:** `Client Budget - Total Amount Received`.
- **Total Revenue:** `SUM(all payments received)` (*never includes unpaid budget*).
- **Client Expenses:** Direct disbursements on client accounts (*Meta Ads, Google Ads, Video reels, Poster design, Photography, Influencers*).
- **Company Expenses:** Operating overhead (*Vercel/Supabase hosting, software licenses, studio rent, internet, salaries*).
- **Total Expenses:** `Client Expenses + Company Expenses`.
- **Net Profit:** `Total Revenue - Total Expenses`.
- **Client Profit:** `Client Amount Received - Client Expenses` (*never calculated from unpaid budget*).
- **Profit Margin:** `(Client Profit / Amount Received) * 100` (*shows '—' if no cash received*).

---

## 🚀 Key Modules & Routes

| Route | Purpose | Key Features |
|---|---|---|
| `/dashboard` | Executive Overview | 4 Glass KPI cards, Revenue vs Expenses area chart, Donut breakdown, Upcoming bills, Recent feed |
| `/clients` | Client Roster | Search, Status filters (Active, Lead, Completed, Pending, Overdue), Quick actions |
| `/clients/new` | Client Onboarding | Corporate profile, initial service scope, agreed budget, advance payment |
| `/clients/[id]` | Client Financial Audit | Budget progress bar, Meta/Google/Video expense breakdown, profit margin, payment & expense history |
| `/projects` | Campaign Deliverables | Project budgets, timelines, lead assignees, linked financial summary |
| `/revenue` | Cash Inflows | Monthly revenue comparison, growth %, payment method breakdown, audit logs |
| `/expenses` | Cost Accounting | Client vs Company expense tabs, ad accounts, vendor tracking, receipt attachments |
| `/payments` | Inflow Records | Advance, partial, and final settlement logs with payment method tracking |
| `/payments/pending` | Overdue Receivables | Automatic overdue detection (`Billing Date < Today AND Pending > 0`), 1-click collect |
| `/invoices` | Billing | Invoice list with status badges (Draft, Sent, Partially Paid, Paid, Overdue) |
| `/invoices/new` | Create Invoice | Dynamic line item builder, real-time GST tax calculation, payment terms |
| `/invoices/[id]` | Printable Invoice & PDF | Professional invoice view with print stylesheet, XYVEX branding, bank & UPI coordinates |
| `/reports` | Financial Intelligence | Client profit audit table (sortable by profit/revenue), monthly executive summary |
| `/settings` | Agency Settings | Company branding, GSTIN, invoice prefixes, bank details, UPI ID, data reset |
| `/login` | Auth | Secure login with pre-configured 1-click demo access for Salih (Admin) |

---

## 🛠 Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Custom Dark Liquid Glass Tokens
- **Icons:** Lucide React
- **Charts:** Recharts
- **Database:** Supabase (PostgreSQL schema with Row-Level Security in `supabase/schema.sql`)
- **PDF & Print:** High-fidelity vector print stylesheet

---

## 🏃 Running the Application
The application is pre-built and running on:
```bash
http://localhost:3000
```

To run development or build commands:
```bash
pnpm dev      # Start dev server
pnpm build    # Production build
pnpm start    # Start production server
```
