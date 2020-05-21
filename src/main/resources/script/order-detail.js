$(document).ready(function () {
  for (let j = 0; j < $(".sc-detail-allshow").length; j++) {
    for (let i = 0; i < 3; i++) {
      $($($(".sc-detail-allshow")[j]).parent().find("div")[i]).removeClass(
          "hidden")
    }//默认显示前三条物流信息
  }

})
//查看物流详细
$(".sc-detail-allshow").click(function () {
  if ($(this).children("span").first().text() === "查看全部") {
    $(this).parent().find("div").removeClass("hidden")
    $(this).children("span").first().text("收起")
    $(this).children(".glyphicon").removeClass("glyphicon-menu-down")
    $(this).children(".glyphicon").addClass("glyphicon-menu-up")
  }
  else {
    for (let i = 3; i < $(this).parent().parent().parent().find(
        ".sc-detail-expressstate div").length; i++) {
      //前三显示，之后的隐藏
      $($(this).parent().parent().parent().find(
          ".sc-detail-expressstate div")[i]).addClass("hidden")
      $(this).children("span").first().text("查看全部")
      $(this).children(".glyphicon").removeClass("glyphicon-menu-up")
      $(this).children(".glyphicon").addClass("glyphicon-menu-down")
    }
  }
})
$(".od-refundbtn").click(function () {
  $(".mobile-content").css("-webkit-overflow-scrolling", "auto")
  alertWindowInfo("确认是否申请退款？", "退款成功后，该订单将自动取消")
})
