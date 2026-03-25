// ============================================================
// PASTE YOUR GOOGLE SHEET CSV URL BELOW
// ============================================================
// 
// To get this URL:
// 1. Open your Google Sheet
// 2. File → Share → Publish to web
// 3. Select "PROJECT_REVIEW" sheet
// 4. Change format to "CSV"  
// 5. Click Publish and paste the URL here
//
// It will look something like:
// https://docs.google.com/spreadsheets/d/e/2PACX-xxxxx/pub?gid=123456&single=true&output=csv

export const SHEET_CSV_URL = "PASTE_YOUR_CSV_URL_HERE";

// ============================================================
// REVENUE OVERRIDES — update these each year
// ============================================================
// These are your actual year-split revenue figures 
// (because the sheet lists full project values, not the split)

export const REVENUE_OVERRIDES = {
  2021: 8795150,
  2022: 11662012,
  2023: 12510000,
  2024: 12399538,
  2025: 13723841,
};
