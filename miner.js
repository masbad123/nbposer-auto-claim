require('dotenv').config();
const fs = require('fs');
const axios = require('axios');

const TOKEN = process.env.TOKEN;
const LAST_MINING_FILE = 'last_mining.json';

async function getMiningStatus() {
  try {
    const res = await axios.get('https://nbposer.net/api/v1/user/pos/powerLogined', {
      headers: {
        'token': TOKEN,
        'accept': 'application/json',
        'content-type': 'application/json;charset=UTF-8',
      }
    });

    const data = res.data;
    if (data.code === 200 && data.data) {
      const { powerStartupTime, powerEndTime, batchObtainAmount } = data.data;
      console.log(`[${new Date().toISOString()}] ✅ Mining aktif`);
      console.log(`  ⏱️  Mulai  : ${powerStartupTime}`);
      console.log(`  ⏳ Selesai: ${powerEndTime}`);
      console.log(`  💎 Reward : ${batchObtainAmount} HKT`);

      // Simpan waktu terakhir mining
      fs.writeFileSync(LAST_MINING_FILE, JSON.stringify({ last: powerStartupTime }, null, 2));
    } else {
      console.error(`[${new Date().toISOString()}] ⚠️ Gagal mining: ${JSON.stringify(data)}`);
    }

  } catch (err) {
    console.error(`[${new Date().toISOString()}] ❌ Error: ${err.message}`);
  }
}

async function start() {
  while (true) {
    await getMiningStatus();
    console.log('⏳ Menunggu 30 menit...\n');
    await new Promise(r => setTimeout(r, 30 * 60 * 1000));
  }
}

start();
