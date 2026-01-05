"use client";

import { Card } from "@/components/ui/card";
import { Project } from "@/types/project";
import { motion } from "framer-motion";
import {
  Code,
  CreditCard,
  Database,
  Globe,
  Map,
  ShoppingCart,
  Smartphone,
  Users,
  Workflow,
  Zap
} from "lucide-react";
import Image from "next/image";

// Icon mapping for dynamic icon rendering
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

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  // Get icon component
  const IconComponent = project.icon && iconMap[project.icon]
    ? iconMap[project.icon]
    : Code;

  const formatUserCount = (count?: number) => {
    if (!count) return null;
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="cursor-pointer border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group"
        onClick={onClick}
      >
        <div className="p-6 flex items-center gap-4">
          {/* Icon/Logo */}
          <div className="bg-gradient-to-br from-sky-100 to-sky-200 p-4 rounded-2xl flex-shrink-0 group-hover:from-sky-200 group-hover:to-sky-300 transition-all duration-300">
            {project.logoImage ? (
              <Image
                src={project.logoImage}
                alt={project.name}
                className="w-8 h-8 object-contain"
              />
            ) : (
              <IconComponent className="w-8 h-8 text-sky-600" />
            )}
          </div>

          {/* Title and Subtitle */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1 group-hover:text-sky-600 transition-colors">
              {project.name}
            </h3>
            {project.tagline ? (
              <p className="text-sm text-slate-500 font-medium truncate">
                {project.tagline}
              </p>
            ) : null}
            {project.userCount ? (
              <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1">
                <Users className="w-3.5 h-3.5" />
                {formatUserCount(project.userCount)} משתמשים
              </div>
            ) : null}
          </div>

          {/* Hover indicator */}
          <div className="w-2 h-2 rounded-full bg-sky-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </Card>
    </motion.div>
  );
}
