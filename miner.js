require("dotenv").config();
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const email = process.env.EMAIL;
const password = process.env.PASSWORD;

const loginUrl = "https://nbposer.net/api/v1/user/login";
const miningUrl = "https://nbposer.net/api/v1/user/pos/powerLogined";
const userInfoUrl = "https://nbposer.net/api/v1/user/userInfo";

const tokenFile = path.join(__dirname, "token.txt");
const logFile = path.join(__dirname, "log.txt");
const lastMiningFile = path.join(__dirname, "last_mining.json");

const interval = 30 * 60 * 1000; // 30 menit

function logToFile(message) {
  const time = new Date().toISOString();
  const fullMessage = `[${time}] ${message}\n`;
  fs.appendFileSync(logFile, fullMessage);
  console.log(fullMessage);
}

function saveToken(token) {
  fs.writeFileSync(tokenFile, token, "utf-8");
  logToFile("💾 Token baru disimpan.");
}

function loadToken() {
  if (fs.existsSync(tokenFile)) {
    return fs.readFileSync(tokenFile, "utf-8").trim();
  }
  return null;
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

async function loginAndSaveToken() {
  try {
    const res = await axios.post(loginUrl, {
      username: email,
      password: password,
    });

    const token = res.data?.data?.token || res.data?.token;

    if (!token) throw new Error("Token tidak ditemukan saat login.");

    logToFile("✅ Login berhasil.");
    saveToken(token);
    return token;
  } catch (err) {
    const msg = err.response?.data || err.message;
    logToFile(`❌ Login gagal: ${JSON.stringify(msg)}`);
    return null;
  }
}

async function doMining(token) {
  try {
    const res = await axios.get(miningUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json;charset=UTF-8",
        Accept: "application/json, text/plain, */*",
        "User-Agent": "Mozilla/5.0",
        Referer: "https://nbposer.net/",
      },
    });

    if (res.data.code === 0) {
      logToFile(`⛏ Mining berhasil: ${JSON.stringify(res.data)}`);
      saveLastMiningTime();
      return true;
    } else if (res.data.code === 401) {
      logToFile(`⚠️ Token kadaluarsa. Perlu login ulang.`);
      return false;
    } else {
      logToFile(`⚠️ Gagal mining: ${JSON.stringify(res.data)}`);
      return true;
    }
  } catch (err) {
    const msg = err.response?.data || err.message;
    logToFile(`❌ Error saat mining: ${JSON.stringify(msg)}`);
    return true;
  }
}

async function getUserInfo(token) {
  try {
    const res = await axios.get(userInfoUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json;charset=UTF-8",
        Accept: "application/json, text/plain, */*",
        "User-Agent": "Mozilla/5.0",
        Referer: "https://nbposer.net/",
      },
    });

    if (res.data.code === 0 && res.data.data) {
      logToFile(`👤 Info Pengguna: ${JSON.stringify(res.data.data, null, 2)}`);
    } else {
      logToFile(`⚠️ Gagal mengambil user info: ${JSON.stringify(res.data)}`);
    }
  } catch (err) {
    const msg = err.response?.data || err.message;
    logToFile(`❌ Error saat get user info: ${JSON.stringify(msg)}`);
  }
}

async function autoMine() {
  let token = loadToken();
  const lastMining = loadLastMiningTime();

  if (lastMining) {
    logToFile(`ℹ️ Waktu mining terakhir: ${lastMining}`);
  } else {
    logToFile("🔍 Belum ada data mining sebelumnya.");
  }

  if (!token) {
    token = await loginAndSaveToken();
  }

  if (token) {
    const miningResult = await doMining(token);

    if (miningResult === false) {
      logToFile("🔁 Mencoba login ulang karena token tidak valid...");
      token = await loginAndSaveToken();

      if (token) {
        await doMining(token);
        await getUserInfo(token);
      }
    } else {
      await getUserInfo(token);
    }
  } else {
    logToFile("❌ Tidak bisa mining karena token kosong.");
  }
}

// Jalankan pertama kali dan ulangi setiap 30 menit
autoMine();
setInterval(autoMine, interval);
