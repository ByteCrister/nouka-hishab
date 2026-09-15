export interface SandDashboardMetrics {
  revenue: {
    total: number;
    currentMonth: number;
  };
  boats: {
    total: number;
    active: number;
    maintenanceCostTotal: number;
  };
  trips: {
    total: number;
    completed: number;
    ongoing: number;
  };
  recentTrips: {
    id: number;
    publicId: string;
    boatName: string;
    status: string;
    amount: number;
    date: Date | null;
  }[];
  recentMaintenance: {
    id: number;
    boatName: string;
    description: string;
    cost: number;
    date: Date | null;
  }[];
}
