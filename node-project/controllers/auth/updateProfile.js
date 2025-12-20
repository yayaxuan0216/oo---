const { db } = require('../../firebase');

const updateProfile = async (req, res) => {
  console.log('收到更新資料請求:', req.body);
  
  try {
    const { userId, role, name, email } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ message: '缺少使用者 ID 或身分' });
    }

    // 1. 決定集合名稱
    const collectionName = role === 'landlord' ? 'landlords' : 'tenants';

    // 2. 更新 Firestore 資料
    await db.collection(collectionName).doc(userId).update({
      name: name,
      email: email || '' // 如果 email 是 undefined 則存空字串
    });

    console.log('資料更新成功');
    res.status(200).json({ success: true, message: '資料更新成功' });

  } catch (error) {
    console.error('更新失敗:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

module.exports = updateProfile;