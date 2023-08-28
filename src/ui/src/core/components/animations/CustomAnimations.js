/**
 * @fileoverview - Defines several custom jQuery animations that can be invoked on jQuery selectors in the application. 
 * Includes such utilities as scrolling to a given element, and showing floating header elements.
 * @namespace core.components.animations.CustomAnimations
 * @memberof core.components.animations
 */


(function($) {

  const isMobile = function() {
    return sessionStorage.mobile || navigator.userAgent.toLowerCase().indexOf('mobi') > -1;
  }();

  // Add custom page scrolling animations
  const customAnimationOptions = {
    mobile_menu_breakpoint_px: 768,
    scroll_duration: 600,
    input_ele_height: 70,
    scrollableContainerSelector: '#intake-content',
    pageItemSelector: '.page-item-container',
    defaultOffsetForPageHeader: 103
  };
  function UpdateTableHeaders(options) {
    options = options || {};
    const offsetForPageHeader = options.defaultOffsetForPageHeader || customAnimationOptions.defaultOffsetForPageHeader;

    const persistAreaEle = $(this).hasClass('persist-area') ? $(this) : $(this).find(".persist-area");
    
    persistAreaEle.each(function() {
      // Check for persistent headers without a floatingHeader counterpart and create the latter
      const el = $(this);
      const headerRow = el.hasClass('persist-header') ? el : el.find(".persist-header");
      const clonedHeaderRow = headerRow.next('.floatingHeader');

      // If we are on mobile and the header is very tall, don't show a floating header
      // The reason for this is because mobile keyboard takes up too much vertical screen real-estate to show a floating header
      if (isMobile && headerRow.outerHeight() > 85) {
        return;
      }
      if (!clonedHeaderRow || clonedHeaderRow.length === 0) {
        headerRow
          .before(headerRow.clone())
          //.css("width", headerRow.width())
          .addClass("floatingHeader");
      }

      const offset = el.offset();
      const scrollTop = $(window).scrollTop() + offsetForPageHeader;
      const floatingHeader = el.find(".floatingHeader", this);

      floatingHeader.off('click.rtb')
        .on('click.rtb', function(e) {
          // Don't scroll if a delete icon was pressed
          const ele = $(e.target);
          if (ele.hasClass('general-delete-icon') || ele.parents('.general-delete-icon').length) {
            return;
          }

          const associated_header = $(this).prev('.persist-header'),
            verticalTarget = $(customAnimationOptions.scrollableContainerSelector).scrollTop() + associated_header.offset().top - 112;
          // Scroll to the previous header when clicking on the floating header
          $(customAnimationOptions.scrollableContainerSelector).animate({ scrollTop: verticalTarget }, {duration: 400});
        });

      // Show the floating header if the screen scrolls below the persist-header
      if ((scrollTop > offset.top) &&
        // But don't show the floating header if floating header bottom edge is over 10px below the persist-area
           (scrollTop+floatingHeader.outerHeight()-10 < offset.top + el.outerHeight())) {

        // Let the headers be dynamic from the template
        const screen_width = (window.innerWidth > 0) ? window.innerWidth : screen.width,
          css_options = {
            "visibility": "visible",
            height: headerRow.outerHeight(),
          };
        if (screen_width > customAnimationOptions.mobile_menu_breakpoint_px) {
          const extend_header = el.data('header-extend');
          if (extend_header) {
            css_options['margin-left'] = `-${extend_header}px`;
          }

          if (extend_header || extend_header === 0) {
            css_options.width = el.width() + extend_header * 2;
          }
        } else {
          // If it's a mobile screen, go full width
          css_options.width = '100%';
          css_options['margin-left'] = 0;
        }
        
        floatingHeader.css(css_options);
      } else {
        floatingHeader.css({
          "visibility": "hidden"
        });
      }
    });
  }
  // Always be listening on scroll updates for floating headers
  const initializeFloatingHeaders = function(options) {
    $(function() {
      $(customAnimationOptions.scrollableContainerSelector)
        .off('scroll.rtb', function() { return UpdateTableHeaders.bind(this)(options); })
        .on('scroll.rtb', function() { return UpdateTableHeaders.bind(this)(options); })
        .trigger('scroll.rtb');
    });
  };

  // Add static jQuery functions

  // This function will add options into the custom animations module
  $.initializeCustomAnimations = function(options) {
    options = options || {};
    _.extend(customAnimationOptions, {}, options);
  };
  $.initializeDatepickerScroll = function() {
    document.addEventListener('scroll', function() {
      try {
        $('input.hasDatepicker').datepicker("hide");
      } catch (err) { }
    }, true);
  };

  $.getScrollableElement = function() {
    return $(customAnimationOptions.scrollableContainerSelector);
  },

  $.scrollPageToTop = function() {
    const scrollable_ele = $(customAnimationOptions.scrollableContainerSelector);
    scrollable_ele.scrollTop(0);
  }

  // Add functions on jQuery elements
  $.fn.extend({
    initializeFloatingHeaders,

    addCalendarScrollFn(calendarControlsSelector, calendarHeaderSelector, runAfterScrollFn=null, scrollEndDetectionMs=null) {
      const floatingScrollerClass = 'floatingHeaderMode';
      const floatingHeaderClass = 'floatingHeader';
      const addClassWithCheck = (ele, className) => ele ? ele.addClass(className) : null;
      const removeClassWithCheck = (ele, className) => ele ? ele.removeClass(className) : null;
      let isRunning = false;
      let isScrolling = false;
  
      const scrollFn = function(context) {
        if (isRunning) return;
        isRunning = true;
        // Clear our timeout throughout the scroll
        window.clearTimeout(isScrolling);

        try {
          const scrollableEle = $(context);
          const calendarControlsEle = scrollableEle.find(calendarControlsSelector);
          const calendarHeaderEle = scrollableEle.find(calendarHeaderSelector);
          const isFloating = scrollableEle.hasClass(floatingScrollerClass);

          let scrollTriggerPosition;
          if (calendarControlsEle) {
            // If the header is floating, then un-"fixed" the calendar controls or else position() and offset()
            // will report number based on the ele being anchored to the top of the document
            if (isFloating) {
              removeClassWithCheck(calendarControlsEle, floatingHeaderClass);
            }
            scrollTriggerPosition = (calendarControlsEle.position() || {}).top + scrollableEle.scrollTop();
            if (isFloating) {
              addClassWithCheck(calendarControlsEle, floatingHeaderClass);
            }
          }
  
          if (scrollableEle.scrollTop() > scrollTriggerPosition) {
            addClassWithCheck(calendarControlsEle, floatingHeaderClass);
            addClassWithCheck(calendarHeaderEle, floatingHeaderClass);
            addClassWithCheck(scrollableEle, floatingScrollerClass);
          } else {
            removeClassWithCheck(scrollableEle, floatingScrollerClass);
            removeClassWithCheck(calendarControlsEle, floatingHeaderClass);
            removeClassWithCheck(calendarHeaderEle, floatingHeaderClass);
          }

        } catch (err) {
        }

        if (runAfterScrollFn) {
          // Set a timeout to run after scrolling ends
          isScrolling = setTimeout(function() {
            runAfterScrollFn();
          }, scrollEndDetectionMs||0);
        }

        isRunning = false;
      };
      
      $(customAnimationOptions.scrollableContainerSelector)
        .off('scroll.rtb_calendar')
        .on('scroll.rtb_calendar', function() { scrollFn(this); })
        .trigger('scroll.rtb_calendar');

      //setTimeout(() => $(customAnimationOptions.scrollableContainerSelector).trigger('scroll.rtb_calendar'), 5);
    },

    runCallback(callbackFn) {
      const dfd = $.Deferred();
      const fn_return = callbackFn();
      // Check if a promise is returned and resolve accordingly, or resolve right away
      if (fn_return && fn_return.done) {
        fn_return.done(dfd.resolve).fail(dfd.reject);
      } else {
        dfd.resolve();
      }
      return dfd;
    },

    isOffScreen(options) {
      options = options || {};
      const container = options.scrollableContainerSelector || $(customAnimationOptions.scrollableContainerSelector);
      const contHeight = container.height();
      const activeFloatingHeader = $('.floatingHeader:visible').filter(function() {
            return $(this).css('visibility') !== 'hidden' });

      let internalContentOffsetHeight = 0;
      if (options.is_page_item) {
        internalContentOffsetHeight = customAnimationOptions.input_ele_height;
      } else if (options.is_page_item_container) {
        internalContentOffsetHeight = $(this).find(customAnimationOptions.pageItemSelector).height();
      }

      // If there was a floating header, add a flat amount to the off-page detection
      if (activeFloatingHeader.length) {
        internalContentOffsetHeight -= activeFloatingHeader.height();
      }

      const elemTop = $(this).offset().top - container.offset().top + internalContentOffsetHeight,
        elemBottom = elemTop + $(this).height() + internalContentOffsetHeight;

      const entirely_in_view = (elemTop >= 0 && elemBottom <= contHeight);
      //console.log(`[Info] Element is ${entirely_in_view ? 'not' : ''} off screen `, $(this));
      return !entirely_in_view;
    },

    scrollPageTo(options) {
      options = options || {};
      if (!options.force_scroll && !$(this).isOffScreen(options)) {
        return $.Deferred().resolve().promise();
      }

      const scrollableSelector = options.scrollableContainerSelector || customAnimationOptions.scrollableContainerSelector;
      const scrollOffset = options.scrollOffset || 0;
      // If there was a floating header, add a flat amount to the item scroll
      const activeFloatingHeader = $('.floatingHeader:visible').filter(function() {
            return $(this).css('visibility') !== 'hidden' });

      let item_offset_to_use = options.is_page_item ? customAnimationOptions.input_ele_height : 0;
      if (activeFloatingHeader.length) {
        item_offset_to_use -= activeFloatingHeader.height();
      }
      const scrollable_ele = $(scrollableSelector);
      return scrollable_ele.animate({
          // Subtract "customAnimationOptions.input_ele_height" to put the input field that had the error into view
          scrollTop: scrollable_ele.scrollTop() - scrollable_ele.offset().top + $(this).offset().top - item_offset_to_use - scrollOffset
      }, _.extend({duration: customAnimationOptions.scroll_duration}, options));
    }
  });
  
})(jQuery);
