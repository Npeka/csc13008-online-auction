import type { Bid, Category, Product, Question, Rating, User } from "@/types";

// Mock Users
export const mockUsers: User[] = [
  {
    id: "user-1",
    email: "admin@morphee.com",
    fullName: "Morphee Admin",
    role: "ADMIN",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
    address: "123 Reptile Way, Miami, FL 33101",
    rating: { positive: 150, negative: 2, total: 152 },
    createdAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "user-2",
    email: "breeder@morphee.com",
    fullName: "John Reptiles",
    role: "SELLER",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=seller",
    address: "456 Python Lane, Tampa, FL 33602",
    rating: { positive: 89, negative: 3, total: 92 },
    createdAt: "2023-03-15T00:00:00Z",
  },
  {
    id: "user-3",
    email: "buyer@morphee.com",
    fullName: "Sarah Chen",
    role: "BIDDER",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bidder",
    address: "789 Gecko Street, Orlando, FL 32801",
    rating: { positive: 25, negative: 1, total: 26 },
    createdAt: "2024-01-10T00:00:00Z",
  },
];

// Reptile Categories (MorphMarket-inspired)
export const mockCategories: Category[] = [
  {
    id: "ball-pythons",
    name: "Ball Pythons",
    slug: "ball-pythons",
    icon: "Snake",
    productCount: 1250,
    children: [
      { id: "bp-normal", name: "Normal", slug: "normal", productCount: 150 },
      { id: "bp-pastel", name: "Pastel", slug: "pastel", productCount: 200 },
      { id: "bp-piebald", name: "Piebald", slug: "piebald", productCount: 180 },
      { id: "bp-banana", name: "Banana", slug: "banana", productCount: 220 },
      { id: "bp-clown", name: "Clown", slug: "clown", productCount: 150 },
      { id: "bp-spider", name: "Spider", slug: "spider", productCount: 100 },
    ],
  },
  {
    id: "leopard-geckos",
    name: "Leopard Geckos",
    slug: "leopard-geckos",
    icon: "Lizard",
    productCount: 820,
    children: [
      { id: "lg-normal", name: "Normal", slug: "normal", productCount: 120 },
      {
        id: "lg-tangerine",
        name: "Tangerine",
        slug: "tangerine",
        productCount: 180,
      },
      {
        id: "lg-mack-snow",
        name: "Mack Snow",
        slug: "mack-snow",
        productCount: 150,
      },
      {
        id: "lg-super-giant",
        name: "Super Giant",
        slug: "super-giant",
        productCount: 90,
      },
    ],
  },
  {
    id: "crested-geckos",
    name: "Crested Geckos",
    slug: "crested-geckos",
    icon: "Leaf",
    productCount: 650,
    children: [
      {
        id: "cg-harlequin",
        name: "Harlequin",
        slug: "harlequin",
        productCount: 180,
      },
      {
        id: "cg-dalmatian",
        name: "Dalmatian",
        slug: "dalmatian",
        productCount: 120,
      },
      { id: "cg-flame", name: "Flame", slug: "flame", productCount: 150 },
      {
        id: "cg-lilly-white",
        name: "Lilly White",
        slug: "lilly-white",
        productCount: 80,
      },
    ],
  },
  {
    id: "bearded-dragons",
    name: "Bearded Dragons",
    slug: "bearded-dragons",
    icon: "Sun",
    productCount: 480,
    children: [
      { id: "bd-normal", name: "Normal", slug: "normal", productCount: 100 },
      { id: "bd-citrus", name: "Citrus", slug: "citrus", productCount: 90 },
      {
        id: "bd-red",
        name: "Red/Orange",
        slug: "red-orange",
        productCount: 120,
      },
      { id: "bd-zero", name: "Zero", slug: "zero", productCount: 60 },
    ],
  },
  {
    id: "boas",
    name: "Boas",
    slug: "boas",
    icon: "Circle",
    productCount: 380,
    children: [
      { id: "boa-bci", name: "BCI", slug: "bci", productCount: 150 },
      { id: "boa-bcc", name: "BCC", slug: "bcc", productCount: 80 },
      { id: "boa-dwarf", name: "Dwarf", slug: "dwarf", productCount: 100 },
    ],
  },
  {
    id: "corn-snakes",
    name: "Corn Snakes",
    slug: "corn-snakes",
    icon: "Wheat",
    productCount: 420,
    children: [
      { id: "cs-normal", name: "Normal", slug: "normal", productCount: 80 },
      {
        id: "cs-amelanistic",
        name: "Amelanistic",
        slug: "amelanistic",
        productCount: 120,
      },
      { id: "cs-snow", name: "Snow", slug: "snow", productCount: 100 },
      {
        id: "cs-bloodred",
        name: "Bloodred",
        slug: "bloodred",
        productCount: 70,
      },
    ],
  },
];

// Helper to get future date
const getFutureDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

const getPastDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

// Mock Reptile Products
export const mockProducts: Product[] = [
  {
    id: "prod-1",
    name: "Banana Pied Ball Python - Male, 450g",
    title: "Banana Pied Ball Python - Male, 450g",
    slug: "banana-pied-ball-python-male",
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
    category: { id: "bp-banana", name: "Banana Ball Pythons", slug: "banana" },
    seller: {
      id: mockUsers[1].id,
      name: mockUsers[1].fullName,
      avatar: mockUsers[1].avatar,
      rating:
        typeof mockUsers[1].rating === "number" ? mockUsers[1].rating : 4.8,
      ratingCount: mockUsers[1].ratingCount || 92,
    },
    startPrice: 800,
    currentPrice: 1250,
    bidStep: 50,
    buyNowPrice: 1800,
    bidCount: 12,
    viewCount: 342,
    watchCount: 28,
    status: "ACTIVE" as const,
    startTime: getPastDate(5),
    endTime: getFutureDate(2),
    createdAt: getPastDate(5),
    images: [
      {
        id: "img-1",
        url: "https://images.unsplash.com/photo-1531386151447-fd76ad50012f?w=800",
        alt: "Banana Pied Ball Python",
      },
      {
        id: "img-2",
        url: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800",
        alt: "Ball Python closeup",
      },
    ],
    highestBidder: {
      id: mockUsers[2].id,
      name: mockUsers[2].fullName,
      avatar: mockUsers[2].avatar,
    },
    isFeatured: true,
    isNew: true,
  },
  {
    id: "prod-2",
    name: "Super Giant Tremper Leopard Gecko - Female",
    title: "Super Giant Tremper Leopard Gecko - Female",
    slug: "super-giant-tremper-leopard-gecko",
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
    category: {
      id: "lg-super-giant",
      name: "Super Giant",
      slug: "super-giant",
    },
    seller: {
      id: mockUsers[1].id,
      name: mockUsers[1].fullName,
      avatar: mockUsers[1].avatar,
      rating:
        typeof mockUsers[1].rating === "number" ? mockUsers[1].rating : 4.8,
      ratingCount: mockUsers[1].ratingCount || 92,
    },
    startPrice: 250,
    currentPrice: 380,
    bidStep: 25,
    buyNowPrice: 500,
    bidCount: 8,
    viewCount: 156,
    watchCount: 15,
    status: "ACTIVE" as const,
    startTime: getPastDate(3),
    endTime: getFutureDate(1),
    createdAt: getPastDate(3),
    images: [
      {
        id: "img-3",
        url: "https://images.unsplash.com/photo-1597517697687-acc0c17b2603?w=800",
        alt: "Leopard Gecko",
      },
    ],
    highestBidder: {
      id: mockUsers[2].id,
      name: mockUsers[2].fullName,
      avatar: mockUsers[2].avatar,
    },
    isFeatured: false,
    isNew: true,
  },
  {
    id: "prod-3",
    name: "Lilly White Crested Gecko - Extreme Harlequin",
    title: "Lilly White Crested Gecko - Extreme Harlequin",
    slug: "lilly-white-crested-gecko-extreme",
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
    category: {
      id: "cg-lilly-white",
      name: "Lilly White",
      slug: "lilly-white",
    },
    seller: {
      id: mockUsers[1].id,
      name: mockUsers[1].fullName,
      avatar: mockUsers[1].avatar,
      rating:
        typeof mockUsers[1].rating === "number" ? mockUsers[1].rating : 4.8,
      ratingCount: mockUsers[1].ratingCount || 92,
    },
    startPrice: 400,
    currentPrice: 650,
    bidStep: 25,
    buyNowPrice: 900,
    bidCount: 15,
    viewCount: 423,
    watchCount: 45,
    status: "ACTIVE" as const,
    startTime: getPastDate(4),
    endTime: getFutureDate(0.5),
    createdAt: getPastDate(4),
    images: [
      {
        id: "img-4",
        url: "https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?w=800",
        alt: "Crested Gecko",
      },
    ],
    highestBidder: {
      id: mockUsers[2].id,
      name: mockUsers[2].fullName,
      avatar: mockUsers[2].avatar,
    },
    isFeatured: true,
    isNew: false,
  },
  {
    id: "prod-4",
    name: "Red/Orange Hypo Bearded Dragon - Adult Male",
    title: "Red/Orange Hypo Bearded Dragon - Adult Male",
    slug: "red-orange-hypo-bearded-dragon",
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
    category: { id: "bd-red", name: "Red/Orange", slug: "red-orange" },
    seller: {
      id: mockUsers[1].id,
      name: mockUsers[1].fullName,
      avatar: mockUsers[1].avatar,
      rating:
        typeof mockUsers[1].rating === "number" ? mockUsers[1].rating : 4.8,
      ratingCount: mockUsers[1].ratingCount || 92,
    },
    startPrice: 300,
    currentPrice: 450,
    bidStep: 25,
    bidCount: 6,
    viewCount: 198,
    watchCount: 22,
    status: "ACTIVE" as const,
    startTime: getPastDate(2),
    endTime: getFutureDate(3),
    createdAt: getPastDate(2),
    images: [
      {
        id: "img-5",
        url: "https://images.unsplash.com/photo-1598449356475-b9f71db7d847?w=800",
        alt: "Bearded Dragon",
      },
    ],
    isFeatured: false,
    isNew: true,
  },
  {
    id: "prod-5",
    name: "Clown Ball Python - Female, 1200g Breeder",
    title: "Clown Ball Python - Female, 1200g Breeder",
    slug: "clown-ball-python-female-breeder",
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
    category: { id: "bp-clown", name: "Clown", slug: "clown" },
    seller: {
      id: mockUsers[1].id,
      name: mockUsers[1].fullName,
      avatar: mockUsers[1].avatar,
      rating:
        typeof mockUsers[1].rating === "number" ? mockUsers[1].rating : 4.8,
      ratingCount: mockUsers[1].ratingCount || 92,
    },
    startPrice: 1500,
    currentPrice: 2100,
    bidStep: 100,
    buyNowPrice: 2800,
    bidCount: 9,
    viewCount: 287,
    watchCount: 31,
    status: "ACTIVE" as const,
    startTime: getPastDate(6),
    endTime: getFutureDate(4),
    createdAt: getPastDate(6),
    images: [
      {
        id: "img-6",
        url: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800",
        alt: "Clown Ball Python",
      },
    ],
    highestBidder: {
      id: mockUsers[2].id,
      name: mockUsers[2].fullName,
      avatar: mockUsers[2].avatar,
    },
    isFeatured: true,
    isNew: false,
  },
  {
    id: "prod-6",
    name: "Central American Boa - BCI Het Albino",
    title: "Central American Boa - BCI Het Albino",
    slug: "central-american-boa-bci-het-albino",
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
    category: { id: "boa-bci", name: "BCI", slug: "bci" },
    seller: {
      id: mockUsers[1].id,
      name: mockUsers[1].fullName,
      avatar: mockUsers[1].avatar,
      rating:
        typeof mockUsers[1].rating === "number" ? mockUsers[1].rating : 4.8,
      ratingCount: mockUsers[1].ratingCount || 92,
    },
    startPrice: 350,
    currentPrice: 480,
    bidStep: 25,
    bidCount: 7,
    viewCount: 145,
    watchCount: 18,
    status: "ACTIVE" as const,
    startTime: getPastDate(1),
    endTime: getFutureDate(5),
    createdAt: getPastDate(1),
    images: [
      {
        id: "img-7",
        url: "https://images.unsplash.com/photo-1531386151447-fd76ad50012f?w=800",
        alt: "Boa Constrictor",
      },
    ],
    isFeatured: false,
    isNew: true,
  },
  {
    id: "prod-7",
    name: "Scaleless Corn Snake - Tessera Pattern",
    title: "Scaleless Corn Snake - Tessera Pattern",
    slug: "scaleless-corn-snake-tessera",
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
    category: { id: "cs-normal", name: "Corn Snakes", slug: "corn-snakes" },
    seller: {
      id: mockUsers[1].id,
      name: mockUsers[1].fullName,
      avatar: mockUsers[1].avatar,
      rating:
        typeof mockUsers[1].rating === "number" ? mockUsers[1].rating : 4.8,
      ratingCount: mockUsers[1].ratingCount || 92,
    },
    startPrice: 200,
    currentPrice: 320,
    bidStep: 20,
    bidCount: 11,
    viewCount: 267,
    watchCount: 33,
    status: "ACTIVE" as const,
    startTime: getPastDate(3),
    endTime: getFutureDate(1.5),
    createdAt: getPastDate(3),
    images: [
      {
        id: "img-8",
        url: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800",
        alt: "Corn Snake",
      },
    ],
    highestBidder: {
      id: mockUsers[2].id,
      name: mockUsers[2].fullName,
      avatar: mockUsers[2].avatar,
    },
    isFeatured: false,
    isNew: false,
  },
  {
    id: "prod-8",
    name: "Piebald Ball Python - High White 80%",
    title: "Piebald Ball Python - High White 80%",
    slug: "piebald-ball-python-high-white",
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
    category: { id: "bp-piebald", name: "Piebald", slug: "piebald" },
    seller: {
      id: mockUsers[1].id,
      name: mockUsers[1].fullName,
      avatar: mockUsers[1].avatar,
      rating:
        typeof mockUsers[1].rating === "number" ? mockUsers[1].rating : 4.8,
      ratingCount: mockUsers[1].ratingCount || 92,
    },
    startPrice: 2000,
    currentPrice: 3200,
    bidStep: 100,
    buyNowPrice: 4500,
    bidCount: 18,
    viewCount: 512,
    watchCount: 67,
    status: "ACTIVE" as const,
    startTime: getPastDate(7),
    endTime: getFutureDate(0.25),
    createdAt: getPastDate(7),
    images: [
      {
        id: "img-9",
        url: "https://images.unsplash.com/photo-1531386151447-fd76ad50012f?w=800",
        alt: "Piebald Ball Python",
      },
    ],
    highestBidder: {
      id: mockUsers[2].id,
      name: mockUsers[2].fullName,
      avatar: mockUsers[2].avatar,
    },
    isFeatured: true,
    isNew: false,
  },
];

// Mock Bids
export const mockBids: Bid[] = [
  {
    id: "bid-1",
    productId: "prod-1",
    bidder: mockUsers[2],
    amount: 1250,
    createdAt: getPastDate(0.1),
  },
  {
    id: "bid-2",
    productId: "prod-1",
    bidder: mockUsers[2],
    amount: 1150,
    createdAt: getPastDate(0.5),
  },
  {
    id: "bid-3",
    productId: "prod-1",
    bidder: mockUsers[2],
    amount: 1000,
    createdAt: getPastDate(1),
  },
];

// Mock Questions
export const mockQuestions: Question[] = [
  {
    id: "q-1",
    productId: "prod-1",
    asker: mockUsers[2],
    content: "Is this snake eating live or frozen/thawed? Any feeding issues?",
    createdAt: getPastDate(2),
    answer: {
      content:
        "He takes frozen/thawed rats without any issues. Never refused a meal since I got him. Very reliable feeder!",
      createdAt: getPastDate(1.5),
    },
  },
  {
    id: "q-2",
    productId: "prod-1",
    asker: mockUsers[2],
    content: "Can you ship to California?",
    createdAt: getPastDate(1),
    answer: {
      content:
        "Yes, I ship to all 48 continental states via FedEx Priority Overnight. California shipping is available!",
      createdAt: getPastDate(0.5),
    },
  },
];

// Mock Ratings (feedback received by users)
export const mockRatings: Rating[] = [
  {
    id: "rating-1",
    fromUserId: "user-2",
    fromUser: mockUsers[1], // John Reptiles (seller)
    toUserId: "user-3",
    toUser: mockUsers[2], // Sarah Chen (buyer)
    orderId: "order-1",
    score: 1,
    comment:
      "Great buyer! Fast payment and excellent communication. Would definitely sell to again.",
    createdAt: getPastDate(15),
  },
  {
    id: "rating-2",
    fromUserId: "user-1",
    fromUser: mockUsers[0], // Admin
    toUserId: "user-3",
    toUser: mockUsers[2],
    orderId: "order-2",
    score: 1,
    comment: "Smooth transaction, highly recommended buyer.",
    createdAt: getPastDate(30),
  },
  {
    id: "rating-3",
    fromUserId: "user-3",
    fromUser: mockUsers[2], // Sarah Chen
    toUserId: "user-2",
    toUser: mockUsers[1], // John Reptiles
    orderId: "order-3",
    score: 1,
    comment:
      "Amazing seller! The Ball Python arrived healthy and exactly as described. Packaging was excellent.",
    createdAt: getPastDate(10),
  },
  {
    id: "rating-4",
    fromUserId: "user-3",
    fromUser: mockUsers[2],
    toUserId: "user-2",
    toUser: mockUsers[1],
    orderId: "order-4",
    score: 1,
    comment: "Very responsive to questions. Fast shipping!",
    createdAt: getPastDate(25),
  },
  {
    id: "rating-5",
    fromUserId: "user-3",
    fromUser: mockUsers[2],
    toUserId: "user-2",
    toUser: mockUsers[1],
    orderId: "order-5",
    score: -1,
    comment: "Shipping took longer than expected, but animal arrived healthy.",
    createdAt: getPastDate(45),
  },
];

// Helper functions
export const getProductById = (id: string): Product | undefined =>
  mockProducts.find((p) => p.id === id);

export const getProductsByCategory = (categoryId: string): Product[] =>
  mockProducts.filter((p) => p.category?.id === categoryId);

export const getBidsForProduct = (productId: string): Bid[] =>
  mockBids.filter((b) => b.productId === productId);

export const getQuestionsForProduct = (productId: string): Question[] =>
  mockQuestions.filter((q) => q.productId === productId);

export const getFeaturedProducts = (): Product[] =>
  mockProducts.filter((p) => p.isFeatured);

export const getEndingSoonProducts = (limit?: number): Product[] => {
  const sorted = [...mockProducts]
    .filter((p) => p.status === "ACTIVE")
    .sort(
      (a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime(),
    );
  return limit ? sorted.slice(0, limit) : sorted;
};

export const getMostBidProducts = (limit?: number): Product[] => {
  const sorted = [...mockProducts].sort(
    (a, b) => (b.bidCount || 0) - (a.bidCount || 0),
  );
  return limit ? sorted.slice(0, limit) : sorted;
};

export const getHighestPriceProducts = (limit?: number): Product[] => {
  const sorted = [...mockProducts].sort(
    (a, b) => b.currentPrice - a.currentPrice,
  );
  return limit ? sorted.slice(0, limit) : sorted;
};

export const getCategoryById = (id: string): Category | undefined => {
  for (const cat of mockCategories) {
    if (cat.id === id) return cat;
    if (cat.children) {
      const child = cat.children.find((c) => c.id === id);
      if (child) return child;
    }
  }
  return undefined;
};

export const getRatingsForUser = (userId: string): Rating[] =>
  mockRatings.filter((r) => r.toUserId === userId);
