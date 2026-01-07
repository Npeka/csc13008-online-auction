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

// Generate auto-bids for a product (automatic bidding system)
function generateAutoBidsForProduct(
  productId: string,
  startPrice: number,
  currentPrice: number,
  bidStep: number,
  bidderIds: string[],
): Array<{
  productId: string;
  bidderId: string;
  maxAmount: number;
  currentAmount: number;
  createdAt: Date;
}> {
  const autoBids: Array<{
    productId: string;
    bidderId: string;
    maxAmount: number;
    currentAmount: number;
    createdAt: Date;
  }> = [];

  // Generate 3-5 auto-bids per product
  const numBidders = Math.floor(Math.random() * 3) + 3; // 3-5 bidders
  let currentBidAmount = startPrice;

  // Shuffle bidders to get random selection
  const shuffledBidders = [...bidderIds].sort(() => Math.random() - 0.5);
  const selectedBidders = shuffledBidders.slice(0, numBidders);

  for (let i = 0; i < selectedBidders.length; i++) {
    const bidderId = selectedBidders[i];

    // Each bidder sets a max amount higher than current
    const maxAmount = currentPrice + bidStep * (numBidders - i) * 2;

    // Current amount is what they're actually bidding now
    currentBidAmount =
      i === selectedBidders.length - 1
        ? currentPrice
        : startPrice + bidStep * (i + 1);

    autoBids.push({
      productId,
      bidderId,
      maxAmount,
      currentAmount: currentBidAmount,
      createdAt: getPastDate((numBidders - i) * 0.3),
    });
  }

  return autoBids;
}

// Placeholder images from Unsplash (reptile/nature themed)
const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1513039763578-cf2c1c5f8750?q=80&w=788&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Snake 1
  'https://media.istockphoto.com/id/1481995188/photo/common-indian-color-changing-lizard-in-close-up.webp?a=1&s=612x612&w=0&k=20&c=NMEibUd9MQ26a_5WX9bc_QUQPjQitS6yejgaxHqAMlA=', // Snake 2
  'https://media.istockphoto.com/id/2252556809/photo/exotic-reptiles-in-terrarium-close-up-portraits.webp?a=1&s=612x612&w=0&k=20&c=96MMYDRRIxdqikMEN374PLX_R6JLXybECVyC5xuNdLk=', // Reptile 1
  'https://media.istockphoto.com/id/1459292558/photo/vertical-closeup-shot-of-a-plumed-basilisk-on-a-blurred-background.webp?a=1&s=612x612&w=0&k=20&c=iB2WzY92zp4ZhQzMeLRbOJLsnALWi-WYJ4OKS2duRLA=', // Reptile 2
  'https://images.unsplash.com/photo-1654751894619-1a1100af4b5e?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDV8fHxlbnwwfHx8fHw%3D', // Lizard 1
  'https://images.unsplash.com/photo-1615443593287-42c34cecd53d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE0fHx8ZW58MHx8fHx8', // Lizard 2
  'https://images.unsplash.com/photo-1718537299306-def3114d5ae9?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDIyfHx8ZW58MHx8fHx8', // Boa 1
  'https://images.unsplash.com/photo-1713871820252-61f309c64628?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDI1fHx8ZW58MHx8fHx8', // Boa 2
  'https://images.unsplash.com/photo-1697054405957-ae0cfc3194be?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE1fHx8ZW58MHx8fHx8', // Python 1
];

// Ensure product has exactly 3 images
function ensureThreeImages(images: string[]): string[] {
  const validImages = images.filter((img) => img && img.trim() !== '');

  // If we have 3 or more valid images, return first 3
  if (validImages.length >= 3) {
    return validImages.slice(0, 3);
  }

  // If we have less than 3, pad with placeholders
  const result = [...validImages];
  while (result.length < 3) {
    // Use different placeholders for variety
    const placeholderIndex = result.length % PLACEHOLDER_IMAGES.length;
    result.push(PLACEHOLDER_IMAGES[placeholderIndex]);
  }

  return result;
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
  let autoBidsCreated = 0;
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
      // Generate auto-bids first to determine highest bidder
      const autoBids = generateAutoBidsForProduct(
        'temp', // Will update after product creation
        prod.startPrice,
        prod.currentPrice,
        prod.bidStep,
        bidderIds,
      );

      // Highest bidder is the one with currentAmount = currentPrice
      const highestBidder = autoBids.find(
        (ab) => ab.currentAmount === prod.currentPrice,
      );

      const createdProd = await prisma.product.create({
        data: {
          title: prod.title,
          slug: prod.slug,
          description: prod.description,
          images: ensureThreeImages(prod.images),
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
          highestBidderId: highestBidder?.bidderId,
        },
      });

      productIds.push(createdProd.id);
      productsCreated++;

      // Create auto-bids for this product
      for (const autoBid of autoBids) {
        await prisma.autoBid.create({
          data: {
            productId: createdProd.id,
            userId: autoBid.bidderId,
            maxAmount: autoBid.maxAmount,
            createdAt: autoBid.createdAt,
          },
        });
        autoBidsCreated++;
      }

      // Create actual bid history by simulating proxy bidding progression
      // Sort auto-bids chronologically (order they were placed)
      const sortedAutoBids = [...autoBids].sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      );

      let currentLeader: {
        bidderId: string;
        maxAmount: number;
        currentBid: number;
      } | null = null;

      for (const autoBid of sortedAutoBids) {
        if (!currentLeader) {
          // First bidder - bid at start price
          await prisma.bid.create({
            data: {
              productId: createdProd.id,
              bidderId: autoBid.bidderId,
              amount: prod.startPrice,
              isValid: true,
              createdAt: autoBid.createdAt,
            },
          });
          bidsCreated++;

          currentLeader = {
            bidderId: autoBid.bidderId,
            maxAmount: autoBid.maxAmount,
            currentBid: prod.startPrice,
          };
        } else {
          // New challenger enters
          const minToWin = currentLeader.currentBid + prod.bidStep;

          if (autoBid.maxAmount >= minToWin) {
            // Challenger can compete
            if (autoBid.maxAmount > currentLeader.maxAmount) {
              // Challenger has higher max - they win
              // Price goes to current leader's max (or just above it)
              const newPrice = Math.min(
                currentLeader.maxAmount + prod.bidStep,
                autoBid.maxAmount,
              );

              await prisma.bid.create({
                data: {
                  productId: createdProd.id,
                  bidderId: autoBid.bidderId,
                  amount: newPrice,
                  isValid: true,
                  createdAt: autoBid.createdAt,
                },
              });
              bidsCreated++;

              currentLeader = {
                bidderId: autoBid.bidderId,
                maxAmount: autoBid.maxAmount,
                currentBid: newPrice,
              };
            } else if (autoBid.maxAmount < currentLeader.maxAmount) {
              // Challenger has lower max - current leader defends
              // Price goes to challenger's max (or slightly above)
              const newPrice = Math.min(
                autoBid.maxAmount + prod.bidStep,
                currentLeader.maxAmount,
              );

              await prisma.bid.create({
                data: {
                  productId: createdProd.id,
                  bidderId: currentLeader.bidderId,
                  amount: newPrice,
                  isValid: true,
                  createdAt: autoBid.createdAt,
                },
              });
              bidsCreated++;

              currentLeader.currentBid = newPrice;
            } else {
              // Tie - first bidder (by timestamp) wins
              const newPrice = autoBid.maxAmount;

              await prisma.bid.create({
                data: {
                  productId: createdProd.id,
                  bidderId: currentLeader.bidderId,
                  amount: newPrice,
                  isValid: true,
                  createdAt: autoBid.createdAt,
                },
              });
              bidsCreated++;

              currentLeader.currentBid = newPrice;
            }
          }
          // If challenger's max is too low, they don't create a bid at all
        }
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

  // 6. Seed System Config
  console.log('⚙️ Seeding System Config...');
  await prisma.systemConfig.upsert({
    where: { key: 'AUCTION_EXTENSION_TRIGGER_MINUTES' },
    update: {},
    create: { key: 'AUCTION_EXTENSION_TRIGGER_MINUTES', value: '5' },
  });
  await prisma.systemConfig.upsert({
    where: { key: 'AUCTION_EXTENSION_DURATION_MINUTES' },
    update: {},
    create: { key: 'AUCTION_EXTENSION_DURATION_MINUTES', value: '10' },
  });

  // 7. Seed Ratings (additional standalone ratings)
  console.log('⭐ Creating additional ratings...');
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
  - ${productsCreated} active products from MorphMarket
  - ${autoBidsCreated} auto-bids (3-5 per product)
  - ${bidsCreated} actual bids (bid history)
  - ${mockQuestions.length} Q&As
  - ${mockRatings.length} standalone ratings
  - System configuration initialized
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
