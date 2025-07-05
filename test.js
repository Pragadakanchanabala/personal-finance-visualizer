import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

console.log('Loaded URI:', process.env.MONGODB_URI);
