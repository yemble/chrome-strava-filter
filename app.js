(function() {

  var log = function(msg, $card) {
    if(console && console['log']) {
      var title = $card ? $card.find('.title-text').text().trim() : null;
      console.log("[Strava feed filter extension] " + msg, title);
    }
  };

  var isCommute = function($activity) {
    return ($activity.find('.activity-map-tag, .workout-type').text().toLowerCase().indexOf('commute') >= 0);
  };

  var hasPhoto = function($activity) {
    if($activity.find('.entry-photo').length > 0) {
      return true;
    }
    else {
      return false;
    }
  };

  var isVirtual = function($activity) {
    if($activity.find('.icon-virtualride, .icon-workout').length > 0) {
      return true;
    }
    else if($activity.html().indexOf('virtualride') >= 0) {
      return true;
    }
    else if($activity.html().indexOf('on TrainerRoad') >= 0) {
      return true;
    }
    else if($activity.find('.enhanced-tag').text().indexOf('Peloton') >= 0) {
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

  var isLongCycle = function($activity, minMiles) {
    if($activity.find('.icon-ride').length > 0) {
      var $stats = $activity.find('.list-stats .stat');
      for(var i = 0; i < $stats.length; i++) {
        var $stat = $( $stats[i] );
        if($stat.find('.stat-subtext').text().toLowerCase().indexOf('distance') >= 0) {
          var $value = $stat.find('.stat-text'); log("distance? " + $value.text(), $activity);
          if(isLongDistance($value, minMiles)) {
            return true;
          }
        }
      }
      var $distance = $activity.find('.list-stats li[title="Distance"]');
      if(isLongDistance($distance, minMiles)) {
        return true;
      }
    }
    return false;
  };

  var isLongDistance = function($value, minMiles) {
    var unit = $value.find('.unit').text().trim().toLowerCase();
    var raw = $value.text().toLowerCase();
    var miles = parseFloat(raw.substring(0, raw.length - unit.length).trim());
    if(unit == 'km') {
      miles *= 0.621371
    }
    if(unit == 'km' || unit == 'mi' || unit.indexOf('mile') == 0) {
      if(miles >= minMiles) {
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

    log("Filtering now");

    $('.feed > .feed-entry').each(function () {
      if(options.hideCommute && isCommute( $(this) )) {
        mark( $(this), options.action );
        log("Commute activity hidden", $(this));
      }

      if(options.hideVirtual && isVirtual( $(this) )) {
        mark( $(this), options.action );
        log("Virtual activity hidden", $(this));
      }

      if(options.hideChallenge && isChallenge( $(this) )) {
        mark( $(this), options.action );
        log("Challenge activity hidden", $(this));
      }

      if(options.showPhoto && hasPhoto( $(this) )) {
        log("Photo activity, skipping other tests", $(this));
        return;
      }

      if(options.showLongCycle > 0 && isLongCycle( $(this), options.showLongCycle )) {
        log("Long cycle activity, skipping other tests", $(this));
        return;
      }

      // this doesn't actually work, classes are reset on pagination
      if($(this).hasClass('boring')) {
        //log("Found boring, skipping", $(this));
        //return;
      }

      mark( $(this), options.action );
      log("Default hide activity", $(this));

    });

    /*var $feed = $('.feed-container > .feed'),
        $cards = $feed.children('.feed-entry');
    $cards.sort(function(a,b) {
      var attr = 'data-updated-at';
      var an = a.getAttribute(attr),
          bn = b.getAttribute(attr);
      if(an < bn) return  1;
      if(an > bn) return -1;
      else        return  0;
    });
    $cards.detach().appendTo($feed);*/

    /*$('.pagination a.load-feed').last().on('click', function() {
      setTimeout(filterFeed, 3000);
    });*/

  };

  var autoPaginate = function(remaining) {
    if(remaining < 1) return;
    log("Fetching next page (" + remaining + " loads remaining)");
    $('.feed-pagination a.btn').click();
    setTimeout(function() { autoPaginate(remaining-1); }, 5000);
  };

  var defaultOptions = {
    action: 'fade',
    hideCommute: true,
    hideVirtual: true,
    hideChallenge: false,
    showPhoto: true,
    showLongCycle: 0,
    autoPage: 3,
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

      options.showLongCycle = parseInt(options.showLongCycle);
      log("options: " + JSON.stringify(options));

      setInterval(filterFeed, 3000);

      setTimeout(function() { autoPaginate(options.autoPage); }, 5000);

    });

  })();

})();
