import React from 'react';

interface AdminSkeletonProps {
  tab: 'analytics' | 'orders' | 'catalog' | 'supplier' | 'audit';
}

export const AdminSkeleton: React.FC<AdminSkeletonProps> = ({ tab }) => {
  return (
    <div className="animate-pulse space-y-6 w-full" aria-busy="true" aria-label="Loading dashboard view">
      {/* Overview Analytics Skeleton */}
      {tab === 'analytics' && (
        <div className="space-y-6">
          {/* 4 Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-3.5 bg-slate-800 rounded-md w-24"></div>
                  <div className="w-4 h-4 bg-slate-800 rounded-full"></div>
                </div>
                <div className="h-7 bg-slate-800 rounded-lg w-28"></div>
                <div className="h-2.5 bg-slate-800/60 rounded w-20"></div>
              </div>
            ))}
          </div>

          {/* Supplier Status Banner Skeleton */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3 w-full sm:w-2/3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 shrink-0"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-800 rounded w-48"></div>
                <div className="h-3 bg-slate-800/60 rounded w-64"></div>
              </div>
            </div>
            <div className="h-8 bg-slate-800 rounded-xl w-36 shrink-0"></div>
          </div>

          {/* Audit Logs Preview Skeleton */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-slate-800 rounded w-52"></div>
              <div className="h-3 bg-slate-800/60 rounded w-24"></div>
            </div>
            <div className="space-y-2 pt-2">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-10 bg-slate-850/80 rounded-xl border border-slate-800/80"></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Orders & Retries Skeleton */}
      {tab === 'orders' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4">
          {/* Search bar & filter pills */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            <div className="h-9 bg-slate-800 rounded-xl w-full sm:w-80"></div>
            <div className="flex space-x-1.5 w-full sm:w-auto">
              {[1, 2, 3, 4].map((p) => (
                <div key={p} className="h-8 bg-slate-800 rounded-lg w-16"></div>
              ))}
            </div>
          </div>

          {/* Table Header & Rows */}
          <div className="space-y-2 pt-2">
            <div className="h-8 bg-slate-800/60 rounded-lg w-full"></div>
            {[1, 2, 3, 4, 5, 6].map((row) => (
              <div key={row} className="h-12 bg-slate-850/70 border border-slate-800/60 rounded-xl w-full flex items-center justify-between px-3">
                <div className="h-3 bg-slate-750 rounded w-24"></div>
                <div className="h-3 bg-slate-750 rounded w-20 hidden sm:block"></div>
                <div className="h-3 bg-slate-750 rounded w-20"></div>
                <div className="h-3 bg-slate-750 rounded w-16"></div>
                <div className="h-4 bg-slate-750 rounded-full w-14"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Catalog & Pricing Toggles Skeleton */}
      {tab === 'catalog' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-5">
          <div className="space-y-2">
            <div className="h-5 bg-slate-800 rounded w-60"></div>
            <div className="h-3 bg-slate-800/60 rounded w-80"></div>
          </div>

          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((card) => (
              <div key={card} className="p-4 rounded-2xl bg-slate-850/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 shrink-0"></div>
                  <div className="space-y-1.5">
                    <div className="h-4 bg-slate-800 rounded w-36"></div>
                    <div className="h-3 bg-slate-800/60 rounded w-52"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-7 bg-slate-800 rounded-lg w-24"></div>
                  <div className="h-7 bg-slate-800 rounded-xl w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Supplier Adapters Skeleton */}
      {tab === 'supplier' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-5">
          <div className="space-y-2">
            <div className="h-5 bg-slate-800 rounded w-64"></div>
            <div className="h-3 bg-slate-800/60 rounded w-96"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((sup) => (
              <div key={sup} className="p-4 rounded-2xl bg-slate-850/70 border border-slate-800 space-y-3">
                <div className="h-3 bg-slate-800 rounded w-24"></div>
                <div className="h-5 bg-slate-800 rounded w-36"></div>
                <div className="h-10 bg-slate-800/50 rounded w-full"></div>
                <div className="h-9 bg-slate-800 rounded-xl w-full pt-2"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Trail Skeleton */}
      {tab === 'audit' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-5 bg-slate-800 rounded w-56"></div>
              <div className="h-3 bg-slate-800/60 rounded w-72"></div>
            </div>
            <div className="h-6 bg-slate-800 rounded-lg w-28"></div>
          </div>

          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="p-3.5 rounded-2xl bg-slate-850/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-slate-800 rounded w-40"></div>
                  <div className="h-3 bg-slate-800/60 rounded w-28"></div>
                </div>
                <div className="h-12 bg-slate-900/90 rounded-xl border border-slate-800/80"></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
