import { Suspense } from "react";
import { DashboardHeader } from "./components/dashboard-header";
import { DashboardStats } from "./components/dashboard-stats";
import { QuickActions } from "./components/quick-actions";
import { RecentActivity } from "./components/recent-activity";
import { TodaysSchedule } from "./components/todays-schedule";
import {
  DashboardStatsSkeleton,
  QuickActionsSkeleton,
  RecentActivitySkeleton,
  TodaysScheduleSkeleton
} from "./components/dashboard-skeletons";

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <DashboardHeader />

      {/* Stats Grid */}
      <Suspense fallback={<DashboardStatsSkeleton />}>
        <DashboardStats />
      </Suspense>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <Suspense fallback={<QuickActionsSkeleton />}>
            <QuickActions />
          </Suspense>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Suspense fallback={<RecentActivitySkeleton />}>
            <RecentActivity />
          </Suspense>
        </div>
      </div>

      {/* Today's Schedule */}
      <Suspense fallback={<TodaysScheduleSkeleton />}>
        <TodaysSchedule />
      </Suspense>
    </div>
  );
}