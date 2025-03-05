export interface ComponentData {
    name: string;
    value: number;
}

export interface StatusData {
    name: string;
    value: number;
}

export interface StarDistribution {
    stars: number;
    count: number;
}

export interface ClientData {
    totalUsers: number;
    averageStars: number;
    componentData: ComponentData[];
    statusData: StatusData[];
    starDistribution: StarDistribution[];
}

export type MonthData = Record<string, ClientData>; 