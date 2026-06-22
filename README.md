# 🇪🇹 Ethiopian Real Estate Chatbot

Bilingual AI chatbot (Amharic + English) for Addis Ababa real estate companies.

## Deploy to Netlify (5 minutes)

### Step 1 — Upload to GitHub
1. Create a new repo on github.com
2. Upload all these files (drag & drop the whole folder)

### Step 2 — Connect to Netlify
1. Go to app.netlify.com → "Add new site" → "Import an existing project"
2. Connect your GitHub repo
3. Build settings are auto-detected from `netlify.toml`
4. Click **Deploy**

### Step 3 — Add your API key
1. In Netlify dashboard → **Site Settings → Environment Variables**
2. Click **Add a variable**
3. Key: `ANTHROPIC_API_KEY`
4. Value: `sk-ant-...` (your Anthropic API key)
5. Click **Save** → then **Trigger deploy** → **Deploy site**

✅ Done! Your site is live and the chatbot will answer questions.

## Get an Anthropic API key
→ https://console.anthropic.com
