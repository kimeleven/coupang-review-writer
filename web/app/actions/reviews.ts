'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export type ReviewInput = {
  productId: string;
  productName: string;
  title: string;
  content: string;
  style: string;
  keywords: string[];
};

export async function getReviews() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return reviews;
}

export async function createReview(data: ReviewInput) {
  const review = await prisma.review.create({
    data: {
      productId: data.productId,
      productName: data.productName,
      title: data.title,
      content: data.content,
      style: data.style,
      keywords: data.keywords,
    },
  });
  revalidatePath('/');
  return review;
}

export async function deleteReview(id: string) {
  await prisma.review.delete({ where: { id } });
  revalidatePath('/');
  return { success: true };
}
