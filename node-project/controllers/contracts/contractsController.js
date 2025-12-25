const { PDFDocument } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const fs = require('fs');
const axios = require('axios');
const { db, bucket } = require('../../firebaseConfig');

// 取得所有合約
const getContracts = async (req, res) => {
  try {
    const snapshot = await db.collection('contracts').get();
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

    const [sY, sM, sD] = (periodStart || '--').split('-');
    const sYearROC = sY ? (parseInt(sY) - 1911).toString() : '';

    const [eY, eM, eD] = (periodEnd || '--').split('-');
    const eYearROC = eY ? (parseInt(eY) - 1911).toString() : '';

    // 讀取 PDF 與字體 (注意路徑：假設執行點在根目錄)
    const templateBytes = fs.readFileSync('./template_contract.pdf');
    const pdfDoc = await PDFDocument.load(templateBytes);
    
    pdfDoc.registerFontkit(fontkit);
    const fontBytes = fs.readFileSync('./kaiu.ttf');
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

    // 上傳 Storage
    const pdfBytes = await pdfDoc.save();
    const filename = `contracts/${Date.now()}_${tenantName}.pdf`;
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
        createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('contracts').add(finalContractData);
    console.log("✅ 租約建立成功:", url);
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

    await db.collection('contracts').doc(contractId).update({ pdfUrl: url });

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

    const docRef = db.collection('contracts').doc(contractId);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: "合約不存在" });
    const { pdfUrl } = doc.data();

    const pdfResponse = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
    const pdfDoc = await PDFDocument.load(pdfResponse.data);
    
    const pngImageBytes = Buffer.from(signatureImage.replace(/^data:image\/png;base64,/, ""), 'base64');
    const pngImage = await pdfDoc.embedPng(pngImageBytes);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0]; 
    const pngDims = pngImage.scale(0.25);

    firstPage.drawImage(pngImage, {
      x: 100, 
      y: 150, 
      width: pngDims.width,
      height: pngDims.height,
    });

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
};

// 房客簽名
const tenantSign = async (req, res) => {
  try {
    const contractId = req.params.id;
    const { signatureImage } = req.body;

    if (!signatureImage) return res.status(400).json({ error: "無簽名資料" });

    const docRef = db.collection('contracts').doc(contractId);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: "合約不存在" });
    const { pdfUrl } = doc.data();

    const pdfResponse = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
    const pdfDoc = await PDFDocument.load(pdfResponse.data);
    
    const pngImageBytes = Buffer.from(signatureImage.replace(/^data:image\/png;base64,/, ""), 'base64');
    const pngImage = await pdfDoc.embedPng(pngImageBytes);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0]; 
    const pngDims = pngImage.scale(0.25);

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
};

module.exports = {
  getContracts,
  createContract,
  updateContractPdf,
  landlordSign,
  tenantSign
};