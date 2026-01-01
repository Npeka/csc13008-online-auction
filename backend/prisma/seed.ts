import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// --- MOCK DATA SOURCE (Adapted from frontend/src/data/mock.ts) ---

const mockUsers = [
  {
    originalId: 'user-1',
    email: 'admin@morphee.com',
    fullName: 'Morphee Admin',
    role: 'ADMIN',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    address: '123 Reptile Way, Miami, FL 33101',
    rating: 150, // Simplified score
    ratingCount: 152,
  },
  {
    originalId: 'user-2',
    email: 'breeder@morphee.com',
    fullName: 'John Reptiles',
    role: 'SELLER',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=seller',
    address: '456 Python Lane, Tampa, FL 33602',
    rating: 4.8, // Simplified score
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
];

const mockCategories = [
  {
    originalId: 'ball-pythons',
    name: 'Ball Pythons',
    slug: 'ball-pythons',
    description: 'Ball Pythons morphs and regular',
    children: [
      { originalId: 'bp-normal', name: 'Normal', slug: 'bp-normal' },
      { originalId: 'bp-pastel', name: 'Pastel', slug: 'bp-pastel' },
      { originalId: 'bp-piebald', name: 'Piebald', slug: 'bp-piebald' },
      { originalId: 'bp-banana', name: 'Banana', slug: 'bp-banana' },
      { originalId: 'bp-clown', name: 'Clown', slug: 'bp-clown' },
      { originalId: 'bp-spider', name: 'Spider', slug: 'bp-spider' },
    ],
  },
  {
    originalId: 'leopard-geckos',
    name: 'Leopard Geckos',
    slug: 'leopard-geckos',
    description: 'Leopard Geckos morphs',
    children: [
      { originalId: 'lg-normal', name: 'Normal', slug: 'lg-normal' },
      { originalId: 'lg-tangerine', name: 'Tangerine', slug: 'lg-tangerine' },
      { originalId: 'lg-mack-snow', name: 'Mack Snow', slug: 'lg-mack-snow' },
      {
        originalId: 'lg-super-giant',
        name: 'Super Giant',
        slug: 'lg-super-giant',
      },
    ],
  },
  {
    originalId: 'crested-geckos',
    name: 'Crested Geckos',
    slug: 'crested-geckos',
    description: 'Crested Geckos morphs',
    children: [
      { originalId: 'cg-harlequin', name: 'Harlequin', slug: 'cg-harlequin' },
      { originalId: 'cg-dalmatian', name: 'Dalmatian', slug: 'cg-dalmatian' },
      { originalId: 'cg-flame', name: 'Flame', slug: 'cg-flame' },
      {
        originalId: 'cg-lilly-white',
        name: 'Lilly White',
        slug: 'cg-lilly-white',
      },
    ],
  },
  {
    originalId: 'bearded-dragons',
    name: 'Bearded Dragons',
    slug: 'bearded-dragons',
    description: 'Bearded Dragons morphs',
    children: [
      { originalId: 'bd-normal', name: 'Normal', slug: 'bd-normal' },
      { originalId: 'bd-citrus', name: 'Citrus', slug: 'bd-citrus' },
      { originalId: 'bd-red', name: 'Red/Orange', slug: 'bd-red-orange' },
      { originalId: 'bd-zero', name: 'Zero', slug: 'bd-zero' },
    ],
  },
  {
    originalId: 'boas',
    name: 'Boas',
    slug: 'boas',
    description: 'Boas morphs',
    children: [
      { originalId: 'boa-bci', name: 'BCI', slug: 'boa-bci' },
      { originalId: 'boa-bcc', name: 'BCC', slug: 'boa-bcc' },
      { originalId: 'boa-dwarf', name: 'Dwarf', slug: 'boa-dwarf' },
    ],
  },
  {
    originalId: 'corn-snakes',
    name: 'Corn Snakes',
    slug: 'corn-snakes',
    description: 'Corn Snakes morphs',
    children: [
      { originalId: 'cs-normal', name: 'Normal', slug: 'cs-normal' },
      {
        originalId: 'cs-amelanistic',
        name: 'Amelanistic',
        slug: 'cs-amelanistic',
      },
      { originalId: 'cs-snow', name: 'Snow', slug: 'cs-snow' },
      { originalId: 'cs-bloodred', name: 'Bloodred', slug: 'cs-bloodred' },
    ],
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

const mockProducts = [
  {
    originalId: 'prod-1',
    name: 'Banana Pied Ball Python - Male, 450g',
    slug: 'banana-pied-ball-python-male',
    description: `
      <h3>Stunning Banana Piebald Ball Python</h3>
      <p>This gorgeous male Banana Piebald Ball Python is a must-have for any serious collection. High white piebald pattern with beautiful banana coloring throughout.</p>
      <ul>
        <li><strong>Morph:</strong> Banana Piebald</li>
        <li><strong>Sex:</strong> Male (proven)</li>
        <li><strong>Weight:</strong> 450g</li>
        <li><strong>Hatched:</strong> June 2024</li>
        <li><strong>Feeding:</strong> F/T rats, excellent feeder</li>
        <li><strong>Genetics:</strong> 100% Het Clown possible</li>
      </ul>
      <p>Parents are on-site and can provide lineage photos upon request. Shipping available via FedEx Priority Overnight.</p>
    `,
    categoryId: 'bp-banana',
    sellerId: 'user-2',
    startingPrice: 800,
    currentPrice: 1250,
    stepPrice: 50,
    buyNowPrice: 1800,
    startTime: getPastDate(5),
    endTime: getFutureDate(2),
    images: [
      'https://images.unsplash.com/photo-1531386151447-fd76ad50012f?w=800',
      'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800',
    ],
    highlight: true,
  },
  {
    originalId: 'prod-2',
    name: 'Super Giant Tremper Leopard Gecko - Female',
    slug: 'super-giant-tremper-leopard-gecko',
    description: `
      <h3>Breeding Quality Super Giant Leopard Gecko</h3>
      <p>Beautiful Super Giant Tremper Albino female leopard gecko. Perfect for breeding projects!</p>
      <ul>
        <li><strong>Morph:</strong> Super Giant Tremper Albino</li>
        <li><strong>Sex:</strong> Female</li>
        <li><strong>Weight:</strong> 95g</li>
        <li><strong>Age:</strong> 2 years</li>
        <li><strong>Proven:</strong> Yes, produced 2 clutches</li>
      </ul>
    `,
    categoryId: 'lg-super-giant',
    sellerId: 'user-2',
    startingPrice: 250,
    currentPrice: 380,
    stepPrice: 25,
    buyNowPrice: 500,
    startTime: getPastDate(3),
    endTime: getFutureDate(1),
    images: [
      'https://images.unsplash.com/photo-1597517697687-acc0c17b2603?w=800',
    ],
    highlight: false,
  },
  {
    originalId: 'prod-3',
    name: 'Lilly White Crested Gecko - Extreme Harlequin',
    slug: 'lilly-white-crested-gecko-extreme',
    description: `
      <h3>Rare Lilly White Crested Gecko</h3>
      <p>Exceptional Lilly White with extreme harlequin patterning. One of the nicest we've produced this season.</p>
      <ul>
        <li><strong>Morph:</strong> Lilly White Extreme Harlequin</li>
        <li><strong>Sex:</strong> Unsexed (too young)</li>
        <li><strong>Weight:</strong> 8g</li>
        <li><strong>Hatched:</strong> September 2024</li>
        <li><strong>Feeding:</strong> Pangea, excellent eater</li>
      </ul>
    `,
    categoryId: 'cg-lilly-white',
    sellerId: 'user-2',
    startingPrice: 400,
    currentPrice: 650,
    stepPrice: 25,
    buyNowPrice: 900,
    startTime: getPastDate(4),
    endTime: getFutureDate(0.5),
    images: [
      'https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?w=800',
    ],
    highlight: true,
  },
  {
    originalId: 'prod-4',
    name: 'Red/Orange Hypo Bearded Dragon - Adult Male',
    slug: 'red-orange-hypo-bearded-dragon',
    description: `
      <h3>Vibrant Red Hypo Bearded Dragon</h3>
      <p>This stunning hypomelanistic bearded dragon displays incredible red and orange coloring. Great temperament, hand-tamed.</p>
      <ul>
        <li><strong>Morph:</strong> Red Hypo Translucent</li>
        <li><strong>Sex:</strong> Male</li>
        <li><strong>Age:</strong> 18 months</li>
        <li><strong>Length:</strong> 20 inches</li>
        <li><strong>Temperament:</strong> Extremely docile</li>
      </ul>
    `,
    categoryId: 'bd-red',
    sellerId: 'user-2',
    startingPrice: 300,
    currentPrice: 450,
    stepPrice: 25,
    buyNowPrice: null, // No buy now
    startTime: getPastDate(2),
    endTime: getFutureDate(3),
    images: [
      'https://images.unsplash.com/photo-1598449356475-b9f71db7d847?w=800',
    ],
    highlight: false,
  },
  {
    originalId: 'prod-5',
    name: 'Clown Ball Python - Female, 1200g Breeder',
    slug: 'clown-ball-python-female-breeder',
    description: `
      <h3>Proven Clown Ball Python Female</h3>
      <p>Exceptional female Clown ready for the 2025 breeding season. Has produced beautiful offspring.</p>
      <ul>
        <li><strong>Morph:</strong> Clown</li>
        <li><strong>Sex:</strong> Female (proven)</li>
        <li><strong>Weight:</strong> 1200g</li>
        <li><strong>Age:</strong> 4 years</li>
        <li><strong>Proven:</strong> 3 successful clutches</li>
      </ul>
    `,
    categoryId: 'bp-clown',
    sellerId: 'user-2',
    startingPrice: 1500,
    currentPrice: 2100,
    stepPrice: 100,
    buyNowPrice: 2800,
    startTime: getPastDate(6),
    endTime: getFutureDate(4),
    images: [
      'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800',
    ],
    highlight: true,
  },
  {
    originalId: 'prod-6',
    name: 'Central American Boa - BCI Het Albino',
    slug: 'central-american-boa-bci-het-albino',
    description: `
      <h3>Beautiful BCI Boa with Albino Genetics</h3>
      <p>Well-started BCI with proven het albino genetics. Calm temperament, great feeder.</p>
      <ul>
        <li><strong>Species:</strong> Boa constrictor imperator</li>
        <li><strong>Genetics:</strong> Het Albino (Kahl line)</li>
        <li><strong>Sex:</strong> Female</li>
        <li><strong>Length:</strong> 3 feet</li>
        <li><strong>Feeding:</strong> F/T medium rats</li>
      </ul>
    `,
    categoryId: 'boa-bci',
    sellerId: 'user-2',
    startingPrice: 350,
    currentPrice: 480,
    stepPrice: 25,
    buyNowPrice: null,
    startTime: getPastDate(1),
    endTime: getFutureDate(5),
    images: [
      'https://images.unsplash.com/photo-1531386151447-fd76ad50012f?w=800',
    ],
    highlight: false,
  },
  {
    originalId: 'prod-7',
    name: 'Scaleless Corn Snake - Tessera Pattern',
    slug: 'scaleless-corn-snake-tessera',
    description: `
      <h3>Unique Scaleless Corn Snake</h3>
      <p>Rare scaleless corn snake with stunning tessera pattern. A true conversation piece!</p>
      <ul>
        <li><strong>Morph:</strong> Scaleless Tessera</li>
        <li><strong>Sex:</strong> Male</li>
        <li><strong>Age:</strong> 1 year</li>
        <li><strong>Length:</strong> 24 inches</li>
        <li><strong>Feeding:</strong> F/T mice</li>
      </ul>
    `,
    categoryId: 'cs-normal',
    sellerId: 'user-2',
    startingPrice: 200,
    currentPrice: 320,
    stepPrice: 20,
    buyNowPrice: null,
    startTime: getPastDate(3),
    endTime: getFutureDate(1.5),
    images: [
      'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800',
    ],
    highlight: false,
  },
  {
    originalId: 'prod-8',
    name: 'Piebald Ball Python - High White 80%',
    slug: 'piebald-ball-python-high-white',
    description: `
      <h3>High White Piebald Ball Python</h3>
      <p>Exceptional high white piebald with approximately 80% white coverage. A stunning display animal!</p>
      <ul>
        <li><strong>Morph:</strong> Piebald (High White)</li>
        <li><strong>Sex:</strong> Female</li>
        <li><strong>Weight:</strong> 850g</li>
        <li><strong>White Coverage:</strong> ~80%</li>
        <li><strong>Feeding:</strong> F/T rats</li>
      </ul>
    `,
    categoryId: 'bp-piebald',
    sellerId: 'user-2',
    startingPrice: 2000,
    currentPrice: 3200,
    stepPrice: 100,
    buyNowPrice: 4500,
    startTime: getPastDate(7),
    endTime: getFutureDate(0.25),
    images: [
      'https://images.unsplash.com/photo-1531386151447-fd76ad50012f?w=800',
    ],
    highlight: true,
  },
];

const mockBids = [
  {
    originalId: 'bid-1',
    productId: 'prod-1',
    bidderId: 'user-3',
    amount: 1250,
    createdAt: getPastDate(0.1),
  },
  {
    originalId: 'bid-2',
    productId: 'prod-1',
    bidderId: 'user-3',
    amount: 1150,
    createdAt: getPastDate(0.5),
  },
  {
    originalId: 'bid-3',
    productId: 'prod-1',
    bidderId: 'user-3',
    amount: 1000,
    createdAt: getPastDate(1),
  },
];

const mockQuestions = [
  {
    originalId: 'q-1',
    productId: 'prod-1',
    askerId: 'user-3',
    content: 'Is this snake eating live or frozen/thawed? Any feeding issues?',
    createdAt: getPastDate(2),
    answer: {
      content:
        'He takes frozen/thawed rats without any issues. Never refused a meal since I got him. Very reliable feeder!',
      createdAt: getPastDate(1.5),
      answererId: 'user-2',
    },
  },
  {
    originalId: 'q-2',
    productId: 'prod-1',
    askerId: 'user-3',
    content: 'Can you ship to California?',
    createdAt: getPastDate(1),
    answer: {
      content:
        'Yes, I ship to all 48 continental states via FedEx Priority Overnight. California shipping is available!',
      createdAt: getPastDate(0.5),
      answererId: 'user-2',
    },
  },
];

const mockRatings = [
  {
    originalId: 'rating-1',
    fromUserId: 'user-2', // Seller
    toUserId: 'user-3', // Buyer
    score: 1,
    comment:
      'Great buyer! Fast payment and excellent communication. Would definitely sell to again.',
    createdAt: getPastDate(15),
  },
  {
    originalId: 'rating-3',
    fromUserId: 'user-3', // Buyer
    toUserId: 'user-2', // Seller
    score: 1,
    comment:
      'Amazing seller! The Ball Python arrived healthy and exactly as described. Packaging was excellent.',
    createdAt: getPastDate(10),
  },
];

// --- SEED EXECUTION ---

async function main() {
  console.log('🌱 Starting new reptile seed...');

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
  const categoryMap = new Map<string, string>(); // originalId -> dbId
  const productMap = new Map<string, string>(); // originalId -> dbId

  // 2. Seed Users
  console.log('👤 Creating users from mock data...');
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
  }

  // 3. Seed Categories
  console.log('📂 Creating categories from mock data...');
  for (const cat of mockCategories) {
    // Create parent category
    const parent = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
      },
    });
    categoryMap.set(cat.originalId, parent.id);

    // Create children
    if (cat.children) {
      for (const child of cat.children) {
        const sub = await prisma.category.create({
          data: {
            name: child.name,
            slug: child.slug,
            parentId: parent.id,
            description: `${child.name} morph of ${cat.name}`,
          },
        });
        categoryMap.set(child.originalId, sub.id);
      }
    }
  }

  // 4. Seed Products
  console.log('📦 Creating products from mock data...');
  for (const prod of mockProducts) {
    const sellerId = userMap.get(prod.sellerId);
    const categoryId = categoryMap.get(prod.categoryId);

    if (!sellerId || !categoryId) {
      console.warn(
        `Skipping product ${prod.name}: Missing seller or category match.`,
      );
      continue;
    }

    const createdProd = await prisma.product.create({
      data: {
        title: prod.name,
        slug: prod.slug,
        description: prod.description,
        images: prod.images,
        startPrice: prod.startingPrice,
        currentPrice: prod.currentPrice,
        bidStep: prod.stepPrice,
        buyNowPrice: prod.buyNowPrice || undefined,
        startTime: prod.startTime,
        endTime: prod.endTime,
        sellerId: sellerId,
        categoryId: categoryId,
        autoExtend: true,
        // Mock data doesn't have isFeatured directly on schema usually, but we can set it if schema supports it
        // Or assume business logic handles it.
      },
    });
    productMap.set(prod.originalId, createdProd.id);
  }

  // 5. Seed Bids
  console.log('💰 Creating bids from mock data...');
  for (const bid of mockBids) {
    const productId = productMap.get(bid.productId);
    const bidderId = userMap.get(bid.bidderId);

    if (!productId || !bidderId) continue;

    await prisma.bid.create({
      data: {
        productId,
        bidderId,
        amount: bid.amount,
        createdAt: bid.createdAt,
      },
    });
  }

  // 6. Seed Questions & Answers
  console.log('❓ Creating Q&A from mock data...');
  for (const q of mockQuestions) {
    const productId = productMap.get(q.productId);
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

  // 7. Seed Ratings
  console.log('⭐ Creating ratings from mock data...');
  for (const r of mockRatings) {
    const fromId = userMap.get(r.fromUserId);
    const toId = userMap.get(r.toUserId);

    if (!fromId || !toId) continue;

    await prisma.rating.create({
      data: {
        giverId: fromId,
        receiverId: toId,
        rating: r.score > 0 ? 1 : -1, // Schema might expect int?
        comment: r.comment,
        createdAt: r.createdAt,
      },
    });
  }

  console.log('✅ New Reptile Seed completed successfully!');
  console.log(`
  🎉 **Created:**
  - ${mockUsers.length} users
  - ${mockCategories.length} main categories
  - ${mockProducts.length} products
  - ${mockBids.length} bids
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
