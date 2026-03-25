# FutureDeluxe Dashboard — Setup Guide
## From zero to live dashboard in ~15 minutes

---

## What you're setting up

A live dashboard that reads directly from your Google Sheet. When you update 
the PROJECT_REVIEW sheet, the dashboard updates too (on next page load or 
when you click the refresh button).

Your team can access it via a URL like `fd-dashboard.vercel.app`.

---

## Step 1: Publish your Google Sheet (2 mins)

1. Open your Google Sheet in Chrome
2. Click **File** in the top menu
3. Click **Share** → **Publish to web**
4. A dialog box appears. In the first dropdown, change "Entire Document" to **PROJECT_REVIEW**
5. In the second dropdown, change "Web page" to **Comma-separated values (.csv)**
6. Click the green **Publish** button
7. A URL appears — **copy this URL** and save it somewhere (a note, email to yourself, etc.)

> **Important:** This doesn't make your sheet "public" in the Google search 
> sense. It creates a read-only CSV feed that only someone with the exact URL 
> can access. Your sheet stays fully editable by you.

---

## Step 2: Create a GitHub account (3 mins)

1. Go to **github.com**
2. Click **Sign up**
3. Enter your email, create a password, choose a username
4. Complete the verification steps
5. You now have a GitHub account

---

## Step 3: Upload the project to GitHub (3 mins)

1. Once logged into GitHub, click the **+** icon in the top right → **New repository**
2. Name it `fd-dashboard`
3. Leave it as **Public** (Vercel free tier requires this — your data isn't in the code, it's fetched live from your sheet)
4. Click **Create repository**
5. On the next page, you'll see an option that says **"uploading an existing file"** — click that link
6. Open the `fd-dashboard` folder I've given you on your computer
7. **Select ALL files and folders** inside it and drag them onto the GitHub upload area
8. Make sure you can see: `package.json`, `vite.config.js`, `index.html`, `vercel.json`, and the `src` folder
9. Click **Commit changes**

---

## Step 4: Add your Google Sheet URL to the code (2 mins)

1. In your GitHub repository, click into **src** → **config.js**
2. Click the **pencil icon** (edit) in the top right of the file
3. Find the line that says: `export const SHEET_CSV_URL = "PASTE_YOUR_CSV_URL_HERE";`
4. Replace `PASTE_YOUR_CSV_URL_HERE` with the CSV URL you copied in Step 1
5. Keep the quote marks around it!
6. If you need to update the revenue figures in future, you can edit the `REVENUE_OVERRIDES` section too
7. Click **Commit changes**

---

## Step 5: Deploy on Vercel (5 mins)

1. Go to **vercel.com**
2. Click **Sign Up** → **Continue with GitHub**
3. Authorize Vercel to access your GitHub
4. You'll land on the Vercel dashboard. Click **Add New** → **Project**
5. You should see your `fd-dashboard` repository listed — click **Import**
6. On the configuration page:
   - **Framework Preset**: should auto-detect as "Vite" — if not, select it
   - Leave everything else as default
7. Click **Deploy**
8. Wait 1-2 minutes while it builds
9. When it's done, you'll see a **congratulations** page with a URL like `fd-dashboard-xxxx.vercel.app`
10. **That's your live dashboard!**

---

## Sharing with your team

Simply send them the Vercel URL. No login required, works on any device. 
Bookmark it for easy access.

---

## Updating data

### When you add new projects to the sheet:
Just edit your Google Sheet as normal. The dashboard reads fresh data every 
time someone loads the page (or clicks the refresh button).

### When a new year starts:
1. Add the new year's revenue to `src/config.js` in the `REVENUE_OVERRIDES` section
2. Go to your GitHub repo → `src/config.js` → edit → commit
3. Vercel auto-redeploys in ~60 seconds

### If column names change in your sheet:
You'd need to update `src/dataLoader.js` to match. This is the one scenario 
where you might need technical help — but as long as you keep the same column 
headers it'll work indefinitely.

---

## Troubleshooting

**Dashboard shows "Connection error":**
- Check your CSV URL is correct in `src/config.js`
- Make sure the sheet is still published (File → Share → Publish to web → check it says "Published")
- Try opening the CSV URL directly in your browser — you should see raw data

**Data looks wrong or incomplete:**
- Make sure you published the **PROJECT_REVIEW** sheet specifically, not "Entire Document"
- Check the format is **CSV**, not "Web page"

**Charts not showing:**
- Try a hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

---

## Cost

Everything is free:
- Google Sheets: free
- GitHub: free
- Vercel (Hobby plan): free for personal/small team use

There's nothing to pay for unless you get more than 100GB of bandwidth per 
month, which would require thousands of daily visitors.
