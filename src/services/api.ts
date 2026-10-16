'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Product, HomeQuote, Order, SeoConfig, StoragePublicConfig, AuthUser } from '../types';

// API Fetchers
export async function fetchProducts(params?: {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}): Promise<Product[]> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== 'all') query.append('category', params.category);
  if (params?.search) query.append('search', params.search);
  if (params?.minPrice !== undefined) query.append('minPrice', String(params.minPrice));
  if (params?.maxPrice !== undefined) query.append('maxPrice', String(params.maxPrice));
  if (params?.sort) query.append('sort', params.sort);

  const res = await fetch(`/api/products?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function fetchProductById(id: string): Promise<Product> {
  const res = await fetch(`/api/products/${id}`);
  if (!res.ok) throw new Error('Product not found');
  return res.json();
}

export async function createProductApi(product: Partial<Product>): Promise<Product> {
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  });
  if (!res.ok) throw new Error('Failed to create product');
  return res.json();
}

export async function updateProductApi({ id, data }: { id: string; data: Partial<Product> }): Promise<Product> {
  const res = await fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update product');
  return res.json();
}

export async function deleteProductApi(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete product');
  return res.json();
}

export async function fetchHomeQuotes(): Promise<HomeQuote[]> {
  const res = await fetch('/api/home-quotes');
  if (!res.ok) throw new Error('Failed to fetch home quotes');
  return res.json();
}

export async function createHomeQuoteApi(quote: Partial<HomeQuote>): Promise<HomeQuote> {
  const res = await fetch('/api/home-quotes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(quote)
  });
  if (!res.ok) throw new Error('Failed to submit home quote request');
  return res.json();
}

export async function fetchSeoConfig(): Promise<SeoConfig> {
  const res = await fetch('/api/seo');
  if (!res.ok) throw new Error('Failed to fetch SEO config');
  return res.json();
}

export async function updateSeoConfigApi(seo: Partial<SeoConfig>): Promise<SeoConfig> {
  const res = await fetch('/api/seo', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(seo)
  });
  if (!res.ok) throw new Error('Failed to update SEO config');
  return res.json();
}

export async function fetchStorageConfig(): Promise<StoragePublicConfig> {
  const res = await fetch('/api/storage');
  if (!res.ok) throw new Error('Failed to fetch storage config');
  return res.json();
}

export async function uploadFileApi(file: File, folder = 'products'): Promise<{ url: string; filename: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const res = await fetch('/api/storage/upload', {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error('File upload failed');
  return res.json();
}

export async function createOrderApi(order: Partial<Order>): Promise<Order> {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order)
  });
  if (!res.ok) throw new Error('Failed to create order');
  return res.json();
}

export async function fetchAnalytics(): Promise<any> {
  const res = await fetch('/api/analytics');
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

// TanStack Query Hooks
export function useProductsQuery(
  params?: { category?: string; search?: string; minPrice?: number; maxPrice?: number; sort?: string },
  initialData?: Product[]
) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => fetchProducts(params),
    initialData
  });
}

export function useProductDetailQuery(id: string | null) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id!),
    enabled: !!id
  });
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProductApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }
  });
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProductApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProductApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }
  });
}

export function useHomeQuotesQuery() {
  return useQuery({
    queryKey: ['homeQuotes'],
    queryFn: fetchHomeQuotes
  });
}

export function useCreateHomeQuoteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createHomeQuoteApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeQuotes'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }
  });
}

export function useSeoQuery(initialData?: SeoConfig) {
  return useQuery({
    queryKey: ['seo'],
    queryFn: fetchSeoConfig,
    initialData
  });
}

export function useUpdateSeoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSeoConfigApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo'] });
    }
  });
}

export function useStorageConfigQuery() {
  return useQuery({
    queryKey: ['storageConfig'],
    queryFn: fetchStorageConfig
  });
}

export function useUploadFileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, folder }: { file: File; folder?: string }) => uploadFileApi(file, folder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storageConfig'] });
    }
  });
}

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOrderApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }
  });
}

export function useAnalyticsQuery() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: fetchAnalytics
  });
}

// ==========================================
// Authentication
// ==========================================

export async function fetchMe(): Promise<AuthUser | null> {
  const res = await fetch('/api/auth/me');
  if (!res.ok) return null;
  const data = await res.json();
  return data.user || null;
}

export async function loginApi(input: { email: string; password: string }): Promise<AuthUser> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data;
}

export async function registerApi(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthUser> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Registration failed');
  return data;
}

export async function fetchAccountSummary(): Promise<{ orders: Order[]; quotes: HomeQuote[] }> {
  const res = await fetch('/api/account/summary');
  if (!res.ok) throw new Error('Failed to fetch account data');
  return res.json();
}

export function useAccountSummaryQuery(enabled = true) {
  return useQuery({
    queryKey: ['accountSummary'],
    queryFn: fetchAccountSummary,
    enabled
  });
}

export async function updateProfileApi(name: string): Promise<AuthUser> {
  const res = await fetch('/api/auth/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Update failed');
  return data;
}

export async function changePasswordApi(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ message: string }> {
  const res = await fetch('/api/auth/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Change failed');
  return data;
}

export async function forgotPasswordApi(
  email: string
): Promise<{ message: string; devResetToken?: string; devResetUrl?: string }> {
  const res = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export async function resetPasswordApi(input: {
  token: string;
  password: string;
}): Promise<{ message: string }> {
  const res = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Reset failed');
  return data;
}

export async function logoutApi(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' });
}

export function useMeQuery() {
  return useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    staleTime: 5 * 60 * 1000
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: loginApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    }
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    }
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      queryClient.clear();
    }
  });
}
