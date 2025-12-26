const { db } = require('../../firebaseConfig');

const getRoomTenants = async (req, res) => {
  try {
    const { rentalId } = req.query;

    if (!rentalId) return res.json([]);

    const snapshot = await db.collection('appointments')
      .where('rentalId', '==', rentalId)
      .get();

    if (snapshot.empty) {
      return res.json([]); 
    }

    const tenants = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.tenantId,
        name: data.tenantName,
        status: data.status || 'applied'
      };
    });

    res.json(tenants);
  } catch (error) {
    console.error("讀取房客失敗:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getRoomTenants };