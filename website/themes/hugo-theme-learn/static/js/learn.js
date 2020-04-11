function setMenuHeight() {
  $("#sidebar .highlightable").height($("#sidebar").innerHeight() - $("#header-wrapper").height() - 40)
}

function fallbackMessage(action) {
  var actionMsg = ""
  var actionKey = action === "cut" ? "X" : "C"

  if (/iPhone|iPad/i.test(navigator.userAgent)) {
    actionMsg = "No support :("
  } else if (/Mac/i.test(navigator.userAgent)) {
    actionMsg = "Press ⌘-" + actionKey + " to " + action
  } else {
    actionMsg = "Press Ctrl-" + actionKey + " to " + action
  }

  return actionMsg
}

// for the window resize
$(window).resize(function () {
  setMenuHeight()
})

// debouncing function from John Hann
// http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
;(function ($, sr) {
  var debounce = function (func, threshold, execAsap) {
    var timeout

    return function debounced() {
      var obj = this,
        args = arguments

      function delayed() {
        if (!execAsap) func.apply(obj, args)
        timeout = null
      }

      if (timeout) clearTimeout(timeout)
      else if (execAsap) func.apply(obj, args)

      timeout = setTimeout(delayed, threshold || 100)
    }
  }
  // smartresize
  jQuery.fn[sr] = function (fn) {
    return fn ? this.bind("resize", debounce(fn)) : this.trigger(sr)
  }
})(jQuery, "smartresize")

jQuery(document).ready(function () {
  jQuery("#sidebar .category-icon").on("click", function () {
    $(this).toggleClass("fa-angle-down fa-angle-right")
    $(this).parent().parent().children("ul").toggle()
    return false
  })

  var sidebarStatus = (searchStatus = "open")
  setMenuHeight()

  jQuery("#overlay").on("click", function () {
    jQuery(document.body).toggleClass("sidebar-hidden")
    sidebarStatus = jQuery(document.body).hasClass("sidebar-hidden") ? "closed" : "open"

    return false
  })

  jQuery("[data-sidebar-toggle]").on("click", function () {
    jQuery(document.body).toggleClass("sidebar-hidden")
    sidebarStatus = jQuery(document.body).hasClass("sidebar-hidden") ? "closed" : "open"

    return false
  })
  jQuery("[data-clear-history-toggle]").on("click", function () {
    sessionStorage.clear()
    location.reload()
    return false
  })
  jQuery("[data-search-toggle]").on("click", function () {
    if (sidebarStatus == "closed") {
      jQuery("[data-sidebar-toggle]").trigger("click")
      jQuery(document.body).removeClass("searchbox-hidden")
      searchStatus = "open"

      return false
    }

    jQuery(document.body).toggleClass("searchbox-hidden")
    searchStatus = jQuery(document.body).hasClass("searchbox-hidden") ? "closed" : "open"

    return false
  })

  $.expr[":"].contains = $.expr.createPseudo(function (arg) {
    return function (elem) {
      return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0
    }
  })

  // allow keyboard control for prev/next links
  jQuery(function () {
    jQuery(".nav-prev").click(function () {
      location.href = jQuery(this).attr("href")
    })
    jQuery(".nav-next").click(function () {
      location.href = jQuery(this).attr("href")
    })
  })

  jQuery("input, textarea").keydown(function (e) {
    //  left and right arrow keys
    if (e.which == "37" || e.which == "39") {
      e.stopPropagation()
    }
  })

  jQuery(document).keydown(function (e) {
    // prev links - left arrow key
    if (e.which == "37") {
      jQuery(".nav.nav-prev").click()
    }

    // next links - right arrow key
    if (e.which == "39") {
      jQuery(".nav.nav-next").click()
    }
  })

  $('#body-inner a:not(:has(img)):not(.btn):not(a[rel="footnote"])').addClass("highlight")

  var touchsupport = "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0
  if (!touchsupport) {
    // browser doesn't support touch
    $("#toc-menu").hover(function () {
      $(".progress").stop(true, false, true).fadeToggle(100)
    })

    $(".progress").hover(function () {
      $(".progress").stop(true, false, true).fadeToggle(100)
    })
  }
  if (touchsupport) {
    // browser does support touch
    $("#toc-menu").click(function () {
      $(".progress").stop(true, false, true).fadeToggle(100)
    })
    $(".progress").click(function () {
      $(".progress").stop(true, false, true).fadeToggle(100)
    })
  }
})

jQuery(window).on("load", function () {
  function adjustForScrollbar() {
    if (parseInt(jQuery("#body-inner").height()) + 83 >= jQuery("#body").height()) {
      jQuery(".nav.nav-next").css({ "margin-right": getScrollBarWidth() })
    } else {
      jQuery(".nav.nav-next").css({ "margin-right": 0 })
    }
  }

  // adjust sidebar for scrollbar
  adjustForScrollbar()

  jQuery(window).smartresize(function () {
    adjustForScrollbar()
  })

  // store this page in session
  sessionStorage.setItem(jQuery("body").data("url"), 1)

  // loop through the sessionStorage and see if something should be marked as visited
  for (var url in sessionStorage) {
    if (sessionStorage.getItem(url) == 1) jQuery('[data-nav-id="' + url + '"]').addClass("visited")
  }
})
