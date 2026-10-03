const db = require('../database/db');
const { COMPANY, DEFAULT_TERMS } = require('../config');
const D = require('docx');

function calc(q) {
  const disc = (Number(q.discount) || 0) / 100;
  let sub = 0, gst = 0;
  const rows = (q.items || []).map(it => {
    const amount = (+it.qty || 0) * (+it.rate || 0);
    sub += amount; gst += amount * (1 - disc) * (+it.gst || 0) / 100;
    return { ...it, amount };
  });
  const d = sub * disc;
  return { rows, sub, d, gst, total: sub - d + gst };
}
const inr = n => Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

exports.company = (req, res) => res.json({ company: COMPANY, terms: DEFAULT_TERMS });

exports.nextNo = (req, res) => {
  const n = db.prepare('SELECT COUNT(*) c FROM quotations').get().c + 1;
  const t = new Date(), p = x => String(x).padStart(2, '0');
  res.json({ qno: `JK/${t.getFullYear()}/${String(n).padStart(3, '0')}`, date: `${p(t.getDate())}-${p(t.getMonth() + 1)}-${t.getFullYear()}` });
};

exports.stats = (req, res) => {
  const all = db.prepare('SELECT COUNT(*) c, COALESCE(SUM(total),0) s FROM quotations').get();
  const m = db.prepare("SELECT COUNT(*) c FROM quotations WHERE strftime('%Y-%m',created)=strftime('%Y-%m','now')").get();
  res.json({ count: all.c, value: all.s, month: m.c });
};

exports.list = (req, res) => {
  const q = `%${req.query.q || ''}%`;
  res.json(db.prepare('SELECT id,qno,customer,total,updated FROM quotations WHERE customer LIKE ? OR qno LIKE ? ORDER BY id DESC').all(q, q));
};

exports.get = (req, res) => {
  const r = db.prepare('SELECT data FROM quotations WHERE id=?').get(req.params.id);
  if (!r) return res.status(404).json({ error: 'Quotation not found.' });
  res.json({ ...JSON.parse(r.data), id: +req.params.id });
};

exports.create = (req, res) => {
  const q = req.body;
  const id = db.prepare('INSERT INTO quotations(qno,customer,total,data) VALUES(?,?,?,?)')
    .run(q.qno, q.customer, calc(q).total, JSON.stringify(q)).lastInsertRowid;
  res.json({ id });
};

exports.update = (req, res) => {
  const q = req.body;
  db.prepare("UPDATE quotations SET qno=?,customer=?,total=?,data=?,updated=CURRENT_TIMESTAMP WHERE id=?")
    .run(q.qno, q.customer, calc(q).total, JSON.stringify(q), req.params.id);
  res.json({ id: +req.params.id });
};

exports.remove = (req, res) => { db.prepare('DELETE FROM quotations WHERE id=?').run(req.params.id); res.json({ ok: true }); };

// ---------- Word (.docx) ----------
exports.docx = async (req, res) => {
  const r = db.prepare('SELECT data FROM quotations WHERE id=?').get(req.params.id);
  if (!r) return res.status(404).send('Quotation not found.');
  const q = JSON.parse(r.data), { rows, sub, d, gst, total } = calc(q);
  const P = (text, o = {}) => new D.Paragraph({ alignment: o.align, spacing: { after: 60 },
    children: [new D.TextRun({ text: String(text), bold: o.bold, size: o.size || 20, color: o.color })] });
  const lines = (s, o) => String(s || '').split('\n').map(l => P(l, o));
  const C = D.AlignmentType.CENTER, RT = D.AlignmentType.RIGHT;
  const W = [600, 4306, 900, 1500, 800, 1800];
  const bd = { style: D.BorderStyle.SINGLE, size: 4, color: '888888' };
  const borders = { top: bd, bottom: bd, left: bd, right: bd };
  const cell = (t, i, o = {}) => new D.TableCell({ width: { size: W[i], type: D.WidthType.DXA }, borders,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    shading: o.head ? { type: D.ShadingType.CLEAR, fill: 'E6EEF7', color: 'auto' } : undefined,
    children: [P(t, { bold: o.head, align: o.right ? RT : undefined, size: 19 })] });
  const table = new D.Table({ width: { size: 9906, type: D.WidthType.DXA }, columnWidths: W, rows: [
    new D.TableRow({ children: ['#', 'Description', 'Qty', 'Rate (₹)', 'GST %', 'Amount (₹)'].map((h, i) => cell(h, i, { head: true })) }),
    ...rows.map((it, n) => new D.TableRow({ children: [cell(n + 1, 0), cell(it.desc, 1), cell(it.qty, 2, { right: true }),
      cell(inr(it.rate), 3, { right: true }), cell(it.gst, 4, { right: true }), cell(inr(it.amount), 5, { right: true })] }))] });
  const doc = new D.Document({ sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1000, bottom: 1000, left: 1000, right: 1000 } } },
    children: [
      P(COMPANY.name, { bold: true, size: 36, align: C, color: '0B4F8A' }),
      P(COMPANY.address, { align: C, size: 18 }), P(COMPANY.contact, { align: C, size: 18 }), P(COMPANY.gstin, { align: C, size: 18 }),
      P('QUOTATION', { bold: true, size: 28, align: C }),
      P('To,'), P(q.customer, { bold: true }), ...lines(q.address), P('Kind Attn: ' + (q.attn || '')),
      P(`Quotation No: ${q.qno}     Date: ${q.date}     Valid: ${q.valid || ''}`, { bold: true }),
      table, P(''),
      P('Subtotal: ₹ ' + inr(sub), { align: RT }), P(`Discount ${q.discount || 0}%: - ₹ ${inr(d)}`, { align: RT }),
      P('GST: ₹ ' + inr(gst), { align: RT }), P('TOTAL: ₹ ' + inr(total), { align: RT, bold: true, size: 24 }), P(''),
      P('Terms & Conditions:', { bold: true }), ...lines(q.terms, { size: 18 }), P(''), P(''),
      P('For ' + COMPANY.name, { bold: true, align: RT }), P(''), P(''), P('Authorised Signatory', { align: RT })
    ] }] });
  const buf = await D.Packer.toBuffer(doc);
  res.set({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'Content-Disposition': `attachment; filename="${String(q.qno).replace(/[^\w-]/g, '-')}.docx"` });
  res.send(buf);
};
