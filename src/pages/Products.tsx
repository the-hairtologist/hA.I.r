import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Loader2, Package, AlertTriangle, TrendingUp, Edit, Trash2, Beaker } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const PRODUCT_CATEGORIES = [
  { value: "color", label: "Color" },
  { value: "developer", label: "Developer" },
  { value: "toner", label: "Toner" },
  { value: "treatment", label: "Treatment" },
  { value: "styling", label: "Styling" },
  { value: "other", label: "Other" }
];

const UNIT_TYPES = [
  { value: "oz", label: "oz (ounces)" },
  { value: "ml", label: "ml (milliliters)" },
  { value: "g", label: "g (grams)" },
  { value: "tubes", label: "Tubes" },
  { value: "bottles", label: "Bottles" }
];

// Chart colors using CSS variables for theming
const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--primary))'
];

const Products = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [usageData, setUsageData] = useState<any[]>([]);
  const [stylistProfile, setStylistProfile] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
  // Form state
  const [productName, setProductName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("color");
  const [currentQuantity, setCurrentQuantity] = useState("");
  const [unitType, setUnitType] = useState("oz");
  const [reorderThreshold, setReorderThreshold] = useState("");
  const [costPerUnit, setCostPerUnit] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: stylist } = await supabase
        .from("stylist_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (!stylist) {
        toast.error("Stylist profile not found");
        navigate("/dashboard");
        return;
      }

      setStylistProfile(stylist);

      // Load products
      const { data: productsData } = await supabase
        .from("product_inventory")
        .select("*")
        .eq("stylist_id", stylist.id)
        .order("product_name");

      setProducts(productsData || []);

      // Load usage data (aggregate by product)
      const { data: usageAggregated } = await supabase
        .from("formula_products")
        .select(`
          product_id,
          quantity_used,
          product:product_inventory(product_name, brand, category)
        `)
        .in("product_id", (productsData || []).map(p => p.id));

      setUsageData(usageAggregated || []);
    } catch (error: any) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!productName || !brand || !currentQuantity) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const productData = {
        stylist_id: stylistProfile.id,
        product_name: productName,
        brand,
        category,
        current_quantity: parseFloat(currentQuantity),
        unit_type: unitType,
        reorder_threshold: reorderThreshold ? parseFloat(reorderThreshold) : 0,
        cost_per_unit: costPerUnit ? parseFloat(costPerUnit) : null,
        notes: notes || null,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("product_inventory")
          .update(productData)
          .eq("id", editingProduct.id);

        if (error) throw error;
        toast.success("Product updated!");
      } else {
        const { error } = await supabase
          .from("product_inventory")
          .insert(productData);

        if (error) throw error;
        toast.success("Product added!");
      }

      handleCloseDialog();
      loadData();
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductName(product.product_name);
    setBrand(product.brand);
    setCategory(product.category);
    setCurrentQuantity(product.current_quantity.toString());
    setUnitType(product.unit_type);
    setReorderThreshold(product.reorder_threshold?.toString() || "");
    setCostPerUnit(product.cost_per_unit?.toString() || "");
    setNotes(product.notes || "");
    setDialogOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure? This will remove product from all formulas.")) return;

    try {
      const { error } = await supabase
        .from("product_inventory")
        .delete()
        .eq("id", productId);

      if (error) throw error;
      toast.success("Product deleted");
      loadData();
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProduct(null);
    setProductName("");
    setBrand("");
    setCategory("color");
    setCurrentQuantity("");
    setUnitType("oz");
    setReorderThreshold("");
    setCostPerUnit("");
    setNotes("");
  };

  // Calculate stats
  const lowStockProducts = products.filter(p => 
    p.current_quantity <= p.reorder_threshold && p.reorder_threshold > 0
  );

  const totalInventoryValue = products.reduce((sum, p) => 
    sum + (p.current_quantity * (p.cost_per_unit || 0)), 0
  );

  // Most used products by category
  const categoryUsage = useMemo(() => {
    const usage: Record<string, number> = {};
    usageData.forEach(item => {
      const cat = item.product?.category || "other";
      usage[cat] = (usage[cat] || 0) + parseFloat(item.quantity_used);
    });
    return Object.entries(usage).map(([name, value]) => ({ name, value }));
  }, [usageData]);

  // Most used color lines (brands in color category)
  const colorLineUsage = useMemo(() => {
    const usage: Record<string, number> = {};
    usageData.forEach(item => {
      if (item.product?.category === "color") {
        const brand = item.product?.brand || "Unknown";
        usage[brand] = (usage[brand] || 0) + parseFloat(item.quantity_used);
      }
    });
    return Object.entries(usage)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [usageData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Product Inventory</h1>
            <p className="text-muted-foreground">Track product usage and manage inventory</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{products.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Items in inventory</p>
            </CardContent>
          </Card>

          <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{lowStockProducts.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Items need reordering</p>
            </CardContent>
          </Card>

          <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Inventory Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                ${totalInventoryValue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Total value at cost</p>
            </CardContent>
          </Card>
        </div>

        {/* Usage Charts */}
        {usageData.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Category Usage Pie Chart */}
            <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Beaker className="h-5 w-5" />
                  Usage by Category
                </CardTitle>
                <CardDescription>Which products you use most</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryUsage}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => entry.name}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryUsage.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `${value.toFixed(1)} units`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Color Lines Bar Chart */}
            <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Most Used Color Lines
                </CardTitle>
                <CardDescription>Your go-to brands</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={colorLineUsage} layout="vertical" margin={{ left: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-xs fill-muted-foreground" />
                      <YAxis type="category" dataKey="name" className="text-xs fill-muted-foreground" />
                      <Tooltip formatter={(value: number) => [`${value.toFixed(1)} oz`, 'Used']} />
                      <Bar dataKey="value" className="fill-primary" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Low Stock Alerts */}
        {lowStockProducts.length > 0 && (
          <Card className="border-[3px] border-amber-500 shadow-[4px_4px_0px_0px_hsl(45,100%,51%)] bg-amber-50 dark:bg-amber-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-5 w-5" />
                Low Stock Alerts
              </CardTitle>
              <CardDescription>Products that need reordering</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lowStockProducts.map((product) => (
                  <div 
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-background rounded-lg border-2 border-amber-500"
                  >
                    <div>
                      <p className="font-semibold">{product.product_name}</p>
                      <p className="text-sm text-muted-foreground">{product.brand}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive">
                        {product.current_quantity} {product.unit_type}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Reorder at {product.reorder_threshold}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products List */}
        <Card className="border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
          <CardHeader>
            <CardTitle>All Products</CardTitle>
            <CardDescription>Manage your product inventory</CardDescription>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No products in inventory yet</p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Product
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 border-[2px] border-foreground rounded-lg hover:bg-secondary/5 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{product.product_name}</p>
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{product.brand}</p>
                      {product.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{product.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {product.current_quantity} {product.unit_type}
                        </p>
                        {product.cost_per_unit && (
                          <p className="text-xs text-muted-foreground">
                            ${product.cost_per_unit}/{product.unit_type}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
              <DialogDescription>
                {editingProduct ? "Update product information" : "Add a new product to your inventory"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product-name">Product Name *</Label>
                  <Input
                    id="product-name"
                    placeholder="e.g., Wella Koleston 7/0"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">Brand *</Label>
                  <Input
                    id="brand"
                    placeholder="e.g., Wella, Redken"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit-type">Unit Type *</Label>
                  <Select value={unitType} onValueChange={setUnitType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIT_TYPES.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current-quantity">Current Quantity *</Label>
                  <Input
                    id="current-quantity"
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={currentQuantity}
                    onChange={(e) => setCurrentQuantity(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reorder-threshold">Reorder At</Label>
                  <Input
                    id="reorder-threshold"
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={reorderThreshold}
                    onChange={(e) => setReorderThreshold(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost-per-unit">Cost Per Unit ($)</Label>
                  <Input
                    id="cost-per-unit"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={costPerUnit}
                    onChange={(e) => setCostPerUnit(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes about this product..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>

              <Button onClick={handleSaveProduct} className="w-full">
                {editingProduct ? "Update Product" : "Add Product"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Products;
