"use client";

export const ProfileLoading = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
      <div className="col-span-1">
        <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm flex flex-col items-center">
          <div className="h-32 w-32 bg-muted rounded-full mb-4"></div>
          <div className="h-10 w-32 bg-muted rounded-md"></div>
        </div>
      </div>
      <div className="col-span-2">
        <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm">
          <div className="h-6 w-1/3 bg-muted rounded mb-6"></div>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-4 w-24 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-muted rounded"></div>
                <div className="h-10 bg-muted rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-24 bg-muted rounded"></div>
                <div className="h-10 bg-muted rounded"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


