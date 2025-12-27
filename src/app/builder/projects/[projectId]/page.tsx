'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';

interface Defect {
  id: string;
  room_name: string;
  audit_point_name: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  notes: string;
  has_photo: boolean;
  audit_date: string;
  auditor_name: string;
}

export default function ProjectDetail() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [defects, setDefects] = useState<Defect[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'LOW' | 'MEDIUM' | 'HIGH'>('ALL');
  const [projectName, setProjectName] = useState('');

  useEffect(() => {
    async function fetchDefects() {
      try {
        const response = await fetch(
          `/api/v1/builder/projects/${projectId}/defects`,
        );
        if (!response.ok) throw new Error('Failed to fetch defects');
        const data = await response.json() as {
          project_name: string;
          defects: Defect[];
        };
        setDefects(data.defects);
        setProjectName(data.project_name);
      } catch (error) {
        console.error('Error fetching defects:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDefects();
  }, [projectId]);

  const filteredDefects =
    filter === 'ALL' ? defects : defects.filter((d) => d.severity === filter);

  const severityColors = {
    LOW: 'bg-blue-100 text-blue-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-red-100 text-red-800',
  };

  const severityBgColors = {
    LOW: 'bg-blue-50 border-blue-200',
    MEDIUM: 'bg-yellow-50 border-yellow-200',
    HIGH: 'bg-red-50 border-red-200',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">Loading defect data...</p>
      </div>
    );
  }

  const counts = {
    total: defects.length,
    low: defects.filter((d) => d.severity === 'LOW').length,
    medium: defects.filter((d) => d.severity === 'MEDIUM').length,
    high: defects.filter((d) => d.severity === 'HIGH').length,
  };

  return (
    <div>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4">
          <Link href="/builder" className="text-indigo-600 hover:text-indigo-700 font-medium inline-block">
            ← Back to Dashboard
          </Link>
        </div>
        <PageHeader title={projectName} subtitle="Audit defects and findings" align="center" />

        {/* Filter Tabs */}
        <div className="flex justify-center gap-2 mb-6 bg-white rounded-lg card-shadow p-2">
          {[
            { label: 'All', value: 'ALL' as const, count: counts.total },
            { label: 'Low', value: 'LOW' as const, count: counts.low },
            {
              label: 'Medium',
              value: 'MEDIUM' as const,
              count: counts.medium,
            },
            { label: 'High', value: 'HIGH' as const, count: counts.high },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === tab.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Defects List */}
        <div className="space-y-4">
          {filteredDefects.length === 0 ? (
            <div className="card card-shadow p-8 text-center">
              <p className="text-gray-500 text-lg">
                {filter === 'ALL'
                  ? 'No defects found'
                  : `No ${filter.toLowerCase()} severity defects found`}
              </p>
            </div>
          ) : (
            filteredDefects.map((defect) => (
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
                        className={`text-xs font-bold px-2 py-1 rounded ${
                          severityColors[defect.severity]
                        }`}
                      >
                        {defect.severity}
                      </span>
                      {defect.has_photo && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                          📸 Photo
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Location: <span className="font-medium">{defect.room_name}</span>
                    </p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 bg-white bg-opacity-50 rounded p-4">
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
                </div>

                {/* Notes */}
                {defect.notes && (
                  <div className="bg-white bg-opacity-50 rounded p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </p>
                    <p className="text-sm text-gray-600">{defect.notes}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
