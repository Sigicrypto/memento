# Memento Database Migrations

This directory tracks the schema and data migrations for the Memento Supabase project.

## Current State

The database relies on an organized set of migrations, which apply RLS policies, schemas, and features in sequential order.

## Running Migrations

Make sure you have the Supabase CLI installed.
```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

## Adding New Migrations

1. Generate a new migration file:
   ```bash
   supabase migration new add_feature_x
   ```
2. Write standard SQL inside the generated `supabase/migrations/[timestamp]_add_feature_x.sql` file.
3. Push to your local or remote database.
