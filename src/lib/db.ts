import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../../drizzle/schema';

// Type exports for use throughout the app
export type User = typeof schema.users.$inferSelect;
export type Project = typeof schema.projects.$inferSelect;
export type StructureNode = typeof schema.structure_nodes.$inferSelect;
export type AuditTemplate = typeof schema.audit_templates.$inferSelect;
export type TemplateAuditPoint = typeof schema.template_audit_points.$inferSelect;
export type AuditSession = typeof schema.audit_sessions.$inferSelect;
export type AuditItem = typeof schema.audit_items.$inferSelect;
export type AuditMedia = typeof schema.audit_media.$inferSelect;

// New inserts
export type NewUser = typeof schema.users.$inferInsert;
export type NewProject = typeof schema.projects.$inferInsert;
export type NewStructureNode = typeof schema.structure_nodes.$inferInsert;
export type NewAuditTemplate = typeof schema.audit_templates.$inferInsert;
export type NewTemplateAuditPoint = typeof schema.template_audit_points.$inferInsert;
export type NewAuditSession = typeof schema.audit_sessions.$inferInsert;
export type NewAuditItem = typeof schema.audit_items.$inferInsert;
export type NewAuditMedia = typeof schema.audit_media.$inferInsert;

// Get DB client from Cloudflare context
export function getDB(env: { DB: D1Database }) {
  return drizzle(env.DB, { schema });
}

// Re-export schema for convenience
export * from '../../drizzle/schema';
