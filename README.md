# KAASH — How To Put This App Online

You do NOT need to know how to code. Just follow these clicks.
Total time: about 20 minutes. Cost: ₹0 (everything here is free).

═══════════════════════════════════════════════════════════
WHAT THIS FOLDER IS
═══════════════════════════════════════════════════════════
This is your complete KAASH app, ready to put on the internet.
When deployed, you get a link (like kaash.vercel.app) that:
  • Works on any phone or computer
  • Can be "Added to Home Screen" so it looks like a real app
  • You can share on WhatsApp, Instagram, anywhere

═══════════════════════════════════════════════════════════
THE EASIEST WAY: DEPLOY VIA GITHUB + VERCEL (NO SOFTWARE TO INSTALL)
═══════════════════════════════════════════════════════════

──────────────────────────────────────────
STEP 1: Create a GitHub account (5 min)
──────────────────────────────────────────
1. Go to github.com
2. Click "Sign up"
3. Use your KAASH email (e.g. kaash.app@gmail.com)
4. Verify your email

──────────────────────────────────────────
STEP 2: Create a new repository (3 min)
──────────────────────────────────────────
1. After logging in, click the "+" icon top-right → "New repository"
2. Repository name: type "kaash-app"
3. Select "Public"
4. Click "Create repository"
5. On the next page, click the link "uploading an existing file"
   (it's in the line: "…or push an existing repository…")
   OR go to: github.com/YOUR-USERNAME/kaash-app/upload/main

──────────────────────────────────────────
STEP 3: Upload these files (5 min)
──────────────────────────────────────────
1. Open this "kaash-deploy" folder on your computer
2. Select ALL files and folders inside it
   (package.json, vite.config.js, index.html, src folder, public folder, etc.)
   ⚠️ Select the CONTENTS, not the folder itself
3. Drag them all into the GitHub upload box in your browser
4. Wait for upload to finish (you'll see green checkmarks)
5. Scroll down, click "Commit changes"

──────────────────────────────────────────
STEP 4: Connect to Vercel and Deploy (5 min)
──────────────────────────────────────────
1. Go to vercel.com
2. Click "Sign Up" → "Continue with GitHub" (use the same account)
3. Click "Add New..." → "Project"
4. Find "kaash-app" in the list → click "Import"
5. Vercel auto-detects everything. DON'T change any settings.
6. Click "Deploy"
7. Wait 1-2 minutes ⏳
8. 🎉 You'll see "Congratulations!" with your live link

Your app is now LIVE at: kaash-app.vercel.app
(or similar — Vercel gives you the exact link)

──────────────────────────────────────────
STEP 5: Test it (2 min)
──────────────────────────────────────────
1. Open the link on your phone
2. Tap through the app
3. To install as an app:
   • iPhone: Tap Share → "Add to Home Screen"
   • Android: Tap menu (⋮) → "Install app" or "Add to Home Screen"

═══════════════════════════════════════════════════════════
WANT A CUSTOM DOMAIN? (kaash.app instead of kaash-app.vercel.app)
═══════════════════════════════════════════════════════════
1. Buy "kaash.app" at godaddy.com or namecheap.com (~₹1,200/year)
2. In Vercel: Project → Settings → Domains → Add → type "kaash.app"
3. Vercel shows you DNS settings → paste them at GoDaddy
4. Wait 1 hour → kaash.app is live

═══════════════════════════════════════════════════════════
ALTERNATIVE: TEST ON YOUR OWN COMPUTER FIRST (optional)
═══════════════════════════════════════════════════════════
If you want to see it on your computer before going online:
1. Install Node.js from nodejs.org (click the big green "LTS" button)
2. Open Terminal (Mac) or Command Prompt (Windows)
3. Type: cd (then drag this folder into the window, press Enter)
4. Type: npm install   (press Enter, wait 1 min)
5. Type: npm run dev    (press Enter)
6. Open the link it shows (usually http://localhost:5173)

═══════════════════════════════════════════════════════════
TROUBLESHOOTING
═══════════════════════════════════════════════════════════
• "Build failed" on Vercel → Copy the red error text, send it to Claude
• App shows blank screen → Make sure you uploaded the CONTENTS of the
  folder, not the folder itself. The package.json must be at the top level.
• Icons don't show → That's fine, the app still works. Icons are optional.

═══════════════════════════════════════════════════════════
WHAT'S NEXT (after it's live)
═══════════════════════════════════════════════════════════
This version has 6 events with sample content built in.
To add real videos and all 100 events, you'll connect:
  • Firebase (database for events) — see INSTRUCTION_MANUAL.md
  • Cloudflare R2 (video storage) — see INSTRUCTION_MANUAL.md
  • Razorpay (payments) — see INSTRUCTION_MANUAL.md
Claude will guide you through each when you're ready.

Right now, your goal is simple: GET IT LIVE and share the link.
