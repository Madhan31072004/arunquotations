const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const CompanyProfile = require('./models/CompanyProfile');
const Client = require('./models/Client');
const Material = require('./models/Material');

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await CompanyProfile.deleteMany({});
    await Client.deleteMany({});
    await Material.deleteMany({});

    // Create default user
    const user = await User.create({
      name: 'Arun Designer',
      email: 'arun@demo.com',
      password: 'demo123',
      phone: '+91 98765 43210',
      role: 'admin',
    });
    console.log('✅ Default user created: arun@demo.com / demo123');

    // Create company profile
    await CompanyProfile.create({
      userId: user._id,
      companyName: 'Arun Interior Studio',
      tagline: 'Designing Dreams Into Reality',
      address: '42, MG Road, Bangalore - 560001',
      phone: '+91 98765 43210',
      email: 'info@aruninteriors.com',
      gstNumber: '29ABCDE1234F1Z5',
      primaryColor: '#C9A351',
      footerText: 'Thank you for choosing Arun Interior Studio',
      termsAndConditions: [
        'Quotation valid for 30 days from issue date.',
        'Payment: 50% advance, 40% on material delivery, 10% on completion.',
        'Prices are inclusive of material and labour unless stated otherwise.',
        'Any changes after approval may affect pricing and timelines.',
        'Warranty: 1 year on workmanship, brand warranty on hardware.',
      ],
    });
    console.log('✅ Company profile created');

    // Create sample clients
    const clients = await Client.insertMany([
      { userId: user._id, name: 'Priya Sharma', phone: '+91 98765 43210', email: 'priya@email.com', address: 'Indiranagar, Bangalore', projectName: '3BHK Apartment Interiors' },
      { userId: user._id, name: 'Rajesh Kumar', phone: '+91 87654 32109', email: 'rajesh@email.com', address: 'Whitefield, Bangalore', projectName: 'Villa Full Renovation' },
      { userId: user._id, name: 'Anita Desai', phone: '+91 76543 21098', email: 'anita@email.com', address: 'Koramangala, Bangalore', projectName: 'Office Interior Design' },
      { userId: user._id, name: 'Vikram Patel', phone: '+91 65432 10987', email: 'vikram@email.com', address: 'HSR Layout, Bangalore', projectName: 'Penthouse Luxury Design' },
      { userId: user._id, name: 'Meera Joshi', phone: '+91 54321 09876', email: 'meera@email.com', address: 'JP Nagar, Bangalore', projectName: 'Kitchen Modular Setup' },
    ]);
    console.log(`✅ ${clients.length} sample clients created`);

    // Create sample materials
    const materials = await Material.insertMany([
      { userId: user._id, name: 'BWP Grade Plywood 18mm', category: 'Plywood', unit: 'sq.ft', unitPrice: 125, brand: 'Century' },
      { userId: user._id, name: 'MR Grade Plywood 12mm', category: 'Plywood', unit: 'sq.ft', unitPrice: 85, brand: 'Greenply' },
      { userId: user._id, name: 'Merino Laminate (Matte)', category: 'Laminate', unit: 'sq.ft', unitPrice: 85, brand: 'Merino' },
      { userId: user._id, name: 'Sunmica Premium Gloss', category: 'Laminate', unit: 'sq.ft', unitPrice: 65, brand: 'Sunmica' },
      { userId: user._id, name: 'Soft-Close Hinges', category: 'Hardware', unit: 'nos', unitPrice: 120, brand: 'Hettich' },
      { userId: user._id, name: 'Drawer Channel SS 18"', category: 'Hardware', unit: 'set', unitPrice: 280, brand: 'Hettich' },
      { userId: user._id, name: 'Telescopic Channel 20"', category: 'Hardware', unit: 'set', unitPrice: 350, brand: 'Ebco' },
      { userId: user._id, name: 'Toughened Glass 10mm', category: 'Glass', unit: 'sq.ft', unitPrice: 350, brand: 'Saint Gobain' },
      { userId: user._id, name: 'Asian Royale Paint', category: 'Paint', unit: 'sq.ft', unitPrice: 18, brand: 'Asian Paints' },
      { userId: user._id, name: 'Quartz Countertop', category: 'Granite', unit: 'sq.ft', unitPrice: 450, brand: 'Caesarstone' },
      { userId: user._id, name: 'Natural Teak Veneer', category: 'Veneer', unit: 'sq.ft', unitPrice: 180, brand: 'Decowood' },
      { userId: user._id, name: 'Vitrified Floor Tile 2x2', category: 'Tile', unit: 'sq.ft', unitPrice: 55, brand: 'Kajaria' },
      { userId: user._id, name: 'Carpenter Labour', category: 'Labour', unit: 'sq.ft', unitPrice: 65, brand: '-' },
      { userId: user._id, name: 'Painter Labour', category: 'Labour', unit: 'sq.ft', unitPrice: 12, brand: '-' },
      { userId: user._id, name: 'Electrical Wiring Point', category: 'Electrical', unit: 'nos', unitPrice: 450, brand: 'Havells' },
    ]);
    console.log(`✅ ${materials.length} sample materials created`);

    console.log('\n🎉 Seed complete! You can now login with:');
    console.log('   Email:    arun@demo.com');
    console.log('   Password: demo123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seed();
