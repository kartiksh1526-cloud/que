(async () => {
  const s = await api('/api/quotations/stats');
  $('sCount').textContent = s.count; $('sVal').textContent = '₹ ' + fm(s.value); $('sMonth').textContent = s.month;
  const list = (await api('/api/quotations')).slice(0, 6);
  $('recent').innerHTML = list.length ? list.map(h => `<tr><td>${esc(h.qno)}</td><td>${esc(h.customer)}</td><td class="r">₹ ${fm(h.total)}</td>
    <td class="r"><a class="btn s" href="/preview.html?id=${h.id}">Preview</a> <a class="btn s" href="/quotation.html?id=${h.id}">Edit</a></td></tr>`).join('')
    : '<tr><td colspan="4"><div class="empty-state"><img src="images/quotation-illustration.svg" alt=""><div><strong>Your workspace is ready</strong>No quotations yet. Create your first one to get started.</div></div></td></tr>';
})();
