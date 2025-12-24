import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const items = sqliteTable('tes', {
  id: text('id'),
  name: text('name').notNull(),
});
