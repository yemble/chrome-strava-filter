(function() {

  var log = function(msg) {
    if(console && console['log']) {
      console.log("[Strava feed filter extension] " + msg);
    }
  };

  var isCommute = function($activity) {
    return ($activity.find('.workout-type').text() == 'Commute');
  };

  var isVirtual = function($activity) {
    if($activity.find('.type.icon-virtualride').length > 0) {
      return true;
    }
    else if($activity.html().indexOf('virtualride') > 0) {
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

  var filterFeed = function(options) {
    // skip own feed
    if(document.location.search == '?feed_type=my_activity') {
      return;
    }

    log("Filtering now");

    $('.feed .feed-entry').each(function () {
      // this doesn't actually work, classes are reset on pagination
      if($(this).hasClass('boring')) {
        log("Found boring, skipping");
        return;
      }

      if(options.hideCommute && isCommute( $(this) )) {
        mark( $(this), options.action );
        //log("Commute activity hidden");
      }

      if(options.hideVirtual && isVirtual( $(this) )) {
        mark( $(this), options.action );
        //log("Virtual activity hidden");
      }

    });

    $('.pagination a.load-feed').last().on('click', function() {
      setTimeout(filterFeed, 5000, options);
    });

  };

  var defaultOptions = {
    action: 'fade',
    hideCommute: true,
    hideVirtual: true,
  };

  (function() {
    log("Loading options");
    chrome.storage.sync.get(defaultOptions, function(items) {
      if (chrome.runtime.error) {
        filterFeed(defaultOptions);
      }
      else {
        filterFeed(items)
      }
    });

  })();

})();
