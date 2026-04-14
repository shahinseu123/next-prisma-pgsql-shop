// src/lib/validations.ts
import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

export const productSchema = z.object({
  name: z.string().min(2, 'Name too short'),
  description: z.string().min(10, 'Description too short'),
  price: z.number().positive('Price must be positive'),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
  category: z.string().min(1, 'Category is required'),
  imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
})

export const categorySchema = z.object({
  name: z.string().min(2, 'Name too short'),
  imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
})

export const cartItemSchema = z.object({
  quantity: z.number().int().positive().max(99),
})

export const couponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  value: z.number().positive(),
  minOrderAmount: z.number().nonnegative().optional(),
  maxUses: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional(),
})

export const applyCouponSchema = z.object({
  code: z.string().min(1),
  orderTotal: z.number().positive(),
})

export const orderSchema = z.object({
  couponCode: z.string().optional(),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
})