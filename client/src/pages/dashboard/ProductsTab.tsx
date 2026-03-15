import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ProductsTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: products, isLoading, refetch } = trpc.products.list.useQuery({ limit: 50, offset: 0 });
  const deleteProduct = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success("Product deleted");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const filteredProducts = products?.filter((p) => p.title?.toLowerCase().includes(searchTerm.toLowerCase())) || [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Products</CardTitle>
              <CardDescription>Manage your Amazon products and affiliate links</CardDescription>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

          {isLoading ? (
            <div className="text-center py-8">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No products found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium max-w-xs truncate">{product.title}</TableCell>
                      <TableCell>${product.price}</TableCell>
                      <TableCell>{product.discount}%</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {product.source}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm("Delete this product?")) {
                              deleteProduct.mutate({ id: product.id });
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
