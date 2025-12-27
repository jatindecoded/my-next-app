'use client';

import Link from 'next/link';
import { IconBuildingSkyscraper, IconListCheck, IconAlertTriangle, IconCircleCheck, IconFolder } from '@tabler/icons-react';
import PageHeader from '@/components/ui/PageHeader';
import { useEffect, useState } from 'react';

interface Project {
  id: string;
  name: string;
  location: string;
}

interface DefectSummary {
  total_audits: number;
  total_defects: number;
  pass_rate: number;
  critical_defects: number;
}

export default function BuilderDashboard() {
  const [projects, setProjects] = useState<
    Array<Project & { summary: DefectSummary }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        // This will be the builder endpoint
        const response = await fetch('/api/v1/builder/projects');
        if (!response.ok) throw new Error('Failed to fetch projects');
        const data = await response.json();
        setProjects(data as Array<Project & { summary: DefectSummary }>);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-lg text-gray-600">Loading projects...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader title="Audit Dashboard" subtitle="Monitor quality metrics across projects" align="center" />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SummaryCard
            title="Projects"
            icon={<IconBuildingSkyscraper />}
            value={projects.length.toString()}
            color="blue"
          />
          <SummaryCard
            title="Audits"
            icon={<IconListCheck />}
            value={projects
              .reduce((sum, p) => sum + (p.summary?.total_audits || 0), 0)
              .toString()}
            color="indigo"
          />
          <SummaryCard
            title="Defects"
            icon={<IconAlertTriangle />}
            value={projects
              .reduce((sum, p) => sum + (p.summary?.total_defects || 0), 0)
              .toString()}
            color="amber"
          />
          <SummaryCard
            title="Avg Pass Rate"
            icon={<IconCircleCheck />}
            value={
              (
                projects.reduce((sum, p) => sum + (p.summary?.pass_rate || 0), 0) /
                  projects.length || 0
              ).toFixed(1) + '%'
            }
            color="emerald"
          />
        </div>

        {/* Projects Table */}
        <div className="card card-shadow">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <IconFolder size={18} /> <span>Projects</span>
            </h2>
          </div>

          {projects.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No projects available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Location
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Audits
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Defects
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Pass Rate
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50/80">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900 flex items-center gap-2">
                          <IconBuildingSkyscraper size={16} /> {project.name}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-600">
                          {project.location || 'N/A'}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                          <IconListCheck size={16} /> {project.summary?.total_audits || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                            project.summary?.total_defects
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          <IconAlertTriangle size={16} /> {project.summary?.total_defects || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-semibold text-gray-900">
                          {(project.summary?.pass_rate || 0).toFixed(1)}%
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/builder/projects/${project.id}`}
                          className="text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'indigo' | 'amber' | 'emerald';
}) {
  const colors = {
    blue: 'bg-blue-50 border-blue-100',
    indigo: 'bg-indigo-50 border-indigo-100',
    amber: 'bg-amber-50 border-amber-100',
    emerald: 'bg-emerald-50 border-emerald-100',
  };

  const textColors = {
    blue: 'text-blue-800',
    indigo: 'text-indigo-800',
    amber: 'text-amber-800',
    emerald: 'text-emerald-800',
  };

  return (
    <div className={`${colors[color]} border rounded-lg p-5 card-shadow`}>
      <p className={`text-sm font-semibold ${textColors[color]} mb-1 flex items-center gap-2`}>
        <span className="[&>*]:w-4 [&>*]:h-4">{icon}</span>
        <span>{title}</span>
      </p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
