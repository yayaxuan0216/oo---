// index.js
const express = require('express');
const cors = require('cors');
// 引入 firebase 設定 (若其他 API 需要 db，可以 const { db } = require('./firebaseConfig');)
const { db } = require('./firebaseConfig');

// 引入剛剛寫好的路由檔案
const contractRoutes = require('./routes/contracts');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 掛載路由
// 這樣所有在 contractRoutes 裡的網址都會自動加上 /api
// 例如 router.get('/contracts') 會變成 /api/contracts
app.use('/api', contractRoutes);


// --- 其他非合約的 API (例如: 取得真實房客) 可以留著，或是一樣拆分 ---
app.get('/api/room-tenants', async (req, res) => {
  try {
    const { rentalId } = req.query;

    if (!rentalId) return res.json([]);

    const snapshot = await db.collection('appointments')
      .where('rentalId', '==', rentalId)
      .get();

    if (snapshot.empty) {
      return res.json([]); 
    }

    const tenants = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.tenantId,
        name: data.tenantName,
        status: data.status || 'applied'
      };
    });

    res.json(tenants);
  } catch (error) {
    console.error("讀取房客失敗:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});