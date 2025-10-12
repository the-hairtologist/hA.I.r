import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus, Trash2, Check } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";

const PaymentMethodsPage = () => {
  // Mock data - will be replaced with actual Stripe integration
  const paymentMethods = [
    {
      id: "1",
      type: "Visa",
      last4: "4242",
      expiryMonth: "12",
      expiryYear: "2025",
      isDefault: true
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumbs />
        <PageHeader title="Payment Methods" />

        <div className="grid gap-4 md:gap-6 max-w-2xl">
          {/* Add New Card Button */}
          <Card className="border-dashed hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
            <CardContent className="flex items-center justify-center py-8">
              <Button variant="ghost" className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                <span>Add New Payment Method</span>
              </Button>
            </CardContent>
          </Card>

          {/* Saved Payment Methods */}
          {paymentMethods.map((method) => (
            <Card key={method.id} className="relative">
              {method.isDefault && (
                <Badge className="absolute top-4 right-4 bg-green-500">
                  <Check className="h-3 w-3 mr-1" />
                  Default
                </Badge>
              )}
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {method.type} •••• {method.last4}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Expires {method.expiryMonth}/{method.expiryYear}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!method.isDefault && (
                      <Button variant="outline" size="sm">
                        Set as Default
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Security Notice */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-sm">Secure Payment Processing</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>
                Your payment information is encrypted and securely stored. We use industry-standard
                security measures to protect your financial data.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PaymentMethodsPage;
