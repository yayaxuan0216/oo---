const mysql = require('mysql2/promise');

async function seedData() {
    const pool = mysql.createPool({
        host: 'localhost',
        port: 3307,          // 你的 XAMPP Port
        user: 'root',
        password: '',
        database: 'rental_system',    // 你的資料庫名稱
        waitForConnections: true,
        connectionLimit: 10
    });

    try {
        const connection = await pool.getConnection();
        console.log('開始寫入測試資料...');

        // --- 1. 建立房東 (Landlord) ---
        console.log('正在建立房東...');
        const [landlordRes] = await connection.execute(
            `INSERT INTO Landlord (Mail, Password, Name, PhoneNumber, Type) 
             VALUES (?, ?, ?, ?, ?)`,
            ['123@gemail.com', '123456', '王大陸', '0912345678', '個人']
        );
        const landlordId = landlordRes.insertId; 

        // --- 2. 建立房客 (Tenant) ---
        console.log('正在建立房客...');
        
        const tenantsData = [
            ['stu@gemail.com', '123456', '特斯拉', '0987654321', '學生'],
            ['666@gemail.com', '789', '張傳魚', '0912345678', '學生'],
            ['789@gemail.com', '123', '蕭波', '0987654321', '學生']
        ];

        // ★★★ 修改重點：先宣告變數，用來存最後一個人的 ID ★★★
        let tenantId = 0; 

        for (const tenant of tenantsData) {
            // 把執行結果存下來 ([res])
            const [res] = await connection.execute(
                `INSERT INTO Tenant (Mail, Password, Name, PhoneNumber, Type) 
                 VALUES (?, ?, ?, ?, ?)`,
                tenant 
            );
            // 更新 tenantId，這樣迴圈結束後我們至少有一個 ID 可以用
            tenantId = res.insertId;
        }
        
        console.log(` 成功新增 ${tenantsData.length} 位房客！(最後一位 ID: ${tenantId})`);

        // --- 3. 建立設施 (Amenity) ---
        console.log('正在建立公共設施選項...');
        const amenities = ['冷氣', '洗衣機', '冰箱', '網路', '第四台'];
        const amenityIds = [];
        for (const name of amenities) {
            const [res] = await connection.execute(
                'INSERT INTO Amenity (Name, Category) VALUES (?, ?)',
                [name, '家電']
            );
            amenityIds.push(res.insertId);
        }

        // --- 4. 建立房屋 (House) ---
        console.log('正在建立房屋...');
        const [houseRes] = await connection.execute(
            `INSERT INTO House (Name, Address, Rent, Description, Deposit, Type, State, Floor, Area, LandlordID) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                '雲科龍潭溫馨套房', 
                '雲林縣斗六市龍潭路1-81號', 
                640, 
                '近學校，採光佳，含水費', 
                '兩個月', 
                '套房', 
                '待租', 
                '3F', 
                8.5, 
                landlordId 
            ]
        );
        const houseId = houseRes.insertId;

        // --- 5. 建立房屋設施關聯 (HouseAmenity) ---
        console.log('正在設定房屋設施...');
        await connection.execute('INSERT INTO HouseAmenity (HouseID, AmenityID, QuantityOrNote) VALUES (?, ?, ?)', [houseId, amenityIds[0], '分離式冷氣']);
        await connection.execute('INSERT INTO HouseAmenity (HouseID, AmenityID, QuantityOrNote) VALUES (?, ?, ?)', [houseId, amenityIds[3], '光纖 100M']);

        // --- 6. 建立預約看房 (ViewAppointment) ---
        // 這裡會使用到上面留下來的 tenantId (也就是蕭波的 ID)
        console.log('正在建立預約紀錄...');
        await connection.execute(
            `INSERT INTO ViewAppointment (LandlordID, TenantID, HouseID, ViewTime, State, Remark)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [landlordId, tenantId, houseId, '2025-12-25 10:00:00', '待確認', '學生想看房']
        );

        // --- 7. 建立聊天紀錄 (Conversation + Message) ---
        console.log('正在建立聊天紀錄...');
        const [chatRes] = await connection.execute(
            `INSERT INTO Conversation (LandlordID, TenantID, HouseID, ChatStatus) VALUES (?, ?, ?, ?)`,
            [landlordId, tenantId, houseId, 'Active']
        );
        const chatId = chatRes.insertId;

        await connection.execute(
            `INSERT INTO Message (ConversationID, SenderID, Content) VALUES (?, ?, ?)`,
            [chatId, tenantId, '您好，請問這間還有空房嗎？'] 
        );

        await connection.execute(
            `INSERT INTO Message (ConversationID, SenderID, Content) VALUES (?, ?, ?)`,
            [chatId, landlordId, '有的，歡迎預約看房！'] 
        );

        console.log('測試資料寫入完成！');
        connection.release();

    } catch (error) {
        console.error('寫入失敗:', error.message);
    } finally {
        await pool.end();
    }
}

seedData();