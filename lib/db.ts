import Redis from 'ioredis';

export interface Idea {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  color: string;
}

// Create Redis client with REDIS_URL
// Works with standard Redis connection URLs
const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: false,
      lazyConnect: true,
    })
  : new Redis({
      host: 'localhost',
      lazyConnect: true,
    });

// Ensure connection
if (process.env.REDIS_URL) {
  redis.connect().catch((err) => {
    console.error('Redis connection error:', err);
  });
}

// KV key patterns:
// - idea:{ideaId} -> Idea object (JSON string)
// - user_ideas:{userId} -> Set of idea IDs

export async function getIdeas(userId: string): Promise<Idea[]> {
  try {
    // Get all idea IDs for this user
    const ideaIds = await redis.smembers(`user_ideas:${userId}`);

    if (!ideaIds || ideaIds.length === 0) {
      return [];
    }

    // Fetch all ideas in parallel
    const ideas = await Promise.all(
      ideaIds.map(async (id) => {
        const ideaJson = await redis.get(`idea:${id}`);
        if (!ideaJson) return null;
        return JSON.parse(ideaJson) as Idea;
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
    const ideaJson = await redis.get(`idea:${id}`);

    if (!ideaJson) return null;

    const idea = JSON.parse(ideaJson) as Idea;

    // Verify the idea belongs to this user
    if (idea.userId === userId) {
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
    await redis.set(`idea:${newIdea.id}`, JSON.stringify(newIdea));

    // Add the idea ID to the user's set of ideas
    await redis.sadd(`user_ideas:${idea.userId}`, newIdea.id);

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

    await redis.set(`idea:${id}`, JSON.stringify(updatedIdea));

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
    await redis.del(`idea:${id}`);

    // Remove from user's set of ideas
    await redis.srem(`user_ideas:${userId}`, id);

    return true;
  } catch (error) {
    console.error('Error deleting idea:', error);
    return false;
  }
}
