const qid = new URLSearchParams(location.search).get('id');

function addRow(it = { desc: '', qty: 1, rate: 0, gst: 18 }) {
  const t = document.createElement('tr');
  t.innerHTML = `<td style="width:40px" class="n"></td>
  <td><textarea rows="2" class="desc" placeholder="Item / work description">${esc(it.desc)}</textarea></td>
  <td style="width:80px"><input class="qty" type="number" min="0" step="any" value="${esc(it.qty)}"></td>
  <td style="width:120px"><input class="rate" type="number" min="0" step="any" value="${esc(it.rate)}"></td>
  <td style="width:80px"><input class="gst" type="number" min="0" step="any" value="${esc(it.gst)}"></td>
  <td style="width:120px" class="r amt"></td>
  <td style="width:40px"><button class="d" type="button" title="Remove item" aria-label="Remove item">✕</button></td>`;
  t.oninput = refresh; t.querySelector('button').onclick = () => { t.remove(); refresh(); };
  $('rows').appendChild(t); refresh();
}
function getData() {
  return { id: qid ? +qid : undefined, qno: $('qno').value, date: $('date').value, valid: $('valid').value,
    customer: $('customer').value.trim(), address: $('address').value, attn: $('attn').value,
    discount: num($('discount').value), terms: $('terms').value,
    items: [...$('rows').rows].map(r => ({ desc: r.querySelector('.desc').value, qty: num(r.querySelector('.qty').value),
      rate: num(r.querySelector('.rate').value), gst: num(r.querySelector('.gst').value) })) };
}
function refresh() {
  const t = calcTotals(getData());
  [...$('rows').rows].forEach((r, i) => { r.cells[0].textContent = i + 1; r.querySelector('.amt').textContent = fm(t.rows[i].amount); });
  $('sub').textContent = fm(t.sub); $('dsc').textContent = '- ' + fm(t.d); $('gstT').textContent = fm(t.gst); $('total').textContent = '₹ ' + fm(t.total);
}
function fill(q) {
  ['qno', 'date', 'valid', 'customer', 'address', 'attn', 'discount', 'terms'].forEach(k => $(k).value = q[k] ?? '');
  $('rows').innerHTML = ''; (q.items?.length ? q.items : [undefined]).forEach(addRow);
}
async function save(thenPreview) {
  const q = getData();
  if (!q.customer) return alert('Please enter a customer name.');
  const r = qid ? await api('/api/quotations/' + qid, 'PUT', q) : await api('/api/quotations', 'POST', q);
  location = thenPreview ? '/preview.html?id=' + r.id : '/history.html';
}
(async () => {
  if (qid) fill(await api('/api/quotations/' + qid));
  else {
    const [n, c] = await Promise.all([api('/api/quotations/next-no'), api('/api/quotations/company')]);
    fill({ qno: n.qno, date: n.date, valid: '15 days', discount: 0, terms: c.terms, items: [] });
  }
})();
