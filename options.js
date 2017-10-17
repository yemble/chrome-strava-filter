

// Saves options to chrome.storage
function save_options() {
  var action = document.getElementById('action').value;
  var hideCommute = document.getElementById('hide_commute').checked;
  var hideVirtual = document.getElementById('hide_virtual').checked;
  var hideChallenge = document.getElementById('hide_challenge').checked;
  var hideShortCycle = document.getElementById('hide_short_cycle').selectedOptions[0].value;

  chrome.storage.sync.set({
    action: action,
    hideCommute: hideCommute,
    hideVirtual: hideVirtual,
    hideChallenge: hideChallenge,
    hideShortCycle: hideShortCycle,
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
    hideVirtual: true,
    hideChallenge: false,
    hideShortCycle: 0,
  }, function(items) {
    document.getElementById('action').value = items.action;
    document.getElementById('hide_commute').checked = items.hideCommute;
    document.getElementById('hide_virtual').checked = items.hideVirtual;
    document.getElementById('hide_challenge').checked = items.hideChallenge;
    var csSel = document.getElementById('hide_short_cycle');
    setSelected(csSel, items.hideShortCycle)
  });
}

// set value for a select element
function setSelected(sel, val) {
  var opts = sel.options;
  for(var i = 0; i < opts.length; i++) {
    if(opts[i].value == val) {
      sel.selectedIndex = i;
      return;
    }
  }
}


document.addEventListener('DOMContentLoaded', restore_options);

document.getElementById('save').addEventListener('click', save_options);