-- Seed data for Construction Audit App
-- Run this against your Cloudflare D1 database

INSERT OR IGNORE INTO users (id, name, phone, role, created_at) VALUES
('user_builder_1', 'Builder One', '1000000000', 'BUILDER', 1735329600000),
('user_auditor_1', 'Auditor One', '2000000000', 'AUDITOR', 1735329600000);

INSERT OR IGNORE INTO projects (id, name, location, created_at) VALUES
('project_1', 'Sunrise Residency', 'Sector 15', 1735329600000);

INSERT OR IGNORE INTO structure_nodes (id, project_id, parent_id, level_type, name, order_index) VALUES
('node_project_1', 'project_1', NULL, 'PROJECT', 'Sunrise Residency', 0),
('node_block_A', 'project_1', 'node_project_1', 'BLOCK', 'Block A', 1),
('node_floor_1', 'project_1', 'node_block_A', 'FLOOR', 'Floor 1', 1),
('node_unit_101', 'project_1', 'node_floor_1', 'UNIT', 'Unit 101', 1),
('node_room_101_kitchen', 'project_1', 'node_unit_101', 'ROOM', 'Kitchen', 1),
('node_room_101_bedroom', 'project_1', 'node_unit_101', 'ROOM', 'Bedroom', 2);

INSERT OR IGNORE INTO template_audit (id, project_id, name) VALUES
('tmpl_1', 'project_1', 'Standard Quality Template');

INSERT OR IGNORE INTO template_audit_points (id, template_id, applicable_level_type, name, is_mandatory, severity, order_index) VALUES
('pt_room_clean', 'tmpl_1', 'ROOM', 'Room Cleanliness', 1, 'LOW', 1),
('pt_room_tiles', 'tmpl_1', 'ROOM', 'Tiles Alignment', 1, 'MEDIUM', 2),
('pt_room_water', 'tmpl_1', 'ROOM', 'Water Leakage', 0, 'HIGH', 3),
('pt_unit_doors', 'tmpl_1', 'UNIT', 'Door Fittings', 1, 'MEDIUM', 1),
('pt_unit_paint', 'tmpl_1', 'UNIT', 'Paint Quality', 0, 'LOW', 2);
