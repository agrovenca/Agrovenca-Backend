-- CreateTable
CREATE TABLE "ShippingAddress" (
    "pk" TEXT NOT NULL,
    "alias" VARCHAR(100) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "lastName" VARCHAR(150) NOT NULL,
    "email" TEXT NOT NULL,
    "phone" VARCHAR(30) NOT NULL,
    "address_line_1" VARCHAR(250) NOT NULL,
    "country" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ShippingAddress_pkey" PRIMARY KEY ("pk")
);

-- AddForeignKey
ALTER TABLE "ShippingAddress" ADD CONSTRAINT "ShippingAddress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
