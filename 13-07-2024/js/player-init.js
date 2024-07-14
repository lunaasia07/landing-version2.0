jQuery(document).ready(function () {

    var autoplayVideos = wpst_player_init_var.autoplay_videos;
    if (autoplayVideos) {
        var autoplay = true;
    } else {
        var autoplay = false;
    }

    var muteVideosDefault = wpst_player_init_var.mute_videos_by_default;
    if (muteVideosDefault) {
        var muted = true;
    } else {
        var muted = false;
    }

    function videojs_init() {
        jQuery('video-js').each(function () {
            var videoPlayer = jQuery(this);

            if (videoPlayer.hasClass('player-loaded')) {
                return;
            }

            var videoPostId = videoPlayer.data('postid');
            var videoPlayerId = videoPlayer.attr('id');

            if (!videoPlayerId) {
                return;
            }


            jQuery.ajax({
                url: wpst_ajax_var.url,
                type: "POST",
                data: {
                    'action': 'wpst_media_data_fetchmeta',
                    'nonce': wpst_ajax_var.nonce,
                    'post_id': videoPostId
                },
                dataType: "json",
                beforeSend: function () {
                },
                success: function (response) {
                    var player = videojs(videoPlayerId, {
                        playsinline: true,
                        muted: muted,
                        autoplay: autoplay,
                        controls: true,
                        loop: true,
                        responsive: true,
                        preload: 'auto',
                        textTrackSettings: false,
                    });
                    player.poster(response.video_poster_url);
                    player.src({
                        type: response.video_type,
                        src: response.video_url
                    });
                    videoPlayer.addClass('player-loaded');
                }
            });
        });
    }

    videojs_init();

    const swiper = new Swiper('.swiper', {
        direction: 'vertical',
        loop: false,
        threshold: 2,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        on: {
            transitionStart: function () {
                var videos = document.querySelectorAll('video');
                Array.prototype.forEach.call(videos, function (video) {
                    video.pause();
                });

                // Post views
                // var postId = 0;
                // postId = jQuery('.swiper-slide-active').data('id');
                // jQuery.ajax({
                // 	type: 'post',
                // 	url: wpst_ajax_var.url,
                // 	dataType: 'json',
                // 	data: {
                // 		action: 'get-post-data',
                // 		nonce: wpst_ajax_var.nonce,
                // 		post_id: postId,
                // 	},
                // });
            },
            transitionEnd: function () {
                if (autoplay == false) {
                    return;
                }
                var index = this.realIndex;
                var slide = document.getElementsByClassName('swiper-slide')[index];
                var slideVideo = slide.getElementsByTagName('video-js')[0];
                var slideCurrentVideo = jQuery(slideVideo).find('video').get(0);
                if (slideCurrentVideo != null || slideCurrentVideo != undefined) {
                    slideCurrentVideo.play();
                }
            },
        }
    });

    swiper.on('reachEnd', function () {

        var data = {
            'action': 'loadmore_swipe',
            'nonce': loadmore_ajax_var.nonce,
            'query': loadmore_ajax_var.posts,
            'page': loadmore_ajax_var.current_page,
            'maxpage': loadmore_ajax_var.max_page,
            // 'random_posts': loadmore_ajax_var.random_posts,
            // 'firstPostIDs': loadmore_ajax_var.first_post_ids
        };
        jQuery.ajax({
            url: loadmore_ajax_var.ajaxurl,
            data: data,
            type: 'POST',
            beforeSend: function () {
                canBeLoaded = false;
                // swiper.disable();
            },
            success: function (data) {
                if (data) {
                    // swiper.enable();
                    jQuery('.swiper-wrapper').find('.swiper-slide-active').after(data);
                    loadmore_ajax_var.current_page++;
                    swiper.update();
                    videojs_init();
                }
            }
        });
    });

    jQuery(document).on('click', '.enlight-content', function (e) {
        swiper.disable();
    });

    jQuery(document).on('click', '.close-fullscreen', function (e) {
        swiper.enable();
    });

    // Comments
    jQuery(document).on('click', '.comment-icon.comment-closed', function (e) {
        jQuery(this).addClass('comment-opened').removeClass('comment-closed');
        jQuery('#nav-menu').addClass('comment-opened');
        jQuery('#reply-title').addClass('.button .button-color');
        e.preventDefault();
        // var this_field = jQuery(this);
        var svgIcon = jQuery(this).find('svg');
        var postID = jQuery(this).parents('.swiper-slide').data('id');
        var data = {
            'action': 'load_post_comments',
            'nonce': loadmore_ajax_var.nonce,
            'post_id': postID
        };
        jQuery.ajax({
            url: loadmore_ajax_var.ajaxurl,
            data: data,
            type: 'POST',
            beforeSend: function () {
                svgIcon.replaceWith('<svg class="spinner" viewBox="0 0 50 50" width="32" height="32"><circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle></svg>');
            },
            success: function (data) {
                swiper.disable();
                jQuery('.comment-icon.comment-opened').find('svg').replaceWith('<svg xmlns="http://www.w3.org/2000/svg" fill="#ffffff" version="1.1" width="32" height="32" viewBox="1.25 2.35 29.5 27.3"><path d="M16.5 2.353c-7.857 0-14.25 5.438-14.25 12.124 0.044 2.834 1.15 5.402 2.938 7.33l-0.006-0.007c-0.597 2.605-1.907 4.844-3.712 6.569l-0.005 0.005c-0.132 0.135-0.214 0.32-0.214 0.525 0 0.414 0.336 0.75 0.75 0.751h0c0.054-0 0.107-0.006 0.158-0.017l-0.005 0.001c3.47-0.559 6.546-1.94 9.119-3.936l-0.045 0.034c1.569 0.552 3.378 0.871 5.262 0.871 0.004 0 0.009 0 0.013 0h-0.001c7.857 0 14.25-5.439 14.25-12.125s-6.393-12.124-14.25-12.124zM16.5 25.102c-0.016 0-0.035 0-0.054 0-1.832 0-3.586-0.332-5.205-0.94l0.102 0.034c-0.058-0.018-0.126-0.029-0.195-0.030h-0.001c-0.020-0.002-0.036-0.009-0.056-0.009 0 0-0 0-0 0-0.185 0-0.354 0.068-0.485 0.18l0.001-0.001c-0.010 0.008-0.024 0.004-0.034 0.013-1.797 1.519-3.97 2.653-6.357 3.243l-0.108 0.023c1.29-1.633 2.215-3.613 2.619-5.777l0.013-0.083c0-0.006 0-0.014 0-0.021 0-0.021-0.001-0.043-0.003-0.064l0 0.003c0-0.005 0-0.010 0-0.015 0-0.019-0.001-0.037-0.002-0.055l0 0.002c-0.004-0.181-0.073-0.345-0.184-0.47l0.001 0.001-0.011-0.027c-1.704-1.697-2.767-4.038-2.791-6.626l-0-0.005c0-5.858 5.72-10.624 12.75-10.624s12.75 4.766 12.75 10.624c0 5.859-5.719 10.625-12.75 10.625z"/></svg>');
                jQuery('.dark-bg').show();
                var videos = document.querySelectorAll('video');
                Array.prototype.forEach.call(videos, function (video) {
                    video.pause();
                });
                jQuery('main').prepend(data);
                var commentRespondHeight = jQuery('.comment-respond').outerHeight();
                jQuery('.comments-list').css('height', 'calc(100% - ' + commentRespondHeight + 'px - 70px)');
                jQuery('.author-first-letter').each(function () {
                    jQuery(this).css('background-color', 'hsla(' + Math.floor(Math.random() * (360)) + ', 75%, 58%, 1)');
                });
                var commentform = jQuery('#commentform'); // find the comment form
                commentform.prepend('<div id="comment-status" ></div>'); // add info panel before the form to provide feedback or errors
                var statusdiv = jQuery('#comment-status'); // define the info panel
                // var list ;
                jQuery('a.comment-reply-link').click(function (e) {
                    e.preventDefault();
                });

                commentform.submit(function () {
                    //serialize and store form data in a variable
                    var formdata = commentform.serialize();
                    //Add a status message
                    statusdiv.html('<p>Processing...</p>');
                    //Extract action URL from commentform
                    var formurl = commentform.attr('action');
                    //Post Form with data					
                    jQuery.ajax({
                        type: 'post',
                        url: formurl,
                        data: formdata,
                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                            statusdiv.html('<p class="alert alert-error">You might have left one of the fields blank, or be posting too quickly</p>');
                        },
                        success: function (data, textStatus) {
                            if (data == "success" || textStatus == "success") {
                                jQuery('#reply-title').hide();
                                jQuery('#commentform .comment-fields').hide();
                                jQuery('#commentform textarea').hide();
                                jQuery('#commentform .form-submit').hide();
                                statusdiv.html('<p class="alert alert-success" >Thank you. Your comment is awaiting moderation.</p>');
                                if (jQuery(".comment-box").has("ol.commentlist").length > 0) {
                                    jQuery('ol.commentlist').prepend(data);
                                    jQuery('.author-first-letter').each(function () {
                                        jQuery(this).css('background-color', 'hsla(' + Math.floor(Math.random() * (360)) + ', 75%, 58%, 1)');
                                    });
                                } else {
                                    jQuery('ol.commentlist').html(data);
                                }
                            } else {
                                statusdiv.html('<p class="alert alert-error">Please wait a while before posting your next comment</p>');
                                commentform.find('textarea[name=comment]').val();
                            }
                        }
                    });
                    return false;
                });
            }
        });
    });

    jQuery(document).on('click', '.dark-bg', function () {
        swiper.enable();
        jQuery('.comment-box').remove();
        jQuery('.comment-icon.comment-opened').addClass('comment-closed').removeClass('comment-opened');
    });

    jQuery(document).on('click', '#respond #reply-title', function () {
        var replySpan = jQuery(this).find('span');
        replySpan.toggleClass('button button-color');
        replySpan.html('Leave a comment <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" style="position: relative; top: 2px; margin-left: 3px;"><path fill="#333333" d="M0 7.33l2.829-2.83 9.175 9.339 9.167-9.339 2.829 2.83-11.996 12.17z"/></svg>');
        if (replySpan.hasClass('button')) {
            replySpan.html('Leave a comment <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" style="position: relative; top: 2px; margin-left: 3px;"><path fill="#ffffff" d="M0 16.67l2.829 2.83 9.175-9.339 9.167 9.339 2.829-2.83-11.996-12.17z"/></svg>');
        }
        jQuery(this).parents('#respond').find('#commentform').toggle();
    });

    jQuery(document).on('click', '.close-comment-box', function (e) {
        e.preventDefault();
        swiper.enable();
        jQuery('.dark-bg').hide();
        jQuery('.comment-box').remove();
        jQuery('.comment-icon.comment-opened').addClass('comment-closed').removeClass('comment-opened');
    });

});