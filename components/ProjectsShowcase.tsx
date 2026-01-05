"use client";

import { useMemo, useState } from "react";
import { projects } from "@/data/projects";
import { Project } from "@/types/project";
import ProjectDialog from "./ProjectDialog";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ExternalLink, Users } from "lucide-react";

type ProjectsShowcaseVariant = "default" | "homepage";

function formatUserCount(count?: number) {
  if (!count) return null;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
}

function formatProjectDate(date?: string) {
  if (!date) return null;
  // expected: YYYY-MM
  const [y, m] = date.split("-");
  if (!y || !m) return date;
  return `${m}/${y}`;
}

export default function ProjectsShowcase({
  variant = "default",
  showHeader = true,
}: {
  variant?: ProjectsShowcaseVariant;
  showHeader?: boolean;
}) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setDialogOpen(true);
  };

  const { enterprise, devTools, hobby } = useMemo(() => {
    const enterpriseProjects = projects
      .filter((p) => p.track === "enterprise")
      .sort((a, b) => (b.userCount ?? 0) - (a.userCount ?? 0));
    const devToolsProjects = projects
      .filter((p) => p.track === "dev-tools")
      .sort((a, b) => (b.userCount ?? 0) - (a.userCount ?? 0));
    const hobbyProjects = projects
      .filter((p) => p.track === "hobby")
      .sort((a, b) => (b.userCount ?? 0) - (a.userCount ?? 0));
    return { enterprise: enterpriseProjects, devTools: devToolsProjects, hobby: hobbyProjects };
  }, []);

  return (
    <div className="w-full">
      {showHeader && variant === "default" ? (
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-heebo font-bold text-slate-900 mb-4"
          >
            פרויקטים
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-600 font-assistant max-w-2xl mx-auto"
          >
            לחצו על פרויקט כדי לראות פרטים.
          </motion.p>
        </div>
      ) : null}

      {variant === "homepage" ? (
        <div className="grid gap-10">
          {enterprise.length ? (
            <div>
              <div className="flex items-end justify-between gap-4 mb-4">
                <div>
                  <div className="text-sm font-semibold text-slate-900">מערכות לגופים ציבוריים ועמותות</div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enterprise.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.06 }}
                  >
                    <Card
                      className="border border-slate-200 bg-white shadow-sm overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleProjectClick(project)}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="text-lg font-bold text-slate-900 leading-tight">{project.name}</div>
                            {project.tagline ? (
                              <div className="text-sm text-slate-600 mt-1 line-clamp-2">{project.tagline}</div>
                            ) : null}
                          </div>
                          {project.userCount ? (
                            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1 flex-shrink-0">
                              <Users className="w-3.5 h-3.5" />
                              {formatUserCount(project.userCount)}
                            </div>
                          ) : null}
                        </div>
                        <div className="mt-3 text-sm text-slate-700 leading-relaxed line-clamp-3">
                          {project.description}
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          {project.startedAt ? (
                            <div className="text-xs text-slate-500">{formatProjectDate(project.startedAt)}</div>
                          ) : (
                            <div />
                          )}
                          {project.url ? (
                            <a
                              href={project.url}
                              onClick={(e) => e.stopPropagation()}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-900 hover:text-slate-700"
                            >
                              לאתר
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : null}

          {devTools.length ? (
            <div>
              <div className="flex items-end justify-between gap-4 mb-4">
                <div>
                  <div className="text-sm font-semibold text-slate-900">כלי מפתחים</div>
                  <div className="text-sm text-slate-600">כלי פיתוח, מערכות הטמעה, ומשפרי ביצועים</div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {devTools.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.06 }}
                  >
                    <Card
                      className="border border-slate-200 bg-white shadow-sm overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleProjectClick(project)}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="text-lg font-bold text-slate-900 leading-tight">{project.name}</div>
                            {project.tagline ? (
                              <div className="text-sm text-slate-600 mt-1 line-clamp-2">{project.tagline}</div>
                            ) : null}
                          </div>
                          {project.userCount ? (
                            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1 flex-shrink-0">
                              <Users className="w-3.5 h-3.5" />
                              {formatUserCount(project.userCount)}
                            </div>
                          ) : null}
                        </div>
                        <div className="mt-3 text-sm text-slate-700 leading-relaxed line-clamp-3">
                          {project.description}
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          {project.startedAt ? (
                            <div className="text-xs text-slate-500">{formatProjectDate(project.startedAt)}</div>
                          ) : (
                            <div />
                          )}
                          {project.url ? (
                            <a
                              href={project.url}
                              onClick={(e) => e.stopPropagation()}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-900 hover:text-slate-700"
                            >
                              לאתר
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : null}

          {hobby.length ? (
            <div>
              <div className="flex items-end justify-between gap-4 mb-4">
                <div>
                  <div className="text-sm font-semibold text-slate-900">פרויקטים אישיים</div>
                  <div className="text-sm text-slate-600">ניסויים, פרויקטים חובבניים וסתם לכיף</div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hobby.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.06 }}
                  >
                    <Card
                      className="border border-slate-200 bg-white shadow-sm overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleProjectClick(project)}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="text-lg font-bold text-slate-900 leading-tight">{project.name}</div>
                            {project.tagline ? (
                              <div className="text-sm text-slate-600 mt-1 line-clamp-2">{project.tagline}</div>
                            ) : null}
                          </div>
                          {project.userCount ? (
                            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1 flex-shrink-0">
                              <Users className="w-3.5 h-3.5" />
                              {formatUserCount(project.userCount)}
                            </div>
                          ) : null}
                        </div>
                        <div className="mt-3 text-sm text-slate-700 leading-relaxed line-clamp-3">
                          {project.description}
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          {project.startedAt ? (
                            <div className="text-xs text-slate-500">{formatProjectDate(project.startedAt)}</div>
                          ) : (
                            <div />
                          )}
                          {project.url ? (
                            <a
                              href={project.url}
                              onClick={(e) => e.stopPropagation()}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-900 hover:text-slate-700"
                            >
                              לאתר
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-10">
          {enterprise.length ? (
            <div>
              <div className="text-sm font-semibold text-slate-900 mb-4">ארגונים ואנטרפרייז</div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enterprise.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <Card
                      className="border border-slate-200 bg-white shadow-sm overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleProjectClick(project)}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="text-lg font-bold text-slate-900 leading-tight">{project.name}</div>
                            {project.tagline ? (
                              <div className="text-sm text-slate-600 mt-1 truncate">{project.tagline}</div>
                            ) : null}
                          </div>
                          {project.userCount ? (
                            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1 flex-shrink-0">
                              <Users className="w-3.5 h-3.5" />
                              {formatUserCount(project.userCount)}
                            </div>
                          ) : null}
                        </div>
                        <div className="mt-4 text-sm text-slate-700 leading-relaxed line-clamp-3">{project.description}</div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : null}

          {devTools.length ? (
            <div>
              <div className="text-sm font-semibold text-slate-900 mb-4">כלי מפתחים</div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {devTools.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <Card
                      className="border border-slate-200 bg-white shadow-sm overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleProjectClick(project)}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="text-lg font-bold text-slate-900 leading-tight">{project.name}</div>
                            {project.tagline ? (
                              <div className="text-sm text-slate-600 mt-1 truncate">{project.tagline}</div>
                            ) : null}
                          </div>
                          {project.userCount ? (
                            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1 flex-shrink-0">
                              <Users className="w-3.5 h-3.5" />
                              {formatUserCount(project.userCount)}
                            </div>
                          ) : null}
                        </div>
                        <div className="mt-4 text-sm text-slate-700 leading-relaxed line-clamp-3">{project.description}</div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : null}

          {hobby.length ? (
            <div>
              <div className="text-sm font-semibold text-slate-900 mb-4">פרויקטים אישיים</div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hobby.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <Card
                      className="border border-slate-200 bg-white shadow-sm overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleProjectClick(project)}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="text-lg font-bold text-slate-900 leading-tight">{project.name}</div>
                            {project.tagline ? (
                              <div className="text-sm text-slate-600 mt-1 truncate">{project.tagline}</div>
                            ) : null}
                          </div>
                          {project.userCount ? (
                            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1 flex-shrink-0">
                              <Users className="w-3.5 h-3.5" />
                              {formatUserCount(project.userCount)}
                            </div>
                          ) : null}
                        </div>
                        <div className="mt-4 text-sm text-slate-700 leading-relaxed line-clamp-3">{project.description}</div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Project Dialog */}
      <ProjectDialog 
        project={selectedProject}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
