const { randomBytes } = require('node:crypto');
const GENERATED_PASSWORD = !process.env.APP_PASSWORD;
const PASSWORD = process.env.APP_PASSWORD || randomBytes(18).toString('base64url');

module.exports = {
  PASSWORD,
  GENERATED_PASSWORD,
  SECRET: process.env.SECRET_KEY || randomBytes(32).toString('hex'),
  PORT: process.env.PORT || 3000,
  COMPANY: {
    name: 'JK HYDRAULIC & ENGINEERING',
    address: 'CSC Shop No. 7 & 8, F-Block, F-31, Phase-II, Mayapuri, New Delhi-110064',
    contact: 'Phone: 9136661641 / 9643154611 | Email: jkhydraulicandengineering@gmail.com',
    gstin: 'GSTIN: ____________________'
  },
  DEFAULT_TERMS: '1. Payment: 50% advance, balance before delivery.\n2. Delivery: 7-10 working days from order confirmation.\n3. Prices are ex-works Delhi; transport extra.\n4. Warranty: 6 months against manufacturing defects.'
};
