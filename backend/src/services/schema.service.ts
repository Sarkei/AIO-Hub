/**
 * Schema Service
 * 
 * Erstellt und verwaltet User-spezifische Datenbank-Schemas
 * Jeder User bekommt sein eigenes Schema mit identischer Tabellenstruktur
 */

import { prisma } from '../prisma/client';

/**
 * Erstellt ein neues Schema für einen User und legt alle Tabellen an
 */
export async function createUserSchema(schemaName: string): Promise<void> {
  try {
    console.log(`Creating schema: ${schemaName}`);

    // Schema erstellen
    await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);

    // Todos Tabelle
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "${schemaName}"."todos" (
        "id" TEXT PRIMARY KEY,
        "user_id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "status" TEXT NOT NULL DEFAULT 'OPEN',
        "due_date" TIMESTAMP,
        "priority" INTEGER NOT NULL DEFAULT 1,
        "order" INTEGER NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Events Tabelle
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "${schemaName}"."events" (
        "id" TEXT PRIMARY KEY,
        "user_id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "location" TEXT,
        "start_time" TIMESTAMP NOT NULL,
        "end_time" TIMESTAMP NOT NULL,
        "all_day" BOOLEAN NOT NULL DEFAULT false,
        "notes" TEXT,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Body Metrics Tabelle
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "${schemaName}"."body_metrics" (
        "id" TEXT PRIMARY KEY,
        "user_id" TEXT NOT NULL,
        "date" DATE NOT NULL,
        "weight" DOUBLE PRECISION,
        "body_fat" DOUBLE PRECISION,
        "chest" DOUBLE PRECISION,
        "waist" DOUBLE PRECISION,
        "hips" DOUBLE PRECISION,
        "biceps" DOUBLE PRECISION,
        "thighs" DOUBLE PRECISION,
        "calves" DOUBLE PRECISION,
        "notes" TEXT,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("user_id", "date")
      )
    `);

    // Workouts Tabelle
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "${schemaName}"."workouts" (
        "id" TEXT PRIMARY KEY,
        "user_id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "date" DATE NOT NULL,
        "start_time" TIMESTAMP,
        "end_time" TIMESTAMP,
        "notes" TEXT,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Exercises Tabelle
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "${schemaName}"."exercises" (
        "id" TEXT PRIMARY KEY,
        "workout_id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "order" INTEGER NOT NULL DEFAULT 0,
        "notes" TEXT,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("workout_id") REFERENCES "${schemaName}"."workouts"("id") ON DELETE CASCADE
      )
    `);

    // Sets Tabelle
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "${schemaName}"."sets" (
        "id" TEXT PRIMARY KEY,
        "exercise_id" TEXT NOT NULL,
        "set_number" INTEGER NOT NULL,
        "reps" INTEGER NOT NULL,
        "weight" DOUBLE PRECISION NOT NULL,
        "is_warmup" BOOLEAN NOT NULL DEFAULT false,
        "rpe" INTEGER,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("exercise_id") REFERENCES "${schemaName}"."exercises"("id") ON DELETE CASCADE
      )
    `);

    // Nutrition Profile Tabelle
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "${schemaName}"."nutrition_profiles" (
        "id" TEXT PRIMARY KEY,
        "user_id" TEXT NOT NULL UNIQUE,
        "goal" TEXT NOT NULL DEFAULT 'MAINTAIN',
        "diet_type" TEXT NOT NULL DEFAULT 'STANDARD',
        "daily_calories" INTEGER NOT NULL,
        "protein_grams" INTEGER NOT NULL,
        "carbs_grams" INTEGER NOT NULL,
        "fat_grams" INTEGER NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Nutrition Log Tabelle
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "${schemaName}"."nutrition_logs" (
        "id" TEXT PRIMARY KEY,
        "user_id" TEXT NOT NULL,
        "date" DATE NOT NULL,
        "meal_name" TEXT NOT NULL,
        "food_item" TEXT NOT NULL,
        "calories" INTEGER NOT NULL,
        "protein" DOUBLE PRECISION NOT NULL,
        "carbs" DOUBLE PRECISION NOT NULL,
        "fat" DOUBLE PRECISION NOT NULL,
        "notes" TEXT,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Indices erstellen für bessere Performance
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "idx_todos_user_status" 
      ON "${schemaName}"."todos"("user_id", "status")
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "idx_events_user_start" 
      ON "${schemaName}"."events"("user_id", "start_time")
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "idx_body_metrics_user_date" 
      ON "${schemaName}"."body_metrics"("user_id", "date")
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "idx_workouts_user_date" 
      ON "${schemaName}"."workouts"("user_id", "date")
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "idx_nutrition_logs_user_date" 
      ON "${schemaName}"."nutrition_logs"("user_id", "date")
    `);

    console.log(`✅ Schema ${schemaName} created successfully`);
  } catch (error) {
    console.error(`❌ Failed to create schema ${schemaName}:`, error);
    throw error;
  }
}

/**
 * Löscht ein User-Schema komplett (für Account-Löschung)
 */
export async function deleteUserSchema(schemaName: string): Promise<void> {
  try {
    console.log(`Deleting schema: ${schemaName}`);
    await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
    console.log(`✅ Schema ${schemaName} deleted successfully`);
  } catch (error) {
    console.error(`❌ Failed to delete schema ${schemaName}:`, error);
    throw error;
  }
}
