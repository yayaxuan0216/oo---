const { db } = require('../../firebaseConfig');

const getAmenities = async (req, res) => {
  try {
    const snapshot = await db.collection('amenities').get();
    
    const list = [];
    snapshot.forEach(doc => {
      list.push(doc.data().name);
    });

    res.status(200).json({ success: true, data: list });
  } catch (error) {
    console.error('取得設施失敗:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

module.exports = getAmenities;