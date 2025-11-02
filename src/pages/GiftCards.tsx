import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Gift, CreditCard } from 'lucide-react';
import { MetaTags } from '@/components/MetaTags';
import { useToast } from '@/hooks/use-toast';

const PRESET_AMOUNTS = [25, 50, 100, 200];

export default function GiftCards() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePurchase = async () => {
    const amount = selectedAmount || parseFloat(customAmount);

    if (!amount || amount < 10) {
      toast({
        title: 'Invalid amount',
        description: 'Minimum gift card amount is $10',
        variant: 'destructive',
      });
      return;
    }

    if (!recipientEmail) {
      toast({
        title: 'Recipient email required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    // Stripe payment logic would go here
    toast({
      title: 'Redirecting to checkout...',
      description: `Purchasing $${amount} gift card`,
    });
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <>
      <MetaTags
        title="Gift Cards - Give the Gift of Great Hair"
        description="Purchase gift cards for your favorite salon"
      />

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
              <Gift className="w-10 h-10 text-primary" />
              Gift Cards
            </h1>
            <p className="text-muted-foreground">
              Give the gift of beautiful hair
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Purchase Card */}
            <Card>
              <CardHeader>
                <CardTitle>Purchase Gift Card</CardTitle>
                <CardDescription>
                  Choose an amount and recipient
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Amount</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_AMOUNTS.map(amount => (
                      <Button
                        key={amount}
                        variant={
                          selectedAmount === amount ? 'default' : 'outline'
                        }
                        onClick={() => {
                          setSelectedAmount(amount);
                          setCustomAmount('');
                        }}
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Custom Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">
                      $
                    </span>
                    <Input
                      type="number"
                      min="10"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={e => {
                        setCustomAmount(e.target.value);
                        setSelectedAmount(null);
                      }}
                      className="pl-7"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Recipient Email</Label>
                  <Input
                    type="email"
                    placeholder="recipient@example.com"
                    value={recipientEmail}
                    onChange={e => setRecipientEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Gift Message (Optional)</Label>
                  <Textarea
                    placeholder="Add a personal message..."
                    value={giftMessage}
                    onChange={e => setGiftMessage(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={handlePurchase}
                  disabled={
                    loading ||
                    (!selectedAmount && !customAmount) ||
                    !recipientEmail
                  }
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Purchase Gift Card
                </Button>
              </CardFooter>
            </Card>

            {/* Redemption Card */}
            <Card>
              <CardHeader>
                <CardTitle>Redeem Gift Card</CardTitle>
                <CardDescription>Enter your gift card code</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Gift Card Code</Label>
                  <Input placeholder="XXXX-XXXX-XXXX" className="font-mono" />
                </div>
                <Button className="w-full">Check Balance</Button>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">How It Works</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Choose any amount from $10 to $500</li>
                <li>• Recipient receives email with unique code</li>
                <li>• Can be used for any service or product</li>
                <li>• Partial redemption allowed</li>
                <li>• Never expires</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
