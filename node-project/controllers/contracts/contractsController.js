const { PDFDocument } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const fs = require('fs').promises; // 使用 Promise 版本的 fs
const path = require('path');
const axios = require('axios');
const { db, bucket } = require('../../firebaseConfig');

// --- Helper Functions ---

// 民國日期轉換工具
const getROCDateParts = (dateString) => {
  if (!dateString) return { y: '', m: '', d: '' };
  const [y, m, d] = dateString.split('-');
  return {
    y: y ? (parseInt(y) - 1911).toString() : '',
    m: m || '',
    d: d || ''
  };
};

// 共用的簽名處理邏輯
const processSignature = async (contractId, signatureBase64, position, role) => {
  // 1. 取得合約資料
  const docRef = db.collection('contracts').doc(contractId);
  const doc = await docRef.get();
  if (!doc.exists) throw new Error("合約不存在");
  
  const { pdfUrl } = doc.data();
  if (!pdfUrl) throw new Error("找不到 PDF 連結");

  // 2. 下載 PDF (建議優化：若 DB 有存 storagePath，可直接用 bucket.file(path).download())
  const pdfResponse = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
  const pdfDoc = await PDFDocument.load(pdfResponse.data);

  // 3. 嵌入簽名圖片
  const pngImageBytes = Buffer.from(signatureBase64.replace(/^data:image\/png;base64,/, ""), 'base64');
  const pngImage = await pdfDoc.embedPng(pngImageBytes);

  // 4. 繪製簽名
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const pngDims = pngImage.scale(0.25);

  firstPage.drawImage(pngImage, {
    x: position.x,
    y: position.y,
    width: pngDims.width,
    height: pngDims.height,
  });

  // 5. 鎖定表單 (Flatten) - 視需求決定是否每次都鎖定
  const form = pdfDoc.getForm();
  try { form.flatten(); } catch (e) { console.log("Flatten skipped or failed"); }

  // 6. 存回 Storage
  const pdfBytes = await pdfDoc.save();
  // 使用統一的命名規則，方便追蹤
  const filename = `contracts/${contractId}_${role}_signed_${Date.now()}.pdf`;
  const file = bucket.file(filename);

  await file.save(Buffer.from(pdfBytes), {
    contentType: 'application/pdf',
    metadata: { contentType: 'application/pdf' }
  });

  const [url] = await file.getSignedUrl({ action: 'read', expires: '03-01-2125' });

  // 7. 更新 Firestore
  const updateData = {
    pdfUrl: url,
    storagePath: filename, // 新增：建議儲存路徑，未來優化用
  };

  if (role === 'landlord') {
    updateData.status = 'landlord_signed'; // 狀態管理建議明確一點
    updateData.landlordSignedAt = new Date().toISOString();
  } else if (role === 'tenant') {
    updateData.status = 'tenant_signed';
    updateData.tenantSignedAt = new Date().toISOString();
  }

  // 若雙方都簽了，可更新為 completed (需視業務邏輯判斷)
  // 此處僅做基本更新
  await docRef.update(updateData);

  return url;
};

// --- Controllers ---

// 取得所有合約
// 修改 controllers/contractsController.js

const getContracts = async (req, res) => {
  try {
    // 1. 取得前端傳來的查詢參數
    const { landlordId, tenantId } = req.query;

    let query = db.collection('contracts');

    // 2. 如果有傳 landlordId，就只抓該房東的資料
    if (landlordId) {
      query = query.where('landlordId', '==', landlordId);
    }
    // 3. (選用) 如果未來要給房客看，也可以過濾房客 ID
    else if (tenantId) {
      query = query.where('tenantId', '==', tenantId);
    }

    // 4. 執行查詢 (加上排序讓新的在上面)
    // 注意：如果有 where 和 orderBy 混用，Firebase 可能會要求建立索引(Index)，這很正常
    const snapshot = await db.collection('contracts')
  .where('landlordId', '==', landlordId)
  .get();

    const leases = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(leases);
  } catch (error) {
    console.error("讀取失敗:", error);
    res.status(500).json({ error: error.message });
  }
};

// 建立新租約 (生成 PDF)
const createContract = async (req, res) => {
  try {
    const newContract = req.body;
    const {
      landlordName, tenantName, address, price,
      periodStart, periodEnd, otherTerms,
      depositMonths, depositFee
    } = newContract;

    // 日期處理
    const today = new Date();
    const tYear = (today.getFullYear() - 1911).toString();
    const tMonth = (today.getMonth() + 1).toString();
    const tDate = today.getDate().toString();

    const start = getROCDateParts(periodStart);
    const end = getROCDateParts(periodEnd);

    // 讀取 PDF 與字體 (使用非阻塞 IO)
    // 確保 template 和 ttf 檔案存在於正確路徑，建議使用 path.join 確保路徑安全
    const templatePath = path.join(__dirname, '../../template_contract.pdf'); // 請依實際結構調整路徑
    const fontPath = path.join(__dirname, '../../kaiu.ttf');

    // 並行讀取檔案以加速
    const [templateBytes, fontBytes] = await Promise.all([
      fs.readFile(templatePath),
      fs.readFile(fontPath)
    ]);

    const pdfDoc = await PDFDocument.load(templateBytes);
    pdfDoc.registerFontkit(fontkit);
    const customFont = await pdfDoc.embedFont(fontBytes);

    // 填寫表單
    const form = pdfDoc.getForm();
    const setField = (fieldName, text) => {
      try {
        const field = form.getTextField(fieldName);
        if (field) {
          field.setText(text ? text.toString() : '');
          field.updateAppearances(customFont);
        }
      } catch (e) {
        // 欄位不存在時忽略
      }
    };

    setField('todayyear', tYear);
    setField('todaymonth', tMonth);
    setField('todaydate', tDate);
    setField('depositmonth', depositMonths);
    setField('depositfee', depositFee);
    setField('landlordName', landlordName);
    setField('tenantName', tenantName);
    setField('rentAmount', price);
    
    setField('periodStartyear', start.y);
    setField('periodStartmonth', start.m);
    setField('periodStartdate', start.d);
    
    setField('periodEndyear', end.y);
    setField('periodEndmonth', end.m);
    setField('periodEnddate', end.d);

    if (otherTerms) setField('otherTerms', otherTerms);
    if (address) setField('address', address);

    // 上傳 Storage
    const pdfBytes = await pdfDoc.save();
    const filename = `contracts/${Date.now()}_${tenantName || 'unknown'}.pdf`;
    const file = bucket.file(filename);

    await file.save(Buffer.from(pdfBytes), {
      contentType: 'application/pdf',
      metadata: { contentType: 'application/pdf' }
    });

    const [url] = await file.getSignedUrl({ action: 'read', expires: '03-01-2125' });

    // 寫入 Firestore
    const finalContractData = {
      ...newContract,
      pdfUrl: url,
      storagePath: filename, // 儲存路徑
      status: 'created',     // 初始狀態
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('contracts').add(finalContractData);
    console.log("✅ 租約建立成功:", docRef.id);
    res.json({ success: true, id: docRef.id, pdfUrl: url });

  } catch (error) {
    console.error("建立租約失敗:", error);
    res.status(500).json({ error: "建立失敗: " + error.message });
  }
};

// 更新 PDF (房東上傳覆蓋)
const updateContractPdf = async (req, res) => {
  try {
    const contractId = req.params.id;
    const { pdfBase64 } = req.body;

    if (!pdfBase64) return res.status(400).json({ error: "無檔案資料" });

    const base64Data = pdfBase64.replace(/^data:application\/pdf;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    const filename = `contracts/${contractId}_updated_${Date.now()}.pdf`;
    const file = bucket.file(filename);

    await file.save(buffer, {
      contentType: 'application/pdf',
      metadata: { contentType: 'application/pdf' }
    });

    const [url] = await file.getSignedUrl({ action: 'read', expires: '03-01-2125' });

    await db.collection('contracts').doc(contractId).update({ 
      pdfUrl: url,
      storagePath: filename 
    });

    res.json({ success: true, url });
  } catch (error) {
    console.error("更新合約失敗:", error);
    res.status(500).json({ error: error.message });
  }
};

// 房東簽名
const landlordSign = async (req, res) => {
  try {
    const contractId = req.params.id;
    const { signatureImage } = req.body;
    if (!signatureImage) return res.status(400).json({ error: "無簽名資料" });

    // 呼叫共用函數 (座標請依實際 PDF 調整)
    const url = await processSignature(contractId, signatureImage, { x: 100, y: 150 }, 'landlord');
    
    res.json({ success: true, url });
  } catch (error) {
    console.error("房東簽名失敗:", error);
    res.status(500).json({ error: error.message });
  }
};

// 房客簽名
const tenantSign = async (req, res) => {
  try {
    const contractId = req.params.id;
    const { signatureImage } = req.body;
    if (!signatureImage) return res.status(400).json({ error: "無簽名資料" });

    // 呼叫共用函數
    const url = await processSignature(contractId, signatureImage, { x: 350, y: 150 }, 'tenant');

    res.json({ success: true, url });
  } catch (error) {
    console.error("房客簽名失敗:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getContracts,
  createContract,
  updateContractPdf,
  landlordSign,
  tenantSign
};