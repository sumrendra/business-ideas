# Setup Plan — Steps You Need to Do

Everything in the codebase has been generated. The steps below are the **manual, one-time actions** required from you before the site can run.

---

## 1. Install Node.js dependencies

```bash
cd business-ideas
npm install
```

---

## 2. Create a Sanity project

1. Go to [sanity.io](https://www.sanity.io) and sign up / log in.
2. Click **Create new project** → name it `Business Ideas`.
3. Choose dataset name `production`.
4. Copy your **Project ID** from the project dashboard.

---

## 3. Create a Sanity API token

1. In your Sanity project dashboard → **API** → **Tokens**.
2. Click **Add API token**.
3. Name: `Next.js server`, Role: **Viewer**.
4. Copy the token — you will only see it once.

---

## 4. Set up local environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=<your project id from step 2>
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=<token from step 3>
SANITY_WEBHOOK_SECRET=<any random string, e.g. run: openssl rand -hex 32>
```

---

## 5. Run locally

```bash
npm run dev
```

- Site: http://localhost:3000
- Sanity Studio (CMS): http://localhost:3000/studio

Log in to the Studio with your Sanity account and start adding ideas and blog posts.

---

## 6. Add `NEXT_PUBLIC_SITE_URL` to `.env.local`

Once you have a domain or Cloud Run URL, add:

```
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

This is used by the sitemap generator.

---

## 7. GCP setup (one-time)

### 7a. Install and authenticate the GCP CLI

```bash
# Install: https://cloud.google.com/sdk/docs/install
gcloud auth login
gcloud config set project YOUR_GCP_PROJECT_ID
```

### 7b. Enable required GCP services

```bash
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com
```

### 7c. Create Artifact Registry repository

```bash
gcloud artifacts repositories create business-ideas \
  --repository-format=docker \
  --location=us-central1 \
  --description="Business Ideas Next.js app"
```

### 7d. Store secrets in GCP Secret Manager

```bash
# Replace the values with your actual secrets
echo -n "your_sanity_api_token"     | gcloud secrets create SANITY_API_TOKEN     --data-file=-
echo -n "your_webhook_secret"       | gcloud secrets create SANITY_WEBHOOK_SECRET --data-file=-
```

---

## 8. Configure GitHub repository secrets

In your GitHub repo → **Settings** → **Secrets and variables** → **Actions**, add:

| Secret name                     | Value                                               |
|---------------------------------|-----------------------------------------------------|
| `GCP_PROJECT_ID`                | Your GCP project ID                                 |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Your Sanity project ID                              |
| `NEXT_PUBLIC_SANITY_DATASET`    | `production`                                        |
| `NEXT_PUBLIC_SITE_URL`          | Your Cloud Run URL (fill in after first deploy)     |
| `WIF_PROVIDER`                  | Workload Identity provider (see step 9)             |
| `WIF_SERVICE_ACCOUNT`           | Workload Identity service account (see step 9)      |

---

## 9. Set up Workload Identity Federation (WIF)

WIF lets GitHub Actions deploy to GCP without storing a JSON key. Run these commands once:

```bash
# Create a service account for deployments
gcloud iam service-accounts create github-deployer \
  --display-name="GitHub Actions Deployer"

# Grant it the roles it needs
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-deployer@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-deployer@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-deployer@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-deployer@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Create the Workload Identity Pool
gcloud iam workload-identity-pools create github-pool \
  --location="global" \
  --display-name="GitHub Actions Pool"

# Create the OIDC provider inside the pool
gcloud iam workload-identity-pools providers create-oidc github-provider \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# Allow GitHub Actions from YOUR repo to impersonate the service account
# Replace YOUR_GITHUB_USERNAME/business-ideas with your actual repo path
gcloud iam service-accounts add-iam-policy-binding \
  github-deployer@$PROJECT_ID.iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/attribute.repository/YOUR_GITHUB_USERNAME/business-ideas"
```

Get the values for `WIF_PROVIDER` and `WIF_SERVICE_ACCOUNT`:

```bash
# WIF_PROVIDER value:
gcloud iam workload-identity-pools providers describe github-provider \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --format="value(name)"

# WIF_SERVICE_ACCOUNT value:
echo "github-deployer@$PROJECT_ID.iam.gserviceaccount.com"
```

---

## 10. First deploy

Push to `main` to trigger the GitHub Actions pipeline:

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

The workflow will:
1. Build the Docker image
2. Push it to Artifact Registry
3. Deploy it to Cloud Run

After deploy, get your live URL:

```bash
gcloud run services describe business-ideas \
  --region=us-central1 \
  --format="value(status.url)"
```

Copy this URL and update `NEXT_PUBLIC_SITE_URL` in both GitHub Secrets and your `.env.local`.

---

## 11. Set up the Sanity revalidation webhook

This makes the site update instantly when you publish content — no redeploy needed.

1. Go to your Sanity project dashboard → **API** → **Webhooks**.
2. Click **Create webhook**.
3. Fill in:
   - **Name**: `Next.js Revalidate`
   - **URL**: `https://YOUR_CLOUD_RUN_URL/api/revalidate?secret=YOUR_WEBHOOK_SECRET`
   - **Trigger on**: Create, Update, Delete
   - **Filter**: `_type == "businessIdea" || _type == "post"`
   - **Projections**: `{_type, slug}`
4. Save.

---

## 12. (Optional) Custom domain

In GCP Console → Cloud Run → your service → **Custom domains** → map your domain. Then update DNS at your registrar.

---

## Summary of external accounts needed

| Service    | Purpose                        | Cost       |
|------------|-------------------------------|------------|
| Sanity.io  | CMS for ideas and blog posts   | Free tier (up to 3 users, 10GB) |
| GCP        | Cloud Run + Artifact Registry  | Pay-per-use, ~$0 at low traffic |
| GitHub     | Source control + CI/CD         | Free       |

---

## File structure reference

```
business-ideas/
├── app/
│   ├── page.tsx                    Homepage
│   ├── ideas/
│   │   ├── page.tsx                Ideas listing with filters
│   │   └── [slug]/page.tsx         Individual idea page
│   ├── blog/
│   │   ├── page.tsx                Blog listing
│   │   └── [slug]/page.tsx         Individual blog post
│   ├── studio/[[...tool]]/page.tsx Sanity CMS (owner only)
│   ├── api/revalidate/route.ts     Webhook endpoint
│   ├── sitemap.ts                  Auto-generated sitemap
│   └── robots.ts                   robots.txt
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── IdeaCard.tsx
│   ├── BlogCard.tsx
│   └── FilterSidebar.tsx           Tag / budget / industry filters
├── lib/sanity/
│   ├── client.ts                   Sanity client
│   ├── queries.ts                  All GROQ queries
│   ├── image.ts                    Image URL builder
│   └── types.ts                    TypeScript types + filter constants
├── sanity/
│   └── schemas/
│       ├── businessIdea.ts         Idea content schema
│       ├── post.ts                 Blog post schema
│       └── index.ts
├── sanity.config.ts                Sanity Studio config
├── Dockerfile                      Multi-stage production build
├── .github/workflows/deploy.yml   CI/CD pipeline
└── plan.md                         This file
```
