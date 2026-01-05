# Clean Next.js Base Project

A clean Next.js project with a simple homepage, ready for building new features.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the homepage.

## Project Structure

```
app/
  ├── page.tsx          # Homepage entry point
  ├── layout.tsx        # Root layout with fonts
  └── globals.css       # Global styles

components/
  ├── ProfessionalHomepage.tsx  # Main homepage component
  ├── ProjectsShowcase.tsx      # Projects showcase section
  ├── ProjectCard.tsx           # Individual project card
  ├── ProjectDialog.tsx         # Project detail dialog
  ├── RTLWrapper.tsx            # RTL language support wrapper
  └── ui/                       # shadcn/ui components

lib/
  ├── utils.ts          # Utility functions
  ├── icons.ts          # Icon definitions
  └── translations.ts   # Translation utilities

hooks/
  └── use-translation.ts  # Translation hook
```

## Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Framer Motion** - Animations
- **Lucide React** - Icons

## Building New Features

This is a clean base with minimal dependencies. You can start building by:

1. Adding new pages in the `app/` directory
2. Creating reusable components in `components/`
3. Adding utility functions in `lib/`
4. Installing additional packages as needed

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
