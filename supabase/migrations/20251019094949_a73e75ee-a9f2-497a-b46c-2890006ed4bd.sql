-- Team messaging system
CREATE TABLE IF NOT EXISTS public.team_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID NOT NULL REFERENCES public.stylist_profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  edited_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT message_not_empty CHECK (char_length(trim(message)) > 0)
);

-- Enable RLS
ALTER TABLE public.team_messages ENABLE ROW LEVEL SECURITY;

-- Team members can view all messages
CREATE POLICY "Team members can view messages"
  ON public.team_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.stylist_profiles
      WHERE user_id = auth.uid()
    )
  );

-- Team members can create messages
CREATE POLICY "Team members can create messages"
  ON public.team_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stylist_profiles
      WHERE user_id = auth.uid() AND id = team_messages.stylist_id
    )
  );

-- Team members can edit their own messages
CREATE POLICY "Team members can edit own messages"
  ON public.team_messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.stylist_profiles
      WHERE user_id = auth.uid() AND id = team_messages.stylist_id
    )
  );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_messages;

-- Products for marketplace
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID NOT NULL REFERENCES public.stylist_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
  image_url TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  stylist_id UUID NOT NULL REFERENCES public.stylist_profiles(id) ON DELETE CASCADE,
  total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_order_status CHECK (status IN ('pending', 'paid', 'shipped', 'completed', 'cancelled'))
);

-- Order items
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gift cards
CREATE TABLE IF NOT EXISTS public.gift_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  balance DECIMAL(10,2) NOT NULL CHECK (balance >= 0),
  original_balance DECIMAL(10,2) NOT NULL CHECK (original_balance >= 0),
  purchased_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_email TEXT,
  stylist_id UUID REFERENCES public.stylist_profiles(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gift card transactions
CREATE TABLE IF NOT EXISTS public.gift_card_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_card_id UUID NOT NULL REFERENCES public.gift_cards(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  transaction_type TEXT NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_transaction_type CHECK (transaction_type IN ('purchase', 'redemption'))
);

-- RLS for products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stylists can manage own products"
  ON public.products
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.stylist_profiles
      WHERE id = products.stylist_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Clients can view stylist products"
  ON public.products
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.client_profiles
      WHERE user_id = auth.uid() AND preferred_stylist_id = products.stylist_id
    )
  );

-- RLS for orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own orders"
  ON public.orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.client_profiles
      WHERE id = orders.client_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Stylists can view their orders"
  ON public.orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.stylist_profiles
      WHERE id = orders.stylist_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "System can create orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (true);

-- RLS for order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view order items for their orders"
  ON public.order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.client_profiles cp ON cp.id = o.client_id
      WHERE o.id = order_items.order_id AND cp.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.stylist_profiles sp ON sp.id = o.stylist_id
      WHERE o.id = order_items.order_id AND sp.user_id = auth.uid()
    )
  );

-- RLS for gift cards
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can redeem gift cards"
  ON public.gift_cards
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Purchasers can view their gift cards"
  ON public.gift_cards
  FOR SELECT
  USING (purchased_by = auth.uid());

CREATE POLICY "System can create gift cards"
  ON public.gift_cards
  FOR INSERT
  WITH CHECK (true);

-- RLS for gift card transactions
ALTER TABLE public.gift_card_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view gift card transactions"
  ON public.gift_card_transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.gift_cards gc
      WHERE gc.id = gift_card_transactions.gift_card_id 
      AND (gc.purchased_by = auth.uid() OR gc.recipient_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_messages_stylist ON public.team_messages(stylist_id);
CREATE INDEX IF NOT EXISTS idx_team_messages_created ON public.team_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_stylist ON public.products(stylist_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_orders_client ON public.orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_stylist ON public.orders(stylist_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_gift_cards_code ON public.gift_cards(code) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_gift_cards_expires ON public.gift_cards(expires_at) WHERE expires_at IS NOT NULL;

-- Updated_at triggers
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();