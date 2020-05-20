$(".od-cancel-order").click(function () {
    $(".mobile-content").css("-webkit-overflow-scrolling", "auto")
    alertWindowInfo("确认是否申请退款？", "退款成功后，该订单将自动取消")
})
//物流逻辑
var expressNum = $(".od-express-step-current").length;
for (var i = 0; i < expressNum; i++) {
    var expressStep = $($($(".od-express-step-current").parent())[i]).find(".od-express-step");
    for (var j = 4; j <= expressStep.length; j++) {
        $(expressStep[j]).addClass("hidden")
    }
}

$(".express-step-show").click(function () {

    var isShow = $(this).text();
    var currentExpessStep = $(this).parent().find(".od-express-step")
    if (isShow === "查看更多") {
        for (var i = 4; i <= currentExpessStep.length; i++) {
            $(currentExpessStep[i]).removeClass("hidden")
        }
        $(this).text("收起")
    } else {
        for (var i = 4; i <= currentExpessStep.length; i++) {
            $(currentExpessStep[i]).addClass("hidden")
        }
        $(this).text("查看更多")
    }
})

var packageNum = 0;
$(".od-delivery").click(function () {
    $(this).addClass("od-delivery-active")
    $(".od-delivery").not(this).removeClass("od-delivery-active")
    for (i = 0; i < $(".od-delivery").length; i++) {
        if ($(".od-delivery")[i] === this) {
            packageNum = i
        }
    }
    $($(".od-delivery-content")[packageNum]).removeClass("hidden")
    $($(".od-delivery-content").not($(".od-delivery-content")[packageNum])).addClass("hidden")
})
$(".mb-od-express").click(function () {
    $($(".md-od-express-container")[packageNum]).removeClass("hidden")
})
$(".mb-od-express-confirm").click(function () {
    $($(".md-od-express-container")[packageNum]).addClass("hidden")
})

var clipboard = new ClipboardJS('.mb-od-copy-opt');

clipboard.on('success', function() {
    aiboToast('success','复制成功')
});

clipboard.on('error', function() {
    aiboToast('fail','复制失败，请手动复制')
});

