import { NextResponse } from 'next/server';
import { seed } from '../../../../scripts/seed';
import { audit_templates, getDB, projects, structure_nodes, users } from '@/lib/db';
import { getCloudflareContext } from '@opennextjs/cloudflare';

/**
 * API endpoint to seed the database
 * 
 * POST /api/seed
 * 
 * This should only be enabled in development/staging environments!
 * Add authentication or environment checks before deploying to production.
 */
export async function POST() {
  // Security check - only allow in development
  if (process.env.NODE_ENV === 'prod') {
    return NextResponse.json(
      { error: 'Seeding is disabled in production' },
      { status: 403 }
    );
  }


  try {
    // Check if we already have data
    const { env } = await getCloudflareContext({ async: true });
    const db = getDB(env);

    const existingProjects = await db.select().from(projects).limit(1);

    console.log('Existing projects count:', existingProjects);
    
    if (existingProjects.length > 2) {
      return NextResponse.json(
        { 
          message: 'Database already contains data. Clear it first if you want to re-seed.',
          existingProjects: existingProjects.length 
        },
        { status: 400 }
      );
    }

    // Run seed
    await seed(db);

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      {
        error: 'Failed to seed database',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check seed status
 */
export async function GET() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = getDB(env);
    
    const [projectsData, usersData, nodes, templates] = await Promise.all([
      db.select().from(projects),
      db.select().from(users),
      db.select().from(structure_nodes),
      db.select().from(audit_templates),
    ]);

    return NextResponse.json({
      status: 'Database status',
      counts: {
        projects: projectsData.length,
        users: usersData.length,
        structureNodes: nodes.length,
        auditTemplates: templates.length,
      },
      isEmpty: projectsData.length === 0,
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      {
        error: 'Failed to check database status',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
