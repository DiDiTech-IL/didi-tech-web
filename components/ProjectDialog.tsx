"use client";

import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Project } from "@/types/project";
import {
  Calendar,
  Code,
  CreditCard,
  Database,
  ExternalLink,
  Globe,
  Map,
  ShoppingCart,
  Smartphone,
  Users,
  Workflow,
  Zap
} from "lucide-react";

// Icon mapping
const iconMap: Record<string, React.ElementType> = {
  Zap,
  CreditCard,
  ShoppingCart,
  Workflow,
  Code,
  Smartphone,
  Database,
  Globe,
  Map,
};

interface ProjectDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProjectDialog({ project, open, onOpenChange }: ProjectDialogProps) {
  if (!project) return null;

  const IconComponent = project.icon && iconMap[project.icon] 
    ? iconMap[project.icon] 
    : Code;

  // Format user count
  const formatUserCount = (count?: number) => {
    if (!count) return null;
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  // Status badge color
  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "live":
        return "bg-green-100 text-green-800 border-green-200";
      case "in-development":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-slate-100 text-slate-800 border-slate-200";
      case "paused":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getStatusText = (status: Project["status"]) => {
    switch (status) {
      case "live":
        return "פעיל";
      case "in-development":
        return "בפיתוח";
      case "completed":
        return "הושלם";
      case "paused":
        return "מושהה";
      default:
        return status;
    }
  };

  const getAudienceText = (audience: Project["audience"]) => {
    switch (audience) {
      case "developers":
        return "למפתחים";
      case "general":
        return "כללי";
      default:
        return audience;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden">
        {/* Header with gradient background */}
        <div className="-mx-8 -mt-8 mb-6 bg-gradient-to-br from-sky-50 to-sky-100 px-8 pt-8 pb-6 border-b">
          <DialogHeader className="mt-0">
            <div className="flex items-start gap-4 mb-4">
              {/* Icon */}
              <div className="bg-white p-4 rounded-2xl shadow-sm flex-shrink-0">
                <IconComponent className="w-8 h-8 text-sky-600" />
              </div>

              {/* Title and Status */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <DialogTitle className="text-2xl font-bold text-slate-900">
                    {project.name}
                  </DialogTitle>
                  <Badge className={getStatusColor(project.status)}>
                    {getStatusText(project.status)}
                  </Badge>
                </div>
                {project.tagline ? (
                  <p className="text-sky-600 font-medium text-lg">
                    {project.tagline}
                  </p>
                ) : null}
              </div>
            </div>

            {/* Meta Information */}
            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full">
                <span className="font-medium">{getAudienceText(project.audience)}</span>
              </div>
              {project.userCount && (
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">{formatUserCount(project.userCount)} משתמשים</span>
                </div>
              )}
              {project.startedAt ? (
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">{project.startedAt}</span>
                </div>
              ) : null}
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-sky-600 text-white px-3 py-1.5 rounded-full hover:bg-sky-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="font-medium">קישור לאתר</span>
                </a>
              )}
            </div>
          </DialogHeader>
        </div>

        {/* Content */}
        <ScrollArea className="max-h-[50vh]" dir="rtl">
          {/* Description */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-slate-900 mb-2 uppercase tracking-wide">
              תיאור
            </h4>
            <p className="text-slate-600 leading-relaxed text-base">
              {project.description}
            </p>
          </div>

          {/* Technologies */}
          {project.stack?.length ? (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">
                טכנולוגיות
              </h4>
              <div className="flex flex-wrap gap-2">
                {project.stack.map((tech, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-sm bg-slate-100 text-slate-700 px-3 py-1"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}

          {/* Detailed Information */}
          {project.details ? (
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">
                מידע מפורט
              </h4>
              <div className="prose prose-slate max-w-none">
                {project.details.split("\n").map(
                  (paragraph, index) =>
                    paragraph.trim() && (
                      <p key={index} className="text-slate-600 leading-relaxed mb-3 whitespace-pre-wrap">
                        {paragraph}
                      </p>
                    )
                )}
              </div>
            </div>
          ) : null}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
