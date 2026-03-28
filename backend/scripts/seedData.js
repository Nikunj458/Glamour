/**
 * seedData.js — run once to populate DB with sample products + admin
 * Usage: node scripts/seedData.js
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import User from '../models/User.js';

dotenv.config();

const SAMPLE_PRODUCTS = [
  {
    name: 'Royal Banarasi Silk Saree',
    price: 8999, originalPrice: 12999, category: 'Ethnic',
    description: 'Handwoven Banarasi silk saree with intricate zari work. Perfect for weddings and festive occasions.',
    fabric: 'Pure Banarasi Silk', colors: ['Red', 'Gold'], sizes: ['Free Size'],
    tags: ['saree', 'banarasi', 'silk', 'wedding'], featured: true, inStock: true, rating: 4.8, reviewCount: 124,
    images: [{ url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80', fileId: '' }],
  },
  {
    name: 'Embroidered Anarkali Suit',
    price: 4999, originalPrice: 6999, category: 'Ethnic',
    description: 'Stunning embroidered Anarkali suit with dupatta. Features mirror work and thread embroidery.',
    fabric: 'Georgette', colors: ['Royal Blue', 'Silver'], sizes: ['XS', 'S', 'M', 'L', 'XL'],
    tags: ['anarkali', 'suit', 'embroidered', 'festive'], featured: true, inStock: true, rating: 4.6, reviewCount: 89,
    images: [{ url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80', fileId: '' }],
  },
  {
    name: 'Bridal Lehenga Choli',
    price: 24999, originalPrice: 34999, category: 'Bridal',
    description: 'Exquisite bridal lehenga with heavy embroidery and stonework. Complete with blouse and dupatta.',
    fabric: 'Raw Silk with Net Dupatta', colors: ['Maroon', 'Gold', 'Peach'], sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    tags: ['bridal', 'lehenga', 'wedding', 'heavy-work'], featured: true, inStock: true, rating: 4.9, reviewCount: 56,
    images: [{ url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80', fileId: '' }],
  },
  {
    name: 'Cotton Kurti with Palazzo',
    price: 1299, originalPrice: 1799, category: 'Casual',
    description: 'Comfortable cotton kurti paired with palazzo pants. Block print design for everyday elegance.',
    fabric: 'Cotton', colors: ['Yellow', 'White'], sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    tags: ['kurti', 'palazzo', 'cotton', 'daily-wear'], featured: false, inStock: true, rating: 4.3, reviewCount: 203,
    images: [{ url: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600&q=80', fileId: '' }],
  },
  {
    name: 'Designer Western Dress',
    price: 3499, originalPrice: 4999, category: 'Western',
    description: 'Chic midi dress with floral print. Flattering A-line silhouette suitable for parties and outings.',
    fabric: 'Crepe', colors: ['Navy Blue', 'White'], sizes: ['XS', 'S', 'M', 'L'],
    tags: ['western', 'dress', 'midi', 'party'], featured: false, inStock: true, rating: 4.4, reviewCount: 67,
    images: [{ url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80', fileId: '' }],
  },
  {
    name: 'Festive Sharara Set',
    price: 6499, originalPrice: 8999, category: 'Festive',
    description: 'Gorgeous sharara set with gota patti work. Perfect for festivals, mehndi and sangeet functions.',
    fabric: 'Chiffon with Gota Work', colors: ['Mint Green', 'Gold'], sizes: ['S', 'M', 'L', 'XL'],
    tags: ['sharara', 'festive', 'gota', 'mehndi'], featured: true, inStock: true, rating: 4.7, reviewCount: 41,
    images: [{ url: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&q=80', fileId: '' }],
  },
  {
    name: 'Oxidised Silver Jhumka Set',
    price: 899, originalPrice: 1299, category: 'Accessories',
    description: 'Handcrafted oxidised silver jhumka earrings with intricate filigree work.',
    fabric: 'Oxidised Silver Metal', colors: ['Silver', 'Black'], sizes: ['Free Size'],
    tags: ['jhumka', 'earrings', 'oxidised', 'accessories'], featured: false, inStock: true, rating: 4.5, reviewCount: 178,
    images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80', fileId: '' }],
  },
  {
    name: 'Chanderi Silk Dupatta',
    price: 1999, originalPrice: 2799, category: 'Accessories',
    description: 'Lightweight Chanderi silk dupatta with hand-block print borders.',
    fabric: 'Chanderi Silk', colors: ['Pastel Pink', 'Gold Border'], sizes: ['Free Size'],
    tags: ['dupatta', 'chanderi', 'silk'], featured: false, inStock: true, rating: 4.2, reviewCount: 92,
    images: [{ url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80', fileId: '' }],
  },
  {
    name: 'Bandhani Tie-Dye Saree',
    price: 3299, originalPrice: 4499, category: 'Ethnic',
    description: 'Traditional Rajasthani bandhani saree with vibrant tie-dye patterns.',
    fabric: 'Georgette', colors: ['Pink', 'Yellow', 'Red'], sizes: ['Free Size'],
    tags: ['bandhani', 'tie-dye', 'rajasthani', 'ethnic'], featured: false, inStock: true, rating: 4.4, reviewCount: 55,
    images: [{ url: 'https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=600&q=80', fileId: '' }],
  },
  {
    name: 'Pre-Stitched Drape Saree',
    price: 2499, originalPrice: 3299, category: 'Western',
    description: 'Modern pre-stitched drape saree — no pleating needed. Perfect fusion wear for the contemporary woman.',
    fabric: 'Satin Crepe', colors: ['Emerald Green', 'Black'], sizes: ['XS', 'S', 'M', 'L', 'XL'],
    tags: ['saree', 'fusion', 'pre-stitched', 'modern'], featured: false, inStock: true, rating: 4.6, reviewCount: 88,
    images: [{ url: 'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=600&q=80', fileId: '' }],
  },
  {
    name: 'Zardozi Bridal Blouse',
    price: 5999, originalPrice: 7999, category: 'Bridal',
    description: 'Heavily embroidered zardozi blouse, custom stitchable. The perfect finishing piece for any bridal look.',
    fabric: 'Velvet with Zardozi Work', colors: ['Maroon', 'Gold'], sizes: ['XS', 'S', 'M', 'L', 'XL'],
    tags: ['blouse', 'bridal', 'zardozi', 'velvet'], featured: false, inStock: true, rating: 4.8, reviewCount: 34,
    images: [{ url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80', fileId: '' }],
  },
  {
    name: 'Lucknowi Chikankari Kurti',
    price: 2199, originalPrice: 2999, category: 'Casual',
    description: 'Authentic Lucknowi chikankari hand-embroidered kurti in breathable cotton.',
    fabric: 'Mul Cotton', colors: ['Off White', 'Peach'], sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    tags: ['chikankari', 'lucknowi', 'kurti', 'cotton'], featured: false, inStock: true, rating: 4.7, reviewCount: 145,
    images: [{ url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80', fileId: '' }],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/boutique');
    console.log('Connected to MongoDB');

    // Admin
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@boutique.com' });
    if (!adminExists) {
      await User.create({ name: 'Admin', email: process.env.ADMIN_EMAIL || 'admin@boutique.com', password: process.env.ADMIN_PASSWORD || 'Admin@123', role: 'admin' });
      console.log('Admin user created');
    } else {
      console.log('Admin already exists');
    }

    // Products
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(SAMPLE_PRODUCTS);
      console.log(`${SAMPLE_PRODUCTS.length} sample products seeded`);
    } else {
      console.log(`${count} products already exist — skipping`);
    }

    console.log('\nSeed complete! Start the server with: npm run dev\n');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();