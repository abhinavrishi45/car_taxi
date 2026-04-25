#!/usr/bin/env node
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const Agent = require('../models/Agent');

async function main() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI not set in .env');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const agents = await Agent.find().sort({ createdAt: -1 }).limit(20).lean();
    if (!agents || agents.length === 0) {
      console.log('No agents found in DB.');
    } else {
      console.log(`Found ${agents.length} agent(s):`);
      agents.forEach((a, idx) => {
        console.log('---');
        console.log(`index: ${idx}`);
        console.log(`id: ${a._id}`);
        console.log(`username: ${a.username}`);
        console.log(`email: ${a.email}`);
        console.log(`createdAt: ${a.createdAt}`);
        console.log(`password: ${a.password}`);
        const looksHashed = typeof a.password === 'string' && /^\$2[aby]\$/.test(a.password);
        console.log(`looksHashed: ${looksHashed}`);
      });
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
}

main();
