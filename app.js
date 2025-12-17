// 引入 mysql2 的 promise 版本
const mysql = require('mysql2/promise');

async function testConnection() {
    // 1. 建立連線池 (Connection Pool) 設定
    const pool = mysql.createPool({
        host: 'localhost',    // XAMPP 預設主機
        port: 3307,             
        user: 'root',           // XAMPP 預設帳號
        password: '',           // XAMPP 預設密碼通常為空 (若是空的請留空字串)
        database: 'rental_system',       // 請改成你要連線的資料庫名稱 (XAMPP 通常自帶一個 'test' 資料庫)
        waitForConnections: true,
        connectionLimit: 10,    // 同時最大連線數
        queueLimit: 0
    });

    try {
        // 2. 嘗試取得連線
        const connection = await pool.getConnection();
        console.log('✅ 成功連接到 XAMPP MySQL 資料庫！');

        // 3. 測試執行一個簡單的 SQL 查詢
        const [rows, fields] = await connection.execute('SELECT 1 + 1 AS solution');
        console.log('測試查詢結果:', rows[0].solution); // 應該印出 2

        // 4. 釋放連線回連線池
        connection.release();

    } catch (error) {
        console.error('連線失敗:', error.message);
        
        // 常見錯誤排除提示
        if (error.code === 'ECONNREFUSED') {
            console.log('提示：請確認 XAMPP 的 MySQL 是否已啟動？Port 是否為 3306？');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('提示：請確認帳號密碼是否正確 (XAMPP 預設密碼通常是空的)。');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('提示：找不到資料庫，請確認 "database" 參數名稱正確。');
        }
    } finally {
        // 關閉整個連線池 (通常在程式結束時才做)
        await pool.end();
    }
}

testConnection();