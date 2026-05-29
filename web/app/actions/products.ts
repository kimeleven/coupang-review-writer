'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export type ProductInput = {
  name: string;
  price: number;
  category: string;
  coupangUrl: string;
  partnersUrl?: string;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  notes?: string;
};

export async function getProducts() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return products;
}

export async function createProduct(data: ProductInput) {
  const product = await prisma.product.create({
    data: {
      name: data.name,
      price: data.price,
      category: data.category,
      coupangUrl: data.coupangUrl,
      partnersUrl: data.partnersUrl || '',
      imageUrl: data.imageUrl || null,
      rating: data.rating || null,
      reviewCount: data.reviewCount || null,
      notes: data.notes || null,
    },
  });
  revalidatePath('/');
  return product;
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
  revalidatePath('/');
  return { success: true };
}
