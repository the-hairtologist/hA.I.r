-- Create product_inventory table for tracking products
CREATE TABLE product_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID NOT NULL REFERENCES stylist_profiles(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL, -- e.g., 'color', 'developer', 'toner', 'treatment'
  current_quantity NUMERIC NOT NULL DEFAULT 0,
  unit_type TEXT NOT NULL DEFAULT 'oz', -- oz, ml, tubes, bottles
  reorder_threshold NUMERIC NOT NULL DEFAULT 0,
  cost_per_unit NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create formula_products junction table linking formulas to products
CREATE TABLE formula_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formula_id UUID NOT NULL REFERENCES formulas(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES product_inventory(id) ON DELETE CASCADE,
  quantity_used NUMERIC NOT NULL, -- Amount used from inventory
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(formula_id, product_id)
);

-- Add indexes for better performance
CREATE INDEX idx_product_inventory_stylist ON product_inventory(stylist_id);
CREATE INDEX idx_product_inventory_category ON product_inventory(category);
CREATE INDEX idx_product_inventory_low_stock ON product_inventory(stylist_id, current_quantity, reorder_threshold) 
  WHERE current_quantity <= reorder_threshold;
CREATE INDEX idx_formula_products_formula ON formula_products(formula_id);
CREATE INDEX idx_formula_products_product ON formula_products(product_id);

-- Enable RLS
ALTER TABLE product_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE formula_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_inventory
CREATE POLICY "Stylists can view own inventory"
  ON product_inventory FOR SELECT
  USING (stylist_id IN (
    SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Stylists can create own inventory"
  ON product_inventory FOR INSERT
  WITH CHECK (stylist_id IN (
    SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Stylists can update own inventory"
  ON product_inventory FOR UPDATE
  USING (stylist_id IN (
    SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Stylists can delete own inventory"
  ON product_inventory FOR DELETE
  USING (stylist_id IN (
    SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
  ));

-- RLS Policies for formula_products
CREATE POLICY "Stylists can view formula products"
  ON formula_products FOR SELECT
  USING (formula_id IN (
    SELECT id FROM formulas WHERE stylist_id IN (
      SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Stylists can create formula products"
  ON formula_products FOR INSERT
  WITH CHECK (formula_id IN (
    SELECT id FROM formulas WHERE stylist_id IN (
      SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Stylists can update formula products"
  ON formula_products FOR UPDATE
  USING (formula_id IN (
    SELECT id FROM formulas WHERE stylist_id IN (
      SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Stylists can delete formula products"
  ON formula_products FOR DELETE
  USING (formula_id IN (
    SELECT id FROM formulas WHERE stylist_id IN (
      SELECT id FROM stylist_profiles WHERE user_id = auth.uid()
    )
  ));

-- Trigger to update updated_at
CREATE TRIGGER update_product_inventory_updated_at
  BEFORE UPDATE ON product_inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE product_inventory IS 'Tracks hair product inventory for stylists';
COMMENT ON TABLE formula_products IS 'Links formulas to products used, tracking usage';
COMMENT ON COLUMN product_inventory.category IS 'Product category: color, developer, toner, treatment, etc.';
COMMENT ON COLUMN product_inventory.reorder_threshold IS 'Alert when inventory falls below this amount';
COMMENT ON COLUMN formula_products.quantity_used IS 'Amount of product used in this formula';