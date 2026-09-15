require('dotenv').config();
const { askAiChat } = require('./src/lib/ai');

async function test() {
  try {
    const res = await askAiChat('test-chat-id', 'Olá, como você está?', 'test-profile-id', 'Test', 'Seja muito breve.');
    console.log('AI Response:', res);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
