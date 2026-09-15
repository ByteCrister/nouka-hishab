'use client';

import { useEffect } from 'react';
import { useBoatsListStore } from '@/store/sand/useBoatStore';
import { BoatsHeader } from './BoatsHeader';
import { BoatsKpiSection } from './BoatsKpiSection';
import { BoatsToolbar } from './BoatsToolbar';
import { BoatsList } from './BoatsList';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function BoatsPageClient() {
  const { fetchBoats, meta, setPage, filters } = useBoatsListStore();

  useEffect(() => {
    fetchBoats({ silent: false });
  }, [fetchBoats, filters.page, filters.limit, filters.search, filters.status]);

  return (
    <div className="space-y-6 pb-12">
      <BoatsHeader />
      <BoatsKpiSection />
      
      <div className="rounded-2xl border border-border/50 bg-card/30 p-6 backdrop-blur-xl">
        <BoatsToolbar />
        <BoatsList />
        
        {/* Pagination Controls */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
            <div className="text-sm text-muted-foreground">
              Showing {(meta.page - 1) * meta.limit + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} boats
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(meta.page - 1)}
                disabled={meta.page === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: meta.totalPages }).map((_, i) => (
                  <Button
                    key={i + 1}
                    variant={meta.page === i + 1 ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPage(i + 1)}
                    className="w-8 h-8 p-0"
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(meta.page + 1)}
                disabled={meta.page === meta.totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
