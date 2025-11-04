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
import { cn } from '@/lib/utils';
import { mobileFirst, touchButton } from '@/lib/responsive/mobile-first-utils';

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

      <div className={cn("min-h-screen bg-gradient-to-br from-background via-background to-primary/5", mobileFirst.padding.md)}>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className={cn(mobileFirst.text['3xl'], "font-bold flex items-center justify-center gap-3 break-words")}>
              <Gift className="w-10 h-10 text-primary flex-shrink-0" />
              Gift Cards
            </h1>
            <p className={cn(mobileFirst.text.base, "text-muted-foreground break-words")}>
              Give the gift of beautiful hair
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Purchase Card */}
            <Card>
              <CardHeader className={mobileFirst.padding.md}>
                <CardTitle className={cn(mobileFirst.text.lg, "break-words")}>Purchase Gift Card</CardTitle>
                <CardDescription className={cn(mobileFirst.text.sm, "break-words")}>
                  Choose an amount and recipient
                </CardDescription>
              </CardHeader>
              <CardContent className={cn(mobileFirst.padding.md, "space-y-4")}>
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
              <CardFooter className={mobileFirst.padding.md}>
                <Button
                  className={cn(touchButton.md, "w-full")}
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
              <CardHeader className={mobileFirst.padding.md}>
                <CardTitle className={cn(mobileFirst.text.lg, "break-words")}>Redeem Gift Card</CardTitle>
                <CardDescription className={cn(mobileFirst.text.sm, "break-words")}>Enter your gift card code</CardDescription>
              </CardHeader>
              <CardContent className={cn(mobileFirst.padding.md, "space-y-4")}>
                <div className="space-y-2">
                  <Label className={mobileFirst.text.sm}>Gift Card Code</Label>
                  <Input placeholder="XXXX-XXXX-XXXX" className={cn(mobileFirst.text.base, "font-mono")} />
                </div>
                <Button className={cn(touchButton.md, "w-full")}>Check Balance</Button>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className={cn(mobileFirst.padding.md, "pt-6")}>
              <h3 className={cn(mobileFirst.text.base, "font-semibold mb-2 break-words")}>How It Works</h3>
              <ul className={cn(mobileFirst.text.sm, "text-muted-foreground space-y-1")}>
                <li className="break-words">• Choose any amount from $10 to $500</li>
                <li className="break-words">• Recipient receives email with unique code</li>
                <li className="break-words">• Can be used for any service or product</li>
                <li className="break-words">• Partial redemption allowed</li>
                <li className="break-words">• Never expires</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
