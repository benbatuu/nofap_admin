import { Skeleton } from '@/components/ui/skeleton'

export function LoadingSkeleton() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card border rounded-lg p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </div>
            <div>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>

      {/* Content Cards */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-card border rounded-lg">
            <div className="p-6 pb-4">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="p-6 pt-0">
              <div className="space-y-3">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-3 h-3 rounded-full" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-6 w-12" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function RolesPageSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row lg:flex-row items-center space-y-2 md:space-y-0 justify-between">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div>
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-6 w-8" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex space-x-8">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>

      {/* Search */}
      <Skeleton className="h-10 w-64" />

      {/* Content */}
      <div className="bg-card border rounded-lg">
        <div className="px-6 py-4 border-b">
          <Skeleton className="h-5 w-24 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="divide-y">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div>
                    <Skeleton className="h-5 w-24 mb-2" />
                    <Skeleton className="h-4 w-48 mb-2" />
                    <div className="flex gap-1">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="w-8 h-8" />
                  <Skeleton className="w-8 h-8" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}