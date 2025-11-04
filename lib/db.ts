import { kv } from '@vercel/kv';

export interface Idea {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  color: string;
}

// KV key patterns:
// - idea:{ideaId} -> Idea object
// - user_ideas:{userId} -> Set of idea IDs

export async function getIdeas(userId: string): Promise<Idea[]> {
  try {
    // Get all idea IDs for this user
    const ideaIds = await kv.smembers(`user_ideas:${userId}`) as string[];

    if (!ideaIds || ideaIds.length === 0) {
      return [];
    }

    // Fetch all ideas in parallel
    const ideas = await Promise.all(
      ideaIds.map(async (id) => {
        const idea = await kv.get<Idea>(`idea:${id}`);
        return idea;
      })
    );

    // Filter out any null values and sort by creation date (newest first)
    return ideas
      .filter((idea): idea is Idea => idea !== null)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error getting ideas:', error);
    return [];
  }
}

export async function getIdea(id: string, userId: string): Promise<Idea | null> {
  try {
    const idea = await kv.get<Idea>(`idea:${id}`);

    // Verify the idea belongs to this user
    if (idea && idea.userId === userId) {
      return idea;
    }

    return null;
  } catch (error) {
    console.error('Error getting idea:', error);
    return null;
  }
}

export async function createIdea(idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>): Promise<Idea> {
  const newIdea: Idea = {
    ...idea,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    // Store the idea
    await kv.set(`idea:${newIdea.id}`, newIdea);

    // Add the idea ID to the user's set of ideas
    await kv.sadd(`user_ideas:${idea.userId}`, newIdea.id);

    return newIdea;
  } catch (error) {
    console.error('Error creating idea:', error);
    throw error;
  }
}

export async function updateIdea(
  id: string,
  userId: string,
  updates: Partial<Omit<Idea, 'id' | 'userId' | 'createdAt'>>
): Promise<Idea | null> {
  try {
    const existingIdea = await getIdea(id, userId);

    if (!existingIdea) {
      return null;
    }

    const updatedIdea: Idea = {
      ...existingIdea,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`idea:${id}`, updatedIdea);

    return updatedIdea;
  } catch (error) {
    console.error('Error updating idea:', error);
    return null;
  }
}

export async function deleteIdea(id: string, userId: string): Promise<boolean> {
  try {
    // Verify the idea exists and belongs to this user
    const idea = await getIdea(id, userId);

    if (!idea) {
      return false;
    }

    // Delete the idea
    await kv.del(`idea:${id}`);

    // Remove from user's set of ideas
    await kv.srem(`user_ideas:${userId}`, id);

    return true;
  } catch (error) {
    console.error('Error deleting idea:', error);
    return false;
  }
}
