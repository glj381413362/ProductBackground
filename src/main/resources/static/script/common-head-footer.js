/*头尾部相关的js控制*/

$(function () {
    //解决SmartEdit移动端滑动冲突问题
    if ($("#smarteditoverlay").length > 0) {
        $(".mobile-content").css({"position": "unset", "margin-top": "40px"})
    }
    $(".alert-window-info-ok").click(function () {
        var Mbcontent = $(".mobile-content");
        if (Mbcontent) {
            Mbcontent.css("-webkit-overflow-scrolling", "touch")
        }
        $(".alert-window-info").addClass("hidden")
        $("body").removeClass("common-mask")
        $("body").removeClass("overFlowHide");
    })
    $(".alert-window-info-cancel").click(function () {
        var Mbcontent = $(".mobile-content");
        if (Mbcontent) {
            Mbcontent.css("-webkit-overflow-scrolling", "touch")
        }
        $(".alert-window-info").addClass("hidden")
        $("body").removeClass("common-mask")
        $("body").removeClass("overFlowHide");
    })
    //用户下拉菜单
    $(".sy-username-option").hover(function () {
        $(".sy-username").show()
        $(".sy-username").hide();
    });
    $(".sy-username").hover(function () {//鼠标移上去
        $(".sy-username").show();
    }, function () {//鼠标移开
        $(".sy-username").hide();
    });
    if ($(window).width() <= 767) {
        $(".common-footer-title-bottom ul").hide();
    } else {
        //这部分代码与页脚有关
        $(".common-footer-title-bottom ul").show();
    }
    //这部分与汉堡包有关
    navControl();


//nav悬浮效果
//     $(".aibo-headnav li span").hover(function () {
//         $(".aibo-headnav li span").not(this).css("opacity","0.5")
//     },function () {
//         $(".aibo-headnav li span").css("opacity","1")
//     })
//     $(".sy-option-nav .sy-logistics-info-row .col-lg-2").hover(function () {
//         $(".sy-option-nav .sy-logistics-info-row .col-lg-2").not(this).css("opacity","0.5")
//     },function () {
//         $(".sy-option-nav .sy-logistics-info-row .col-lg-2").css("opacity","1")
//     })
    // $(".sy-total-products-item").hover(function () {
    //     $(".sy-total-products-item").not(this).css("opacity","0.5")
    // },function () {
    //     $(".sy-total-products-item").css("opacity","1")
    // })

    //瀑布流nav
    $(function () {
        var $container = $('#masonry');
        $(".aibo-all-products").mouseenter(
            function () {
                $container.masonry({
                    itemSelector: '.box',
                    isAnimated: true,
                });
            })
    });


    //页面底部展开/收起控制----start----
    //这部分代码与页脚有关
    $(".common-footer-title-row").click(function () {
        if ($(window).width() <= 767) {
            $(this).next("ul").slideToggle(500);
        }
    });
    //当浏览器大小变化时
    $(window).resize(function () {
        navControl(); //这部分与汉堡包有关
    });

    function brandStoryShow() {
        $(".brand-story-bg").stop()
        $(".brand-story").removeClass("hidden")

        $(".brand-story-show").addClass("aibo-headnav-hover")
        $(".brand-story-bg").removeClass("hidden").animate({
            opacity: "1"
        }, 400);
    }

    function brandStoryHide() {
        $(".brand-story-bg").stop()
        $(".brand-story").addClass("hidden")
        $(".brand-story-show").removeClass("aibo-headnav-hover")
        $(".brand-story-bg").addClass("hidden").animate({
            opacity: "0"
        }, 400);
    }

    $(".brand-story-show").hover(function () {
        brandStoryShow()
    }, function () {
        brandStoryHide()
    })
    $(".brand-story-bg").hover(function () {
        brandStoryShow()

    }, function () {
        brandStoryHide()

    })
    $(".brand-story").hover(function () {
        brandStoryShow()
    }, function () {
        brandStoryHide()
    })
    $(".mb-brand-story-show").click(function () {
        closeMobileNav();
        $(".mb-brand-story").show()
        $(".mb-brand-story").animate({
            width: "100%",
        }, 200);
    })
    $(".mb-brand-story img").click(function () {
        closeMobileNav();
        $(".mb-brand-story").animate({
            width: "0",
        }, 200, function () {
            $(".mb-brand-story").hide()
        });

    })
    //全部商品控制
    $(".aibo-all-products").hover(function () {//鼠标移上去
        $(".sy-total-products-pulldown").stop()
        $(".sy-total-products-pulldown").removeClass("display-none").animate({
            opacity: "1"
        }, 400);
    }, function () {//鼠标移开
        $(".sy-total-products-pulldown").stop()
        $(".sy-total-products-pulldown").addClass("display-none").animate({
            opacity: "0"
        });
    });
    $(".sy-total-products-pulldown").hover(function () {//鼠标移上去
        $(".sy-total-products-pulldown").stop()
        $(".sy-total-products-pulldown").removeClass("display-none").animate({
            opacity: "1"
        }, 400);
        $(".aibo-all-products").addClass("aibo-headnav-hover");
    }, function () {//鼠标移开
        $(".sy-total-products-pulldown").stop()
        $(".sy-total-products-pulldown").addClass("display-none").animate({
            opacity: "0"
        });
        $(".aibo-all-products").removeClass("aibo-headnav-hover");
    });
    //获取屏幕高度,解决移动端搜索和全部商品全屏显示
    var screenHeight = document.documentElement.clientHeight;
    if ($("#search-page-height").length != 0) {
        document.getElementById("search-page-height").style.height = screenHeight + "px";
    }
    if ($("#allProduct-page-height").length != 0) {
        document.getElementById("allProduct-page-height").style.height = screenHeight + "px";
    }

    //搜索商品信息
    $(".search-product-info-result").hide();
    $('.search-product-info').bind('input propertychange', function () {
        if ($(this).val().length > 0) {
            $(".homepage-search-resresult").show();
            $(".homepage-history-search").hide();
        } else {
            $(".homepage-search-resresult").hide();
            $(".homepage-history-search").show();
        }
    });

    //移动端上面黑色条条如果是没有登陆的情况
    if ($(".sy-logistics-info-row .sy-option-left").length === 0 || $(".sy-option-left").css("display") == "none") {
        $(".home-page-content").css("top", "50px");
        $(".mask").css("top", "0");
        $(".aibo-mobile-headnav").css("top", "0");
    }

    //点击用户名下拉列表后立刻隐藏
    $(".sy-username li").click(function () {
        $(".sy-username").hide();
    });
});

// //获取主题内容的高度
// function getMainBody() {
//     let mainHeight=$('.mobile-content').outerHeight(true);
//     console.log("mainHeight="+mainHeight);
//     $('.common-footer').css("marginTop",mainHeight+120+'px');
// }


function toNav(name) {
    console.log(name);
}

//移动端全部商品分类切换
function toogleClassify(ele) {
    var item = $(ele).find('.mobile-classify-item')[0];
    if ($(item).is(':visible')) {
        $(item).hide();
    } else {
        $(item).show();
    }
}


//打开移动端搜索
function showMobileSearch(className) {
    if ($(".sy-option-left").css("display") === "block") {//若移动端物流信息是显示的
        $(className).css("top", "-76.4px");
    } else {
        $(className).css("top", "-52.4px");
    }
    closeMobileNav();
    if (className === ".mobile-search") {
        $(".mobile-search-container").show();
    } else if (className === ".mobile-allProduct") {
        $(".mobile-allProduct-head,.mobile-allProduct-content").show();
    }

    $(className).addClass("mobile-search-click");

}

//关闭移动端搜索
function closeMobileSearch(className) {
    if (className === ".mobile-search") {
        $(".mobile-search-container").hide();
    } else if (className === ".mobile-allProduct") {
        $(".mobile-allProduct-head,.mobile-allProduct-content").hide();
    }
    $(className).removeClass("mobile-search-click");
}

//打开移动端菜单
function showMobileNav() {

    //判断头部有没有黑色条条
    if ($(".sy-logistics-info-row .sy-option-left").length === 0 || $(".sy-option-left").css("display") == "none") {
        $(".mask").css("top", "0");
        $(".aibo-mobile-headnav").css("top", "0");
    }

    $(".mask").removeClass("display-none");
    $(".aibo-mobile-headnav").addClass("aibo-mobile-headnav-click");
    $(".user-option").addClass("user-option-click");
    $(".aibo-mobile-headnav ul").addClass("aibo-mobile-headnav-ul-click");
    $("body").addClass("overFlowHide");
}

//关闭移动端菜单
function closeMobileNav() {
    //允许页面滚动
    // $(".mobile-content").css('overflow-y','auto');

    $(".aibo-mobile-headnav").removeClass("aibo-mobile-headnav-click");
    $(".user-option").removeClass("user-option-click");
    $(".aibo-mobile-headnav ul").removeClass("aibo-mobile-headnav-ul-click");
    $(".mask").addClass("display-none");
    $("body").removeClass("overFlowHide");
}

//关闭PC顶端促销通知
function closeTips() {
    document.getElementById("promotion-notice").style.display = "none";
}

//关闭移动端的订单信息
function closeMobileTips() {
    $(".sy-option-left").addClass("display-none");
    $(".home-page-content").css("top", "50px");
    $(".mask").css("top", "0");
    $(".aibo-mobile-headnav").css("top", "0");
}

//移动端登陆
function login() {
    if ($(window).width() <= 767) {
        $(".login-mobile").addClass("display-none");
        $(".user-name-option").removeClass("display-none");
    } else {
        $('.login-register-a').hide();
        $('.sy-option-left').show();
        $('.sy-username-option').show();
    }

}

function loginout() {
    if ($(window).width() <= 767) {
        $(".user-name-option").addClass("display-none");
        $(".login-mobile").removeClass("display-none");
    } else {
        $('.sy-option-left').hide();
        $('.sy-username-option').hide();
        $('.login-register-a').show();
    }
}

//PC搜索
function search() {
    $('.head-search').show();
    $('.aibo-headnav').hide();
    setTimeout(function () { //动画效果
        $(".pc-input-containder").addClass("search-content-click");
    }, 100);
}

function closeSearch() {
    $(".pc-input-containder").removeClass("search-content-click");
    $('.head-search').hide();
    $('.aibo-headnav').show();
}

//移动端汉堡包和页脚控制
function navControl() {
    //这部分与汉堡包有关
    if ($(window).width() <= 767) {
        $(".aibo-mobile-headnav").addClass("display-block");
        var windowHeight = document.documentElement.clientHeight;
        $(".aibo-mobile-headnav").css("height", windowHeight);
        //设定最大高度，超过就出现滚动条，考虑到浏览器底部有工具栏的情况减去200px
        $(".aibo-mobile-headnav-container").css("max-height", windowHeight - 100);
    } else {
        $(".aibo-mobile-headnav").addClass("display-none");
    }
}

//路由
function routerTo(url) {
    showPageLoading();//loding开始
    setTimeout(function () {
        location.href = url;
        hidePageLoading();//loding隐藏
    }, 1500);
}

/*toast
*参数解析
*isSuccess：是否成功标识，no:不用图片；success:用成功的图片；fail:失败的图片
* 调用aiboToast('no','填入你需要的信息')；aiboToast('success','加入购物车成功')；aiboToast('fail','加入购物车失败')
*/

function aiboToast(flag, messege) {
    let html = "";
    $('.aibo-toast-container p').empty();
    if ($(window).width() >= 768) {//PC端
        if (flag == "success") {
            $(".toast-success").show();
            html = "<p>" + messege + "</p>";
        } else if (flag == "fail") {
            $(".toast-fail").show();
        }
    }
    html = "<p>" + messege + "</p>";
    $('.aibo-toast-container').append(html);

    $(".aibo-toast-container").fadeIn();
    setTimeout(function () {
        $(".aibo-toast-container").fadeOut();
    }, 2000);
}

/*
text1为第一行粗体主提示，
text2为第二行辅助提示
默认为空值
*/
function alertWindowInfo(text1 = "", text2 = "") {
    var Mbcontent = $(".mobile-content");
    if (Mbcontent) {
        Mbcontent.css("-webkit-overflow-scrolling", "auto")
    }
    $(".alert-window-info").removeClass("hidden")
    $("body").addClass("common-mask")
    $("body").addClass("overFlowHide");
    $(".awi-text1").text(text1)
    $(".awi-text2").text(text2)
}


/*页面加载loading*/

/*显示loading*/
function showPageLoading() {
    $('html,body').addClass('page-loading').addClass("overFlowHide");
    //$('body').append('<i class="loaing-animate"></i>');
    $('body').append('<div class="loading">\n' +
        '        <span></span>' +
        '        <span></span>' +
        '        <span></span>' +
        '        </div>');
}

/*隐藏loading*/
function hidePageLoading() {
    $('html,body').removeClass("overFlowHide").removeClass('page-loading');
    //$('.loaing-animate').remove();
    $('.loading').remove();
}

//选中语言特效
$(".select-language-zh").click(function () {
    $(this).addClass("color-fff-imp")
    $(".select-language-us").removeClass("color-fff-imp")
})
$(".select-language-us").click(function () {
    $(this).addClass("color-fff-imp")
    $(".select-language-zh").removeClass("color-fff-imp")
})
