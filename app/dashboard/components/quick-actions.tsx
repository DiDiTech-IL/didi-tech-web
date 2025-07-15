import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Clock,
    FolderOpen,
    Receipt,
    Users
} from "lucide-react";

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>פעולות מהירות</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button className="w-full justify-start" variant="outline">
          <FolderOpen className="h-4 w-4 mr-2" />
          יצירת מוצר חדש
        </Button>
        <Button className="w-full justify-start" variant="outline">
          <Receipt className="h-4 w-4 mr-2" />
          הפקת חשבונית
        </Button>
        <Button className="w-full justify-start" variant="outline">
          <Users className="h-4 w-4 mr-2" />
          הוספת לקוח
        </Button>
        <Button className="w-full justify-start" variant="outline">
          <Clock className="h-4 w-4 mr-2" />
          מעקב זמן
        </Button>
      </CardContent>
    </Card>
  );
}
