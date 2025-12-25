const { db } = require('../../firebaseConfig');

// 1. 取得我的房客列表
const getTenants = async (req, res) => {
  try {
    const { landlordId } = req.query;

    if (!landlordId) {
      return res.status(400).json({ success: false, message: '缺少房東 ID' });
    }

    // ✨ 修改：指向 'tenantsManage' 集合
    const snapshot = await db.collection('tenantsManage')
      .where('landlordId', '==', landlordId)
      .orderBy('createdAt', 'desc') 
      .get();

    const list = [];
    snapshot.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() });
    });

    res.json({ success: true, data: list });

  } catch (error) {
    console.error('取得房客失敗:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 2. 新增房客 (CRM 概念，建立聯絡人)
const addTenant = async (req, res) => {
  try {
    // 1. ✨ 在這裡補上接收 leaseStart, leaseEnd
    const { landlordId, name, phone, rentalId, rentalTitle, uid, leaseStart, leaseEnd } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: '姓名與電話為必填' });
    }

    const newTenant = {
      landlordId,
      name,
      phone,
      uid: uid || null,
      currentRentalId: rentalId || null,
      currentRentalTitle: rentalTitle || '',
      status: rentalId ? 'active' : 'lead',
      
      // 2. ✨ 在這裡把日期寫入資料庫
      leaseStart: leaseStart || null, 
      leaseEnd: leaseEnd || null,

      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('tenantsManage').add(newTenant);

    res.json({ success: true, message: '房客新增成功', id: docRef.id });

  } catch (error) {
    console.error('新增房客失敗:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. 更新房客資料
const updateTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // ✨ 修改：更新 'tenantsManage' 集合
    await db.collection('tenantsManage').doc(id).update(updateData);
    
    res.json({ success: true, message: '更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '更新失敗' });
  }
};

module.exports = { getTenants, addTenant, updateTenant };