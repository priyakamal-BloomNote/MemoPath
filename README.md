# MemoPath 🌿

### Capture your moments. Understand your journey. Grow with intention.

MemoPath is a personal journaling and decision-tracking web application that helps users capture thoughts, document meaningful experiences, reflect on important decisions, and understand their personal growth.

Built using React, TypeScript, Vite, and Supabase, MemoPath combines personal journaling, decision management, visual analytics, and **Pria**, an AI companion integrated into the application through Bolt AI using an externally created assistant link.

## What It Does

MemoPath provides a centralized space for users to record experiences, explore their thoughts, review decisions, and learn from the past.

Users can:

- Capture thoughts, feelings, ideas, and meaningful moments.
- Record important academic, career, and personal decisions.
- Compare expected outcomes with actual results.
- Reflect on experiences and document lessons learned.
- Explore personal activity through visual analytics.
- Track upcoming reviews, goals, and milestones.
- Share thoughts and experiences with Pria, the AI companion.

## Core Features

### Dashboard

- Personalized overview of journal entries and decisions.
- Summary cards displaying activity and progress.
- Quick actions for creating entries and recording decisions.
- Today's Focus section for pending reviews and upcoming reminders.
- Integrated Pria AI companion panel.
- Recent activity and personal progress indicators.

### Personal Journal

- Record thoughts, feelings, experiences, and everyday moments.
- Organize entries into meaningful categories.
- Add titles, descriptions, dates, and tags.
- Browse and revisit previously recorded entries.
- Maintain a personal record of important experiences.

### Decision Tracking

- Record academic, career, financial, and personal decisions.
- Document the reasons behind each decision.
- Define expected outcomes.
- Assign confidence levels from 1–10.
- Set priorities and review dates.
- Record actual outcomes after reviewing decisions.
- Compare expected results with actual experiences.

### Reflection and Learning

- Reflect on previous decisions and experiences.
- Document what went well and what could be improved.
- Record lessons learned.
- Revisit past reflections to understand personal progress.
- Encourage continuous learning through structured reflection.

### Pria — AI Companion

Pria is an AI companion integrated into MemoPath using an externally created assistant link connected through Bolt AI.

- Provides a conversational space to share thoughts, feelings, ideas, and experiences.
- Allows users to discuss decisions and everyday situations.
- Offers an alternative way to explore personal thoughts.
- Integrates the assistant experience into the MemoPath interface.

### Analytics

- Visualize decision trends and personal activity.
- Explore confidence levels and decision outcomes.
- Analyze activity across different categories.
- Track reflection streaks and lessons learned.
- Display information through interactive charts and summary cards.

### Timeline and Calendar

- View decisions and experiences chronologically.
- Track decision dates and scheduled reviews.
- Visualize upcoming review dates in a calendar.
- Identify pending and overdue reviews.
- Revisit previous experiences and reflections.

### Goals and Aspirations

- Record academic, career, and personal goals.
- Track milestones and progress.
- Organize future aspirations.
- Monitor personal development over time.

### Categories

Organize entries into meaningful areas of life:

- Academics
- Career
- Personal Growth
- Finance
- Health

### User Experience

- Responsive interface for desktop, tablet, and mobile.
- Modern dashboard with rounded cards and subtle shadows.
- Soft sage green, cream, beige, and white color palette.
- Intuitive navigation and interactive visualizations.
- Light and dark themes, where implemented.
- Clean typography and smooth interface interactions.

## Technology Stack

| Area | Technology |
|---|---|
| AI-Assisted Development | Bolt AI |
| Frontend Framework | React 18 |
| Programming Language | TypeScript |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| Backend and Database Services | Supabase |
| Data Fetching and Caching | TanStack React Query |
| Form Management | React Hook Form |
| Schema Validation | Zod |
| Data Visualization | Recharts |
| Icons | Lucide React |
| Code Quality | ESLint |

## Architecture

MemoPath combines a React-based frontend, Supabase services, and an externally created AI assistant.

```text
MemoPath Web Application
          |
          v
 React + TypeScript
          |
          +------------------+
          |                  |
          v                  v
   Supabase Services    Pria AI Companion
   Database / Auth      External Assistant Link
   (if configured)      Integrated through Bolt AI
```

The exact authentication, database, and AI communication mechanisms depend on the configurations used in the application.

## Local Setup

### 1. Clone the Repository

```bash
git clone priyakamal-BloomNote/MemoPath
cd MemoPath
```

### 2. Install Dependencies

Make sure Node.js and npm are installed.

```bash
npm install
```

### 3. Configure Environment Variables

If your application uses Supabase environment variables, create a `.env` file in the project root.

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_key
```

Use the exact variable names required by your source code. Do not commit private API keys, database credentials, or service-role keys to GitHub.

### 4. Start the Development Server

```bash
npm run dev
```

Open the local URL displayed in your terminal.

### 5. Build for Production

```bash
npm run build
```

### 6. Run Code Checks

Check the code with ESLint:

```bash
npm run lint
```

Check TypeScript types:

```bash
npm run typecheck
```

### 7. Preview the Production Build

```bash
npm run preview
```

## Project Structure

The following is a typical structure for a React and Vite application. Actual directories may differ in the repository.

```text
MemoPath/
├── public/               Static assets and images
├── src/
│   ├── components/       Reusable UI components
│   ├── pages/            Application pages
│   ├── layouts/          Shared page layouts
│   ├── hooks/            Custom React hooks
│   ├── lib/              Supabase and library configuration
│   ├── services/         Data access and integrations
│   ├── types/            TypeScript definitions
│   ├── utils/            Helper functions
│   ├── App.tsx           Main application component
│   └── main.tsx          Application entry point
├── .env.example          Example environment configuration
├── index.html            HTML entry point
├── package.json          Dependencies and scripts
├── tailwind.config.js    Tailwind CSS configuration
├── tsconfig.json         TypeScript configuration
└── vite.config.ts        Vite configuration
```

## Security and Privacy

- Keep private credentials out of source control.
- Configure database access policies where applicable.
- Protect users' personal journal entries and reflections.
- Use appropriate authentication and authorization if accounts are enabled.
- Keep sensitive AI credentials on a secure server rather than exposing them in frontend code.
- Avoid committing `.env` files and other confidential information.

## Future Enhancements

Potential areas for future development include:

- Personalized reflection summaries.
- Advanced decision-pattern analysis.
- Mood and emotion tracking.
- Weekly and monthly personal growth reports.
- Enhanced search and filtering.
- Exportable journals and reflections.
- More personalized AI-powered experiences.

## Portfolio Note

MemoPath is a personal productivity and reflection platform developed with the assistance of Bolt AI. It demonstrates modern frontend development, TypeScript, database integration, form validation, interactive data visualization, and AI assistant integration.

The project explores how journaling and structured decision reviews can help users better understand their experiences, recognize patterns, and make more informed choices.

---

**MemoPath — Your experiences matter. Your growth begins with reflection. 🌿**

