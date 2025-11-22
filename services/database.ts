
import { User, MarketListing, CommunityPost } from '../types';

// Generic Collection class to simulate MongoDB collection behavior
class Collection<T extends { id?: string }> {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  private getData(): T[] {
    const data = localStorage.getItem(this.name);
    return data ? JSON.parse(data) : [];
  }

  private saveData(data: T[]) {
    localStorage.setItem(this.name, JSON.stringify(data));
  }

  // MongoDB: db.collection.find(query)
  async find(query: Partial<T> = {}): Promise<T[]> {
    const data = this.getData();
    return data.filter(item => {
      for (const key in query) {
        if (item[key as keyof T] !== query[key]) return false;
      }
      return true;
    });
  }

  // MongoDB: db.collection.findOne(query)
  async findOne(query: Partial<T>): Promise<T | null> {
    const items = await this.find(query);
    return items.length > 0 ? items[0] : null;
  }

  // MongoDB: db.collection.insertOne(doc)
  async insertOne(doc: T): Promise<T> {
    const data = this.getData();
    const newDoc = { ...doc, id: doc.id || Date.now().toString() };
    data.unshift(newDoc as T); // Add to beginning for display purposes
    this.saveData(data);
    return newDoc as T;
  }

  // Helper to check if collection is empty (for seeding)
  isEmpty(): boolean {
    return this.getData().length === 0;
  }
}

// --- SEED DATA ---

const seedListings: MarketListing[] = [
  {
    id: '1', crop: 'Wheat (Sharbati)', quantity: '50 Quintal', price: '₹2200/Q', location: 'Bhatinda, Punjab',
    description: 'Premium Sharbati wheat, golden grains, harvested this week. Moisture content < 10%.',
    seller: 'Rajinder Singh', time: '2 hrs ago', type: 'sell', seedType: 'HD-2967', fertilizer: 'DAP, Urea'
  },
  {
    id: '2', crop: 'Cotton', quantity: '20 Quintal', price: '₹6100/Q', location: 'Rajkot, Gujarat',
    description: 'Long staple cotton, clean picked. Direct from field. Ready for ginning.',
    seller: 'Patel Bros', time: '5 hrs ago', type: 'sell'
  },
  {
    id: '3', crop: 'Red Chilli', quantity: '500 Kg', price: '₹180/Kg', location: 'Guntur, AP',
    description: 'Spicy Guntur chilli, vibrant red color. Dried naturally under sun.',
    seller: 'Ramesh Kumar', time: '1 day ago', type: 'sell'
  },
  {
    id: '4', crop: 'Basmati Rice', quantity: '100 Quintal', price: '₹3500/Q', location: 'Karnal, Haryana',
    description: '1121 Basmati Steam Rice. Best quality for export.',
    seller: 'Haryana Agro Traders', time: 'Just now', type: 'buy'
  },
  {
    id: '5', crop: 'Mahindra 575 DI', quantity: '1 Unit', price: '₹800/hr', location: 'Pune, MH',
    description: 'Tractor available for ploughing and rotavator. Driver included.',
    seller: 'Suresh Farm Services', time: '1 hr ago', type: 'rent', equipmentBrand: 'Mahindra', equipmentPower: '45 HP'
  },
  {
    id: '6', crop: 'Drone Spraying', quantity: '5 Acres', price: '₹400/acre', location: 'Indore, MP',
    description: 'Agri-drone for pesticide spraying. Fast and efficient. Saves water.',
    seller: 'TechKisan Solutions', time: '3 hrs ago', type: 'rent', equipmentBrand: 'Garuda Aerospace', equipmentPower: 'Battery'
  }
];

const seedPosts: CommunityPost[] = [
  {
    id: '101', author: 'Vikram Singh', location: 'Punjab',
    content: 'Used Nano Urea this season on my wheat crop. Seeing great results! Has anyone else tried it?',
    time: '2 hrs ago', likes: 15, comments: 4, tags: ['Fertilizer', 'Wheat', 'Success']
  },
  {
    id: '102', author: 'Suresh Patel', location: 'Gujarat',
    content: 'Found these white spots on my cotton leaves. Is this fungal? Please help.',
    time: '5 hrs ago', likes: 8, comments: 12, tags: ['Cotton', 'Disease', 'Help']
  },
  {
    id: '103', author: 'Anil Kumar', location: 'Bihar',
    content: 'Mandi prices for Maize are rising. Good time to sell brothers!',
    time: '1 day ago', likes: 42, comments: 10, tags: ['Maize', 'Market Price']
  }
];

// Initialize Database Collections
export const db = {
  users: new Collection<User>('kisan_users_db'),
  listings: new Collection<MarketListing>('kisan_listings_db'),
  posts: new Collection<CommunityPost>('kisan_posts_db')
};

// Seed initial data if empty
if (db.listings.isEmpty()) {
  console.log("Seeding database with initial market listings...");
  seedListings.forEach(l => db.listings.insertOne(l));
}

if (db.posts.isEmpty()) {
  console.log("Seeding database with initial community posts...");
  seedPosts.forEach(p => db.posts.insertOne(p));
}
