

// Saves options to chrome.storage
function save_options() {
  var action = document.getElementById('action').value;
  var hideCommute = document.getElementById('hide_commute').checked;
  var hideVirtual = document.getElementById('hide_virtual').checked;

  chrome.storage.sync.set({
    action: action,
    hideCommute: hideCommute,
    hideVirtual: hideVirtual
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 1000);
  });
}

// Restores select box and checkbox state using the preferences stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get({
    action: 'fade',
    hideCommute: true,
    hideVirtual: true
  }, function(items) {
    document.getElementById('action').value = items.action;
    document.getElementById('hide_commute').checked = items.hideCommute;
    document.getElementById('hide_virtual').checked = items.hideVirtual;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);

document.getElementById('save').addEventListener('click', save_options);