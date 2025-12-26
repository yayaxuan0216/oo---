const { db } = require('../../firebaseConfig');

// 1. 取得我的居住資訊與帳單
const getMyLivingInfo = async (req, res) => {
  try {
    const { uid } = req.query;

    if (!uid) return res.status(400).json({ success: false, message: '未登入' });

    // 搜尋該房客的租約
    const snapshot = await db.collection('tenantsManage')
      .where('uid', '==', uid)
      .where('status', '==', 'active')
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ success: false, message: '目前沒有有效的租屋合約' });
    }

    const rentalsList = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      
      const billList = [];
      if (data.records) {
        Object.keys(data.records).forEach(month => {
          const rec = data.records[month];
          const isPaid = rec.rent && rec.water && rec.electric;
          
          billList.push({
            month,
            items: {
              rent: rec.rent || false,
              water: rec.water || false,
              electric: rec.electric || false
            },
            isPaid,
            amount: rec.totalAmount || 0,
            
            // 回傳房客的備註 (tenantNote)
            // 將 tenantNote 對應到前端慣用的 'note' 欄位，方便顯示
            note: rec.tenantNote || '' 
          });
        });
        // 排序：新月份在前
        billList.sort((a, b) => b.month.localeCompare(a.month));
      }

      rentalsList.push({
        id: doc.id,
        landlordId: data.landlordId,
        rentalTitle: data.currentRentalTitle || '未命名租屋處',
        bills: billList
      });
    });

    res.json({ success: true, data: rentalsList });

  } catch (error) {
    console.error('取得居住資訊失敗:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 房客更新自己的備註
const updateTenantNote = async (req, res) => {
  try {
    const { uid, month, note } = req.body;

    if (!uid || !month) return res.status(400).json({ success: false, message: '參數不足' });

    // 1. 先找到房客的文件
    const snapshot = await db.collection('tenantsManage')
      .where('uid', '==', uid)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ success: false, message: '找不到合約' });
    }

    const doc = snapshot.docs[0];
    const docId = doc.id;
    
    const currentData = doc.data();
    
    // 1. 取得目前的 records
    const records = currentData.records || {};

    // 2. 確保該月份的物件存在
    if (!records[month]) {
      records[month] = { 
        rent: false, water: false, electric: false, 
        tenantNote: '' 
      };
    }

    // 3. 更新記憶體中的物件
    records[month].tenantNote = note;

    // 4. 將整個 records 物件寫回資料庫
    await db.collection('tenantsManage').doc(docId).update({
      records: records
    });


    res.json({ success: true, message: '備註已更新' });

  } catch (error) {
    console.error('更新備註失敗:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

module.exports = { getMyLivingInfo, updateTenantNote };