# Database Seeding

This directory contains scripts for seeding the database with sample data.

## Overview

The seed script creates a complete sample construction project with:

- **Users**: 4 users (1 builder, 3 auditors)
- **Project**: "Skyline Residency" in Bangalore
- **Structure**:
  - 3 Blocks (Towers A, B, C)
  - 10 Floors per block
  - 4 Units per floor (total: 120 units)
  - 7 Rooms per unit (Living Room, Master Bedroom, Bedroom 2, Kitchen, 2 Bathrooms, Balcony)
  - **Total: 841 structure nodes**
- **Audit Template**: 12 check points
  - 4 Unit-level checks
  - 8 Room-level checks
- **Sample Audits**: 5 completed audit sessions with realistic pass/fail results

## Usage

### Method 1: Via API Endpoint (Recommended for Development)

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the home page (`http://localhost:3000`)

3. Click the "Seed Database" button in the yellow development banner

### Method 2: Via API Call

```bash
# Check current database status
curl http://localhost:3000/api/seed

# Run the seed
curl -X POST http://localhost:3000/api/seed
```

### Method 3: Programmatically

```typescript
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@/drizzle/schema';
import { seed } from '@/scripts/seed';

const db = drizzle(env.DB, { schema });
await seed(db);
```

## Safety Features

- **Production Protection**: Seeding is automatically disabled in production environments
- **Data Check**: The seed endpoint checks if data already exists and refuses to run if projects are found
- **Batch Processing**: Large data sets are inserted in batches to avoid overwhelming the database

## Generated Data Structure

```
Skyline Residency (Project)
├── Tower A (Block)
│   ├── Floor 1
│   │   ├── Flat 01
│   │   │   ├── Living Room
│   │   │   ├── Master Bedroom
│   │   │   ├── Bedroom 2
│   │   │   ├── Kitchen
│   │   │   ├── Bathroom 1
│   │   │   ├── Bathroom 2
│   │   │   └── Balcony
│   │   ├── Flat 02
│   │   ├── Flat 03
│   │   └── Flat 04
│   ├── Floor 2
│   └── ... (up to Floor 10)
├── Tower B (Block)
│   └── ... (same structure)
└── Tower C (Block)
    └── ... (same structure)
```

## Audit Check Points

### Unit-Level Checks
1. Main door alignment and operation (HIGH, Mandatory)
2. Window frames properly fitted (HIGH, Mandatory)
3. Electrical panel accessibility (MEDIUM, Mandatory)
4. Water supply and drainage working (HIGH, Mandatory)

### Room-Level Checks
1. Wall surface finish quality (MEDIUM, Mandatory)
2. Floor tiles level and alignment (HIGH, Mandatory)
3. Ceiling finish and light fittings (MEDIUM, Mandatory)
4. Electrical switches and sockets working (HIGH, Mandatory)
5. Door and window hardware functioning (LOW, Optional)
6. Ventilation adequate (LOW, Optional)
7. No visible cracks or damage (HIGH, Mandatory)
8. Paint finish uniform (MEDIUM, Optional)

## Clearing Data

To clear the database and re-seed:

1. Access your D1 database via Wrangler:
   ```bash
   wrangler d1 execute <database-name> --command "DELETE FROM audit_media; DELETE FROM audit_items; DELETE FROM audit_sessions; DELETE FROM template_audit_points; DELETE FROM audit_templates; DELETE FROM structure_nodes; DELETE FROM projects; DELETE FROM users;"
   ```

2. Or use your database management tool to truncate all tables

3. Re-run the seed

## Notes

- All IDs are generated using `crypto.randomUUID()` - no hardcoded UUIDs
- Timestamps are realistic and staggered over the past week for audit sessions
- Pass/fail rates are realistic: 80% pass for unit checks, 85% pass for room checks
- The seed is idempotent-safe: it checks for existing data before running

## Integration with Cloudflare Workers

The seed script is designed to work with Cloudflare D1. When deploying:

1. Run the seed manually via the API endpoint after deployment
2. Or integrate it into your CI/CD pipeline for staging environments
3. Never enable seeding in production environments

## Troubleshooting

**Error: "Database already contains data"**
- Clear the database first before re-seeding

**Error: "Seeding is disabled in production"**
- This is a safety feature. Only seed in development/staging environments

**Timeout errors**
- The seed creates 800+ nodes. Ensure your database connection timeout is sufficient
- Consider reducing the number of blocks/floors if timeouts persist
