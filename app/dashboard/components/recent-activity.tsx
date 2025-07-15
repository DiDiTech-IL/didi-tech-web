import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Calendar,
    CreditCard,
    FolderOpen,
    Receipt,
    Users
} from "lucide-react";
import { getRecentActivities } from "../lib/dashboard-data";

function getRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `לפני ${diffMins} דקות`;
  } else if (diffHours < 24) {
    return `לפני ${diffHours} שעות`;
  } else {
    return `לפני ${diffDays} ימים`;
  }
}

function getIconComponent(iconName: string) {
  switch (iconName) {
    case 'FolderOpen': return FolderOpen;
    case 'Receipt': return Receipt;
    case 'CreditCard': return CreditCard;
    case 'Users': return Users;
    case 'AlertCircle': return FolderOpen; // Fallback since AlertCircle isn't imported
    default: return FolderOpen;
  }
}

export async function RecentActivity() {
  const recentActivities = await getRecentActivities();

  return (
    <Card>
      <CardHeader>
        <CardTitle>פעילות אחרונה</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity) => {
              const IconComponent = getIconComponent(activity.icon);
              return (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <IconComponent className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {activity.message}
                    </p>
                    <p className="text-sm text-slate-500">{getRelativeTime(activity.time)}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">אין פעילות אחרונה עדיין</p>
              <p className="text-slate-400 text-xs">התחל על ידי יצירת המוצר או הלקוח הראשון שלך</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
