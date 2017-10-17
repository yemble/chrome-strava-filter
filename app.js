(function() {

  var log = function(msg) {
    if(console && console['log']) {
      console.log("[Strava feed filter extension] " + msg);
    }
  };

  var isCommute = function($activity) {
    return ($activity.find('.activity-map-tag, .workout-type').text().toLowerCase().indexOf('commute') >= 0);
  };

  var isVirtual = function($activity) {
    if($activity.find('.icon-virtualride').length > 0) {
      return true;
    }
    else if($activity.html().indexOf('virtualride') > 0) {
      return true;
    }
    else {
      return false;
    }
  };

  var isChallenge = function($activity) {
    if($activity.hasClass('challenge') || $activity.find('.challenge-image, .btn-join-challenge').length > 0) {
      return true;
    }
    else {
      return false;
    }
  };

  var mark = function($activity, action) {
    if(action == 'hide') {
      $activity.hide();
    }
    else {
      $activity.css('opacity', '0.15')
    }
    $activity.addClass('boring');
  }

  var filterFeed = function() {
    // skip own feed
    if(document.location.search == '?feed_type=my_activity') {
      return;
    }

    //log("Filtering now");

    $('.feed .feed-entry').each(function () {
      // this doesn't actually work, classes are reset on pagination
      if($(this).hasClass('boring')) {
        //log("Found boring, skipping");
        return;
      }

      if(options.hideCommute && isCommute( $(this) )) {
        mark( $(this), options.action );
        log("Commute activity hidden");
      }

      if(options.hideVirtual && isVirtual( $(this) )) {
        mark( $(this), options.action );
        log("Virtual activity hidden");
      }

      if(options.hideChallenge && isChallenge( $(this) )) {
        mark( $(this), options.action );
        log("Challenge activity hidden");
      }

    });

    //$('.pagination a.load-feed').last().on('click', function() {
      setTimeout(filterFeed, 3000);
    //});

  };

  var defaultOptions = {
    action: 'fade',
    hideCommute: true,
    hideVirtual: true,
    hideChallenge: false,
  };

  var options = defaultOptions;

  (function() {
    log("Loading options");
    chrome.storage.sync.get(defaultOptions, function(items) {
      if (items && ! chrome.runtime.error) {
        options = items;
        filterFeed();
      }
      else {
        filterFeed();
      }
    });

  })();

})();
