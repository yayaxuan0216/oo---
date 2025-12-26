// 取得單一房源詳情
const getRentalById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('houses').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: '找不到房源' });
    }

    // ✨ 新增：計算收藏人數
    const favSnapshot = await db.collection('favorites')
      .where('rentalId', '==', id)
      .get();
    
    const favoriteCount = favSnapshot.size; // 取得符合條件的文件數量

    res.json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data(),
        favoriteCount: favoriteCount // ✨ 將人數回傳給前端
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};