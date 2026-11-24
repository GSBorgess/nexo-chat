CREATE TYPE "FriendshipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

CREATE TABLE "Friendship" (
    "id" UUID NOT NULL,
    "userLowId" UUID NOT NULL,
    "userHighId" UUID NOT NULL,
    "requestedById" UUID NOT NULL,
    "status" "FriendshipStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Friendship_canonical_pair_check" CHECK ("userLowId" < "userHighId"),
    CONSTRAINT "Friendship_requester_member_check" CHECK ("requestedById" = "userLowId" OR "requestedById" = "userHighId"),
    CONSTRAINT "Friendship_userLowId_fkey" FOREIGN KEY ("userLowId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Friendship_userHighId_fkey" FOREIGN KEY ("userHighId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Friendship_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Friendship_userLowId_userHighId_key" ON "Friendship"("userLowId", "userHighId");
