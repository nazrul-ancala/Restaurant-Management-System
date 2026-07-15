-- DropForeignKey
ALTER TABLE "stock_movements" DROP CONSTRAINT "stock_movements_inventory_item_id_fkey";

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_inventory_item_id_fkey" FOREIGN KEY ("inventory_item_id") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
