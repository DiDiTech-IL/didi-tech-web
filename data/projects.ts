import { Project } from "@/types/project";

/**
 * Portfolio projects data
 *
 * HOW TO ADD A NEW PROJECT:
 * 1. Copy the template below
 * 2. Fill in all the required fields (id, name, description, status, audience, startedAt)
 * 3. Add optional fields as needed (tagline, url, userCount, stack, highlights, metrics, links, image, logoImage, icon, category)
 * 4. Add your project to the projects array
 *
 * TEMPLATE:
 * {
 *   id: "unique-project-id",
 *   name: "Project Name",
 *   tagline: "Short motto or tagline",
 *   url: "https://yourproject.com",
 *   description: "Brief 1-2 sentence description",
 *   status: "live",
 *   audience: "general",
 *   track: "enterprise", // or: "dev-tools" | "hobby"
 *   startedAt: "2024-12", // optional
 *   userCount: 1000,
 *   stack: ["Next.js", "PostgreSQL", "Stripe"],
 *   highlights: ["Webhook validation", "Multi-tenant"],
 *   details: "Longer write-up (optional)",
 *   icon: "Zap",
 *   category: "web-app"
 * }
 */

export const projects: Project[] = [
  {
    id: "mitnadvim",
    name: "מתנדבים",
    tagline: "מערכת לניהול מתנדבים וקבוצות",
    url: "https://www.mitnadvim.app",
    description:
      "מערכת לארגוני התנדבות שמרכזת קבוצות, משימות וניהול מתנדבים במקום אחד — עם תהליך ברור ותפעול יומיומי פשוט.",
    audience: "general",
    track: "enterprise",
    startedAt: "2025-9",
    details: `
• ניהול קבוצות/צוותים ומתנדבים
• תיעוד פעילות, התקדמות ושיוך משימות
• דשבורד ברור לתפעול יום־יומי
`,
    userCount: 450,
    status: "live",
    highlights: [
      "חוויית תפעול פשוטה למנהלים",
      "מבנה קבוצות וגמישות ארגונית",
      "מעקב והתקדמות בצורה מסודרת",
    ],
    icon: "Heart",
    category: "web-app",
  },
  {
    id: "tachles-pay",
    name: "תכלס Pay",
    tagline: "כלי מעקב תשלומים בזמן אמת למפתחים ובעלי עסקים",
    description:
      "כלי להטמעה בשרתים בכדי לספק לבעלי העסק מידע בזמן אמת על תהליכי תשלום שמתבצעים על ידי הלקוחות שלהם.",
    status: "completed",
    audience: "developers",
    track: "dev-tools",
    icon: "CreditCard",
    category: "api",
    url: "https://pay.tachles.dev",
  },
  {
    id: "tachles-starter",
    name: "תכלס Starter",
    tagline: "הקמת פרויקטים בלחיצת כפתור",
    description:
      "חסכו זמן של התקנות והתאמת סביבת הפיתוח שלכם עם תבניות מוכנות מראש שתוכלו ליצור ולשתף בקלות.",
    status: "completed",
    audience: "developers",
    track: "dev-tools",
    stack: ["TypeScript", "Node.js", "npm", "CLI"],
    icon: "Workflow",
    category: "other",
    url: "https://starter.tachles.dev",
  },
  {
    id: "vechen-lemar",
    name: "וכן למר",
    tagline: "פלטפורמת ברכות לשנה החדשה",
    description:
      "פלטפורמה ליצירה ושיתוף של ברכות לשנה החדשה — קל לשלוח, קל לשתף, ונעים להשתמש.",
    status: "completed",
    audience: "general",
    track: "hobby",
    icon: "Globe",
    category: "web-app",
    url: "https://vechenlemar.co.il",
  },
  {
    id: "academap",
    name: "Academap",
    tagline: "מיפוי קורסים ומסלולי למידה",
    description:
      "בנו מסלולי למידה לפי תוכניות התואר שלכם, ועקבו אחרי ההתקדמות שלכם לאורך הסמסטרים",
    status: "completed",
    audience: "general",
    track: "hobby",
    icon: "Map",
    category: "web-app",
    url: "https://www.academap.info",
  },
  {
    id: "smart-oc",
    name: "Smart OC",
    tagline: "אותו חמ״ל, רק חכם יותר",
    description:
    "מערכת ניהול כוחות וגורמים באירועים, בקרת דיווחים ועדכונים בזמן אמת מהכוחות שבשטח",
    status: "completed",
    audience: "general",
    track: "enterprise",
    icon: "Users",
    category: "web-app",
    url: "https://smartoc.live",
  },
  //   {
  //     id: "payments-platform",
  //     name: "תשתית תשלומים",
  //     tagline: "Webhooks, תוכניות תשלום, חשבוניות — עם דגש על אמינות",
  //     description:
  //       "שירות ותשתית שמסדרים תשלומים בפרודקשן: קליטה/אימות webhooks, ניהול תוכניות תשלום, ויצירת מסמכים.",
  //     audience: "developers",
  //     track: "dev-tools",
  //     startedAt: "2024-05",
  //     details: `מה נכנס בפנים:
  // • קליטה ואימות webhooks בצורה יציבה
  // • ניהול תוכניות תשלום ומעקב סטטוסים
  // • יצירת מסמכים (כמו חשבוניות) כחלק מהתהליך
  // • ניטור ובריאות שירות (health checks)

  // הדגש: דיזיין שמקטין תקלות ומקל דיבוג.`,
  //     stack: ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "Redis"],
  //     status: "live",
  //     icon: "CreditCard",
  //     category: "api",
  //   },
  //   {
  //     id: "package-builder",
  //     name: "בונה חבילות מותאמות",
  //     tagline: "כלי שמייצר חבילות/בינארים לפי קונפיגורציה",
  //     description:
  //       "כלי פנימי למפתחים שמייצר build ארוז ומסודר לפי הגדרות — כדי לחסוך זמן ולמנוע טעויות ידניות.",
  //     audience: "developers",
  //     track: "dev-tools",
  //     startedAt: "2024-10",
  //     status: "in-development",
  //     stack: ["TypeScript", "Node.js"],
  //     highlights: ["CLI פשוט", "קונפיגורציה ברורה", "תוצרים עקביים"],
  //     icon: "Workflow",
  //     category: "other",
  //   },
];

// Helper function to get a single project by ID
export function getProjectById(id: string): Project | undefined {
  return projects.find((project) => project.id === id);
}

// Helper function to get projects by category
export function getProjectsByCategory(
  category: Project["category"]
): Project[] {
  return projects.filter((project) => project.category === category);
}

// Helper function to get projects by status
export function getProjectsByStatus(status: Project["status"]): Project[] {
  return projects.filter((project) => project.status === status);
}
