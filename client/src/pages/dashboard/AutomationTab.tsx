import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Play, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function AutomationTab() {
  const { data: logs, isLoading, refetch } = trpc.automation.getLogs.useQuery({ limit: 50, offset: 0 });
  const { data: status } = trpc.automation.getStatus.useQuery();

  const startAutomation = trpc.automation.startAutomation.useMutation({
    onSuccess: () => {
      toast.success("Automation started");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to start: ${error.message}`);
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "started":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "partial":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Automation Status</CardTitle>
          <CardDescription>Current automation state and controls</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-muted">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Current Status</div>
                <div className="text-2xl font-bold capitalize mt-2">{status?.status || "idle"}</div>
              </CardContent>
            </Card>
            <Card className="bg-muted">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Last Run</div>
                <div className="text-lg font-semibold mt-2">
                  {status?.lastRun ? new Date(status.lastRun).toLocaleString() : "Never"}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-muted">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Type</div>
                <div className="text-lg font-semibold mt-2 capitalize">{status?.type || "-"}</div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Start Automation</h3>
            <div className="flex gap-2">
              <Button onClick={() => startAutomation.mutate({ type: "amazon_search" })} disabled={startAutomation.isPending}>
                <Play className="w-4 h-4 mr-2" />
                Search Amazon
              </Button>
              <Button onClick={() => startAutomation.mutate({ type: "pinterest_post" })} disabled={startAutomation.isPending} variant="outline">
                <Play className="w-4 h-4 mr-2" />
                Post to Pinterest
              </Button>
              <Button onClick={() => startAutomation.mutate({ type: "analytics_sync" })} disabled={startAutomation.isPending} variant="outline">
                <Play className="w-4 h-4 mr-2" />
                Sync Analytics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Automation Logs</CardTitle>
          <CardDescription>History of automation runs</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading logs...</div>
          ) : logs && logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No automation logs yet</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Found</TableHead>
                    <TableHead>Posted</TableHead>
                    <TableHead>Errors</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs?.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium capitalize">{log.automationType}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(log.status || "started")}>{log.status}</Badge>
                      </TableCell>
                      <TableCell>{log.productsFound || 0}</TableCell>
                      <TableCell>{log.productsPosted || 0}</TableCell>
                      <TableCell>
                        {log.errorCount ? (
                          <div className="flex items-center gap-1 text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            {log.errorCount}
                          </div>
                        ) : (
                          "0"
                        )}
                      </TableCell>
                      <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
