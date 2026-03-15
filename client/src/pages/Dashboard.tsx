import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { BarChart3, Package, Pin, Settings, TrendingUp } from "lucide-react";
import { useState } from "react";
import ProductsTab from "./dashboard/ProductsTab";
import PinterestTab from "./dashboard/PinterestTab";
import AutomationTab from "./dashboard/AutomationTab";
import AnalyticsTab from "./dashboard/AnalyticsTab";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("products");

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You must be an admin to access this dashboard.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Elite 24 Finds Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your Amazon affiliate and Pinterest automation</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger value="pinterest" className="flex items-center gap-2">
              <Pin className="w-4 h-4" />
              <span className="hidden sm:inline">Pinterest</span>
            </TabsTrigger>
            <TabsTrigger value="automation" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Automation</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <ProductsTab />
          </TabsContent>

          <TabsContent value="pinterest" className="space-y-4">
            <PinterestTab />
          </TabsContent>

          <TabsContent value="automation" className="space-y-4">
            <AutomationTab />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <AnalyticsTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
