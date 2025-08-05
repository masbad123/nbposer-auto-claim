require("dotenv").config();
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const token = process.env.TOKEN;
const miningUrl = "https://nbposer.net/api/v1/user/pos/powerLogined";
const userInfoUrl = "https://nbposer.net/api/v1/user/userInfo";
const authDetailsUrl = "https://nbposer.net/api/v1/user/authenticationDetails";
const noticeUrl = "https://nbposer.net/api/v1/noticeCenter/titleList";
const assetListUrl = "https://nbposer.net/api/v1/asset/list?page=1&size=10&type=bill";
const nodeInfoUrl = "https://infragrid.v.network/wallet/getnodeinfo";

const logFile = path.join(__dirname, "log.txt");
const lastMiningFile = path.join(__dirname, "last_mining.json");
const interval = 30 * 60 * 1000; // 30 menit

function logToFile(message) {
  const time = new Date().toISOString();
  const fullMessage = `[${time}] ${message}\n`;
  fs.appendFileSync(logFile, fullMessage);
  console.log(fullMessage);
}

function saveLastMiningTime() {
  const data = {
    lastMining: new Date().toISOString(),
  };
  fs.writeFileSync(lastMiningFile, JSON.stringify(data, null, 2));
}

function loadLastMiningTime() {
  if (fs.existsSync(lastMiningFile)) {
    const data = JSON.parse(fs.readFileSync(lastMiningFile, "utf-8"));
    return data.lastMining;
  }
  return null;
}

function getHeaders() {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json;charset=UTF-8",
    Accept: "application/json, text/plain, */*",
    "User-Agent": "Mozilla/5.0",
    Referer: "https://nbposer.net/",
  };
}

async function doMining() {
  try {
    const res = await axios.get(miningUrl, {
      headers: getHeaders(),
    });

    if (res.data.code === 0) {
      logToFile(`⛏ Mining berhasil: ${JSON.stringify(res.data)}`);
      saveLastMiningTime();
    } else {
      logToFile(`⚠️ Gagal mining: ${JSON.stringify(res.data)}`);
    }
  } catch (err) {
    const msg = err.response?.data || err.message;
    logToFile(`❌ Error saat mining: ${JSON.stringify(msg)}`);
  }
}

async function fetchInfo(name, url) {
  try {
    const res = await axios.get(url, {
      headers: getHeaders(),
    });

    logToFile(`📦 ${name}: ${JSON.stringify(res.data, null, 2)}`);
  } catch (err) {
    const msg = err.response?.data || err.message;
    logToFile(`❌ Error saat ambil ${name}: ${JSON.stringify(msg)}`);
  }
}

async function autoMine() {
  const lastMining = loadLastMiningTime();
  if (lastMining) {
    logToFile(`ℹ️ Waktu mining terakhir: ${lastMining}`);
  } else {
    logToFile("🔍 Belum ada data mining sebelumnya.");
  }

  if (!token) {
    logToFile("❌ Token tidak ditemukan di file .env.");
    return;
  }

  await doMining();
  await fetchInfo("User Info", userInfoUrl);
  await fetchInfo("Auth Detail", authDetailsUrl);
  await fetchInfo("Notice List", noticeUrl);
  await fetchInfo("Asset List", assetListUrl);
  await fetchInfo("Node Info", nodeInfoUrl);
}

// Jalankan pertama kali dan ulangi setiap 30 menit
autoMine();
setInterval(autoMine, interval);
