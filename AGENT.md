# AGENT.md
## REVREBEL Onboarding System — Specification

---

## 🎯 Objective

Build a token-based onboarding system powered by SurveyJS + Postgres that:

- Scales dynamically based on service scope
- Prefills known hotel data
- Saves progress automatically
- Supports long-duration completion (days/weeks)
- Uploads files directly into a client’s Google Drive folder
- Provides live progress tracking and reporting
- Supports theming per client/brand

---

# 1️⃣ High-Level Flow

## Internal Admin Flow (REVREBEL)

1. Admin enters:
   - hotel_name
   - location
   - pms_system
   - crs_system
   - rate_shopping_tool
   - rms_system
   - google_drive_folder_id
   - Scope flags (revenue / distribution / digital / social)
   - theme

2. System:
   - Creates `client`
   - Creates `onboarding_instance`
   - Generates secure token
   - Composes dynamic survey JSON
   - Stores metadata in Postgres
   - Returns unique URL

3. Admin sends token link to client.

---

## Client Flow

1. Client clicks unique token link.
2. Runner:
   - Validates token
   - Loads composed survey JSON
   - Injects known hotel data as variables
   - Applies selected theme
   - Restores draft if present

3. Survey:
   - Autosaves on change
   - Uploads files to Google Drive
   - Tracks section completion
   - Displays overall % progress

4. Admin can view real-time progress dashboard.

---

# 2️⃣ Database Design (Postgres)

## Table: clients

```sql
id uuid primary key,
hotel_name text,
location text,
pms_system text,
crs_system text,
rate_shopping_tool text,
rms_system text,
google_drive_folder_id text,
created_at timestamptz,
updated_at timestamptz
```

---

## Table: onboarding_instances

```sql
id uuid primary key,
client_id uuid references clients(id),
survey_slug text,
token text unique,
scope_revenue boolean,
scope_distribution boolean,
scope_digital boolean,
scope_social boolean,
theme text,
status text,
draft_data jsonb,
final_data jsonb,
completion_percent numeric,
current_page integer,
last_saved_at timestamptz,
created_at timestamptz,
updated_at timestamptz,
expires_at timestamptz
```

---

# 3️⃣ Survey Composition Logic

Survey modules stored separately:

```
survey_modules/
  revenue.json
  distribution.json
  digital.json
  social.json
```

Server dynamically composes final JSON based on scope flags.

If scope_revenue = false → omit revenue module.
If scope_distribution = false → omit distribution module.

PMS-specific logic:

If pms_system = 'Opera' → inject Opera-specific instructions.
If pms_system = 'StayNTouch' → inject StayNTouch-specific instructions.

Survey JSON is generated server-side before delivery.

---

# 4️⃣ Runtime Variable Injection

Before rendering survey in runner:

```js
model.setVariable("hotel_name", data.hotel_name);
model.setVariable("pms_system", data.pms_system);
model.setValue("hotel_name", data.hotel_name);
```

Survey text may reference:

```
{hotel_name}
{pms_system}
```

Clients never enter data already known.

---

# 5️⃣ Autosave Architecture

Autosave on every value change (debounced):

```js
model.onValueChanged.add(debounce(async () => {
  await PATCH /api/onboarding/:token/draft
}, 1500));
```

Draft payload:

```
{
  draft_data: model.data,
  current_page: model.currentPageNo,
  completion_percent: calculateCompletion(model)
}
```

On load:

```js
if (data.draft_data) {
  model.data = data.draft_data;
  model.currentPageNo = data.current_page;
}
```

Survey must support multi-day completion.

---

# 6️⃣ Google Drive Upload Integration

Requirements:

- Google Service Account
- Drive API enabled
- Folder ID stored per client

Override SurveyJS upload handler:

```js
model.onUploadFiles.add(async (sender, options) => {
  // send file to backend
});
```

Backend:
1. Receives file
2. Uploads to specified Google Drive folder
3. Returns file reference

Files are not stored locally on application server.

---

# 7️⃣ Theme Selection

Theme selected during onboarding creation.

Examples:

- revrebel-dark
- hoteltriton
- white-sands

Runner dynamically loads theme stylesheet.

Themes control:

- Fonts
- Colors
- Button styles
- Progress bar appearance
- Layout density

---

# 8️⃣ Progress Tracking

## In-Survey Progress

Enable progress bar:

```json
"showProgressBar": "top"
```

Completion logic:

answered_required / total_required

Stored in database on autosave.

---

## Admin Progress Dashboard

Endpoint:

```
GET /api/onboarding/:token/progress
```

Response example:

```
{
  completion_percent,
  sections: [
    { name: "Revenue", percent: 75 },
    { name: "Distribution", percent: 40 }
  ]
}
```

Dashboard displays:

- % complete
- Last saved timestamp
- Section breakdown
- Missing required items
- Uploaded files list
- Status (not started / in progress / completed)

Optional: Use SurveyJS Analytics for visual reporting.

---

# 9️⃣ Security Requirements

- Token length 32+ characters
- Cryptographically random
- Optional hashing at rest
- Expirable
- Revocable
- All API endpoints validate token
- Rate limiting applied

---

# 🔟 UX Principles

- Clear section grouping (Revenue / Distribution / Digital / Social)
- Autosave indicator visible
- "Last saved" timestamp visible
- Upload confirmation visible
- Progress % visible
- Collaborative tone, not bureaucratic

---

# 11️⃣ Future Enhancements

- Multi-user stakeholder assignments
- Internal-only comments
- Role-based visibility
- SLA tracking
- Versioned survey snapshots
- Section approval workflow

---

# 🎯 End Goal

This is not a form.

This is a scalable onboarding engine that:

- Eliminates redundant data entry
- Adapts to scope automatically
- Integrates with Google Workspace
- Tracks progress in real time
- Supports long-duration client collaboration
- Scales across all REVREBEL engagements