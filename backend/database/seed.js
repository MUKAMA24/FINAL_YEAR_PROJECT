require('dotenv').config();
const db = require('../config/database');
const bcrypt = require('bcryptjs');

// Configuration Data
const CATEGORIES = [
  'barber', 'tutor', 'spa', 'fitness', 'healthcare',
  'mechanic', 'salon', 'dentist', 'therapist', 'beauty', 'wellness'
];

const KAMPALA_SUBURBS = [
  'Kololo', 'Nakasero', 'Bugolobi', 'Ntinda', 'Muyenga',
  'Kabalagala', 'Mengo', 'Rubaga', 'Makindye', 'Kawempe',
  'Bwaise', 'Wandegeya', 'Mulago', 'Kamwokya', 'Bukoto', 'Naguru'
];

const OTHER_CITIES = [
  'Entebbe', 'Jinja', 'Mbarara', 'Gulu', 'Mbale',
  'Fort Portal', 'Arua', 'Soroti', 'Hoima', 'Kabale',
  'Lira', 'Masaka', 'Mukono', 'Kasese'
];

const SERVICE_TEMPLATES = {
  barber: [
    { name: 'Classic Haircut', price: 110000, duration: 30, desc: 'Professional haircut with styling' },
    { name: 'Beard Trim', price: 55000, duration: 15, desc: 'Beard grooming and shaping' },
    { name: 'Hot Towel Shave', price: 90000, duration: 45, desc: 'Traditional hot towel shave' }
  ],
  tutor: [
    { name: 'Math Tutoring', price: 185000, duration: 60, desc: 'One-on-one mathematics tutoring' },
    { name: 'English Lesson', price: 165000, duration: 60, desc: 'English language and literature' },
    { name: 'Science Class', price: 200000, duration: 60, desc: 'Physics, Chemistry, or Biology tutoring' }
  ],
  spa: [
    { name: 'Swedish Massage', price: 295000, duration: 60, desc: 'Relaxing full body massage' },
    { name: 'Deep Tissue', price: 350000, duration: 60, desc: 'Therapeutic deep tissue massage' },
    { name: 'Facial Treatment', price: 260000, duration: 45, desc: 'Rejuvenating facial treatment' }
  ],
  fitness: [
    { name: 'Personal Training', price: 220000, duration: 60, desc: '1-on-1 fitness coaching' },
    { name: 'Yoga Class', price: 90000, duration: 60, desc: 'Group yoga session' },
    { name: 'HIIT Workout', price: 110000, duration: 45, desc: 'High intensity interval training' }
  ],
  healthcare: [
    { name: 'General Checkup', price: 370000, duration: 30, desc: 'Routine medical examination' },
    { name: 'Consultation', price: 275000, duration: 20, desc: 'Specialist medical consultation' },
    { name: 'Lab Tests', price: 150000, duration: 15, desc: 'Basic laboratory testing services' }
  ],
  mechanic: [
    { name: 'Oil Change', price: 180000, duration: 45, desc: 'Full synthetic oil change and filter' },
    { name: 'Brake Service', price: 250000, duration: 90, desc: 'Brake pad replacement and inspection' },
    { name: 'Diagnostic Scan', price: 100000, duration: 30, desc: 'Computerized engine diagnostic' }
  ],
  salon: [
    { name: 'Hair Styling', price: 150000, duration: 60, desc: 'Wash, cut, and style' },
    { name: 'Manicure', price: 80000, duration: 45, desc: 'Classic manicure with polish' },
    { name: 'Pedicure', price: 100000, duration: 60, desc: 'Relaxing pedicure treatment' }
  ],
  dentist: [
    { name: 'Dental Cleaning', price: 300000, duration: 45, desc: 'Professional teeth cleaning' },
    { name: 'Teeth Whitening', price: 500000, duration: 60, desc: 'Laser teeth whitening session' },
    { name: 'Checkup & X-Ray', price: 250000, duration: 30, desc: 'Dental exam and necessary X-rays' }
  ],
  therapist: [
    { name: 'Counseling Session', price: 200000, duration: 60, desc: 'Individual therapy session' },
    { name: 'Couples Therapy', price: 300000, duration: 90, desc: 'Relationship counseling' },
    { name: 'Stress Management', price: 180000, duration: 60, desc: 'Stress reduction techniques' }
  ],
  beauty: [
    { name: 'Makeup Application', price: 120000, duration: 60, desc: 'Full face professional makeup' },
    { name: 'Eyelash Extensions', price: 150000, duration: 90, desc: 'Classic lash extensions' },
    { name: 'Eyebrow Shaping', price: 40000, duration: 30, desc: 'Threading or waxing' }
  ],
  wellness: [
    { name: 'Nutrition Planning', price: 150000, duration: 60, desc: 'Personalized diet plan' },
    { name: 'Meditation Class', price: 50000, duration: 45, desc: 'Guided meditation session' },
    { name: 'Life Coaching', price: 250000, duration: 60, desc: 'Personal development coaching' }
  ]
};

// Helper to get a random item from array
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper to generate a realistic Ugandan address
const generateAddress = (index) => {
  const isKampala = Math.random() > 0.4; // 60% chance of Kampala
  const city = isKampala ? 'Kampala' : getRandom(OTHER_CITIES);
  const suburb = isKampala ? getRandom(KAMPALA_SUBURBS) : city; // For other cities, use city name as area
  const street = `Plot ${Math.floor(Math.random() * 500) + 1} ${['Main', 'High', 'Market', 'Church', 'Mosque', 'School', 'Hospital'][Math.floor(Math.random() * 7)]} Road`;

  return {
    address: street,
    city: city,
    state: isKampala ? 'Central Region' : 'Uganda',
    zip_code: '00256',
    description: `Located in the heart of ${suburb}, we provide excellent services.`
  };
};

async function seedDatabase() {
  try {
    console.log('Starting massive database seeding...');

    // Clear existing data
    await db.none('DELETE FROM reviews');
    await db.none('DELETE FROM payments');
    await db.none('DELETE FROM bookings');
    await db.none('DELETE FROM time_slots');
    await db.none('DELETE FROM services');
    await db.none('DELETE FROM businesses');
    await db.none('DELETE FROM users');

    console.log('Cleared existing data');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Create Admin
    await db.one(
      `INSERT INTO users (name, email, password, role, phone) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      ['Admin User', 'admin@appointment.com', hashedPassword, 'admin', '0772123456']
    );

    // 2. Create Customers (10 customers)
    const customerIds = [];
    for (let i = 1; i <= 10; i++) {
      const customer = await db.one(
        `INSERT INTO users (name, email, password, role, phone) 
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [`Customer ${i}`, `customer${i}@test.com`, hashedPassword, 'customer', `0700${100000 + i}`]
      );
      customerIds.push(customer.id);
    }
    console.log(`Created 10 customers`);

    // 3. Create Businesses (3 per category)
    let totalBusinesses = 0;

    for (const category of CATEGORIES) {
      console.log(`Seeding ${category} businesses...`);

      for (let i = 1; i <= 3; i++) {
        // Create User
        const businessUser = await db.one(
          `INSERT INTO users (name, email, password, role, phone) 
           VALUES ($1, $2, $3, $4, $5) RETURNING id`,
          [`${category.charAt(0).toUpperCase() + category.slice(1)} Owner ${i}`, `${category}${i}@test.com`, hashedPassword, 'business', `0750${100000 + totalBusinesses}`]
        );

        // Generate Address
        const location = generateAddress(totalBusinesses);
        const businessName = `${location.city} ${category.charAt(0).toUpperCase() + category.slice(1)} ${i}`;

        // Create Business Profile
        const business = await db.one(
          `INSERT INTO businesses (user_id, name, description, address, city, state, zip_code, category, contact_info, is_approved) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
          [
            businessUser.id,
            businessName,
            `${location.description} Professional ${category} services.`,
            location.address,
            location.city,
            location.state,
            location.zip_code,
            category,
            `${category}${i}@test.com`,
            true
          ]
        );

        // Create Services
        const templates = SERVICE_TEMPLATES[category];
        const serviceIds = [];

        for (const template of templates) {
          const service = await db.one(
            `INSERT INTO services (business_id, service_name, description, price, duration) 
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [business.id, template.name, template.desc, template.price, template.duration]
          );
          serviceIds.push(service.id);

          // Create Time Slots (Next 7 days)
          const today = new Date();
          for (let day = 0; day < 7; day++) {
            const date = new Date(today);
            date.setDate(date.getDate() + day);

            // Create 5 slots per day
            for (let hour = 9; hour <= 17; hour += 2) {
              const startTime = new Date(date);
              startTime.setHours(hour, 0, 0, 0);
              const endTime = new Date(startTime);
              endTime.setMinutes(template.duration);

              await db.none(
                `INSERT INTO time_slots (service_id, start_time, end_time, is_booked) 
                 VALUES ($1, $2, $3, $4)`,
                [service.id, startTime, endTime, false]
              );
            }
          }
        }

        // Create Random Bookings & Reviews (for some businesses)
        if (Math.random() > 0.3) { // 70% chance to have bookings
          const randomServiceId = getRandom(serviceIds);
          const randomCustomerId = getRandom(customerIds);

          // Find a slot
          const slot = await db.oneOrNone(
            `SELECT id FROM time_slots WHERE service_id = $1 AND is_booked = false LIMIT 1`,
            [randomServiceId]
          );

          if (slot) {
            const status = Math.random() > 0.5 ? 'completed' : 'booked';
            const booking = await db.one(
              `INSERT INTO bookings (customer_id, business_id, service_id, timeslot_id, total_price, status)
               VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
              [randomCustomerId, business.id, randomServiceId, slot.id, templates[0].price, status]
            );

            await db.none(`UPDATE time_slots SET is_booked = true WHERE id = $1`, [slot.id]);

            if (status === 'completed') {
              await db.none(
                `INSERT INTO reviews (booking_id, customer_id, business_id, rating, comment)
                 VALUES ($1, $2, $3, $4, $5)`,
                [booking.id, randomCustomerId, business.id, Math.floor(Math.random() * 2) + 4, 'Great service! Highly recommended.']
              );
            }
          }
        }

        totalBusinesses++;
      }
    }

    console.log(`\n✅ Successfully seeded ${totalBusinesses} businesses across ${CATEGORIES.length} categories!`);
    console.log('✅ Created services, time slots, bookings, and reviews.');
    console.log('\n🔑 Test Credentials:');
    console.log('Admin: admin@appointment.com / password123');
    console.log('Customers: customer1@test.com ... customer10@test.com / password123');
    console.log('Businesses: [category]1@test.com ... [category]3@test.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
