import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function PinterestTab() {
  const { data: posts, isLoading, refetch } = trpc.pinterest.list.useQuery({ limit: 50, offset: 0 });

  const postPin = trpc.pinterest.post.useMutation({
    onSuccess: (data) => {
      toast.success(`Pin posted! URL: ${data.url}`);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to post: ${error.message}`);
    },
  });

  const deletePost = trpc.pinterest.delete.useMutation({
    onSuccess: () => {
      toast.success("Post deleted");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "posted":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Pinterest Posts</CardTitle>
          <CardDescription>Manage and post your content to Pinterest</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading posts...</div>
          ) : posts && posts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No Pinterest posts yet</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Saves</TableHead>
                    <TableHead>Posted At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts?.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium max-w-xs truncate">{post.title}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(post.status || "draft")}>{post.status}</Badge>
                      </TableCell>
                      <TableCell>{post.clicks || 0}</TableCell>
                      <TableCell>{post.saves || 0}</TableCell>
                      <TableCell>{post.postedAt ? new Date(post.postedAt).toLocaleDateString() : "-"}</TableCell>
                      <TableCell className="space-x-2">
                        {post.status === "draft" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => postPin.mutate({ id: post.id })}
                            disabled={postPin.isPending}
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm("Delete this post?")) {
                              deletePost.mutate({ id: post.id });
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
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
