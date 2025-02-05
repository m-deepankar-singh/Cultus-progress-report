export interface ClientData {
  totalUsers: number;
  averageStars: number;
  componentData: {
    name: string;
    value: number;
  }[];
  statusData: {
    name: string;
    value: number;
  }[];
  starDistribution: {
    stars: number;
    count: number;
  }[];
}

export interface DashboardData {
  [month: string]: Record<string, ClientData>;
}