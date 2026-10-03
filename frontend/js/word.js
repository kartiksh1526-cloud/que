// Generate the Word document on the server.
function downloadWord() { location = `/api/quotations/${new URLSearchParams(location.search).get('id')}/docx`; }
