const express = require('express');
const router = express.Router(); // 使用 Router
const { PDFDocument } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

// 引入剛剛寫好的 firebaseConfig
// 注意：如果這個檔案在 routes 資料夾內，路徑要用 ../ 回到上一層
const { db, bucket } = require('../firebaseConfig'); 

// 為了避免讀取檔案路徑錯誤，建議使用絕對路徑 helper
const resolvePath = (filename) => path.join(__dirname, '..', filename);

// --- API 1: 取得所有合約 ---
router.get('/contracts', async (req, res) => {
  try {
    const snapshot = await db.collection('contracts').get();
    const leases = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(leases);
  } catch (error) {
    console.error("讀取失敗:", error);
    res.status(500).json({ error: error.message });
  }
});

// --- API 2: 建立新租約 (生成可編輯 PDF) ---
router.post('/contracts', async (req, res) => {
  try {
    const newContract = req.body;
    
    // 1. 解構資料
    const { 
      landlordName, tenantName, address, price, 
      periodStart, periodEnd, otherTerms,
      depositMonths, depositFee 
    } = newContract;

    // 2. 準備日期 (轉民國年)
    const today = new Date();
    const tYear = (today.getFullYear() - 1911).toString();
    const tMonth = (today.getMonth() + 1).toString();
    const tDate = today.getDate().toString();

    const [sY, sM, sD] = (periodStart || '--').split('-');
    const sYearROC = sY ? (parseInt(sY) - 1911).toString() : '';

    const [eY, eM, eD] = (periodEnd || '--').split('-');
    const eYearROC = eY ? (parseInt(eY) - 1911).toString() : '';

    // 3. 讀取 PDF 與字體 (使用 resolvePath 確保路徑正確)
    const templateBytes = fs.readFileSync(resolvePath('template_contract.pdf'));
    const pdfDoc = await PDFDocument.load(templateBytes);
    
    pdfDoc.registerFontkit(fontkit);
    const fontBytes = fs.readFileSync(resolvePath('kaiu.ttf'));
    const customFont = await pdfDoc.embedFont(fontBytes);

    // 4. 填寫表單
    const form = pdfDoc.getForm();
    
    const setField = (fieldName, text) => {
      try {
        const field = form.getTextField(fieldName);
        if (field) {
          field.setText(text ? text.toString() : ''); 
          field.updateAppearances(customFont); 
        }
      } catch (e) { }
    };

    setField('todayyear', tYear);
    setField('todaymonth', tMonth);
    setField('todaydate', tDate);
    setField('depositmonth', depositMonths);
    setField('depositfee', depositFee);
    setField('landlordName', landlordName);
    setField('tenantName', tenantName);
    setField('rentAmount', price);
    setField('periodStartyear', sYearROC);
    setField('periodStartmonth', sM);
    setField('periodStartdate', sD);
    setField('periodEndyear', eYearROC);
    setField('periodEndmonth', eM);
    setField('periodEnddate', eD);
    
    if(otherTerms) setField('otherTerms', otherTerms);
    if(address) setField('address', address);

    // 5. 存檔並上傳
    const pdfBytes = await pdfDoc.save();
    const filename = `contracts/${Date.now()}_${tenantName}.pdf`;
    const file = bucket.file(filename);
    
    await file.save(Buffer.from(pdfBytes), { 
      contentType: 'application/pdf',
      metadata: { contentType: 'application/pdf' }
    });
    
    const [url] = await file.getSignedUrl({ action: 'read', expires: '03-01-2125' });

    // 6. 寫入資料庫
    const finalContractData = {
        ...newContract,
        pdfUrl: url,
        createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('contracts').add(finalContractData);

    console.log("✅ 租約建立成功:", url);
    res.json({ success: true, id: docRef.id, pdfUrl: url });

  } catch (error) {
    console.error("建立租約失敗:", error);
    res.status(500).json({ error: "建立失敗: " + error.message });
  }
});

// --- API 3: 房東上傳修改後的 PDF (覆蓋) ---
router.put('/contracts/:id/update-pdf', async (req, res) => {
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
      pdfUrl: url
    });

    res.json({ success: true, url });

  } catch (error) {
    console.error("更新合約失敗:", error);
    res.status(500).json({ error: error.message });
  }
});

// --- API 4: 房東簽名 ---
router.put('/contracts/:id/landlord-sign', async (req, res) => {
  try {
    const contractId = req.params.id;
    const { signatureImage } = req.body;

    if (!signatureImage) return res.status(400).json({ error: "無簽名資料" });

    const docRef = db.collection('contracts').doc(contractId);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: "合約不存在" });
    const { pdfUrl } = doc.data();

    const pdfResponse = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
    const existingPdfBytes = pdfResponse.data;

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pngImageBytes = Buffer.from(signatureImage.replace(/^data:image\/png;base64,/, ""), 'base64');
    const pngImage = await pdfDoc.embedPng(pngImageBytes);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const pngDims = pngImage.scale(0.25);

    // 房東簽名位置
    firstPage.drawImage(pngImage, {
      x: 100, 
      y: 150, 
      width: pngDims.width,
      height: pngDims.height,
    });

    // 房東簽完名後，鎖定合約 (flatten)
    const form = pdfDoc.getForm();
    try { form.flatten(); } catch(e) {}

    const pdfBytes = await pdfDoc.save();
    const filename = `contracts/${contractId}_signed_${Date.now()}.pdf`;
    const file = bucket.file(filename);
    await file.save(Buffer.from(pdfBytes), { contentType: 'application/pdf' });
    const [url] = await file.getSignedUrl({ action: 'read', expires: '03-01-2125' });

    await docRef.update({
      pdfUrl: url,
      status: 'completed',
      landlordSignedAt: new Date().toISOString()
    });

    res.json({ success: true, url });

  } catch (error) {
    console.error("簽名失敗:", error);
    res.status(500).json({ error: error.message });
  }
});

// --- API 5: 房客簽名 ---
router.put('/contracts/:id/tenant-sign', async (req, res) => {
  try {
    const contractId = req.params.id;
    const { signatureImage } = req.body;

    if (!signatureImage) return res.status(400).json({ error: "無簽名資料" });

    const docRef = db.collection('contracts').doc(contractId);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: "合約不存在" });
    const { pdfUrl } = doc.data();

    const pdfResponse = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
    const existingPdfBytes = pdfResponse.data;

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pngImageBytes = Buffer.from(signatureImage.replace(/^data:image\/png;base64,/, ""), 'base64');
    const pngImage = await pdfDoc.embedPng(pngImageBytes);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0]; 
    const pngDims = pngImage.scale(0.25);

    // 房客簽名位置
    firstPage.drawImage(pngImage, {
      x: 350,
      y: 150,
      width: pngDims.width,
      height: pngDims.height,
    });

    const pdfBytes = await pdfDoc.save();
    const filename = `contracts/${contractId}_tenant_signed_${Date.now()}.pdf`;
    const file = bucket.file(filename);
    
    await file.save(Buffer.from(pdfBytes), { contentType: 'application/pdf' });
    const [url] = await file.getSignedUrl({ action: 'read', expires: '03-01-2125' });

    await docRef.update({
      pdfUrl: url,
      status: 'tenant_signed', 
      tenantSignedAt: new Date().toISOString()
    });

    res.json({ success: true, url });

  } catch (error) {
    console.error("房客簽名失敗:", error);
    res.status(500).json({ error: error.message });
  }
});

// 匯出 router
module.exports = router;