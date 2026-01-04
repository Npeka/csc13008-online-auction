import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as cleanedCategories from './categories.json';
import * as transformedProducts from './products.json';

const prisma = new PrismaClient();

// Categories imported from cleaned-categories.json (scraped from MorphMarket API)
const mockCategories = cleanedCategories as Array<{
  name: string;
  originalId: string;
  slug: string;
  children: Array<{
    name: string;
    originalId: string;
    slug: string;
  }>;
}>;

// Products imported from transformed-products.json (scraped from MorphMarket API)
interface TransformedProduct {
  title: string;
  slug: string;
  description: string;
  images: string[];
  startPrice: number;
  currentPrice: number;
  bidStep: number;
  buyNowPrice: number | null;
  startTime: string;
  endTime: string;
  autoExtend: boolean;
  extensionTriggerTime: number;
  extensionDuration: number;
  status: string;
  isActive: boolean;
  allowNewBidders: boolean;
  viewCount: number;
  categorySlug: string;
  _isAuction: boolean;
  _bidCount: number;
  _storeName: string;
}

const morphMarketProducts =
  transformedProducts as unknown as TransformedProduct[];

const mockUsers = [
  {
    originalId: 'user-1',
    email: 'admin@morphee.com',
    fullName: 'Morphee Admin',
    role: 'ADMIN',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    address: '123 Reptile Way, Miami, FL 33101',
    rating: 150,
    ratingCount: 152,
  },
  {
    originalId: 'user-2',
    email: 'breeder@morphee.com',
    fullName: 'John Reptiles',
    role: 'SELLER',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=seller',
    address: '456 Python Lane, Tampa, FL 33602',
    rating: 4.8,
    ratingCount: 92,
  },
  {
    originalId: 'user-3',
    email: 'buyer@morphee.com',
    fullName: 'Sarah Chen',
    role: 'BIDDER',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bidder',
    address: '789 Gecko Street, Orlando, FL 32801',
    rating: 4.9,
    ratingCount: 26,
  },
  // Additional bidders for diverse bid history
  {
    originalId: 'user-4',
    email: 'collector@morphee.com',
    fullName: 'Mike Thompson',
    role: 'BIDDER',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=collector',
    address: '321 Scale Ave, Houston, TX 77001',
    rating: 4.7,
    ratingCount: 45,
  },
  {
    originalId: 'user-5',
    email: 'hobbyist@morphee.com',
    fullName: 'Emily Rodriguez',
    role: 'BIDDER',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hobbyist',
    address: '555 Morph Blvd, Phoenix, AZ 85001',
    rating: 4.6,
    ratingCount: 18,
  },
  {
    originalId: 'user-6',
    email: 'newbie@morphee.com',
    fullName: 'David Kim',
    role: 'BIDDER',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=newbie',
    address: '777 Reptile Road, Seattle, WA 98101',
    rating: 5.0,
    ratingCount: 8,
  },
];

// Helper to get dates relative to now
const getFutureDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};
const getPastDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const mockQuestions = [
  {
    originalId: 'q-1',
    productIndex: 0, // Will use first product
    askerId: 'user-3',
    content: 'Is this animal eating well? Any feeding issues?',
    createdAt: getPastDate(2),
    answer: {
      content: 'Yes, excellent feeder! Takes food without any issues.',
      createdAt: getPastDate(1.5),
      answererId: 'user-2',
    },
  },
  {
    originalId: 'q-2',
    productIndex: 0,
    askerId: 'user-4',
    content: 'Can you ship to California?',
    createdAt: getPastDate(1),
    answer: {
      content:
        'Yes, I ship to all 48 continental states via FedEx Priority Overnight.',
      createdAt: getPastDate(0.5),
      answererId: 'user-2',
    },
  },
];

const mockRatings = [
  {
    originalId: 'rating-1',
    fromUserId: 'user-2',
    toUserId: 'user-3',
    score: 1,
    comment: 'Great buyer! Fast payment and excellent communication.',
    createdAt: getPastDate(15),
  },
  {
    originalId: 'rating-2',
    fromUserId: 'user-3',
    toUserId: 'user-2',
    score: 1,
    comment: 'Amazing seller! Animal arrived healthy and exactly as described.',
    createdAt: getPastDate(10),
  },
];

// Generate bids for a product (min 5 bids per requirement 8.2)
function generateBidsForProduct(
  productId: string,
  startPrice: number,
  currentPrice: number,
  bidStep: number,
  bidderIds: string[],
): Array<{
  productId: string;
  bidderId: string;
  amount: number;
  createdAt: Date;
}> {
  const bids: Array<{
    productId: string;
    bidderId: string;
    amount: number;
    createdAt: Date;
  }> = [];

  // Generate 5-8 bids per product
  const numBids = Math.floor(Math.random() * 4) + 5; // 5-8 bids
  let currentBidAmount = startPrice;

  for (let i = 0; i < numBids; i++) {
    // Select random bidder
    const bidderId = bidderIds[Math.floor(Math.random() * bidderIds.length)];

    // Increase bid amount
    currentBidAmount += bidStep;

    // Don't exceed current price (last bid should be currentPrice)
    if (i === numBids - 1) {
      currentBidAmount = currentPrice;
    } else if (currentBidAmount >= currentPrice) {
      currentBidAmount = currentPrice - bidStep * (numBids - 1 - i);
    }

    bids.push({
      productId,
      bidderId,
      amount: Math.max(startPrice, currentBidAmount),
      createdAt: getPastDate((numBids - i) * 0.5), // Spread bids over time
    });
  }

  return bids;
}

// --- SEED EXECUTION ---

async function main() {
  console.log('🌱 Starting MorphMarket product seed...');

  // 1. Clear existing data
  console.log('🧹 Clearing existing data...');
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"public"."${name}"`)
    .join(', ');

  if (tables.length > 0) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    } catch (error) {
      console.log('Error truncating tables: ', error);
    }
  }

  // Mappings to store new DB IDs
  const userMap = new Map<string, string>(); // originalId -> dbId
  const categoryMap = new Map<string, string>(); // slug -> dbId
  const productIds: string[] = []; // Store product IDs for questions

  // 2. Seed Users
  console.log('👤 Creating users...');
  const bidderIds: string[] = [];

  for (const user of mockUsers) {
    const passwordHash = await bcrypt.hash('password123', 10);
    const createdUser = await prisma.user.create({
      data: {
        email: user.email,
        name: user.fullName,
        password: passwordHash,
        role: user.role as any,
        avatar: user.avatar,
        address: user.address,
        rating: user.rating,
        ratingCount: user.ratingCount,
        emailVerified: true,
      },
    });
    userMap.set(user.originalId, createdUser.id);

    // Collect bidder IDs for bid generation
    if (user.role === 'BIDDER') {
      bidderIds.push(createdUser.id);
    }
  }

  const sellerId = userMap.get('user-2')!; // Main seller

  // 3. Seed Categories
  console.log('📂 Creating categories...');
  for (const cat of mockCategories) {
    const parent = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        description: `${cat.name} and related species`,
      },
    });
    categoryMap.set(cat.slug, parent.id);

    if (cat.children) {
      for (const child of cat.children) {
        const sub = await prisma.category.create({
          data: {
            name: child.name,
            slug: child.slug,
            parentId: parent.id,
            description: `${child.name} - ${cat.name}`,
          },
        });
        categoryMap.set(child.slug, sub.id);
      }
    }
  }

  // 4. Seed Products from MorphMarket data
  console.log('📦 Creating products from MorphMarket data...');
  let productsCreated = 0;
  let bidsCreated = 0;

  for (const prod of morphMarketProducts) {
    const categoryId = categoryMap.get(prod.categorySlug);

    if (!categoryId) {
      console.warn(
        `Skipping product ${prod.title}: Category ${prod.categorySlug} not found`,
      );
      continue;
    }

    try {
      const createdProd = await prisma.product.create({
        data: {
          title: prod.title,
          slug: prod.slug,
          description: prod.description,
          images: prod.images,
          startPrice: prod.startPrice,
          currentPrice: prod.currentPrice,
          bidStep: prod.bidStep,
          buyNowPrice: prod.buyNowPrice || undefined,
          startTime: new Date(prod.startTime),
          endTime: new Date(prod.endTime),
          sellerId: sellerId,
          categoryId: categoryId,
          autoExtend: prod.autoExtend,
          extensionTriggerTime: prod.extensionTriggerTime,
          extensionDuration: prod.extensionDuration,
          viewCount: prod.viewCount,
          status: 'ACTIVE',
          isActive: true,
          allowNewBidders: true,
        },
      });

      productIds.push(createdProd.id);
      productsCreated++;

      // Generate bids for this product (min 5 per requirement)
      const bids = generateBidsForProduct(
        createdProd.id,
        prod.startPrice,
        prod.currentPrice,
        prod.bidStep,
        bidderIds,
      );

      for (const bid of bids) {
        await prisma.bid.create({
          data: {
            productId: bid.productId,
            bidderId: bid.bidderId,
            amount: bid.amount,
            createdAt: bid.createdAt,
          },
        });
        bidsCreated++;
      }
    } catch (error: any) {
      console.warn(`Error creating product ${prod.slug}: ${error.message}`);
    }
  }

  // 5. Seed Questions & Answers (on first few products)
  console.log('❓ Creating Q&A...');
  for (const q of mockQuestions) {
    const productId = productIds[q.productIndex];
    const askerId = userMap.get(q.askerId);

    if (!productId || !askerId) continue;

    const createdQ = await prisma.question.create({
      data: {
        productId,
        askerId,
        question: q.content,
        createdAt: q.createdAt,
      },
    });

    if (q.answer) {
      const answererId = userMap.get(q.answer.answererId!);
      if (answererId) {
        await prisma.answer.create({
          data: {
            questionId: createdQ.id,
            answerId: answererId,
            answer: q.answer.content,
            createdAt: q.answer.createdAt,
          },
        });
      }
    }
  }

  // 6. Seed Ratings
  console.log('⭐ Creating ratings...');
  for (const r of mockRatings) {
    const fromId = userMap.get(r.fromUserId);
    const toId = userMap.get(r.toUserId);

    if (!fromId || !toId) continue;

    await prisma.rating.create({
      data: {
        giverId: fromId,
        receiverId: toId,
        rating: r.score > 0 ? 1 : -1,
        comment: r.comment,
        createdAt: r.createdAt,
      },
    });
  }

  console.log('✅ MorphMarket Seed completed successfully!');
  console.log(`
  🎉 **Created:**
  - ${mockUsers.length} users (including ${bidderIds.length} bidders)
  - ${mockCategories.length} main categories + subcategories
  - ${productsCreated} products from MorphMarket
  - ${bidsCreated} bids (5-8 per product)
  - ${mockQuestions.length} Q&As
  - ${mockRatings.length} ratings
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
