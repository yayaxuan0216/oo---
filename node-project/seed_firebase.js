// 改用 Firebase Client SDK (走 HTTP 協定，避開 gRPC 錯誤)
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, Timestamp } = require("firebase/firestore");

// 這是 API Key 設定
const firebaseConfig = {
  apiKey: "AIzaSyBGnMmziDY7U8joHDkrH2cRE_vH2sNPgto",
  authDomain: "oo-project-dedbd.firebaseapp.com",
  projectId: "oo-project-dedbd",
  storageBucket: "oo-project-dedbd.firebasestorage.app",
  messagingSenderId: "19707691140",
  appId: "1:19707691140:web:a7c1a8dab8c9c8d28002d1"
};

// 初始化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app,'oo-base'); // 指定使用非預設資料庫

async function seedFirebase() {
  try {
    console.log(' 正在透過 HTTP 連線到資料庫...');
    console.log(' 開始寫入資料...');

    // --- 1. 建立房東 (Landlords) ---
    const landlordRef = await addDoc(collection(db, 'landlords'), {
      mail: '123@gemail.com',
      password: '123456',
      name: '王大陸',
      phoneNumber: '0912345678',
      type: '個人',
      createdAt: new Date()
    });
    const landlordId = landlordRef.id;
    console.log(`   ✅ 房東建立成功 (ID: ${landlordId})`);


    // --- 2. 建立房客 (Tenants) ---
    const tenantsData = [
        { mail: 'stu@gemail.com', password: '123456', name: '特斯拉', phone: '0987654321', type: '學生' },
        { mail: '666@gemail.com', password: '789', name: '張傳魚', phone: '0912345678', type: '學生' },
        { mail: '789@gemail.com', password: '123', name: '蕭波', phone: '0987654321', type: '學生' }
    ];

    let lastTenantId = "";
    for (const tenant of tenantsData) {
        const res = await addDoc(collection(db, 'tenants'), {
            ...tenant,
            createdAt: new Date()
        });
        lastTenantId = res.id;
    }
    console.log(`   3 位房客建立成功`);


    // --- 3. 建立設施 (Amenities) ---
    const amenityNames = ['冷氣', '洗衣機', '冰箱', '網路', '第四台'];
    const amenityIds = [];
    for (const name of amenityNames) {
        const res = await addDoc(collection(db, 'amenities'), {
            name: name,
            category: '家電'
        });
        amenityIds.push(res.id);
    }
    console.log(`   設施建立成功`);


    // --- 4. 建立房屋 (Houses) ---
    const houseRef = await addDoc(collection(db, 'houses'), {
        name: '雲科龍潭溫馨套房',
        address: '雲林縣斗六市龍潭路1-81號',
        rent: 640,
        description: '近學校，採光佳，含水費',
        deposit: '兩個月',
        type: '套房',
        state: '待租',
        floor: '3F',
        area: 8.5,
        landlordId: landlordId,
        amenities: [
            { id: amenityIds[0], note: '分離式冷氣' },
            { id: amenityIds[3], note: '光纖 100M' }
        ],
        createdAt: new Date()
    });
    const houseId = houseRef.id;
    console.log(`   房屋建立成功 (ID: ${houseId})`);


    // --- 5. 建立預約 (ViewAppointments) ---
    // 注意：Client SDK 的 Timestamp 處理方式稍微不同，這裡直接用 Date 物件即可，Firebase 會自動轉
    await addDoc(collection(db, 'viewAppointments'), {
        landlordId: landlordId,
        tenantId: lastTenantId,
        houseId: houseId,
        viewTime: Timestamp.fromDate(new Date('2025-12-25T10:00:00')),
        state: '待確認',
        remark: '學生想看房'
    });


    // --- 6. 建立聊天紀錄 ---
    const chatRef = await addDoc(collection(db, 'conversations'), {
        landlordId: landlordId,
        tenantId: lastTenantId,
        houseId: houseId,
        chatStatus: 'Active',
        lastMessageTime: new Date()
    });

    // 寫入子集合 (Sub-collection)
    // 在 Client SDK v9+，需要指定完整路徑
    const messagesCollectionRef = collection(db, 'conversations', chatRef.id, 'messages');

    await addDoc(messagesCollectionRef, {
        senderId: lastTenantId,
        content: '您好，請問還有空房嗎？',
        sentAt: new Date(),
        isRead: false
    });

    await addDoc(messagesCollectionRef, {
        senderId: landlordId,
        content: '有的，歡迎預約看房！',
        sentAt: new Date(),
        isRead: false
    });

    console.log(' 大功告成！避開 gRPC 問題，資料寫入完畢！');

  } catch (error) {
    console.error(' 寫入失敗:', error.message);
    if (error.message.includes("permission-denied")) {
        console.log("請記得去 Firebase Console -> Firestore -> Rules 把權限改成 true！");
    }
  }
}

seedFirebase();