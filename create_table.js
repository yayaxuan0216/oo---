const mysql = require('mysql2/promise');

async function createSchema() {
    const pool = mysql.createPool({
        host: 'localhost',
        port: 3307,          // 你的 XAMPP Port (若是 3306 請自行修改)
        user: 'root',
        password: '',
        database: 'rental_system',    // 你的資料庫名稱
        waitForConnections: true,
        connectionLimit: 10,
        multipleStatements: true // 允許一次執行多條 SQL
    });

    try {
        const connection = await pool.getConnection();
        console.log('連線成功，開始建立資料表...');

        // 定義所有 SQL (依照依賴順序排列)
        // 策略：依圖表建立獨立的 Landlord 與 Tenant 表格，方便 FK 參照
        const queries = [
            // 1. 建立房東表 (Landlord)
            `CREATE TABLE IF NOT EXISTS Landlord (
                UserID INT AUTO_INCREMENT PRIMARY KEY,
                Mail VARCHAR(50) NOT NULL,
                Password VARCHAR(20) NOT NULL,
                Name VARCHAR(50),
                BirthDate DATETIME,
                PhoneNumber VARCHAR(10),
                Type VARCHAR(10),
                Registertime DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // 2. 建立房客表 (Tenant)
            `CREATE TABLE IF NOT EXISTS Tenant (
                UserID INT AUTO_INCREMENT PRIMARY KEY,
                Mail VARCHAR(50) NOT NULL,
                Password VARCHAR(20) NOT NULL,
                Name VARCHAR(50),
                BirthDate DATETIME,
                PhoneNumber VARCHAR(10),
                Type VARCHAR(10),
                Registertime DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // 3. 建立設施表 (Amenity) - 獨立表格
            `CREATE TABLE IF NOT EXISTS Amenity (
                AmenityID INT AUTO_INCREMENT PRIMARY KEY,
                Name VARCHAR(50),
                Category VARCHAR(20),
                Description VARCHAR(255)
            )`,

            // 4. 建立房屋表 (House) - 需要參照 Landlord
            `CREATE TABLE IF NOT EXISTS House (
                HouseID INT AUTO_INCREMENT PRIMARY KEY,
                Name VARCHAR(50),
                Address VARCHAR(255),
                Rent INT,
                Description VARCHAR(255),
                Deposit VARCHAR(20),
                Type VARCHAR(10),
                State VARCHAR(10),
                Floor VARCHAR(10),
                Area DECIMAL(4,2),
                LandlordID INT,
                FOREIGN KEY (LandlordID) REFERENCES Landlord(UserID) ON DELETE SET NULL
            )`,

            // 5. 建立房屋圖片表 (HouseImage) - 參照 House
            `CREATE TABLE IF NOT EXISTS HouseImage (
                ImageID INT AUTO_INCREMENT PRIMARY KEY,
                HouseID INT,
                ImageURL VARCHAR(255),
                Description VARCHAR(255),
                SortOrder INT,
                UploadTime DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (HouseID) REFERENCES House(HouseID) ON DELETE CASCADE
            )`,

            // 6. 建立房屋設施關聯表 (HouseAmenity) - 多對多關聯
            `CREATE TABLE IF NOT EXISTS HouseAmenity (
                HouseID INT,
                AmenityID INT,
                QuantityOrNote VARCHAR(50),
                PRIMARY KEY (HouseID, AmenityID),
                FOREIGN KEY (HouseID) REFERENCES House(HouseID) ON DELETE CASCADE,
                FOREIGN KEY (AmenityID) REFERENCES Amenity(AmenityID) ON DELETE CASCADE
            )`,

            // 7. 建立我的最愛 (Favorite) - 參照 Tenant 和 House
            `CREATE TABLE IF NOT EXISTS Favorite (
                TenantID INT,
                HouseID INT,
                Collectiontime DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (TenantID, HouseID),
                FOREIGN KEY (TenantID) REFERENCES Tenant(UserID) ON DELETE CASCADE,
                FOREIGN KEY (HouseID) REFERENCES House(HouseID) ON DELETE CASCADE
            )`,

            // 8. 建立租屋偏好 (Preference) - 參照 Tenant
            `CREATE TABLE IF NOT EXISTS Preference (
                TenantID INT PRIMARY KEY,
                EstimatedMons INT,
                BudgetMax INT,
                BudgetMin INT,
                Region VARCHAR(255),
                PeopleNum INT,
                Type VARCHAR(10),
                FOREIGN KEY (TenantID) REFERENCES Tenant(UserID) ON DELETE CASCADE
            )`,

            // 9. 建立看房預約 (ViewAppointment)
            `CREATE TABLE IF NOT EXISTS ViewAppointment (
                ViewID INT AUTO_INCREMENT PRIMARY KEY,
                LandlordID INT,
                TenantID INT,
                HouseID INT,
                ViewTime DATETIME,
                State VARCHAR(10),
                Remark VARCHAR(255),
                FOREIGN KEY (LandlordID) REFERENCES Landlord(UserID),
                FOREIGN KEY (TenantID) REFERENCES Tenant(UserID),
                FOREIGN KEY (HouseID) REFERENCES House(HouseID)
            )`,

            // 10. 建立聊天室 (Conversation) - 注意這裡修正了圖表拼字 Coversation -> Conversation
            `CREATE TABLE IF NOT EXISTS Conversation (
                ConversationID INT AUTO_INCREMENT PRIMARY KEY,
                LandlordID INT,
                TenantID INT,
                HouseID INT,
                STime DATETIME,
                LTime DATETIME,
                ChatStatus VARCHAR(20),
                FOREIGN KEY (LandlordID) REFERENCES Landlord(UserID),
                FOREIGN KEY (TenantID) REFERENCES Tenant(UserID),
                FOREIGN KEY (HouseID) REFERENCES House(HouseID)
            )`,

            // 11. 建立訊息 (Message)
            `CREATE TABLE IF NOT EXISTS Message (
                MessageID INT AUTO_INCREMENT PRIMARY KEY,
                ConversationID INT,
                SenderID INT, -- 這裡儲存傳送者的 UserID (可能是房東或房客)
                IsRead BOOLEAN DEFAULT FALSE,
                Content TEXT,
                SendTime DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (ConversationID) REFERENCES Conversation(ConversationID) ON DELETE CASCADE
            )`,

            // 12. 建立合約 (Contract)
            `CREATE TABLE IF NOT EXISTS Contract (
                ContractID INT AUTO_INCREMENT PRIMARY KEY,
                LandlordID INT,
                TenantID INT,
                HouseID INT,
                ContractTemplateVersion VARCHAR(255),
                StartDate DATETIME,
                Endtime DATETIME,
                FinalRent INT,
                FinalDeposit VARCHAR(20),
                WaterFeePerUnit DECIMAL(10,2),
                ElectricFeePerUnit DECIMAL(10,2),
                ManagementFeePerUnit DECIMAL(10,2),
                ContractStatus VARCHAR(20),
                SetupTime DATETIME,
                SignedTime DATETIME,
                FOREIGN KEY (LandlordID) REFERENCES Landlord(UserID),
                FOREIGN KEY (TenantID) REFERENCES Tenant(UserID),
                FOREIGN KEY (HouseID) REFERENCES House(HouseID)
            )`,

            // 13. 建立簽名紀錄 (SignatureRecord)
            `CREATE TABLE IF NOT EXISTS SignatureRecord (
                RecordID INT AUTO_INCREMENT PRIMARY KEY,
                SignatoryID INT, -- 簽名者的 ID
                SignatoryType VARCHAR(10), -- 判斷是 Landlord 還是 Tenant
                ContractID INT,
                IPAddress VARCHAR(45),
                DigitalSignature VARCHAR(255),
                SignTime DATETIME,
                Signed BOOLEAN,
                FOREIGN KEY (ContractID) REFERENCES Contract(ContractID) ON DELETE CASCADE
            )`
        ];

        // 依序執行 SQL
        for (const sql of queries) {
            // 從 SQL 中擷取表格名稱以顯示 Log (只是為了好看)
            const tableName = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1];
            await connection.execute(sql);
            console.log(`資料表 [${tableName}] 檢查/建立完成`);
        }

        console.log('所有資料表建置完畢！');
        connection.release();

    } catch (error) {
        console.error('建表失敗:', error.message);
    } finally {
        await pool.end();
    }
}

createSchema();