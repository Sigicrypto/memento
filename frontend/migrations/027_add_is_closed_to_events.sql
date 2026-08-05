-- Migration 027: Add is_closed column to events table
-- Allows host to toggle an event between 'Active' (accepting uploads) and 'Closed / View-Only' (read-only gallery)

ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS is_closed BOOLEAN DEFAULT FALSE;
