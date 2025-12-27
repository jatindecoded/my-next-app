'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Project {
  id: string;
  name: string;
  location: string;
  created_at: number;
}

export default function AuditorDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch('/api/v1/auditor/projects');
        if (!response.ok) throw new Error('Failed to fetch projects');
        const data = await response.json();
        setProjects(data as Project[]);
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
    <div>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Auditor</h1>
          <p className="text-gray-600">Select a project to start or continue checks</p>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">No projects available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/auditor/projects/${project.id}`}
                className="block bg-white border border-gray-200 rounded-xl card-shadow hover:border-indigo-400 hover:shadow-lg transition-all"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {project.name}
                  </h3>
                  {project.location && (
                    <p className="text-sm text-gray-600 mb-4">
                      {project.location}
                    </p>
                  )}
                  <div className="text-xs text-gray-400">
                    Created:{' '}
                    {new Date(project.created_at).toLocaleDateString()}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="btn btn-primary inline-block">Start Check</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
