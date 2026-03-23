const db = require('./backend/config/db');

async function seed() {
    try {
        const [plans] = await db.execute('SELECT COUNT(*) as count FROM membership_plans');
        if (plans[0].count === 0) {
            console.log('Seeding membership plans...');
            await db.execute('INSERT INTO membership_plans (name, price, duration_days) VALUES (?, ?, ?)', 
                ['Monthly Standard', 250.00, 30]);
            await db.execute('INSERT INTO membership_plans (name, price, duration_days) VALUES (?, ?, ?)', 
                ['Yearly Premium', 2400.00, 365]);
            console.log('Seeding complete.');
        } else {
            console.log('Plans already exist.');
        }
        process.exit(0);
    } catch (error) {
        console.error('Seed failed:', error);
        process.exit(1);
    }
}

seed();
