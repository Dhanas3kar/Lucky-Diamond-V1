# 📊 Lucky Diamond — Google Sheets Client Setup & Daily Publishing Guide

This guide enables the client/admin to update daily winning numbers in **Google Sheets** and have them publish **instantly and directly to the live website**.

---

## 🚀 Quick Setup

### Step 1: Open Your Google Sheet
Name your spreadsheet: **`Lucky Diamond - Live Results`**.

---

## 📋 Recommended Sheet Structure (Copy & Paste)

Set Row 1 as the column headers:

| A | B | C | D | E | F | G |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Date** | **Draw Name** | **Time** | **Draw No** | **1st Prize** | **2nd Prize** | **Status** |

### Sample Daily Entry Rows (6 Draws • Lucky Diamond • 1st Prize ₹10,000 • 2nd Prize ₹1,000):

| Date | Draw Name | Time | Draw No | 1st Prize | 2nd Prize | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `23-11-2026` | `LUCKYDIAMOND` | `11:10 AM` | `420` | `512` | `12` | `Published` |
| `23-11-2026` | `LUCKYDIAMOND` | `12:10 PM` | `421` | `194` | `94` | `Published` |
| `23-11-2026` | `LUCKYDIAMOND` | `01:10 PM` | `422` | `537` | `37` | `Published` |
| `23-11-2026` | `LUCKYDIAMOND` | `06:10 PM` | `423` | `007` | `07` | `Published` |
| `23-11-2026` | `LUCKYDIAMOND` | `07:10 PM` | `424` | | | `Awaiting` |
| `23-11-2026` | `LUCKYDIAMOND` | `08:10 PM` | `425` | | | `Awaiting` |

---

## ⚡ Smart Features & Auto-Calculations

1. **Auto 2nd Prize Derivation**:
   * If the client enters only the 3-digit 1st prize (e.g. `512`), the website **automatically computes** the 2nd prize (`12` — the last two digits)!
   * The client can manually enter or override the 2nd prize in Column F if desired.
2. **Auto Status Detection**:
   * If `1st Prize` has a number, status is automatically considered **Published**.
   * If `1st Prize` is empty, status is automatically **Awaiting result**.
3. **Flexible Timings**:
   * The 6 daily draws run at: `11:10 AM`, `12:10 PM`, `01:10 PM`, `06:10 PM`, `07:10 PM`, and `08:10 PM`.
   * Accepts flexible time formats like `11.10 AM`, `11:10 AM`, or `11:10`.

---

## 🔗 Step 2: Share the Google Sheet

1. In Google Sheets, click the **Share** button in the top-right corner.
2. Under **General access**, change from *Restricted* to:
   👉 **`Anyone with the link`** (set role to **Viewer**).
3. Copy the link.
