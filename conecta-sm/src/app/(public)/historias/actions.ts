'use server';

import { prisma } from '@/lib/prisma';

export async function getPublishedStories() {
  return prisma.inspiringStory.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' }
  });
}
