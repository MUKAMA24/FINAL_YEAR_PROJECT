require('dotenv').config();
const db = require('../config/database');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Hash password for test users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Seed admin user
    const admin = await db.one(
      `INSERT INTO users (name, email, password, role, phone) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ['Admin User', 'admin@appointment.com', hashedPassword, 'admin', '1234567890']
    ).catch(() => null);

    // Seed business users
    const business1 = await db.one(
      `INSERT INTO users (name, email, password, role, phone) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ['John Barber', 'barber@test.com', hashedPassword, 'business', '9876543210']
    ).catch(() => null);

    const business2 = await db.one(
      `INSERT INTO users (name, email, password, role, phone) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ['Jane Tutor', 'tutor@test.com', hashedPassword, 'business', '5551234567']
    ).catch(() => null);

    // Seed customer user
    const customer = await db.one(
      `INSERT INTO users (name, email, password, role, phone) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ['Test Customer', 'customer@test.com', hashedPassword, 'customer', '5559876543']
    ).catch(() => null);

    if (business1) {
      // Seed business 1 - Barber Shop
      const barbershop = await db.one(
        `INSERT INTO businesses (user_id, name, description, address, city, state, zip_code, category, contact_info, is_approved) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
         RETURNING id`,
        [business1.id, 'Classic Cuts Barbershop', 'Professional barbershop with experienced barbers', '123 Main St', 'New York', 'NY', '10001', 'barber', 'barber@test.com', true]
      );

      // Seed services for barbershop
      const haircut = await db.one(
        `INSERT INTO services (business_id, service_name, description, price, duration) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id`,
        [barbershop.id, 'Classic Haircut', 'Traditional haircut with styling', 30.00, 30]
      );

      await db.none(
        `INSERT INTO services (business_id, service_name, description, price, duration) 
         VALUES ($1, $2, $3, $4, $5)`,
        [barbershop.id, 'Beard Trim', 'Professional beard trimming and shaping', 15.00, 15]
      );

      // Seed time slots for haircut service (next 7 days)
      const today = new Date();
      for (let day = 0; day < 7; day++) {
        const date = new Date(today);
        date.setDate(date.getDate() + day);
        
        for (let hour = 9; hour <= 17; hour++) {
          const startTime = new Date(date);
          startTime.setHours(hour, 0, 0, 0);
          
          const endTime = new Date(startTime);
          endTime.setMinutes(30);
          
          await db.none(
            `INSERT INTO time_slots (service_id, start_time, end_time) 
             VALUES ($1, $2, $3)`,
            [haircut.id, startTime, endTime]
          );
        }
      }
    }

    if (business2) {
      // Seed business 2 - Tutoring Service
      const tutoring = await db.one(
        `INSERT INTO businesses (user_id, name, description, address, city, state, zip_code, category, contact_info, is_approved) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
         RETURNING id`,
        [business2.id, 'Smart Learning Tutoring', 'Expert tutoring in math, science, and languages', '456 Oak Ave', 'Los Angeles', 'CA', '90001', 'tutor', 'tutor@test.com', true]
      );

      // Seed services for tutoring
      await db.none(
        `INSERT INTO services (business_id, service_name, description, price, duration) 
         VALUES ($1, $2, $3, $4, $5)`,
        [tutoring.id, 'Math Tutoring', 'One-on-one math tutoring for all levels', 50.00, 60]
      );

      await db.none(
        `INSERT INTO services (business_id, service_name, description, price, duration) 
         VALUES ($1, $2, $3, $4, $5)`,
        [tutoring.id, 'Science Tutoring', 'Biology, Chemistry, and Physics tutoring', 55.00, 60]
      );
    }

    console.log('Database seeding completed successfully!');
    console.log('\nTest accounts:');
    console.log('Admin: admin@appointment.com / password123');
    console.log('Business 1: barber@test.com / password123');
    console.log('Business 2: tutor@test.com / password123');
    console.log('Customer: customer@test.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
