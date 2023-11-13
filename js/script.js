"use strict";
(function() {
    let
        userAgent = navigator.userAgent.toLowerCase(),
        isIE = userAgent.indexOf("msie") !== -1 ? parseInt(userAgent.split("msie")[1], 10) : userAgent.indexOf("trident") !== -1 ? 11 : userAgent.indexOf("edge") !== -1 ? 12 : false;

    // Unsupported browsers
    if (isIE !== false && isIE < 12) {
        console.warn("[Core] detected IE" + isIE + ", load alert");
        var script = document.createElement("script");
        script.src = "./js/support.js";
        document.querySelector("head").appendChild(script);
    }

    let
        initialDate = new Date(),

        $document = $(document),
        $window = $(window),
        $html = $("html"),
        $body = $("body"),

        isDesktop = $html.hasClass("desktop"),
        isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1,
        isRtl = $html.attr("dir") === "rtl",
        windowReady = false,
        isNoviBuilder = false,

        plugins = {
            rdNavbar: $(".rd-navbar"),
            swiper: $(".swiper-slider"),
            slick: $('.slick-slider'),
            viewAnimate: $('.view-animate'),
            selectFilter: $("select"),
            rdInputLabel: $(".form-label"),
            rdMailForm: $(".rd-mailform"),
            regula: $("[data-constraints]"),
            materialParallax: $(".parallax-container"),
            copyrightYear: $('.copyright-year'),
            wow: $('.wow'),
            preloader: $('.preloader'),
        };

    /**
     * @desc Check the element has been scrolled into the view
     * @param {object} elem - jQuery object
     * @return {boolean}
     */
    // function isScrolledIntoView(elem) {
    //     if (isNoviBuilder) return true;
    //     return elem.offset().top + elem.outerHeight() >= $window.scrollTop() && elem.offset().top <= $window.scrollTop() + $window.height();
    // }

    /**
     * @desc Calls a function when element has been scrolled into the view
     * @param {object} element - jQuery object
     * @param {function} func - init function
     */
    // function lazyInit(element, func) {
    //     let scrollHandler = function() {
    //         if ((!element.hasClass('lazy-loaded') && (isScrolledIntoView(element)))) {
    //             func.call(element);
    //             element.addClass('lazy-loaded');
    //         }
    //     };

    //     scrollHandler();
    //     $window.on('scroll', scrollHandler);
    // }

    // Initialize scripts that require a loaded window
    $window.on('load', function() {
        // Page loader & Page transition
        if (plugins.preloader.length && !isNoviBuilder) {
            pageTransition({
                target: document.querySelector('.page'),
                delay: 0,
                duration: 500,
                classIn: 'fadeIn',
                classOut: 'fadeOut',
                classActive: 'animated',
                conditions: function(event, link) {
                    return link && !/(\#|javascript:void\(0\)|callto:|tel:|mailto:|:\/\/)/.test(link) && !event.currentTarget.hasAttribute('data-lightgallery');
                },
                onTransitionStart: function(options) {
                    setTimeout(function() {
                        plugins.preloader.removeClass('loaded');
                    }, options.duration * .75);
                },
                onReady: function() {
                    plugins.preloader.addClass('loaded');
                    windowReady = true;
                }
            });
        }
    });

    // Initialize scripts that require a finished document
    $(function() {
        isNoviBuilder = window.xMode;

        /**
         * Wrapper to eliminate json errors
         * @param {string} str - JSON string
         * @returns {object} - parsed or empty object
         */
        function parseJSON(str) {
            try {
                if (str) return JSON.parse(str);
                else return {};
            } catch (error) {
                console.warn(error);
                return {};
            }
        }


        /**
         * getSwiperHeight
         * @description  calculate the height of swiper slider basing on data attr
         */
        function getSwiperHeight(object, attr) {
            let val = object.attr("data-" + attr);
            let dim;

            if (!val) {
                return undefined;
            }

            dim = val.match(/(px)|(%)|(vh)$/i);

            if (dim.length) {
                switch (dim[0]) {
                    case "px":
                        return parseFloat(val);
                    case "vh":
                        return $(window).height() * (parseFloat(val) / 100);
                    case "%":
                        return object.width() * (parseFloat(val) / 100);
                }
            } else {
                return undefined;
            }
        }

        /**
         * @desc Sets slides background images from attribute 'data-slide-bg'
         * @param {object} swiper - swiper instance
         */
        function setBackgrounds(swiper) {
            let swipersBg = swiper.el.querySelectorAll('[data-slide-bg]');

            for (let i = 0; i < swipersBg.length; i++) {
                let swiperBg = swipersBg[i];
                swiperBg.style.backgroundImage = 'url(' + swiperBg.getAttribute('data-slide-bg') + ')';
            }
        }

        /**
         * toggleSwiperCaptionAnimation
         * @description  toggle swiper animations on active slides
         */
        function toggleSwiperCaptionAnimation(swiper) {
            let prevSlide = $(swiper.$el[0]),
                nextSlide = $(swiper.slides[swiper.activeIndex]);

            prevSlide
                .find("[data-caption-animate]")
                .each(function() {
                    let $this = $(this);
                    $this
                        .removeClass("animated")
                        .removeClass($this.attr("data-caption-animate"))
                        .addClass("not-animated");
                });

            nextSlide
                .find("[data-caption-animate]")
                .each(function() {
                    let $this = $(this),
                        delay = $this.attr("data-caption-delay");

                    if (!isNoviBuilder) {
                        setTimeout(function() {
                            $this
                                .removeClass("not-animated")
                                .addClass($this.attr("data-caption-animate"))
                                .addClass("animated");
                        }, delay ? parseInt(delay) : 0);
                    } else {
                        $this
                            .removeClass("not-animated")
                    }
                });
        }

        /**
         * @desc Attach form validation to elements
         * @param {object} elements - jQuery object
         */
        function attachFormValidator(elements) {
            // Custom validator - phone number
            regula.custom({
                name: 'PhoneNumber',
                defaultMessage: 'Invalid phone number format',
                validator: function() {
                    if (this.value === '') return true;
                    else return /^(\+\d)?[0-9\-\(\) ]{5,}$/i.test(this.value);
                }
            });

            for (let i = 0; i < elements.length; i++) {
                let o = $(elements[i]),
                    v;
                o.addClass("form-control-has-validation").after("<span class='form-validation'></span>");
                v = o.parent().find(".form-validation");
                if (v.is(":last-child")) o.addClass("form-control-last-child");
            }

            elements.on('input change propertychange blur', function(e) {
                let $this = $(this),
                    results;

                if (e.type !== "blur")
                    if (!$this.parent().hasClass("has-error")) return;
                if ($this.parents('.rd-mailform').hasClass('success')) return;

                if ((results = $this.regula('validate')).length) {
                    for (let i = 0; i < results.length; i++) {
                        $this.siblings(".form-validation").text(results[i].message).parent().addClass("has-error");
                    }
                } else {
                    $this.siblings(".form-validation").text("").parent().removeClass("has-error")
                }
            }).regula('bind');

            let regularConstraintsMessages = [{
                    type: regula.Constraint.Required,
                    newMessage: "The text field is required."
                },
                {
                    type: regula.Constraint.Email,
                    newMessage: "The email is not a valid email."
                },
                {
                    type: regula.Constraint.Numeric,
                    newMessage: "Only numbers are required"
                },
                {
                    type: regula.Constraint.Selected,
                    newMessage: "Please choose an option."
                }
            ];


            for (let i = 0; i < regularConstraintsMessages.length; i++) {
                let regularConstraint = regularConstraintsMessages[i];

                regula.override({
                    constraintType: regularConstraint.type,
                    defaultMessage: regularConstraint.newMessage
                });
            }
        }

        /**
         * @desc Check if all elements pass validation
         * @param {object} elements - object of items for validation
         * @param {object} captcha - captcha object for validation
         * @return {boolean}
         */
        function isValidated(elements, captcha) {
            let results, errors = 0;

            if (elements.length) {
                for (let j = 0; j < elements.length; j++) {

                    let $input = $(elements[j]);
                    if ((results = $input.regula('validate')).length) {
                        for (let k = 0; k < results.length; k++) {
                            errors++;
                            $input.siblings(".form-validation").text(results[k].message).parent().addClass("has-error");
                        }
                    } else {
                        $input.siblings(".form-validation").text("").parent().removeClass("has-error")
                    }
                }

                if (captcha) {
                    if (captcha.length) {
                        return validateReCaptcha(captcha) && errors === 0
                    }
                }

                return errors === 0;
            }
            return true;
        }

        /**
         * IE Polyfills
         * @description  Adds some loosing functionality to IE browsers
         */
        if (isIE) {
            if (isIE === 12) $html.addClass("ie-edge");
            if (isIE === 11) $html.addClass("ie-11");
            if (isIE < 10) $html.addClass("lt-ie-10");
            if (isIE < 11) $html.addClass("ie-10");
        }

        /**
         * Select2
         * @description Enables select2 plugin
         */
        if (plugins.selectFilter.length) {
            var i;
            for (i = 0; i < plugins.selectFilter.length; i++) {
                var select = $(plugins.selectFilter[i]);

                select.select2({
                    theme: "bootstrap",
                    placeholder: select.attr('data-placeholder') || null,
                    minimumResultsForSearch: select.attr('data-minimum-results-search') || Infinity,
                    containerCssClass: select.attr('data-container-class') || null,
                    dropdownCssClass: select.attr('data-dropdown-class') || null
                }).next().addClass(select.attr("class").match(/(input-sm)|(input-lg)|($)/i).toString().replace(new RegExp(",", 'g'), " "));
            }
        }

        /**
         * UI To Top
         * @description Enables ToTop Button
         */
        if (isDesktop) {
            $().UItoTop({
                easingType: 'easeOutQuart',
                containerClass: 'ui-to-top fa fa-angle-up'
            });
        }

        // RD Navbar
        if (plugins.rdNavbar.length) {
            let
                navbar = plugins.rdNavbar,
                aliases = {
                    '-': 0,
                    '-sm-': 576,
                    '-md-': 768,
                    '-lg-': 992,
                    '-xl-': 1200,
                    '-xxl-': 1600
                },
                responsive = {},
                navItems = $('.rd-nav-item');

            for (let i = 0; i < navItems.length; i++) {
                let node = navItems[i];

                if (node.classList.contains('opened')) {
                    node.classList.remove('opened')
                }
            }

            for (let alias in aliases) {
                let link = responsive[aliases[alias]] = {};
                if (navbar.attr('data' + alias + 'layout')) link.layout = navbar.attr('data' + alias + 'layout');
                if (navbar.attr('data' + alias + 'device-layout')) link.deviceLayout = navbar.attr('data' + alias + 'device-layout');
                if (navbar.attr('data' + alias + 'hover-on')) link.focusOnHover = navbar.attr('data' + alias + 'hover-on') === 'true';
                if (navbar.attr('data' + alias + 'auto-height')) link.autoHeight = navbar.attr('data' + alias + 'auto-height') === 'true';
                if (navbar.attr('data' + alias + 'stick-up-offset')) link.stickUpOffset = navbar.attr('data' + alias + 'stick-up-offset');
                if (navbar.attr('data' + alias + 'stick-up')) link.stickUp = navbar.attr('data' + alias + 'stick-up') === 'true';
                if (isNoviBuilder) link.stickUp = false;
                else if (navbar.attr('data' + alias + 'stick-up')) link.stickUp = navbar.attr('data' + alias + 'stick-up') === 'true';
            }

            plugins.rdNavbar.RDNavbar({
                anchorNav: !isNoviBuilder,
                stickUpClone: (plugins.rdNavbar.attr("data-stick-up-clone") && !isNoviBuilder) ? plugins.rdNavbar.attr("data-stick-up-clone") === 'true' : false,
                responsive: responsive,
                callbacks: {
                    onStuck: function() {
                        let navbarSearch = this.$element.find('.rd-search input');

                        if (navbarSearch) {
                            navbarSearch.val('').trigger('propertychange');
                        }
                    },
                    onDropdownOver: function() {
                        return !isNoviBuilder;
                    },
                    onUnstuck: function() {
                        if (this.$clone === null)
                            return;

                        let navbarSearch = this.$clone.find('.rd-search input');

                        if (navbarSearch) {
                            navbarSearch.val('').trigger('propertychange');
                            navbarSearch.trigger('blur');
                        }

                    }
                }
            });
        }

        /**
         * ViewPort Universal
         * @description Add class in viewport
         */
        // if (plugins.viewAnimate.length) {
        //     var i;
        //     for (i = 0; i < plugins.viewAnimate.length; i++) {
        //         var $view = $(plugins.viewAnimate[i]).not('.active');
        //         $document.on("scroll", $.proxy(function() {
        //                 if (isScrolledIntoView(this)) {
        //                     this.addClass("active");
        //                 }
        //             }, $view))
        //             .trigger("scroll");
        //     }
        // }

        // Swiper
        if (plugins.swiper.length) {
            for (let i = 0; i < plugins.swiper.length; i++) {

                let
                    node = plugins.swiper[i],
                    pag = node.querySelector('.swiper-pagination'),
                    params = parseJSON(node.getAttribute('data-swiper')),
                    defaults = {
                        speed: 1000,
                        loop: node.getAttribute('data-loop') !== 'false',
                        effect: node.hasAttribute('data-slide-effect') ? node.getAttribute('data-slide-effect') : 'slide',
                        direction: node.getAttribute('data-direction') === 'vertical' ? 'vertical' : 'horizontal',
                        pagination: {
                            el: '.swiper-pagination',
                            clickable: node.getAttribute('data-clickable') !== 'false'
                        },
                        navigation: {
                            nextEl: '.swiper-button-next',
                            prevEl: '.swiper-button-prev'
                        },
                        autoplay: {
                            enabled: node.getAttribute('data-autoplay') !== 'false',
                            delay: node.hasAttribute('data-autoplay') && !isNaN(Number(node.getAttribute('data-autoplay'))) ?
                                node.getAttribute('data-autoplay') : 5000,
                        },
                        keyboard: {
                            enabled: node.getAttribute('data-keyboard') === 'true',
                            onlyInViewport: true,
                        },
                        mousewheel: {
                            enabled: node.getAttribute('data-mousewheel') === 'true',
                            releaseOnEdges: node.hasAttribute('data-mousewheel-release') && node.getAttribute('data-mousewheel-release') === 'true',
                        }
                    },
                    xMode = {
                        autoplay: false,
                        loop: false,
                        simulateTouch: false
                    };

                if (node.querySelector('.swiper-scrollbar')) {
                    defaults.scrollbar = {
                        el: '.swiper-scrollbar',
                        draggable: node.getAttribute('data-draggable') !== 'false',
                    }
                }

                if (pag && pag.getAttribute('data-index-bullet') === 'true') {
                    defaults.pagination.renderBullet = function(index, className) {
                        return '<span class="' + className + '">' + (index + 1) + "</span>";
                    };
                }

                params.on = {
                    init: function() {
                        setBackgrounds(this);
                        toggleSwiperCaptionAnimation(this);

                        // Real Previous Index must be set recent
                        this.on('slideChangeTransitionEnd', function() {
                            toggleSwiperCaptionAnimation(this);
                        });
                    }
                };

                new Swiper(node, Util.merge(isNoviBuilder ? [defaults, params, xMode] : [defaults, params]));

                $window.on("resize", () => {
                    let $node = $(node);
                    let mh = getSwiperHeight($node, "min-height");
                    let h = getSwiperHeight($node, "height");
                    if (h) $node.css("height", mh ? mh > h ? mh : h : h);
                }).trigger("resize");
            }
        }

        // WOW
        if ($html.hasClass("wow-animation") && plugins.wow.length && !isNoviBuilder && isDesktop) {
            new WOW().init();
        }

        // RD Input Label
        if (plugins.rdInputLabel.length) {
            plugins.rdInputLabel.RDInputLabel();
        }

        // Regula
        if (plugins.regula.length) {
            attachFormValidator(plugins.regula);
        }

        // RD Mailform
        if (plugins.rdMailForm.length) {
            let i, j, k,
                msg = {
                    'MF000': 'Successfully sent!',
                    'MF001': 'Recipients are not set!',
                    'MF002': 'Form will not work locally!',
                    'MF003': 'Please, define email field in your form!',
                    'MF004': 'Please, define type of your form!',
                    'MF254': 'Something went wrong with PHPMailer!',
                    'MF255': 'Aw, snap! Something went wrong.'
                };

            for (i = 0; i < plugins.rdMailForm.length; i++) {
                let $form = $(plugins.rdMailForm[i]),
                    formHasCaptcha = false;

                $form.attr('novalidate', 'novalidate').ajaxForm({
                    data: {
                        "form-type": $form.attr("data-form-type") || "contact",
                        "counter": i
                    },
                    beforeSubmit: function(arr, $form, options) {
                        if (isNoviBuilder)
                            return;

                        let form = $(plugins.rdMailForm[this.extraData.counter]),
                            inputs = form.find("[data-constraints]"),
                            output = $("#" + form.attr("data-form-output")),
                            captcha = form.find('.recaptcha'),
                            captchaFlag = true;

                        output.removeClass("active error success");

                        if (isValidated(inputs, captcha)) {

                            // veify reCaptcha
                            if (captcha.length) {
                                let captchaToken = captcha.find('.g-recaptcha-response').val(),
                                    captchaMsg = {
                                        'CPT001': 'Please, setup you "site key" and "secret key" of reCaptcha',
                                        'CPT002': 'Something wrong with google reCaptcha'
                                    };

                                formHasCaptcha = true;

                                $.ajax({
                                        method: "POST",
                                        url: "bat/reCaptcha.php",
                                        data: {
                                            'g-recaptcha-response': captchaToken
                                        },
                                        async: false
                                    })
                                    .done(function(responceCode) {
                                        if (responceCode !== 'CPT000') {
                                            if (output.hasClass("snackbars")) {
                                                output.html('<p><span class="icon text-middle mdi mdi-check icon-xxs"></span><span>' + captchaMsg[responceCode] + '</span></p>')

                                                setTimeout(function() {
                                                    output.removeClass("active");
                                                }, 3500);

                                                captchaFlag = false;
                                            } else {
                                                output.html(captchaMsg[responceCode]);
                                            }

                                            output.addClass("active");
                                        }
                                    });
                            }

                            if (!captchaFlag) {
                                return false;
                            }

                            form.addClass('form-in-process');

                            if (output.hasClass("snackbars")) {
                                output.html('<p><span class="icon text-middle fa fa-circle-o-notch fa-spin icon-xxs"></span><span>Sending</span></p>');
                                output.addClass("active");
                            }
                        } else {
                            return false;
                        }
                    },
                    error: function(result) {
                        if (isNoviBuilder)
                            return;

                        let output = $("#" + $(plugins.rdMailForm[this.extraData.counter]).attr("data-form-output")),
                            form = $(plugins.rdMailForm[this.extraData.counter]);

                        output.text(msg[result]);
                        form.removeClass('form-in-process');

                        if (formHasCaptcha) {
                            grecaptcha.reset();
                            window.dispatchEvent(new Event('resize'));
                        }
                    },
                    success: function(result) {
                        if (isNoviBuilder)
                            return;

                        let form = $(plugins.rdMailForm[this.extraData.counter]),
                            output = $("#" + form.attr("data-form-output")),
                            select = form.find('select');

                        form
                            .addClass('success')
                            .removeClass('form-in-process');

                        if (formHasCaptcha) {
                            grecaptcha.reset();
                            window.dispatchEvent(new Event('resize'));
                        }

                        result = result.length === 5 ? result : 'MF255';
                        output.text(msg[result]);

                        if (result === "MF000") {
                            if (output.hasClass("snackbars")) {
                                output.html('<p><span class="icon text-middle mdi mdi-check icon-xxs"></span><span>' + msg[result] + '</span></p>');
                            } else {
                                output.addClass("active success");
                            }
                        } else {
                            if (output.hasClass("snackbars")) {
                                output.html(' <p class="snackbars-left"><span class="icon icon-xxs mdi mdi-alert-outline text-middle"></span><span>' + msg[result] + '</span></p>');
                            } else {
                                output.addClass("active error");
                            }
                        }

                        form.clearForm();

                        if (select.length) {
                            select.val(null).trigger('change');
                        }

                        form.find('input, textarea').trigger('blur');

                        setTimeout(function() {
                            output.removeClass("active error success");
                            form.removeClass('success');
                        }, 3500);
                    }
                });
            }
        }

        // Material Parallax
        if (plugins.materialParallax.length) {
            if (!isNoviBuilder && !isIE && !isMobile) {
                plugins.materialParallax.parallax();
            } else {
                for (let i = 0; i < plugins.materialParallax.length; i++) {
                    let $parallax = $(plugins.materialParallax[i]);

                    $parallax.addClass('parallax-disabled');
                    $parallax.css({
                        "background-image": 'url(' + $parallax.data("parallax-img") + ')'
                    });
                }
            }
        }

        // Slick carousel
        if (plugins.slick.length) {
            for (let i = 0; i < plugins.slick.length; i++) {
                var $slickItem = $(plugins.slick[i]);

                $slickItem.slick({
                        slidesToScroll: parseInt($slickItem.attr('data-slide-to-scroll'), 10) || 1,
                        asNavFor: $slickItem.attr('data-for') || false,
                        dots: $slickItem.attr("data-dots") === "true",
                        infinite: isNoviBuilder ? false : $slickItem.attr("data-loop") === "true",
                        focusOnSelect: true,
                        arrows: $slickItem.attr("data-arrows") === "true",
                        swipe: $slickItem.attr("data-swipe") === "true",
                        autoplay: isNoviBuilder ? false : $slickItem.attr("data-autoplay") === "true",
                        vertical: $slickItem.attr("data-vertical") === "true",
                        centerMode: $slickItem.attr("data-center-mode") === "true",
                        centerPadding: $slickItem.attr("data-center-padding") ? $slickItem.attr("data-center-padding") : '0.50',
                        mobileFirst: true,
                        responsive: [{
                                breakpoint: 0,
                                settings: {
                                    slidesToShow: parseInt($slickItem.attr('data-items'), 10) || 1
                                }
                            },
                            {
                                breakpoint: 575,
                                settings: {
                                    slidesToShow: parseInt($slickItem.attr('data-sm-items'), 10) || 1
                                }
                            },
                            {
                                breakpoint: 767,
                                settings: {
                                    slidesToShow: parseInt($slickItem.attr('data-md-items'), 10) || 1
                                }
                            },
                            {
                                breakpoint: 991,
                                settings: {
                                    slidesToShow: parseInt($slickItem.attr('data-lg-items'), 10) || 1
                                }
                            },
                            {
                                breakpoint: 1199,
                                settings: {
                                    slidesToShow: parseInt($slickItem.attr('data-xl-items'), 10) || 1
                                }
                            }
                        ]
                    })
                    .on('afterChange', function(event, slick, currentSlide, nextSlide) {
                        var $this = $(this),
                            childCarousel = $this.attr('data-child');

                        if (childCarousel) {
                            $(childCarousel + ' .slick-slide').removeClass('slick-current');
                            $(childCarousel + ' .slick-slide').eq(currentSlide).addClass('slick-current');
                        }
                    });

            }
        }

        // Copyright Year (Evaluates correct copyright year)
        if (plugins.copyrightYear.length) {
            plugins.copyrightYear.text(initialDate.getFullYear());
        }
    });
}());