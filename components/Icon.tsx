import { cn } from "@/lib/utils";
import { Library } from "lucide-react";

function Icon({ className }: { name?: string, className?: string }) {
    // For now, just use the default Library icon since we don't have dynamic icon mapping
    const IconComponent = Library;
    return (
        <IconComponent
            className={cn("h-5 w-5 text-muted-foreground", className)}
            aria-hidden="true"
        />
    )
}

export default Icon