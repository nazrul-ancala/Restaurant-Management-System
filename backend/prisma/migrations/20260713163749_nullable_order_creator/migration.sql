-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_created_by_id_fkey";

-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "created_by_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
