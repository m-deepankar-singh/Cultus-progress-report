'use client';

import React, { useState } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from 'next/dynamic';
import type { BadgeProps } from "../../components/ui/badge";
const Badge = dynamic(() => import("../../components/ui/badge").then(mod => mod.Badge), { ssr: false }) as React.FC<BadgeProps>;
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Activity, Users, Star, BookOpen, Calendar } from 'lucide-react';
import { mockData, availableMonths } from '@/lib/mock-data';
import type { ClientData } from '@/types';

const VIBRANT_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B89B3'];
const CHART_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];

interface ClientDashboardProps {
    clientData: ClientData;
}

// Custom tooltip style
const CustomTooltipStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
};

// Aggregation function for OverviewDashboard
const calculateOverviewStats = (monthData: Record<string, ClientData>) => {
    const allClients = Object.values(monthData);
    const totalUsers = allClients.reduce((sum, client) => sum + client.totalUsers, 0);
    
    // Calculate average stars across all clients
    const weightedStars = allClients.reduce((sum, client) => 
        sum + (client.averageStars * client.totalUsers), 0);
    const averageStars = (weightedStars / totalUsers).toFixed(1);

    // Aggregate completed tasks
    const totalCompleted = allClients.reduce((sum, client) =>
        sum + (client.statusData.find((s: { name: string; value: number }) => s.name === 'Completed')?.value || 0), 0);
   // Aggregate in progress tasks
   const totalInProgress = allClients.reduce((sum, client) =>
       sum + (client.statusData.find((s: { name: string; value: number }) => s.name === 'In Progress')?.value || 0), 0);
   const progressionRate = ((totalInProgress / totalUsers) * 100).toFixed(1);

    // Combine component data
    const componentMap = new Map<string, number>();
    allClients.forEach(client => {
        client.componentData.forEach(comp => {
            componentMap.set(comp.name, (componentMap.get(comp.name) || 0) + comp.value);
        });
    });
    const componentData = Array.from(componentMap.entries())
        .map(([name, value]) => ({ name, value }));

    // Combine status data
    const statusMap = new Map<string, number>();
    allClients.forEach(client => {
        client.statusData.forEach(status => {
            statusMap.set(status.name, (statusMap.get(status.name) || 0) + status.value);
        });
    });
    const statusData = Array.from(statusMap.entries())
        .map(([name, value]) => ({ name, value }));

    // Combine star distribution
    const starMap = new Map<number, number>();
    allClients.forEach(client => {
        client.starDistribution.forEach(star => {
            starMap.set(star.stars, (starMap.get(star.stars) || 0) + star.count);
        });
    });
    const starDistribution = Array.from(starMap.entries())
        .map(([stars, count]) => ({ stars, count }))
        .sort((a, b) => a.stars - b.stars);

    return {
        totalUsers,
        averageStars,
        totalCompleted,
        progressionRate,
        componentData,
        statusData,
        starDistribution,
        activeComponents: componentData.length
    };
};

const ClientDashboard: React.FC<ClientDashboardProps> = ({ clientData }) => {
    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                    <CardContent className="pt-6">
                        <div className="flex items-center space-x-2">
                            <Users className="h-6 w-6 text-blue-500" />
                            <div>
                                <p className="text-sm text-blue-600">Total Users</p>
                                <h3 className="text-2xl font-bold text-blue-700">{clientData.totalUsers}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100">
                    <CardContent className="pt-6">
                        <div className="flex items-center space-x-2">
                            <Star className="h-6 w-6 text-green-500" />
                            <div>
                                <p className="text-sm text-green-600">Average Stars</p>
                                <h3 className="text-2xl font-bold text-green-700">{clientData.averageStars}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                    <CardContent className="pt-6">
                        <div className="flex items-center space-x-2">
                            <Activity className="h-6 w-6 text-purple-500" />
                            <div>
                                <p className="text-sm text-purple-600">Progression Rate</p>
                                <h3 className="text-2xl font-bold text-purple-700">
                                    {(((clientData.statusData.find((s: { name: string; value: number }) => s.name === 'In Progress')?.value || 0) / clientData.totalUsers) * 100).toFixed(1)}%
                                </h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
                    <CardContent className="pt-6">
                        <div className="flex items-center space-x-2">
                            <BookOpen className="h-6 w-6 text-orange-500" />
                            <div>
                                <p className="text-sm text-orange-600">Active Components</p>
                                <h3 className="text-2xl font-bold text-orange-700">{clientData.componentData.length}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status Distribution */}
                <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                        <CardTitle>Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={clientData.statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        paddingAngle={5}
                                    >
                                        {clientData.statusData.map((_, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={VIBRANT_COLORS[index % VIBRANT_COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={CustomTooltipStyle} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Star Distribution */}
                <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader style={{ display: 'none' }}>
                        <CardTitle>Star Distribution</CardTitle>
                        <CardDescription>User achievement levels</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={clientData.starDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                    <XAxis dataKey="stars" />
                                    <YAxis />
                                    <Tooltip contentStyle={CustomTooltipStyle} />
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0.1}/>
                                        </linearGradient>
                                    </defs>
                                    <Area 
                                        type="monotone" 
                                        dataKey="count" 
                                        stroke="#FF6B6B"
                                        fill="url(#colorCount)"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const OverviewDashboard: React.FC<{ monthData: Record<string, ClientData> }> = ({ monthData }) => {
    const stats = calculateOverviewStats(monthData);
    
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                    <CardContent className="pt-6">
                        <div className="flex items-center space-x-2">
                            <Users className="h-6 w-6 text-blue-500" />
                            <div>
                                <p className="text-sm text-blue-600">Total Users</p>
                                <h3 className="text-2xl font-bold text-blue-700">{stats.totalUsers}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100">
                    <CardContent className="pt-6">
                        <div className="flex items-center space-x-2">
                            <Star className="h-6 w-6 text-green-500" />
                            <div>
                                <p className="text-sm text-green-600">Average Stars</p>
                                <h3 className="text-2xl font-bold text-green-700">{stats.averageStars}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                    <CardContent className="pt-6">
                        <div className="flex items-center space-x-2">
                            <Activity className="h-6 w-6 text-purple-500" />
                            <div>
                                <p className="text-sm text-purple-600">Progression Rate</p>
                                <h3 className="text-2xl font-bold text-purple-700">{stats.progressionRate}%</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
                    <CardContent className="pt-6">
                        <div className="flex items-center space-x-2">
                            <BookOpen className="h-6 w-6 text-orange-500" />
                            <div>
                                <p className="text-sm text-orange-600">Active Components</p>
                                <h3 className="text-2xl font-bold text-orange-700">{stats.activeComponents}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Distribution */}
                <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            Client Distribution
                            <Badge variant="secondary">
                                {Object.keys(monthData).length} Clients
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart 
                                    data={(Object.entries(monthData) as [string, ClientData][])
                                        .map(([name, data]) => ({
                                            name: name.split(' ')[0],
                                            users: data.totalUsers
                                        }))}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip contentStyle={CustomTooltipStyle} />
                                    <Bar dataKey="users">
                                        {(Object.keys(monthData) as string[]).map((_, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={CHART_COLORS[index % CHART_COLORS.length]} 
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Client Performance */}
                <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            Client Performance
                            <Badge variant="secondary" className="ml-2">
                                Performance Metrics
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart 
                                    data={(Object.entries(monthData) as [string, ClientData][])
                                        .map(([name, data]) => ({
                                            name: name.split(' ')[0],
                                            completion: ((data.statusData.find((s: { name: string; value: number }) => s.name === 'Completed')?.value || 0) / data.totalUsers * 100),
                                            avgStars: data.averageStars * 20,
                                            engagement: (data.totalUsers / stats.totalUsers * 100)
                                        }))}
                                    layout="vertical"
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                    <XAxis type="number" domain={[0, 100]} />
                                    <YAxis type="category" dataKey="name" width={80} />
                                    <Tooltip 
                                        contentStyle={CustomTooltipStyle}
                                        formatter={(value: number, name: string) => {
                                            switch(name) {
                                                case 'completion':
                                                    return [`${value.toFixed(1)}%`, 'Completion Rate'];
                                                case 'avgStars':
                                                    return [`${(value/20).toFixed(1)}`, 'Average Stars'];
                                                case 'engagement':
                                                    return [`${value.toFixed(1)}%`, 'User Share'];
                                                default:
                                                    return [value, name];
                                            }
                                        }}
                                    />
                                    <Legend
                                        formatter={(value) => {
                                            switch(value) {
                                                case 'completion':
                                                    return 'Completion Rate';
                                                case 'avgStars':
                                                    return 'Average Stars';
                                                case 'engagement':
                                                    return 'User Share';
                                                default:
                                                    return value;
                                            }
                                        }}
                                    />
                                    <Bar dataKey="completion" fill={CHART_COLORS[0]} />
                                    <Bar dataKey="avgStars" fill={CHART_COLORS[1]} />
                                    <Bar dataKey="engagement" fill={CHART_COLORS[2]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Status Distribution */}
                <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                        <CardTitle>Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        paddingAngle={5}
                                    >
                                        {stats.statusData.map((_, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={VIBRANT_COLORS[index % VIBRANT_COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={CustomTooltipStyle} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Star Distribution */}
                <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                        <CardTitle>Star Distribution</CardTitle>
                        <CardDescription>Overall user achievement levels</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.starDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                    <XAxis dataKey="stars" />
                                    <YAxis />
                                    <Tooltip contentStyle={CustomTooltipStyle} />
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0.1}/>
                                        </linearGradient>
                                    </defs>
                                    <Area 
                                        type="monotone" 
                                        dataKey="count" 
                                        stroke="#FF6B6B"
                                        fill="url(#colorCount)"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const [selectedMonth, setSelectedMonth] = useState<string>('2025-01');
    const currentMonthData = mockData[selectedMonth as keyof typeof mockData];

    return (
        <div className="p-6 space-y-6">
            {/* Header with Month Selector */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Cultus Progress Report
                </h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <Select
                            value={selectedMonth}
                            onValueChange={setSelectedMonth}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select month" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableMonths.map((month) => (
                                    <SelectItem key={month.value} value={month.value}>
                                        {month.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
            
            {/* Main Dashboard Content */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full" style={{ 
                    gridTemplateColumns: `repeat(${Object.keys(currentMonthData).length + 1}, minmax(0, 1fr))` 
                }}>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    {Object.keys(currentMonthData).map((client, index) => (
                        <TabsTrigger key={index} value={client}>
                            {client.split(' ')[0]}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="overview">
                    <OverviewDashboard monthData={currentMonthData} />
                </TabsContent>

                {Object.entries(currentMonthData).map(([client, clientData], index) => (
                    <TabsContent key={index} value={client}>
                        <ClientDashboard clientData={clientData} />
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
};

export default Dashboard;