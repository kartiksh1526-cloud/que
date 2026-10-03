async function load() {
  const list = await api('/api/quotations?q=' + encodeURIComponent($('search').value));
  $('list').innerHTML = list.length ? list.map(h => `<tr><td>${esc(h.qno)}</td><td>${esc(h.customer)}</td><td class="r">₹ ${fm(h.total)}</td><td class="mu">${esc(h.updated)}</td>
  <td class="r"><a class="btn s" href="/preview.html?id=${h.id}">Preview</a> <a class="btn s" href="/quotation.html?id=${h.id}">Edit</a>
  <button class="s" onclick="dup(${h.id})">Duplicate</button> <button class="d" onclick="del(${h.id})">Delete</button></td></tr>`).join('')
  : '<tr><td colspan="5" class="mu">No quotations found.</td></tr>';
}
async function dup(id) {
  const q = await api('/api/quotations/' + id), n = await api('/api/quotations/next-no');
  delete q.id; q.qno = n.qno; q.date = n.date;
  const r = await api('/api/quotations', 'POST', q); location = '/quotation.html?id=' + r.id;
}
async function del(id) { if (confirm('Are you sure you want to delete this quotation?')) { await api('/api/quotations/' + id, 'DELETE'); load(); } }
$('search').oninput = load; load();
