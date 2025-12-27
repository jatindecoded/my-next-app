'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Project {
  id: string;
  name: string;
  location: string;
  created_at: number;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 18) return 'Good Afternoon';
  return 'Good Evening';
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getGreeting()}, Auditor!
          </h1>
          <p className="text-gray-600">Select a project to start or continue checks</p>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">No projects available</p>
          </div>
        ) : (
          <div className="flex justify-center gap-6 flex-wrap">
            {projects.map((project) => (
              <Card key={project.id} className="card-shadow hover:-translate-y-0.5 transition-all w-full max-w-lg text-center">
                <Link href={`/auditor/projects/${project.id}`} className="block h-full">
                  <CardContent className="my-8">
                    <CardTitle className="text-xl">{project.name}</CardTitle>
                    {project.location && (
                      <p className="text-sm text-gray-600">{project.location}</p>
                    )}
                    <div className="text-xs text-gray-400">
                      Created: {new Date(project.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                  <CardFooter>

                      <Button className="w-full justify-center">Start Check</Button>
                  </CardFooter>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
