const { db } = require('../../firebaseConfig'); 
const admin = require('firebase-admin'); 

// 1. 發送訊息
const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, message, senderRole } = req.body;

    // 產生聊天室 ID (規則：房東ID_房客ID)
    let chatId;
    if (senderRole === 'landlord') {
      chatId = `${senderId}_${receiverId}`;
    } else {
      chatId = `${receiverId}_${senderId}`;
    }

    const newMessage = {
      text: message,
      senderId: senderId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false
    };

    // 寫入 messages 子集合
    await db.collection('chats').doc(chatId).collection('messages').add(newMessage);

    // 更新聊天室最後訊息
    await db.collection('chats').doc(chatId).set({
      lastMessage: message,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      participants: [senderId, receiverId]
    }, { merge: true });

    res.json({ success: true, message: '傳送成功' });

  } catch (error) {
    console.error('傳送失敗:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 2. 取得聊天紀錄 (API 版)
const getChatHistory = async (req, res) => {
  try {
    const { senderId, receiverId, role } = req.query;

    if (!senderId || !receiverId) {
      return res.status(400).json({ success: false, message: '缺少 ID' });
    }

    let chatId;
    if (role === 'landlord') {
      chatId = `${senderId}_${receiverId}`;
    } else {
      chatId = `${receiverId}_${senderId}`;
    }

    const snapshot = await db.collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .get();

    const messages = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        text: data.text,
        senderId: data.senderId,
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString()
      });
    });

    res.json({ success: true, data: messages });

  } catch (error) {
    console.error('取得訊息失敗:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

module.exports = { sendMessage, getChatHistory };