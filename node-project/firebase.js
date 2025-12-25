// firebase.js
require('dotenv').config(); // 載入環境變數
const admin = require('firebase-admin');

// 1. 處理私鑰的換行符號 (關鍵步驟，防止 .env 讀取錯誤)
const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  : undefined;

// 2. 初始化 Firebase (防止重複初始化)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey
    }),
    // ⚠️ 配合您同學的設定，將 Bucket 寫死在這裡
    storageBucket: "oo-project-dedbd.firebasestorage.app"
  });
}

// 3. 初始化 Firestore
const db = admin.firestore();

// ⚠️ 這是剛才除錯的關鍵：指定資料庫名稱為 'oo-base'
db.settings({
    databaseId: 'oo-base'
});

const bucket = admin.storage().bucket();

// 4. 匯出 db, bucket 和 admin 供其他檔案使用
module.exports = { admin, db, bucket };