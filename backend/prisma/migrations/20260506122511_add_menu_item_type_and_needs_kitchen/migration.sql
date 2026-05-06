-- CreateEnum
CREATE TYPE "MenuItemType" AS ENUM ('FOOD', 'DRINK', 'SERVICE');

-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "type" "MenuItemType" NOT NULL DEFAULT 'FOOD';

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "needsKitchen" BOOLEAN NOT NULL DEFAULT true;
