'use client';

import Link from 'next/link';
import { IconBuildingSkyscraper, IconListCheck, IconAlertTriangle, IconCircleCheck, IconFolder } from '@tabler/icons-react';
import PageHeader from '@/components/ui/PageHeader';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

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

interface Defect {
  id: string;
  project_name: string;
  project_id: string;
  location: string;
  node_level: string;
  audit_point_name: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  notes: string;
  auditor_name: string;
  audit_date: string;
  has_photo: boolean;
}

export default function BuilderDashboard() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p className="text-lg text-gray-600">Loading...</p></div>}>
      <BuilderDashboardContent />
    </Suspense>
  );
}

function BuilderDashboardContent() {
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<
    Array<Project & { summary: DefectSummary }>
  >([]);
  const [allDefects, setAllDefects] = useState<Defect[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllDefects, setShowAllDefects] = useState(searchParams.get('view') === 'defects');

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch projects
        const projectsResponse = await fetch('/api/v1/builder/projects');
        if (!projectsResponse.ok) throw new Error('Failed to fetch projects');
        const projectsData = await projectsResponse.json();
        setProjects(projectsData as Array<Project & { summary: DefectSummary }>);

        // Fetch all defects
        const defectsResponse = await fetch('/api/v1/builder/all-defects');
        if (!defectsResponse.ok) throw new Error('Failed to fetch defects');
        const defectsData = await defectsResponse.json() as { defects: Defect[] };
        setAllDefects(defectsData.defects);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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
        <div className="grid grid-cols-1 md:grid-cols-4 grid-cols-2 gap-6">
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
            <button
              onClick={() => setShowAllDefects(!showAllDefects)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <IconAlertTriangle size={18} />
              {showAllDefects ? 'Show Projects' : `View All Failures (${allDefects.length})`}
            </button>
          </div>

          {showAllDefects ? (
            // All Defects View
            <div className="p-6">
              <div className="space-y-4">
                {allDefects.length === 0 ? (
                  <div className="text-center py-8">
                    <IconCircleCheck size={48} className="mx-auto text-emerald-500 mb-3" />
                    <p className="text-gray-500 text-lg">No defects found across all projects! 🎉</p>
                  </div>
                ) : (
                  allDefects.map((defect) => {
                    const severityColors = {
                      LOW: 'bg-blue-100 text-blue-800 border-blue-200',
                      MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                      HIGH: 'bg-red-100 text-red-800 border-red-200',
                    };
                    const severityBgColors = {
                      LOW: 'bg-blue-50 border-blue-200',
                      MEDIUM: 'bg-yellow-50 border-yellow-200',
                      HIGH: 'bg-red-50 border-red-200',
                    };

                    return (
                      <div
                        key={defect.id}
                        className={`${severityBgColors[defect.severity]} border-2 rounded-lg p-6`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {defect.audit_point_name}
                              </h3>
                              <span
                                className={`text-xs font-bold px-2 py-1 rounded border ${
                                  severityColors[defect.severity]
                                }`}
                              >
                                {defect.severity}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-1">
                              <span className="flex items-center gap-1">
                                <IconBuildingSkyscraper size={14} />
                                <Link 
                                  href={`/builder/projects/${defect.project_id}`}
                                  className="font-medium hover:text-indigo-600"
                                >
                                  {defect.project_name}
                                </Link>
                              </span>
                              <span>•</span>
                              <span className="font-medium">{defect.location}</span>
                              <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                                {defect.node_level}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 bg-white bg-opacity-50 rounded p-4">
                          <div>
                            <p className="text-xs font-medium text-gray-600">Auditor</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {defect.auditor_name}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600">Audit Date</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {new Date(defect.audit_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <Link
                              href={`/builder/projects/${defect.project_id}`}
                              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                            >
                              View Project →
                            </Link>
                          </div>
                        </div>

                        {defect.notes && (
                          <div className="bg-white bg-opacity-50 rounded p-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Notes</p>
                            <p className="text-sm text-gray-600">{defect.notes}</p>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            // Projects Table View
            <>
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
          </>
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
