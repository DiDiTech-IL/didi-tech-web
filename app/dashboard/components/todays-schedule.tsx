import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export function TodaysSchedule() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          לוח הזמנים להיום
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div>
              <p className="font-medium">פגישה עם לקוח - חברת Acme</p>
              <p className="text-sm text-slate-500">דיון על דרישות המוצר</p>
            </div>
            <Badge variant="outline">10:00</Badge>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div>
              <p className="font-medium">תכנון ספרינט פיתוח</p>
              <p className="text-sm text-slate-500">שיחת תיאום צוות</p>
            </div>
            <Badge variant="outline">14:00</Badge>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div>
              <p className="font-medium">סשן סקירת קוד</p>
              <p className="text-sm text-slate-500">סקירת Pull Requests</p>
            </div>
            <Badge variant="outline">16:30</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
