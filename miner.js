require("dotenv").config();
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const email = process.env.EMAIL;
const password = process.env.PASSWORD;

const loginUrl = "https://nbposer.net/api/v1/user/login";
const miningUrl = "https://nbposer.net/api/v1/user/pos/powerLogined";
const logFile = path.join(__dirname, "log.txt");
const interval = 30 * 60 * 1000; // 30 menit

function logToFile(message) {
  const time = new Date().toISOString();
  const fullMessage = `[${time}] ${message}\n`;
  fs.appendFileSync(logFile, fullMessage);
  console.log(fullMessage);
}

async function autoMine() {
  try {
    const loginRes = await axios.post(loginUrl, {
      username: email,
      password: password,
    });

    const token = loginRes.data.token;
    if (!token) throw new Error("Token tidak ditemukan!");

    logToFile("✅ Login berhasil");

    const miningRes = await axios.get(miningUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json;charset=UTF-8",
        Accept: "application/json, text/plain, */*",
        "User-Agent": "Mozilla/5.0",
        Referer: "https://nbposer.net/",
      },
    });

    logToFile(`⛏ Mining berhasil: ${JSON.stringify(miningRes.data)}`);
  } catch (err) {
    const errorMsg = err.response?.data || err.message || "Unknown error";
    logToFile(`❌ ERROR: ${JSON.stringify(errorMsg)}`);
  }
}

autoMine();
setInterval(autoMine, interval);
