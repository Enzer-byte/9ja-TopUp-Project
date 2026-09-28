import { GameId, Order, PaymentGateway, ProductPackage, SupplierValidationResult, SystemSettings, TransactionLog } from '../types';
const base = (globalThis as typeof globalThis & { __API_URL__?: string }).__API_URL__ ?? 'http://localhost:4000/api/v1';
async function request<T>(path: string, init?: RequestInit): Promise<T> { const response = await fetch(`${base}${path}`, { headers: { 'Content-Type':'application/json', ...(init?.headers ?? {}) }, ...init }); const body = await response.json(); if (!response.ok) throw new Error(body.error ?? 'Request failed'); return body; }
const adminHeaders = () => ({ Authorization:`Bearer ${sessionStorage.getItem('ngt_admin_api_token') ?? ''}` });
export const api = {
  catalog: async () => request<{games: unknown[];packages: ProductPackage[]}>('/catalog'),
  validatePlayer: (gameId: GameId, playerId: string) => request<SupplierValidationResult>('/players/validate',{method:'POST',body:JSON.stringify({gameId,playerId})}),
  createOrder: (input: {gameId:GameId;packageId:string;playerId:string;playerNickname?:string;customerEmail:string;customerPhone?:string;paymentGateway:PaymentGateway}) => request<{order:Order}>('/orders',{method:'POST',body:JSON.stringify(input)}),
  initializePayment: (orderRef:string,gateway:PaymentGateway) => request<{order:Order;reference:string;authorizationUrl?:string}>(`/orders/${encodeURIComponent(orderRef)}/payments/initialize`,{method:'POST',body:JSON.stringify({gateway})}),
  order: (orderRef:string) => request<{order:Order}>(`/orders/${encodeURIComponent(orderRef)}`),
  admin: {
    orders: () => request<{orders:Order[]}>('/admin/orders',{headers:adminHeaders()}),
    catalog: () => request<{packages:ProductPackage[]}>('/admin/catalog',{headers:adminHeaders()}),
    updatePackage: (id:string, changes:Partial<ProductPackage>) => request<{package:ProductPackage}>(`/admin/packages/${id}`,{method:'PATCH',headers:adminHeaders(),body:JSON.stringify(changes)}),
    suppliers: () => request<{suppliers:{id:string;isActive:boolean}[]}>('/admin/suppliers',{headers:adminHeaders()}),
    updateSupplier: (id:string,isActive:boolean) => request(`/admin/suppliers/${id}`,{method:'PATCH',headers:adminHeaders(),body:JSON.stringify({isActive})}),
    retry: (id:string) => request<{order:Order}>(`/admin/orders/${id}/retry`,{method:'POST',headers:adminHeaders()}),
    audit: () => request<{logs:TransactionLog[]}>('/admin/audit-logs',{headers:adminHeaders()}),
  }
};
