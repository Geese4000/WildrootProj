// Delete buttons on the archive cards. Each one sends a DELETE request to
// the JSON API (/api/wildshapes/:id) rather than a page route. The browser
// sends the session cookie along automatically, so Passport knows who it is.
document.querySelectorAll('.wr-delete').forEach(function (button) {
  button.addEventListener('click', async function () {
    var name = button.dataset.name;
    if (!window.confirm('Delete ' + name + ' from your archive?')) return;

    button.disabled = true;
    try {
      var response = await fetch('/api/wildshapes/' + button.dataset.id, {
        method: 'DELETE',
        credentials: 'same-origin'
      });
      var body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Delete failed.');

      // Reload so the card, the counts and the tag filters all update
      window.location.reload();
    } catch (err) {
      window.alert(err.message);
      button.disabled = false;
    }
  });
});