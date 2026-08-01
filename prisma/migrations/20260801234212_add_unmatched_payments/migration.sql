-- CreateTable
CREATE TABLE "unmatched_payments" (
    "id" UUID NOT NULL,
    "external_id" TEXT NOT NULL,
    "payer_email" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "status" "PurchaseStatus" NOT NULL,
    "amount_cents" INTEGER,
    "resolved_at" TIMESTAMP(3),
    "resolved_user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unmatched_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unmatched_payments_external_id_key" ON "unmatched_payments"("external_id");

-- CreateIndex
CREATE INDEX "unmatched_payments_resolved_at_idx" ON "unmatched_payments"("resolved_at");

-- AddForeignKey
ALTER TABLE "unmatched_payments" ADD CONSTRAINT "unmatched_payments_resolved_user_id_fkey" FOREIGN KEY ("resolved_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
