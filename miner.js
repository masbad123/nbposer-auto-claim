require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

const MINING_INTERVAL = 30 * 60 * 1000; // 30 menit
const LAST_MINING_FILE = 'last_mining.json';
const LOG_FILE = 'log.txt';

const token = process.env.TOKEN;

function log(message) {
  const timestamp = new Date().toISOString();
  const fullMsg = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, fullMsg);
  console.log(fullMsg.trim());
}

function loadLastMiningTime() {
  try {
    const data = fs.readFileSync(LAST_MINING_FILE);
    return JSON.parse(data).lastMiningTime;
  } catch {
    return null;
  }
}

function saveLastMiningTime(time) {
  fs.writeFileSync(LAST_MINING_FILE, JSON.stringify({ lastMiningTime: time }, null, 2));
}

async function doMining(token) {
  try {
    const response = await axios.get('https://nbposer.net/api/v1/user/pos/powerLogined', {
      headers: {
        token: token,
        'Content-Type': 'application/json;charset=UTF-8',
        'User-Agent': 'Mozilla/5.0',
      },
    });

    if (response.data.code === 0) {
      log(`✅ Mining berhasil: ${JSON.stringify(response.data.data)}`);
    } else {
      log(`⚠️ Gagal mining: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    log(`❌ Error saat mining: ${error.message}`);
  }
}

async function main() {
  if (!token) {
    log('❌ Token kosong. Mohon isi file .env dengan TOKEN=xxx');
    return;
  }

  const lastMining = loadLastMiningTime();
  if (lastMining) log(`ℹ️ Waktu mining terakhir: ${lastMining}`);

  await doMining(token);

  const now = new Date().toISOString();
  saveLastMiningTime(now);

  setInterval(async () => {
    await doMining(token);
    saveLastMiningTime(new Date().toISOString());
  }, MINING_INTERVAL);
}

main();
