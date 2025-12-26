import {
  sqliteTable,
  text,
  integer,
  real,
  primaryKey,
  foreignKey,
} from 'drizzle-orm/sqlite-core';

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone'),
  role: text('role', { enum: ['BUILDER', 'AUDITOR'] }).notNull(),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// Projects table
export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  location: text('location'),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// Structure Nodes table
export const structure_nodes = sqliteTable(
  'structure_nodes',
  {
    id: text('id').primaryKey(),
    project_id: text('project_id').notNull(),
    parent_id: text('parent_id'),
    level_type: text('level_type', {
      enum: ['PROJECT', 'BLOCK', 'FLOOR', 'UNIT', 'ROOM'],
    }).notNull(),
    name: text('name').notNull(),
    order_index: integer('order_index').notNull().default(0),
  },
  (table) => [
    foreignKey({
      columns: [table.project_id],
      foreignColumns: [projects.id],
    }),
    foreignKey({
      columns: [table.parent_id],
      foreignColumns: [table.id],
    }),
  ],
);

// Audit Templates table
export const audit_templates = sqliteTable(
  'template_audit',
  {
    id: text('id').primaryKey(),
    project_id: text('project_id').notNull().unique(),
    name: text('name').notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.project_id],
      foreignColumns: [projects.id],
    }),
  ],
);

// Template Audit Points table
export const template_audit_points = sqliteTable(
  'template_audit_points',
  {
    id: text('id').primaryKey(),
    template_audit_id: text('template_audit_id').notNull(),
    applicable_level_type: text('applicable_level_type', {
      enum: ['UNIT', 'ROOM'],
    }).notNull(),
    name: text('name').notNull(),
    is_mandatory: integer('is_mandatory', { mode: 'boolean' }).default(false),
    severity: text('severity', {
      enum: ['LOW', 'MEDIUM', 'HIGH'],
    }).notNull(),
    order_index: integer('order_index').notNull().default(0),
  },
  (table) => [
    foreignKey({
      columns: [table.template_audit_id],
      foreignColumns: [audit_templates.id],
    }),
  ],
);

// Audit Sessions table
export const audit_sessions = sqliteTable(
  'audit_sessions',
  {
    id: text('id').primaryKey(),
    project_id: text('project_id').notNull(),
    auditor_id: text('auditor_id').notNull(),
    status: text('status', { enum: ['IN_PROGRESS', 'SUBMITTED'] })
      .notNull()
      .default('IN_PROGRESS'),
    created_at: integer('created_at', { mode: 'timestamp' }).notNull(),
    submitted_at: integer('submitted_at', { mode: 'timestamp' }),
  },
  (table) => [
    foreignKey({
      columns: [table.project_id],
      foreignColumns: [projects.id],
    }),
    foreignKey({
      columns: [table.auditor_id],
      foreignColumns: [users.id],
    }),
  ],
);

// Audit Items table (called audit_session_items in your DB)
export const audit_items = sqliteTable(
  'audit_session_items',
  {
    id: text('id').primaryKey(),
    audit_session_id: text('audit_session_id').notNull(),
    structure_node_id: text('structure_node_id').notNull(),
    template_audit_point_id: text('template_audit_point_id').notNull(),
    status: text('status', { enum: ['PASS', 'FAIL'] }).notNull(),
    notes: text('notes'),
    created_at: integer('created_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.audit_session_id],
      foreignColumns: [audit_sessions.id],
    }),
    foreignKey({
      columns: [table.structure_node_id],
      foreignColumns: [structure_nodes.id],
    }),
    foreignKey({
      columns: [table.template_audit_point_id],
      foreignColumns: [template_audit_points.id],
    }),
  ],
);

// Audit Media table
export const audit_media = sqliteTable(
  'audit_media',
  {
    id: text('id').primaryKey(),
    audit_item_id: text('audit_item_id').notNull(),
    storage_key: text('storage_key').notNull(),
    created_at: integer('created_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.audit_item_id],
      foreignColumns: [audit_items.id],
    }),
  ],
);
