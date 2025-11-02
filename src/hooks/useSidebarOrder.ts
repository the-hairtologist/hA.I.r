import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface SidebarItem {
  id: string;
  title: string;
  url: string;
  icon: any;
  gradient: string;
  description?: string;
  group: string;
  color?: string;
  comingSoon?: boolean;
  children?: SidebarItem[];
}

export interface GroupedItems {
  [groupName: string]: SidebarItem[];
}

export function useSidebarOrder(
  defaultItems: SidebarItem[],
  groupLabels: { [key: string]: string }
) {
  const { user } = useAuth();
  const [items, setItems] = useState<SidebarItem[]>(defaultItems);
  const [isLoading, setIsLoading] = useState(true);

  const groupedItems: GroupedItems = items.reduce((acc, item) => {
    if (!acc[item.group]) {
      acc[item.group] = [];
    }
    acc[item.group].push(item);
    return acc;
  }, {} as GroupedItems);

  // Update items when defaultItems change (e.g., when admin role loads)
  useEffect(() => {
    if (!user) {
      setItems(defaultItems);
      setIsLoading(false);
      return;
    }

    loadSidebarOrder();
  }, [user?.id, defaultItems.length]); // Watch for changes in defaultItems

  const loadSidebarOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('user_sidebar_preferences')
        .select('sidebar_order')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading sidebar order:', error);
        setItems(defaultItems);
        setIsLoading(false);
        return;
      }

      if (data?.sidebar_order && Array.isArray(data.sidebar_order)) {
        const orderedIds = data.sidebar_order as string[];
        const orderedItems = orderedIds
          .map(id => defaultItems.find(item => item.id === id))
          .filter(Boolean) as SidebarItem[];

        // Add any new items that aren't in the saved order
        const newItems = defaultItems.filter(
          item => !orderedIds.includes(item.id)
        );

        setItems([...orderedItems, ...newItems]);
      } else {
        setItems(defaultItems);
      }
    } catch (error) {
      console.error('Error loading sidebar order:', error);
      setItems(defaultItems);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSidebarOrder = async (newOrder: SidebarItem[]) => {
    if (!user) return;

    setItems(newOrder);

    try {
      const orderIds = newOrder.map(item => item.id);

      const { error } = await supabase.from('user_sidebar_preferences').upsert(
        {
          user_id: user.id,
          sidebar_order: orderIds,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
        }
      );

      if (error) {
        console.error('Error saving sidebar order:', error);
      }
    } catch (error) {
      console.error('Error saving sidebar order:', error);
    }
  };

  const resetSidebarOrder = async () => {
    if (!user) return;

    setItems(defaultItems);

    try {
      const { error } = await supabase
        .from('user_sidebar_preferences')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error resetting sidebar order:', error);
      }
    } catch (error) {
      console.error('Error resetting sidebar order:', error);
    }
  };

  return {
    items,
    groupedItems,
    groupLabels,
    isLoading,
    saveSidebarOrder,
    resetSidebarOrder,
  };
}
