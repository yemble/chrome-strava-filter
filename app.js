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

  var isShortCycle = function($activity, minMiles) {
    if($activity.find('.icon-ride').length > 0) {
      var $stats = $activity.find('.list-stats .stat');
      for(var i = 0; i < $stats.length; i++) {
        var $stat = $( $stats[i] );
        if($stat.find('.stat-subtext').text().toLowerCase().indexOf('distance') >= 0) {
          var $value = $stat.find('.stat-text');
          if(isShortDistance($value, minMiles)) {
            return true;
          }
        }
      }
      var $distance = $activity.find('.list-stats li[title="Distance"]');
      if(isShortDistance($distance, minMiles)) {
        return true;
      }
    }
    return false;
  };

  var isShortDistance = function($value, minMiles) {
    var unit = $value.find('.unit').text().toLowerCase();
    var raw = $value.text().toLowerCase();
    var miles = parseFloat(raw.substring(0, raw.length - unit.length));
    if(unit == 'km') {
      miles *= 0.621371
    }
    if(unit == 'km' || unit == 'mi' || unit.indexOf('mile') == 0) {
      if(miles < minMiles) {
        return true
      }
    }
    return false;
  }

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

      if(options.hideShortCycle > 0 && isShortCycle( $(this), options.hideShortCycle )) {
        mark( $(this), options.action );
        log("Short cycle activity hidden");
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
    hideShortCycle: 0,
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
