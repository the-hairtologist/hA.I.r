import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CreditCard, AlertCircle, CheckCircle2 } from "lucide-react";

interface PaymentDetailsCardProps {
  payment?: {
    amount: number;
    status: string;
    payment_type: string;
    is_deposit: boolean;
    remaining_balance: number;
    payment_method: string;
  };
  service?: {
    price: number;
    service_name: string;
  };
}

const PaymentDetailsCard = ({ payment, service }: PaymentDetailsCardProps) => {
  if (!payment && !service) return null;

  const isDeposit = payment?.is_deposit || false;
  const amountPaid = payment?.amount || 0;
  const remainingBalance = payment?.remaining_balance || 0;
  const fullPrice = service?.price || (amountPaid + remainingBalance);
  const paymentStatus = payment?.status || 'pending';

  const getStatusConfig = () => {
    if (paymentStatus === 'completed') {
      if (isDeposit && remainingBalance > 0) {
        return {
          icon: AlertCircle,
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning',
          text: 'Deposit Paid',
        };
      }
      return {
        icon: CheckCircle2,
        color: 'text-success',
        bgColor: 'bg-success/10',
        borderColor: 'border-success',
        text: 'Fully Paid',
      };
    }
    return {
      icon: AlertCircle,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/20',
      borderColor: 'border-muted',
      text: 'Pending Payment',
    };
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="brutal-border brutal-shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Payment Details</CardTitle>
          </div>
          <Badge 
            variant={paymentStatus === 'completed' ? 'default' : 'secondary'}
            className="flex items-center gap-1"
          >
            <StatusIcon className={`h-3 w-3 ${statusConfig.color}`} />
            {statusConfig.text}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Service Price */}
        <div className="flex items-center justify-between pb-2 border-b border-border/50">
          <span className="text-sm text-muted-foreground">Service Price</span>
          <span className="text-sm font-semibold">${fullPrice.toFixed(2)}</span>
        </div>

        {/* Amount Paid */}
        {amountPaid > 0 && (
          <div className="flex items-center justify-between pb-2 border-b border-border/50">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {isDeposit ? 'Deposit Paid' : 'Amount Paid'}
              </span>
            </div>
            <span className="text-sm font-semibold text-success">
              ${amountPaid.toFixed(2)}
            </span>
          </div>
        )}

        {/* Remaining Balance */}
        {remainingBalance > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium text-warning">Balance Due</span>
            </div>
            <span className="text-base font-bold text-warning">
              ${remainingBalance.toFixed(2)}
            </span>
          </div>
        )}

        {/* Payment Method */}
        {payment?.payment_method && (
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Payment Method</span>
              <span className="text-xs font-medium capitalize">{payment.payment_method}</span>
            </div>
          </div>
        )}

        {/* Balance Due Notice */}
        {isDeposit && remainingBalance > 0 && (
          <div className="mt-3 p-3 bg-warning/10 border border-warning rounded-lg">
            <p className="text-xs text-warning">
              <strong>Note:</strong> Please pay the remaining balance of ${remainingBalance.toFixed(2)} before or at your appointment.
            </p>
          </div>
        )}

        {/* Fully Paid Notice */}
        {!isDeposit || remainingBalance === 0 && paymentStatus === 'completed' && (
          <div className="mt-3 p-3 bg-success/10 border border-success rounded-lg flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <p className="text-xs text-success font-medium">
              Payment complete - You're all set!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentDetailsCard;
