const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eventify');
  console.log('Connected to MongoDB');

  // Clear existing data
  await Booking.deleteMany({});
  await Review.deleteMany({});
  await Event.deleteMany({});
  await User.deleteMany({});
  console.log('🗑  Cleared existing data');

  // Create users — passwords are hashed automatically by the User model pre-save hook
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@eventify.com',
    password: 'Admin@123',
    role: 'admin',
    bio: 'Platform administrator'
  });

  const organizer1 = await User.create({
    name: 'Alice Organizer',
    email: 'alice@eventify.com',
    password: 'Alice@123',
    role: 'organizer',
    bio: 'Event curator & tech conference organizer'
  });

  const organizer2 = await User.create({
    name: 'Bob Events',
    email: 'bob@eventify.com',
    password: 'Bob@123',
    role: 'organizer',
    bio: 'Music & culture event specialist'
  });

  const user1 = await User.create({
    name: 'Charlie User',
    email: 'charlie@eventify.com',
    password: 'Charlie@123',
    role: 'user',
    bio: 'Event enthusiast'
  });

  console.log('✅ Users created');

  // Create events
  const events = [
    {
      title: 'React Summit 2025',
      description: 'The biggest React conference in Asia. Join 2000+ developers for two days of talks, workshops, and networking. Featuring core React team members and top industry engineers.',
      organizer: organizer1._id,
      category: 'tech',
      date: new Date(Date.now() + 30 * 86400000),
      time: '09:00 AM',
      location: { venue: 'Hyderabad International Convention Centre', address: 'Novotel & HICC Complex', city: 'Hyderabad', state: 'Telangana', country: 'India' },
      price: 2999,
      totalSeats: 500,
      bookedSeats: 120,
      availableSeats: 380,
      status: 'published',
      isFeatured: true,
      tags: ['react', 'javascript', 'frontend', 'tech'],
      images: []
    },
    {
      title: 'Sunburn Music Festival',
      description: "Asia's biggest electronic dance music festival returns! Three stages, 50+ DJs, camping, food courts, and an unforgettable 3-day experience.",
      organizer: organizer2._id,
      category: 'music',
      date: new Date(Date.now() + 45 * 86400000),
      time: '04:00 PM',
      location: { venue: 'Vagator Beach Grounds', address: 'Vagator', city: 'Goa', state: 'Goa', country: 'India' },
      price: 4999,
      totalSeats: 10000,
      bookedSeats: 3200,
      availableSeats: 6800,
      status: 'published',
      isFeatured: true,
      tags: ['edm', 'music', 'festival', 'dance'],
      images: []
    },
    {
      title: 'Startup Pitch Night Hyderabad',
      description: 'Watch 15 handpicked startups pitch to top VCs and angel investors. Network with founders, investors, and ecosystem builders over cocktails.',
      organizer: organizer1._id,
      category: 'business',
      date: new Date(Date.now() + 10 * 86400000),
      time: '06:00 PM',
      location: { venue: 'T-Hub Phase 2', address: 'Raidurg, HITECH City', city: 'Hyderabad', state: 'Telangana', country: 'India' },
      price: 499,
      totalSeats: 200,
      bookedSeats: 45,
      availableSeats: 155,
      status: 'published',
      isFeatured: false,
      tags: ['startup', 'investment', 'networking'],
      images: []
    },
    {
      title: 'Hyderabad Food Festival',
      description: 'A three-day celebration of Hyderabadi cuisine, street food, and culinary innovation. 80+ food stalls, live cooking demos, and Biryani eating contests!',
      organizer: organizer2._id,
      category: 'food',
      date: new Date(Date.now() + 20 * 86400000),
      time: '11:00 AM',
      location: { venue: 'NTR Gardens', address: 'Khairatabad', city: 'Hyderabad', state: 'Telangana', country: 'India' },
      price: 299,
      totalSeats: 5000,
      bookedSeats: 1200,
      availableSeats: 3800,
      status: 'published',
      isFeatured: true,
      tags: ['food', 'biryani', 'culture', 'festival'],
      images: []
    },
    {
      title: 'AI & Machine Learning Workshop',
      description: 'Hands-on 2-day workshop on practical ML with Python. Cover scikit-learn, TensorFlow, and deployment. Beginner to intermediate. Bring your laptop!',
      organizer: organizer1._id,
      category: 'education',
      date: new Date(Date.now() + 15 * 86400000),
      time: '10:00 AM',
      location: { venue: 'IIIT Hyderabad', address: 'Prof CR Rao Rd, Gachibowli', city: 'Hyderabad', state: 'Telangana', country: 'India' },
      price: 1499,
      totalSeats: 60,
      bookedSeats: 55,
      availableSeats: 5,
      status: 'published',
      isFeatured: false,
      tags: ['ai', 'ml', 'python', 'workshop'],
      images: []
    },
    {
      title: 'Bangalore Half Marathon 2025',
      description: 'Run through the garden city! 21km route through Cubbon Park, MG Road, and Indiranagar. Finisher medals, timing chips, and hydration stations included.',
      organizer: organizer2._id,
      category: 'sports',
      date: new Date(Date.now() + 60 * 86400000),
      time: '06:00 AM',
      location: { venue: 'Kanteerava Stadium', address: 'Kasturba Road', city: 'Bangalore', state: 'Karnataka', country: 'India' },
      price: 799,
      totalSeats: 3000,
      bookedSeats: 850,
      availableSeats: 2150,
      status: 'published',
      isFeatured: false,
      tags: ['marathon', 'running', 'fitness', 'sports'],
      images: []
    },
    {
      title: 'Contemporary Art Exhibition: Echoes',
      description: 'Featuring 30 emerging Indian artists exploring identity, memory, and modernity through painting, sculpture, and digital art. Free guided tours daily at 3 PM.',
      organizer: organizer1._id,
      category: 'art',
      date: new Date(Date.now() + 5 * 86400000),
      time: '10:00 AM',
      location: { venue: 'Salar Jung Museum', address: 'Salar Jung Rd, Darulshifa', city: 'Hyderabad', state: 'Telangana', country: 'India' },
      price: 0,
      totalSeats: 1000,
      bookedSeats: 200,
      availableSeats: 800,
      status: 'published',
      isFeatured: false,
      tags: ['art', 'exhibition', 'culture', 'free'],
      images: []
    },
    {
      title: 'Yoga & Wellness Retreat',
      description: 'A transformative weekend retreat with dawn yoga, meditation sessions, Ayurvedic meals, and wellness workshops. Limited to 40 participants for an intimate experience.',
      organizer: organizer2._id,
      category: 'health',
      date: new Date(Date.now() + 25 * 86400000),
      time: '07:00 AM',
      location: { venue: 'Ananda Spa & Resort', address: 'Shankarpally Road', city: 'Hyderabad', state: 'Telangana', country: 'India' },
      price: 8999,
      totalSeats: 40,
      bookedSeats: 32,
      availableSeats: 8,
      status: 'published',
      isFeatured: true,
      tags: ['yoga', 'wellness', 'meditation', 'health'],
      images: []
    },
  ];

  await Event.insertMany(events);
  console.log('✅ Events created');

  console.log('\n🎉 Database seeded successfully!\n');
  console.log('📋 Test Credentials:');
  console.log('  Admin:     admin@eventify.com     / Admin@123');
  console.log('  Organizer: alice@eventify.com     / Alice@123');
  console.log('  Organizer: bob@eventify.com       / Bob@123');
  console.log('  User:      charlie@eventify.com   / Charlie@123');
  console.log('');

  process.exit(0);
};

seed().catch(err => {
  console.error('❌ Seeder error:', err);
  process.exit(1);
});