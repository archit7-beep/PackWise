# PackWise — Comprehensive Frontend Architecture & System Context

This document provides a complete technical reference for the frontend web application of the **PackWise AI-Powered Product Intelligence and Compliance Platform**.

---

## 1. Executive Summary & Technology Stack

The PackWise frontend is engineered as a modern, high-performance web interface designed around luxury typography, glassmorphism, and responsive micro-interactions.

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Runtime / Language**: React 19 / TypeScript 5
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with native CSS Variables & design tokens
- **Animation Engine**: [Framer Motion](https://www.framer.com/motion/) (hardware-accelerated transforms, spring physics, and `whileInView` viewports)
- **Typography**: Google Fonts via `next/font` — **Inter** (body & UI) and **Inter Tight** (editorial display headings)
- **Design Inspiration**:
  - Aesthetics, palette, and typography: `subscrr.app`
  - Upload interface & interaction model: `wetransfer.com`

---

## 2. Directory & Component Hierarchy

The frontend resides directly in the `frontend/` directory:

```
frontend/
├── app/
│   ├── dashboard/
│   │   └── page.tsx              # Deep product intelligence analysis dashboard
│   ├── favicon.ico               # PackWise favicon
│   ├── globals.css               # Design system tokens, glassmorphism & grain overlay
│   ├── layout.tsx                # Root HTML layout, SEO metadata, fonts & splash loader
│   └── page.tsx                  # WeTransfer-style landing page
├── components/
│   ├── AccuracySection.tsx       # Auditability & transparency trust badges
│   ├── AlertsSection.tsx         # Live compliance telemetry & caliper console
│   ├── ComplianceSection.tsx     # 6-Point Metrology & FSSAI PASS/FAIL table
│   ├── FAQSection.tsx            # Accordion-style product FAQ
│   ├── Footer.tsx                # Large editorial CTA & team credit
│   ├── Hero.tsx                  # WeTransfer-style centered upload with 3D cursor parallax
│   ├── Loader.tsx                # Staggered typography splash screen
│   ├── Manifesto.tsx             # Editorial mission statement
│   ├── Navbar.tsx                # Lucent frosted glass locked floating pill navbar
│   ├── NutritionSection.tsx      # Nutrition facts card with animated ICMR gauges
│   ├── OCRSection.tsx            # EasyOCR raw vs structured JSON dual terminal
│   ├── Overview.tsx              # 5-step OCR and compliance pipeline overview
│   └── SustainabilitySection.tsx # Material recyclability & disposal guide
├── lib/
│   └── motion.ts                 # Shared cubic-bezier easing presets & variants
├── public/                       # Static SVGs and branding assets
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

---

## 3. Routes & User Flow

### 3.1. Landing Page (`/`)
The landing page serves as the entry point and conversion funnel:
1. **Initial Splash Loader (`Loader.tsx`)**: Renders a letter-by-letter spring entrance animation for `"PackWise"`, displaying for ~2.4s on first mount before fading seamlessly into the layout.
2. **Floating Lucent Navbar (`Navbar.tsx`)**: Permanently fixed at `top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl` with `bg-[#FDFBF7]/12 backdrop-blur-md` optical refraction.
3. **WeTransfer Hero Dropzone (`Hero.tsx`)**:
   - Centered headline: *"Scan any product. Know everything about it."*
   - Reactive 3D cursor parallax container tracking mouse position (`mouseX`, `mouseY`, `rotateX`, `rotateY`).
   - Floating file-extension badges (`.JPG`, `.PNG`, `.PDF`, `.WEBP`, `.HEIC`) with asynchronous bobbing animations.
   - Drag-and-drop or file input trigger that transitions directly to `/dashboard`.
4. **Scan Pipeline Overview (`Overview.tsx`)**: Step-by-step pipeline from upload to EasyOCR, Google GenAI structured extraction, Legal Metrology validation, and report generation.
5. **Compliance Preview (`ComplianceSection.tsx`)**: 6-check regulatory verification for packaging.
6. **Live Telemetry Alerts Console (`AlertsSection.tsx`)**: Interactive micro-widgets including an Optical Font Caliper Gauge, 6-Point Statutory Matrix, and License Registry Watchdog.
7. **Editorial Manifesto (`Manifesto.tsx`)**: Large typography highlighting consumer transparency.
8. **Accuracy & Governance (`AccuracySection.tsx`)**: Badges highlighting deterministic rule evaluation over LLM guesswork.
9. **FAQ (`FAQSection.tsx`)**: Accordion questions on OCR accuracy, FSSAI regulations, and data retention.
10. **Footer (`Footer.tsx`)**: Large interactive *"Scan your first product."* CTA, navigation links, and the team signature: `✦ Created by Team Claude's plan ✦`.

### 3.2. Product Intelligence Dashboard (`/dashboard`)
The dashboard provides an in-depth regulatory, nutritional, and sustainability evaluation for the scanned product:
- **Product Context**: Mock data canonical product is **Amul Buffalo Milk**.
- **Inspection Header**:
  - Scanned product badge (`🥛 Amul Buffalo Milk`, MRP: ₹68, Net Qty: 1L, Mfd: 28-08-2026, Best Before: 31-08-2026, FSSAI Lic: 10013022000357).
  - SVG radial animated score gauge displaying an overall AI Score of **`94 / 100`**.
- **Quick Metrics Grid**: 4 telemetry cards (`6/6 Compliance PASS`, `EasyOCR 97% Confidence`, `Nutrition 78/100`, `Recyclable Packaging`).
- **Comprehensive Analysis Modules**:
  - Full PASS/FAIL Legal Metrology & FSSAI rule breakdown table.
  - EasyOCR extraction terminal showing raw text vs formatted JSON.
  - Nutrition breakdown with percent daily value bars based on ICMR recommendations.
  - Sustainability scoring and Tetra Pak disposal/recycling guidance.

---

## 4. Design System & Theme Engine

### 4.1. Color Tokens (`globals.css`)
| Token | Light Theme | Dark Theme (`[data-theme="dark"]`) | Usage |
| :--- | :--- | :--- | :--- |
| `--orange` | `#FF2500` | `#FF2500` | Primary action / brand accent |
| `--ink` | `#1a1712` | `#F5F5F5` | Primary text and headings |
| `--muted` | `#7c766c` | `rgba(255,255,255,0.5)` | Secondary / helper text |
| `--bg` | `#f4f2ec` (warm paper) | `#0A0A0A` (deep obsidian) | Page canvas background |
| `--card` | `#ffffff` | `#141414` | Card & panel background |
| `--line` | `rgba(26,23,18,0.1)` | `rgba(255,255,255,0.08)` | Border lines |
| `--peri-ink` | `#4c63c7` | `rgba(255,255,255,0.5)` | Category chips & secondary accents |

### 4.2. Glassmorphism Architecture
The floating navbar utilizes optical frosted glass refraction:
```css
bg-[#FDFBF7]/12 dark:bg-black/20
backdrop-blur-md backdrop-saturate-[180%]
border border-white/35 dark:border-white/[0.08]
shadow-[0_4px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)]
```

### 4.3. Motion & Animation Standards (`lib/motion.ts`)
- **Primary Smooth Curve**: `cubic-bezier(0.16, 1, 0.3, 1)` (represented as tuple `[0.16, 1, 0.3, 1]`)
- **Spring Physics**: `cubic-bezier(0.34, 1.56, 0.64, 1)`
- **Scroll Triggers**: Hardware-accelerated Framer Motion `whileInView` with `viewport={{ once: true, margin: "-60px" }}`.

---

## 5. Development & Build Commands

All frontend scripts should be executed from the `frontend/` directory:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start local development server (Turbopack)
npm run dev

# Run TypeScript type check
npx tsc --noEmit

# Create optimized production build
npm run build

# Start production server
npm run start
```
