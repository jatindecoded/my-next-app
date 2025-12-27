/**
 * Seed script for populating the database with sample construction project data
 * 
 * This script creates:
 * - Sample users (builders and auditors)
 * - A project with multi-level structure (Blocks -> Floors -> Units -> Rooms)
 * - Audit templates with various check points
 * - Sample audit sessions with results
 * 
 * Run with: tsx scripts/seed.ts
 * Or integrate into your Cloudflare Worker startup
 */

import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as schema from '../drizzle/schema';

interface SeedContext {
  db: ReturnType<typeof drizzle<typeof schema>>;
}

// Utility to generate UUID
function generateId(): string {
  return crypto.randomUUID();
}

// Current timestamp
function now(): Date {
  return new Date();
}

/**
 * Seed users (builders and auditors)
 */
async function seedUsers(ctx: SeedContext) {
  console.log('🌱 Seeding users...');
  
  const users = [
    {
      id: generateId(),
      name: 'Rajesh Kumar',
      phone: '+919876543210',
      role: 'BUILDER' as const,
      created_at: now(),
    },
    {
      id: generateId(),
      name: 'Priya Sharma',
      phone: '+919876543211',
      role: 'AUDITOR' as const,
      created_at: now(),
    },
    {
      id: generateId(),
      name: 'Amit Patel',
      phone: '+919876543212',
      role: 'AUDITOR' as const,
      created_at: now(),
    },
    {
      id: generateId(),
      name: 'Sneha Reddy',
      phone: '+919876543213',
      role: 'AUDITOR' as const,
      created_at: now(),
    },
  ];

  await ctx.db.insert(schema.users).values(users).onConflictDoNothing();
  console.log(`✅ Created ${users.length} users`);
  
  return users;
}

/**
 * Seed project
 */
async function seedProject(ctx: SeedContext) {
  console.log('🏗️  Seeding project...');
  
  const project = {
    id: generateId(),
    name: 'Skyline Residency',
    location: 'Whitefield, Bangalore',
    created_at: now(),
  };

  await ctx.db.insert(schema.projects).values(project).onConflictDoNothing();
  console.log(`✅ Created project: ${project.name}`);
  
  return project;
}

/**
 * Seed structure: PROJECT -> BLOCKs -> FLOORs -> UNITs -> ROOMs
 */
async function seedStructure(ctx: SeedContext, projectId: string) {
  console.log('🏢 Seeding project structure...');
  
  const nodes: Array<typeof schema.structure_nodes.$inferInsert> = [];
  
  // Root node (PROJECT)
  const rootNode = {
    id: generateId(),
    project_id: projectId,
    parent_id: null,
    level_type: 'PROJECT' as const,
    name: 'Skyline Residency',
    order_index: 0,
  };
  nodes.push(rootNode);

  // Create 3 blocks (A, B, C)
  const blocks = ['A', 'B', 'C'].map((blockName, idx) => ({
    id: generateId(),
    project_id: projectId,
    parent_id: rootNode.id,
    level_type: 'BLOCK' as const,
    name: `Tower ${blockName}`,
    order_index: idx,
  }));
  nodes.push(...blocks);

  // For each block, create 10 floors
  blocks.forEach((block, blockIdx) => {
    for (let floor = 1; floor <= 10; floor++) {
      const floorNode = {
        id: generateId(),
        project_id: projectId,
        parent_id: block.id,
        level_type: 'FLOOR' as const,
        name: `Floor ${floor}`,
        order_index: floor,
      };
      nodes.push(floorNode);

      // For each floor, create 4 units (01, 02, 03, 04)
      for (let unit = 1; unit <= 4; unit++) {
        const unitNumber = String(unit).padStart(2, '0');
        const unitNode = {
          id: generateId(),
          project_id: projectId,
          parent_id: floorNode.id,
          level_type: 'UNIT' as const,
          name: `Flat ${unitNumber}`,
          order_index: unit,
        };
        nodes.push(unitNode);

        // For each unit, create rooms
        const rooms = [
          { name: 'Living Room', order: 1 },
          { name: 'Master Bedroom', order: 2 },
          { name: 'Bedroom 2', order: 3 },
          { name: 'Kitchen', order: 4 },
          { name: 'Bathroom 1', order: 5 },
          { name: 'Bathroom 2', order: 6 },
          { name: 'Balcony', order: 7 },
        ];

        rooms.forEach((room) => {
          nodes.push({
            id: generateId(),
            project_id: projectId,
            parent_id: unitNode.id,
            level_type: 'ROOM' as const,
            name: room.name,
            order_index: room.order,
          });
        });
      }
    }
  });

  // Insert all nodes in batches to avoid overwhelming the DB
  // D1 has a strict limit on SQL variables (around 400-500)
  // With 6 columns + conflict handling, use very small batches
  const batchSize = 10;
  for (let i = 0; i < nodes.length; i += batchSize) {
    const batch = nodes.slice(i, i + batchSize);
    await ctx.db.insert(schema.structure_nodes).values(batch).onConflictDoNothing();
    if (i % 100 === 0) {
      console.log(`   Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(nodes.length / batchSize)}`);
    }
  }

  console.log(`✅ Created ${nodes.length} structure nodes`);
  console.log(`   - 1 Project`);
  console.log(`   - ${blocks.length} Blocks`);
  console.log(`   - ${blocks.length * 10} Floors`);
  console.log(`   - ${blocks.length * 10 * 4} Units`);
  console.log(`   - ${blocks.length * 10 * 4 * 7} Rooms`);
  
  return nodes;
}

/**
 * Seed audit template with check points
 */
async function seedAuditTemplate(ctx: SeedContext, projectId: string) {
  console.log('📋 Seeding audit template...');
  
  const template = {
    id: generateId(),
    project_id: projectId,
    name: 'Standard Quality Checklist',
  };

  await ctx.db.insert(schema.audit_templates).values(template).onConflictDoNothing();

  // Unit-level check points
  const unitCheckpoints = [
    {
      id: generateId(),
      template_audit_id: template.id,
      applicable_level_type: 'UNIT' as const,
      name: 'Main door alignment and operation',
      is_mandatory: true,
      severity: 'HIGH' as const,
      order_index: 1,
    },
    {
      id: generateId(),
      template_audit_id: template.id,
      applicable_level_type: 'UNIT' as const,
      name: 'Window frames properly fitted',
      is_mandatory: true,
      severity: 'HIGH' as const,
      order_index: 2,
    },
    {
      id: generateId(),
      template_audit_id: template.id,
      applicable_level_type: 'UNIT' as const,
      name: 'Electrical panel accessibility',
      is_mandatory: true,
      severity: 'MEDIUM' as const,
      order_index: 3,
    },
    {
      id: generateId(),
      template_audit_id: template.id,
      applicable_level_type: 'UNIT' as const,
      name: 'Water supply and drainage working',
      is_mandatory: true,
      severity: 'HIGH' as const,
      order_index: 4,
    },
  ];

  // Room-level check points
  const roomCheckpoints = [
    {
      id: generateId(),
      template_audit_id: template.id,
      applicable_level_type: 'ROOM' as const,
      name: 'Wall surface finish quality',
      is_mandatory: true,
      severity: 'MEDIUM' as const,
      order_index: 1,
    },
    {
      id: generateId(),
      template_audit_id: template.id,
      applicable_level_type: 'ROOM' as const,
      name: 'Floor tiles level and alignment',
      is_mandatory: true,
      severity: 'HIGH' as const,
      order_index: 2,
    },
    {
      id: generateId(),
      template_audit_id: template.id,
      applicable_level_type: 'ROOM' as const,
      name: 'Ceiling finish and light fittings',
      is_mandatory: true,
      severity: 'MEDIUM' as const,
      order_index: 3,
    },
    {
      id: generateId(),
      template_audit_id: template.id,
      applicable_level_type: 'ROOM' as const,
      name: 'Electrical switches and sockets working',
      is_mandatory: true,
      severity: 'HIGH' as const,
      order_index: 4,
    },
    {
      id: generateId(),
      template_audit_id: template.id,
      applicable_level_type: 'ROOM' as const,
      name: 'Door and window hardware functioning',
      is_mandatory: false,
      severity: 'LOW' as const,
      order_index: 5,
    },
    {
      id: generateId(),
      template_audit_id: template.id,
      applicable_level_type: 'ROOM' as const,
      name: 'Ventilation adequate',
      is_mandatory: false,
      severity: 'LOW' as const,
      order_index: 6,
    },
    {
      id: generateId(),
      template_audit_id: template.id,
      applicable_level_type: 'ROOM' as const,
      name: 'No visible cracks or damage',
      is_mandatory: true,
      severity: 'HIGH' as const,
      order_index: 7,
    },
    {
      id: generateId(),
      template_audit_id: template.id,
      applicable_level_type: 'ROOM' as const,
      name: 'Paint finish uniform',
      is_mandatory: false,
      severity: 'MEDIUM' as const,
      order_index: 8,
    },
  ];

  const allCheckpoints = [...unitCheckpoints, ...roomCheckpoints];
  await ctx.db.insert(schema.template_audit_points).values(allCheckpoints).onConflictDoNothing();

  console.log(`✅ Created audit template with ${allCheckpoints.length} check points`);
  console.log(`   - ${unitCheckpoints.length} Unit-level checks`);
  console.log(`   - ${roomCheckpoints.length} Room-level checks`);
  
  return { template, checkpoints: allCheckpoints };
}

/**
 * Seed sample audit sessions with results
 */
async function seedAuditSessions(
  ctx: SeedContext,
  projectId: string,
  auditors: Array<{ id: string; name: string }>,
  units: Array<{ id: string; name: string; parent_id?: string | null | undefined }>,
  rooms: Array<{ id: string; name: string; parent_id?: string | null | undefined }>,
  checkpoints: Array<{ id: string; applicable_level_type: string }>,
) {
  console.log('🔍 Seeding sample audit sessions...');
  
  // Create 5 completed audit sessions for different units
  const sessionsToCreate = Math.min(5, units.length);
  let totalItems = 0;

  for (let i = 0; i < sessionsToCreate; i++) {
    const auditor = auditors[i % auditors.length];
    const targetUnit = units[i];
    
    const session = {
      id: generateId(),
      project_id: projectId,
      auditor_id: auditor.id,
      status: 'SUBMITTED' as const,
      created_at: new Date(Date.now() - (7 - i) * 24 * 60 * 60 * 1000), // Stagger over last week
      submitted_at: new Date(Date.now() - (7 - i) * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
    };

    await ctx.db.insert(schema.audit_sessions).values(session).onConflictDoNothing();

    // Add audit items for unit-level checks
    const unitCheckpoints = checkpoints.filter(cp => cp.applicable_level_type === 'UNIT');
    const unitItems = unitCheckpoints.map(cp => ({
      id: generateId(),
      audit_session_id: session.id,
      structure_node_id: targetUnit.id,
      template_audit_point_id: cp.id,
      status: Math.random() > 0.2 ? ('PASS' as const) : ('FAIL' as const), // 80% pass rate
      notes: Math.random() > 0.7 ? 'Minor issue noted' : null,
      created_at: session.created_at,
    }));

    // Add audit items for room-level checks
    const unitRooms = rooms.filter(r => r.parent_id === targetUnit.id);
    const roomCheckpoints = checkpoints.filter(cp => cp.applicable_level_type === 'ROOM');
    
    const roomItems = unitRooms.flatMap(room =>
      roomCheckpoints.map(cp => ({
        id: generateId(),
        audit_session_id: session.id,
        structure_node_id: room.id,
        template_audit_point_id: cp.id,
        status: Math.random() > 0.15 ? ('PASS' as const) : ('FAIL' as const), // 85% pass rate
        notes: Math.random() > 0.8 ? 'Needs minor touch-up' : null,
        created_at: session.created_at,
      }))
    );

    const allItems = [...unitItems, ...roomItems];
    
    // Insert in batches (small batches for D1 limits)
    const batchSize = 10;
    for (let j = 0; j < allItems.length; j += batchSize) {
      const batch = allItems.slice(j, j + batchSize);
      await ctx.db.insert(schema.audit_items).values(batch).onConflictDoNothing();
    }

    totalItems += allItems.length;
  }

  console.log(`✅ Created ${sessionsToCreate} audit sessions with ${totalItems} check results`);
}

/**
 * Main seed function
 */
export async function seed(db: ReturnType<typeof drizzle<typeof schema>>) {
  console.log('🌱 Starting database seed...\n');
  const ctx: SeedContext = { db };

  try {
    // 1. Seed users
    await seedUsers(ctx);
    // Query actual users from DB (in case they already existed)
    const users = await ctx.db.select().from(schema.users);
    const auditors = users.filter(u => u.role === 'AUDITOR');

    // 2. Seed project
    await seedProject(ctx);
    // Query actual project from DB
    const projects = await ctx.db.select().from(schema.projects);
    const project = projects[0];

    // 3. Seed structure
    await seedStructure(ctx, project.id);
    // Query actual nodes from DB
    const allNodes = await ctx.db.select().from(schema.structure_nodes).where(
      eq(schema.structure_nodes.project_id, project.id)
    );
    const units = allNodes.filter(n => n.level_type === 'UNIT');
    const rooms = allNodes.filter(n => n.level_type === 'ROOM');

    // 4. Seed audit template
    await seedAuditTemplate(ctx, project.id);
    // Query actual checkpoints from DB
    const templates = await ctx.db.select().from(schema.audit_templates).where(
      eq(schema.audit_templates.project_id, project.id)
    );
    const checkpoints = await ctx.db.select().from(schema.template_audit_points).where(
      eq(schema.template_audit_points.template_audit_id, templates[0].id)
    );

    // 5. Seed sample audit sessions
    await seedAuditSessions(ctx, project.id, auditors, units, rooms, checkpoints);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Projects: 1`);
    console.log(`   - Structure nodes: ${allNodes.length}`);
    console.log(`   - Audit checkpoints: ${checkpoints.length}`);
    console.log(`   - Sample audit sessions: 5`);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

/**
 * For running as a standalone script with Node.js
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('⚠️  Note: This seed script is designed to run within a Cloudflare Worker environment');
  console.log('    with access to D1 database. For local development, use wrangler or adapt');
  console.log('    the script to use your local database connection.\n');
}
