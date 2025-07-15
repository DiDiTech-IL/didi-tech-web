"use client";

import { useUser } from "@clerk/nextjs";

export function DashboardHeader() {
  const { user } = useUser();

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
        ברוך השוב, {user?.firstName || 'מפתח'}! 👋
      </h1>
      <p className="text-slate-600 dark:text-slate-400 mt-2">
        הנה מה שקורה עם עסק הפיתוח שלך היום.
      </p>
    </div>
  );
}
