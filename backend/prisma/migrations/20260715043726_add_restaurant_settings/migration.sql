-- CreateTable
CREATE TABLE "restaurant_settings" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'RMS',
    "address" TEXT,
    "phone" TEXT,
    "hours" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_settings_pkey" PRIMARY KEY ("id")
);
