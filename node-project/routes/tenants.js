const express = require('express');
const router = express.Router();
// 注意：請確認 firebaseConfig 的路徑。通常 routes 資料夾在根目錄下一層，所以是用 .. 回上一頁
const { db } = require('../firebaseConfig'); 

// 取得特定房源的房客/申請者名單
// 因為在 index.js 我們會設定路徑為 /api/room-tenants，所以這裡只要寫 '/'
router.get('/', async (req, res) => {
  try {
    const { rentalId } = req.query; // 取得前端傳來的 ?rentalId=...

    if (!rentalId) {
      return res.status(400).json({ error: "缺少 rentalId 參數" });
    }

    // 🔥 請確認你的資料庫集合名稱是否正確 (例如 'appointments' 或 'requests')
    const snapshot = await db.collection('appointments') 
      .where('rentalId', '==', rentalId)
      .get();

    if (snapshot.empty) {
      // 如果沒人預約，回傳空陣列，不要回傳錯誤
      return res.json([]); 
    }

    const tenants = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,         // 文件 ID
        name: data.name || data.tenantName,    // 確保欄位名稱對應資料庫
        status: data.status // 預約狀態
      };
    });

    res.json(tenants);

  } catch (error) {
    console.error("取得房客失敗:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;