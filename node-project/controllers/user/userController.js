const { db } = require('../../firebaseConfig');

const searchUserByPhone = async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({ success: false, message: '請提供電話號碼' });
    }

    // 搜尋 users 集合
    const snapshot = await db.collection('tenants')
      .where('phone', '==', phone) 
      .limit(1) // 只抓一筆
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ success: false, message: '找不到此使用者' });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    // 回傳必要的資訊就好
    res.json({
      success: true,
      data: {
        uid: userDoc.id, // 重要：這是綁定用的 ID
        name: userData.name || userData.displayName || '',
        email: userData.email || ''
      }
    });

  } catch (error) {
    console.error('搜尋使用者失敗:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

module.exports = { searchUserByPhone };