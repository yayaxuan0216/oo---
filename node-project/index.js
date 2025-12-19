const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const bodyParser = require('body-parser');

// 1. 初始化 Firebase
// ⚠️ 請確認 serviceAccountKey.json 檔案真的在這個資料夾內，且名稱完全一樣
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
db.settings({
  databaseId: 'oo-base' // 例如 'my-database'，如果是 (default) 就不用加這行
});
const app = express();

// 2. 中介軟體設定
app.use(cors()); // 允許跨網域請求 (讓 Vue 可以連)
app.use(bodyParser.json()); // 解析 JSON

// 3. 建立註冊 API 接口
// app.post('/api/register', async (req, res) => {
//   try {
//     // 從前端接收資料
//     const { name, phone, address, gender, role, password } = req.body;

//     // 簡單驗證
//     if (!name || !phone || !password) {
//       return res.status(400).json({ message: '欄位不完整' });
//     }

//     // 準備要寫入資料庫的物件
//     const newUser = {
//       name,
//       phone,
//       address,
//       gender,
//       role, // 'tenant' 或 'landlord'
//       password,
//       createdAt: admin.firestore.FieldValue.serverTimestamp()
//     };


//     let collectionName = '';
    
//     if (role === 'landlord') {
//       collectionName = 'landlords'; // 房東存這裡
//     } else {
//       collectionName = 'tenants';   // 租客存這裡
//     }
//     // 寫入 Firestore 的 'tenants' 集合
//     const docRef = await db.collection(collectionName).add(newUser);

//     console.log(`新${role === 'landlord' ? '房東' : '租客'}註冊成功 ID:`, docRef.id);
    
//     // 回傳成功訊息給前端
//     res.status(200).json({ 
//       success: true, 
//       message: '註冊成功', 
//       userId: docRef.id,
//       role: role
//     });

//   } catch (error) {
//     console.error('註冊錯誤:', error);
//     res.status(500).json({ success: false, message: '伺服器錯誤' });
//   }
// });

// 3. 建立註冊 API 接口
app.post('/api/register', async (req, res) => {
  // 🕵️‍♀️ 監控點 1：確認請求有進來
  console.log('收到註冊請求！Body:', req.body); 

  try {
    const { name, phone, address, gender, role, password } = req.body;

    // 基本驗證
    if (!name || !phone || !password || !role) {
      return res.status(400).json({ message: '欄位不完整' });
    }

    const newUser = {
      name,
      phone,
      address,
      gender,
      role, 
      password, // (正式上線前請加密)
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // 判斷存入哪個集合
    let collectionName = role === 'landlord' ? 'landlords' : 'tenants';
    
    // 🕵️‍♀️ 監控點 2：確認即將寫入
    console.log(`準備寫入 Firebase 集合: ${collectionName}`);

    const docRef = await db.collection(collectionName).add(newUser);

    // 🕵️‍♀️ 監控點 3：寫入成功
    console.log(`寫入成功！ID:`, docRef.id);
    
    // 🔴 修正這裡：原本的 ... 拿掉，改成完整的 JSON 回傳
    res.status(200).json({ 
      success: true, 
      message: '註冊成功', 
      userId: docRef.id,
      role: role 
    });

  } catch (error) {
    // 🕵️‍♀️ 監控點 4：發生錯誤
    console.error('後端炸開了:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
});

// 4. 啟動伺服器
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`後端伺服器運作中：http://localhost:${PORT}`);
});