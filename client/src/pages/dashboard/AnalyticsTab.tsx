import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

export default function AnalyticsTab() {
  const { data: stats, isLoading } = trpc.analytics.getDashboardStats.useQuery();

  if (isLoading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  const chartData = [
    {
      name: "Posts",
      posted: stats?.postedCount || 0,
      draft: stats?.draftCount || 0,
      failed: stats?.failedCount || 0,
    },
  ];

  const engagementData = [
    { name: "Clicks", value: stats?.totalClicks || 0 },
    { name: "Saves", value: stats?.totalSaves || 0 },
    { name: "Impressions", value: stats?.totalImpressions || 0 },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Products in database</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPosts || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Pinterest posts created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalClicks || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Affiliate link clicks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Clicks/Post</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats?.averageClicksPerPost || 0).toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">Average engagement</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Post Status Distribution</CardTitle>
          <CardDescription>Breakdown of your Pinterest posts by status</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="posted" fill="#10b981" />
              <Bar dataKey="draft" fill="#6b7280" />
              <Bar dataKey="failed" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Engagement Metrics</CardTitle>
          <CardDescription>Total clicks, saves, and impressions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {engagementData.map((item) => (
              <div key={item.name} className="text-center">
                <div className="text-2xl font-bold">{item.value}</div>
                <p className="text-sm text-muted-foreground">{item.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
          <CardDescription>Key metrics overview</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Posted Posts</p>
              <p className="text-lg font-semibold">{stats?.postedCount || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Draft Posts</p>
              <p className="text-lg font-semibold">{stats?.draftCount || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Failed Posts</p>
              <p className="text-lg font-semibold text-red-600">{stats?.failedCount || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Saves/Post</p>
              <p className="text-lg font-semibold">{(stats?.averageSavesPerPost || 0).toFixed(1)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
