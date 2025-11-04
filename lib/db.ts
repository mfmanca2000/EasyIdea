import { promises as fs } from 'fs';
import path from 'path';

export interface Idea {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  color: string;
}

const DB_PATH = path.join(process.cwd(), 'data', 'ideas.json');

async function ensureDbFile() {
  const dir = path.dirname(DB_PATH);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }

  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify([]));
  }
}

export async function getIdeas(userId: string): Promise<Idea[]> {
  await ensureDbFile();
  const data = await fs.readFile(DB_PATH, 'utf-8');
  const allIdeas: Idea[] = JSON.parse(data);
  return allIdeas.filter(idea => idea.userId === userId);
}

export async function getIdea(id: string, userId: string): Promise<Idea | null> {
  const ideas = await getIdeas(userId);
  return ideas.find(idea => idea.id === id) || null;
}

export async function createIdea(idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>): Promise<Idea> {
  await ensureDbFile();
  const data = await fs.readFile(DB_PATH, 'utf-8');
  const allIdeas: Idea[] = JSON.parse(data);

  const newIdea: Idea = {
    ...idea,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  allIdeas.push(newIdea);
  await fs.writeFile(DB_PATH, JSON.stringify(allIdeas, null, 2));

  return newIdea;
}

export async function updateIdea(id: string, userId: string, updates: Partial<Omit<Idea, 'id' | 'userId' | 'createdAt'>>): Promise<Idea | null> {
  await ensureDbFile();
  const data = await fs.readFile(DB_PATH, 'utf-8');
  const allIdeas: Idea[] = JSON.parse(data);

  const index = allIdeas.findIndex(idea => idea.id === id && idea.userId === userId);
  if (index === -1) return null;

  allIdeas[index] = {
    ...allIdeas[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await fs.writeFile(DB_PATH, JSON.stringify(allIdeas, null, 2));

  return allIdeas[index];
}

export async function deleteIdea(id: string, userId: string): Promise<boolean> {
  await ensureDbFile();
  const data = await fs.readFile(DB_PATH, 'utf-8');
  const allIdeas: Idea[] = JSON.parse(data);

  const filtered = allIdeas.filter(idea => !(idea.id === id && idea.userId === userId));

  if (filtered.length === allIdeas.length) return false;

  await fs.writeFile(DB_PATH, JSON.stringify(filtered, null, 2));

  return true;
}
