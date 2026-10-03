// Render the quotation preview and open the browser's print dialog for PDF export.
const pid = new URLSearchParams(location.search).get('id');
const inrS = n => '₹ ' + fm(n);
(async () => {
  const [q, c] = await Promise.all([api('/api/quotations/' + pid), api('/api/quotations/company')]);
  const co = c.company, t = calcTotals(q), br = s => esc(s).replace(/\n/g, '<br>');
  $('paper').innerHTML = `<h1>${esc(co.name)}</h1>
  <div class="c">${esc(co.address)}<br>${esc(co.contact)}<br>${esc(co.gstin)}</div>
  <h2 class="c" style="margin:10px 0 0">QUOTATION</h2>
  <div class="meta"><div>To,<br><b>${esc(q.customer)}</b><br>${br(q.address)}<br>Kind Attn: ${esc(q.attn || '')}</div>
  <div>Quotation No: <b>${esc(q.qno)}</b><br>Date: ${esc(q.date)}<br>Valid: ${esc(q.valid || '')}</div></div>
  <table><thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Rate (₹)</th><th>GST %</th><th>Amount (₹)</th></tr></thead><tbody>
  ${t.rows.map((it, i) => `<tr><td>${i + 1}</td><td>${br(it.desc)}</td><td class="n">${esc(it.qty)}</td><td class="n">${fm(it.rate)}</td><td class="n">${esc(it.gst)}</td><td class="n">${fm(it.amount)}</td></tr>`).join('')}
  </tbody></table>
  <table class="tot"><tr><td>Subtotal</td><td class="n">${fm(t.sub)}</td></tr><tr><td>Discount ${esc(q.discount || 0)}%</td><td class="n">- ${fm(t.d)}</td></tr>
  <tr><td>GST</td><td class="n">${fm(t.gst)}</td></tr><tr><td><b>Total</b></td><td class="n"><b>${inrS(t.total)}</b></td></tr></table>
  <b>Terms &amp; Conditions:</b><div style="font-size:12px">${br(q.terms)}</div>
  <div style="margin-top:50px;text-align:right">For <b>${esc(co.name)}</b><br><br><br>Authorised Signatory</div>`;
  document.title = q.qno.replace(/\//g, '-');
  $('editBtn').href = '/quotation.html?id=' + pid;
})();
function downloadPdf() { window.print(); }
