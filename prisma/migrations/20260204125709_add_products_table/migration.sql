-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "product_name" TEXT NOT NULL,
    "item_id" TEXT,
    "stock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "delivery_price" DOUBLE PRECISION,
    "distributor_id" INTEGER,
    "last_restocked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_product_id_key" ON "products"("product_id");

-- CreateIndex
CREATE INDEX "products_product_name_idx" ON "products"("product_name");

-- CreateIndex
CREATE INDEX "products_item_id_idx" ON "products"("item_id");

-- CreateIndex
CREATE INDEX "products_distributor_id_idx" ON "products"("distributor_id");

-- CreateIndex
CREATE INDEX "products_stock_idx" ON "products"("stock");

-- CreateIndex
CREATE INDEX "products_last_restocked_at_idx" ON "products"("last_restocked_at");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_distributor_id_fkey" FOREIGN KEY ("distributor_id") REFERENCES "distributors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
