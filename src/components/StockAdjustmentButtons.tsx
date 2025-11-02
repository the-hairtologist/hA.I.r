/**
 * Stock Adjustment Buttons
 * Quick +/- controls for product inventory
 */

import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StockAdjustmentButtonsProps {
  productId: string;
  currentQuantity: number;
  unitType: string;
  onUpdate: () => void;
  incrementAmount?: number;
}

export const StockAdjustmentButtons = ({
  productId,
  currentQuantity,
  unitType,
  onUpdate,
  incrementAmount = 1,
}: StockAdjustmentButtonsProps) => {
  const [isAdjusting, setIsAdjusting] = useState(false);

  const adjustStock = async (delta: number) => {
    setIsAdjusting(true);
    try {
      const newQuantity = Math.max(0, currentQuantity + delta);

      const { error } = await supabase
        .from('product_inventory')
        .update({ current_quantity: newQuantity })
        .eq('id', productId);

      if (error) throw error;

      toast.success(
        delta > 0
          ? `Added ${delta} ${unitType}`
          : `Removed ${Math.abs(delta)} ${unitType}`
      );
      onUpdate();
    } catch (error) {
      console.error('Error adjusting stock:', error);
      toast.error('Failed to update stock');
    } finally {
      setIsAdjusting(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={e => {
          e.stopPropagation();
          adjustStock(-incrementAmount);
        }}
        disabled={isAdjusting || currentQuantity === 0}
        className="h-8 w-8 p-0"
        aria-label={`Decrease by ${incrementAmount}`}
      >
        <Minus className="h-3 w-3" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={e => {
          e.stopPropagation();
          adjustStock(incrementAmount);
        }}
        disabled={isAdjusting}
        className="h-8 w-8 p-0"
        aria-label={`Increase by ${incrementAmount}`}
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
};
