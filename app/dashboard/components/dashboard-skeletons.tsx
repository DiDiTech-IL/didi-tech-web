import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function QuickActionsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>פעולות מהירות</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}

export function RecentActivitySkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>פעילות אחרונה</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function TodaysScheduleSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
