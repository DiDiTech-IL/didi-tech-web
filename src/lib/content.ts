import { BookCheck, Cpu, Factory, Rocket } from "lucide-react";
import { Project, Testimonial } from "./types";
import superducationLogo from "@/assets/superducationLogo.png";

export const projects: Project[] = [
  {
    title: "מערכת להנגשת מידע רפואי בחירום",
    description: "אחסון והנגשת מידע רפואי עבור צוותי חירום ועזרה ראשונה",
    image:
      "https://images.unsplash.com/photo-1587556930799-8dca6fad6d41?auto=format&fit=crop&q=80&w=1280",
    link: "https://www.medicode.co.il",
  },
  {
    title: 'חמ"ל חכם לכוחות הביטחון',
    description:
      "ניהול כוח אדם, צוותי ביטחון ולחימה, מעקב שיבוצים ובקרת משימות במערכת זמינה ונוחה לשימוש",
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1280",
    link: "https://www.smartoc.live",
  },
  {
    title: "סביבת למידה ושיתוף ידע",
    description:
      "תוכנה לבניית קורסים דיגיטליים ותפעול שיעורים פרטיים בין סטודנטים",
    image: superducationLogo,
    link: "#",
  },
];

export const services = [
  {
    title: "פתרונות לארגונים",
    description:
      "אספקת מערכות מורכבות לצרכים רגישים - ביטחון, בריאות וחינוך. המוצר בנוי מקצה-לקצה, כולל ממשק מנהלים",
    icon: Factory,
  },
  {
    title: "הדרכות מקצועיות",
    description:
      "קורסים במגוון תחומים - Low-Level, אבטחת מידע, Fullstack ועוד...",
    icon: BookCheck,
  },

  {
    title: "תכנון ושדרוג מערכות",
    description:
      "ייעול תהליכי עבודה במערכות שלכם - שיפור קריאות, שדרוג בסיסי קוד ותיקונים מקיפים.",
    icon: Cpu,
  },
  {
    title: "הכוונה לסטודנטים וג'וניורים",
    description:
      "מפגשי היכרות עם עולם הפיתוח מחוץ לאקדמיה, זיהוי פוטנציאל בצרכים בשוק, כלים ללמידה מהירה",
    icon: Rocket,
  },
];

export const testimonials: Testimonial[] = [
  {
    name: "מ. ט.",
    role: "Founder",
    company: "Medicode",
    content: "בקרוב הם יכתבו",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
  },
  {
    name: "ש. ב.",
    role: "Commander",
    company: "910",
    content: "בקרוב יהיה כתוב",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150",
  },
  {
    name: "ר. ש.",
    role: "Teaching",
    company: "Superducation",
    content: "הם עוד מחכים לגרסת הפצה הרשמית",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150",
  },
];
