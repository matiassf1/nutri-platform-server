-- Add new fields to plan_meals table
ALTER TABLE "plan_meals" ADD COLUMN "completedAt" TIMESTAMP(3);
ALTER TABLE "plan_meals" ADD COLUMN "selectedRecipeId" TEXT;

-- Add new fields to recipes table
ALTER TABLE "recipes" ADD COLUMN "name" TEXT;
ALTER TABLE "recipes" ADD COLUMN "authorId" TEXT;

-- Update existing recipes to have name = title and authorId = createdBy
UPDATE "recipes" SET "name" = "title" WHERE "name" IS NULL;
UPDATE "recipes" SET "authorId" = "createdBy" WHERE "authorId" IS NULL;

-- Make the new fields required
ALTER TABLE "recipes" ALTER COLUMN "name" SET NOT NULL;
ALTER TABLE "recipes" ALTER COLUMN "authorId" SET NOT NULL;

-- Create indexes
CREATE INDEX "plan_meals_selectedRecipeId_idx" ON "plan_meals"("selectedRecipeId");

-- Add foreign key constraint for selectedRecipeId
ALTER TABLE "plan_meals" ADD CONSTRAINT "plan_meals_selectedRecipeId_fkey" FOREIGN KEY ("selectedRecipeId") REFERENCES "recipes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add foreign key constraint for authorId
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
