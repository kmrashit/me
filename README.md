# 🚀 Knowledge Nebula (The Rocket Journey)

An interactive, premium, dark-mode 3D portfolio project hostable on GitHub Pages. Your skills are represented as a cosmic dataset of "knowledge nodes" distributed in concentric orbital spheres around a central fixed rocket.

The rocket engine exhaust fire, nebula starfield drift speed, and orbit speed are fully adjustable using the Warp Drive controller. Hovering over skills highlights their constellation lines and reveals their proficiency and description in a glassmorphic details dashboard.

---

## 🛠️ Architecture and Customization

This project is built using:
- **Three.js** for the 3D canvas rendering, starfield, procedural rocket, and exhaust particles.
- **Vanilla CSS** for premium styling, animations, responsive design, and glassmorphic panels.
- **Bun + Vite** as the development server and static build packager.

### No-Rebuild Dynamic Configuration
The data files (`skills.json` and `config.json`) are located in the `public/` directory. When Vite bundles the application into the static `dist/` directory, these files are copied *verbatim*. 
- **What this means for you**: Once your site is hosted on GitHub Pages, you (or anyone using your template) can edit `skills.json` or `config.json` directly through GitHub's web interface, and the changes will immediately go live on the site **without** requiring you to check out the code, install dependencies, or recompile a Javascript bundle!

---

## 📂 Customizing the Data

### 1. Customizing Skills (`public/skills.json`)
The file contains an array of skill objects. Customize them to fit your skillset:
```json
{
  "name": "Redis",
  "category": "Backend",
  "proficiency": "high",
  "description": "In-memory database, caching, and pub/sub message broker."
}
```
- `proficiency`: Can be `"high"`, `"medium"`, or `"low"`. This determines which concentric sphere they are placed in:
  - `"high"`: Inner Sphere (Closest radius, warm pink glow)
  - `"medium"`: Middle Sphere (Teal/cyan glow)
  - `"low"`: Outer Sphere (Furthest radius, purple glow)
- `category`: Skills of the same category will be connected with glowing constellation lines.

### 2. Customizing Configurations (`public/config.json`)
Allows you to customize text, themes, and colors without changing any code:
- **`developer`**: Set your `name`, `title`, `bio`, and social URLs (`github`, `linkedin`, `email`).
- **`theme`**: Change background color, accent colors, and glow colors.
- **`rocket`**: Customize colors of the 3D rocket parts (`bodyColor`, `finColor`, `windowColor`, `exhaustColor`).

---

## 💻 Local Development

Ensure you have [Bun](https://bun.sh/) installed.

1. **Install Dependencies**:
   ```bash
   bun install
   ```

2. **Start Dev Server**:
   ```bash
   bun run dev
   ```
   This will start a local hot-reloading server (usually at `http://localhost:5173`).

---

## 🚀 Compiling & Hosting on GitHub Pages

Because the project is configured with relative base paths (`base: './'`), the built application can run under any path (such as a GitHub repository subdirectory).

### Step 1: Build the Static Files
Run the build script to compile the application:
```bash
bun run build
```
This generates a `dist` folder containing all static assets, HTML, compiled JS, and raw JSON configurations.

### Step 2: Deploy to GitHub Pages

#### Option A: GitHub Actions (Recommended, automated)
Create a workflow file in your repository at `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ] # or your default branch

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install Dependencies
        run: bun install

      - name: Build
        run: bun run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload Artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

#### Option B: Manual Deploy using the `gh-pages` package
1. Install `gh-pages` as a dev dependency:
   ```bash
   bun add -d gh-pages
   ```
2. Add a deploy script to your `package.json`:
   ```json
   "scripts": {
     "dev": "vite",
     "build": "vite build",
     "preview": "vite preview",
     "deploy": "vite build && gh-pages -d dist"
   }
   ```
3. Run the deployment:
   ```bash
   bun run deploy
   ```
