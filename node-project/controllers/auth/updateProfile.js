const { db } = require('../../firebaseConfig');

const updateProfile = async (req, res) => {
  console.log('收到更新資料請求'); 
  
  try {
    const { userId, role, name, email, avatar } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ message: '缺少使用者 ID 或身分' });
    }

    const collectionName = role === 'landlord' ? 'landlords' : 'tenants';

    const updateData = {
      name: name,
      email: email || ''
    };

    // 如果前端有傳圖片過來，才更新圖片欄位
    if (avatar) {
      updateData.avatar = avatar;
    }

    // 更新 Firestore
    await db.collection(collectionName).doc(userId).update(updateData);

    console.log('資料與頭貼更新成功');
    res.status(200).json({ success: true, message: '資料更新成功' });

  } catch (error) {
    console.error('更新失敗:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

module.exports = updateProfile;