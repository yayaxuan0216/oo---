const { db } = require('../../firebaseConfig');
const uploadImage = require('../../utils/uploadImage'); // 引入上傳工具
const getCoordinates = require('../../utils/geocoding'); // 引入地圖工具

const addRental = async (req, res) => {
  try {
    // 1. 解構前端傳來的資料
    const { 
      landlordId, title, address, type, price, 
      deposit, floor, area, rooms, amenities, 
      description, images, isPublished 
    } = req.body;

    // ==========================================
    // 🛠️ 修正重點 A：處理圖片 (解決 1MB 爆掉問題)
    // ==========================================
    let imageUrls = []; // 準備一個陣列來存「網址」

    // 如果前端有傳圖片陣列過來
    if (images && Array.isArray(images) && images.length > 0) {
      console.log(`📸 正在上傳 ${images.length} 張圖片到 Storage...`);
      
      // 使用 Promise.all 平行處理，把 Base64 全部轉成 Storage 網址
      imageUrls = await Promise.all(
        images.map(async (base64String) => {
          return await uploadImage(base64String);
        })
      );
      
      console.log('✅ 圖片上傳完成，網址已取得');
    }

    // ==========================================
    // 🛠️ 修正重點 B：處理座標 (維持原樣)
    // ==========================================
    let coordinates = { lat: 23.705, lng: 120.430 }; // 預設值 (斗六)
    
    if (address) {
      console.log(`🗺️ 正在轉換地址: ${address}...`);
      const coords = await getCoordinates(address);
      if (coords) {
        coordinates = coords;
        console.log('✅ 座標轉換成功:', coordinates);
      } else {
        console.log('⚠️ 查無座標，使用預設值');
      }
    }

    // ==========================================
    // 🛠️ 修正重點 C：組裝完整資料物件
    // (您原本漏掉了很多欄位，這裡全部補上)
    // ==========================================
    const newRental = {
      landlordId,
      title,
      address,
      
      // 寫入轉換後的座標
      lat: coordinates.lat,
      lng: coordinates.lng,

      // 寫入轉換後的「圖片網址」 (絕對不能存 Base64!)
      images: imageUrls, 

      type,
      price: Number(price),     // 確保是數字
      deposit: Number(deposit), // 確保是數字
      floor: Number(floor),     // 補上
      area: Number(area),       // 補上
      rooms: Number(rooms),     // 補上
      
      amenities: amenities || [], // 補上設施陣列
      description: description || '', // 補上描述
      isPublished: isPublished || false, // 補上發布狀態

      createdAt: new Date().toISOString()
    };

    // 寫入資料庫
    // (注意：您的錯誤訊息顯示集合是 houses，請確認是否要改成 rentals)
    // 如果您之前的查詢都是用 rentals，這裡建議統一改成 'rentals'
    const docRef = await db.collection('houses').add(newRental);

    console.log(`🎉 新增成功，ID: ${docRef.id}`);
    res.status(200).json({ success: true, message: '新增成功', id: docRef.id });

  } catch (error) {
    console.error('❌ 新增失敗:', error);
    // 回傳錯誤訊息給前端
    res.status(500).json({ success: false, message: error.message || '伺服器錯誤' });
  }
};

module.exports = addRental;