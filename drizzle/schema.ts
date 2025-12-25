import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const items = sqliteTable('test', {
  id: text('id'),
  name: text('name').notNull(),
});
