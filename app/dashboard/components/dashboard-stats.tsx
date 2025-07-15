import { Card, CardContent } from "@/components/ui/card";
import {
  FolderOpen,
  Receipt,
  TrendingUp,
  Users
} from "lucide-react";
import { getDashboardStats, type DashboardStats } from "../lib/dashboard-data";

const statCards = [
  {
    name: 'מוצרים פעילים',
    key: 'activeProducts' as keyof DashboardStats,
    change: '+2%',
    changeType: 'positive',
    icon: FolderOpen,
    color: 'blue'
  },
  {
    name: 'סה״כ לקוחות',
    key: 'totalClients' as keyof DashboardStats,
    change: '+15%',
    changeType: 'positive',
    icon: Users,
    color: 'green'
  },
  {
    name: 'הכנסות חודשיות',
    key: 'monthlyRevenue' as keyof DashboardStats,
    change: '+8%',
    changeType: 'positive',
    icon: TrendingUp,
    color: 'purple',
    format: (value: number) => `₪${value.toLocaleString()}`
  },
  {
    name: 'חשבוניות ממתינות',
    key: 'pendingInvoices' as keyof DashboardStats,
    change: '-3%',
    changeType: 'negative',
    icon: Receipt,
    color: 'orange'
  },
  {
    name: 'כרטיסי שירות פתוחים',
    key: 'openTickets' as keyof DashboardStats,
    change: '+5%',
    changeType: 'positive',
    icon: Receipt,
    color: 'red'
  },
];

export async function DashboardStats() {
  const stats = await getDashboardStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        const value = stats[stat.key];
        const displayValue = stat.format ? stat.format(value as number) : value;
        
        return (
          <Card key={stat.name} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {displayValue}
                  </p>
                  <div className={`flex items-center mt-2 text-sm ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                    <span>{stat.change}</span>
                    <span className="text-slate-500 ml-1">מהחודש שעבר</span>
                  </div>
                </div>
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20' :
                  stat.color === 'green' ? 'bg-green-100 dark:bg-green-900/20' :
                    stat.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/20' :
                      stat.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/20' :
                        'bg-red-100 dark:bg-red-900/20'
                  }`}>
                  <Icon className={`h-6 w-6 ${stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                    stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                      stat.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                        stat.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                          'text-red-600 dark:text-red-400'
                    }`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
