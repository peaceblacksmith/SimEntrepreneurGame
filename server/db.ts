import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq } from 'drizzle-orm';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import * as schema from '../shared/schema';
import config from './config';

neonConfig.webSocketConstructor = ws;

let db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!config.DATABASE_URL) {
    return null;
  }
  
  if (!db) {
    const pool = new Pool({ connectionString: config.DATABASE_URL });
    db = drizzle(pool, { schema });
  }
  
  return db;
}

export async function getSetting(key: string): Promise<string | null> {
  const database = getDb();
  if (!database) return null;
  
  try {
    const result = await database
      .select()
      .from(schema.settings)
      .where(eq(schema.settings.key, key))
      .limit(1);
    return result[0]?.value || null;
  } catch (error) {
    console.error(`Error reading setting ${key}:`, error);
    return null;
  }
}

export async function setSetting(key: string, value: string): Promise<boolean> {
  const database = getDb();
  if (!database) return false;
  
  try {
    const existing = await database
      .select()
      .from(schema.settings)
      .where(eq(schema.settings.key, key))
      .limit(1);
    
    if (existing.length > 0) {
      await database
        .update(schema.settings)
        .set({ value })
        .where(eq(schema.settings.key, key));
    } else {
      await database
        .insert(schema.settings)
        .values({ key, value });
    }
    
    return true;
  } catch (error) {
    console.error(`Error saving setting ${key}:`, error);
    return false;
  }
}
