const { db, admin } = require('../../firebaseConfig');

const addMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, message } = req.body;

    if (!message) return res.status(400).send('訊息是空的');

    const newMessage = {
      role,     // 發言者身份
      content: message, //訊息內容
      createdAt: new Date().toISOString()//紀錄發言時間
    };

    // 將新訊息加入 appointment 的 history 陣列，並更新狀態為 'negotiating'
    await db.collection('appointments').doc(id).update({
      status: 'negotiating', // 只要有人說話，狀態就變協調中
      history: admin.firestore.FieldValue.arrayUnion(newMessage),
      updatedAt: new Date().toISOString()
    });

    res.status(200).json({ success: true, data: newMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
module.exports = addMessage;