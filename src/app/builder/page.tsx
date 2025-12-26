'use client';

import Link from 'next/link';
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
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Audit Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor construction audit results and quality metrics
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            title="Total Projects"
            value={projects.length.toString()}
            color="blue"
          />
          <SummaryCard
            title="Total Audits"
            value={projects
              .reduce((sum, p) => sum + (p.summary?.total_audits || 0), 0)
              .toString()}
            color="green"
          />
          <SummaryCard
            title="Total Defects"
            value={projects
              .reduce((sum, p) => sum + (p.summary?.total_defects || 0), 0)
              .toString()}
            color="red"
          />
          <SummaryCard
            title="Avg Pass Rate"
            value={
              (
                projects.reduce((sum, p) => sum + (p.summary?.pass_rate || 0), 0) /
                  projects.length || 0
              ).toFixed(1) + '%'
            }
            color="purple"
          />
        </div>

        {/* Projects Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
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
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Project Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Location
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                      Audits
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                      Defects
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                      Pass Rate
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">
                          {project.name}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-600">
                          {project.location || 'N/A'}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {project.summary?.total_audits || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            project.summary?.total_defects
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {project.summary?.total_defects || 0}
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
                          View Details →
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
  color,
}: {
  title: string;
  value: string;
  color: 'blue' | 'green' | 'red' | 'purple';
}) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200',
    purple: 'bg-purple-50 border-purple-200',
  };

  const textColors = {
    blue: 'text-blue-700',
    green: 'text-green-700',
    red: 'text-red-700',
    purple: 'text-purple-700',
  };

  return (
    <div className={`${colors[color]} border-2 rounded-lg p-6`}>
      <p className={`text-sm font-medium ${textColors[color]} mb-2`}>
        {title}
      </p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
