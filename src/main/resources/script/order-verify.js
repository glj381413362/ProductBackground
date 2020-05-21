$(document).ready(function () {
  if ($(".integral-checked").prop("checked")) { //true
    $(".integral-checked").parent().css({
      "background-image": "url(\'../assets/icon/bg-right.png\')",
      "border": "none"
    })
    let clientHeight = document.documentElement.clientHeight;
    $(".sc-order-addresslist").css("height", clientHeight - 100)
  }//初始化积分抵扣项被勾选项显示效果
  $(".sc-order-custominfo").first().addClass("customer-bdactive").append(
      "<span class=\"sc-order-defaultaddress color-fff font12\">默认</span>\n");
  let addressnum = $($(".ov-addresslist>div")).length
  if (addressnum === 0) {
    $(".ov-addresslist").addClass("hidden")
    $(".setaddaddress").removeClass("hidden")
  }
});//为首个收货地址添加“默认”头标
// function address() {
//     let custominfo = $(".sc-order-custominfo")
//     for (let i = 0; i <= custominfo.length; i++) {
//         //pc端显示前3个收货地址
//         if ($(window).width() > 767) {
//             if (i < 3) {
//                 $(custominfo[i]).parent().removeClass("hidden")
//             }
//             else {
//                 $(custominfo[i]).parent().addClass("hidden")
//             }
//         }
//         //移动端显示前1个收货地址
//         else {
//             i < 1 ? $(custominfo[i]).parent().removeClass("hidden") : $(custominfo[i]).parent().addClass("hidden")
//         }
//     }
// }

//address()
// $(window).resize(address)//极端情况分辨率下由pc 转 移动，调整收货地址显示
// //显示所有地址
// $(".sc-order-address").click(function () {
//     if ($(this).find("span").text() != "收起") {
//         $(".sc-order-custominfo").parent().removeClass("hidden")
//         $(this).find("span").text("收起")
//     }
//     else {
//         address()
//         $(this).find("span").text("更多地址")
//     }
// });
//移动端显示更多地址
$(".sc-order-mbshowmore").click(function () {
  $("body").addClass("overFlowHide");
  $("body").addClass("common-mask");
  $(".mobile-content").css("-webkit-overflow-scrolling", "auto")
  $(".sc-order-selffetch").find("input").prop("checked", false).parent().css({
    "background-image": "url('')",
    "border": "1px solid rgb(0, 0, 0)"
  })
  isSelfFetch()
  $(".sc-order-mbaddress").removeClass("hidden")
  $(".sc-order-addresslist>div").removeClass("hidden")
  let isBdactive = $(".sc-order-addresslist").find(
      ".sc-order-custominfo").hasClass("customer-bdactive")

  if (!isBdactive) {
    $(".sc-order-addresslist").find(".sc-order-custominfo").first().addClass(
        "customer-bdactive")
  }
  $(".sc-order-addresslist").find(".sc-order-custominfo").first().append(
      "<span class=\"sc-order-defaultaddress color-fff font12\">默认</span>\n");
})
//移动端隐藏更多地址
$(".sc-order-mbhidemore").click(function () {
  closeAddressWindow()
})

function closeAddressWindow() {
  $(".sc-order-mbaddress").addClass("hidden")
  $("body").removeClass("overFlowHide");
  $("body").removeClass("common-mask");
  $(".mobile-content").css("-webkit-overflow-scrolling", "touch")
}

// 修改定位  点击单选框边框变化
function changeBoderActive(ev) {
  if ($(ev).is(':checked')) {
    $(".store-mention .left-row").removeClass("boder-active");
    $(ev).parent().parent().parent().parent().parent().addClass("boder-active");
  }
}

//pc收货地址选择
$(".sc-order-addresspc-set").click(function () {

  $(".sc-order-addresspc-set").find(".edited").remove()
  $(this).find("p").append(
      "<img src=\"../assets/icon/edited.svg\" class=\"fr pd-R15 edited\">")
  $(".sc-order-addresspc-set").not($(this)).removeClass("bd-active")
  $(this).addClass("bd-active").find("input").prop("checked", true)
  $(".sc-order-selffetch").find("input").prop("checked", false).parent().css({
    "background-image": "url('')",
    "border": "1px solid rgb(0, 0, 0)"
  })
  isSelfFetch()
})
//自提地址选择
$(".sc-order-addresspc-selfset").click(function () {
  $(".sc-order-addresspc-selfset").not($(this)).removeClass("self-active")
  $(this).addClass("self-active").find("input").prop("checked", true)

})
//勾选自提样式变化
$(".sc-order-selffetch").click(function () {
  $(".sc-order-addresspc-set").find(".edited").remove()
  isSelfFetch()
})
//移动收货地址选择后样式变化
$(".sc-order-custominfo").click(function () {
  $(".sc-order-custominfo").not(this).removeClass("customer-bdactive")
  $(this).addClass("customer-bdactive")
  $(".sc-order-custominfo-show").empty();
  $(".sc-order-custominfo-show").append($(this).clone())
  closeAddressWindow()
  isSelfFetch()
})

//是否自提
function isSelfFetch() {
  if ($(".sc-order-selffetch").find("input").prop("checked")) {//勾选
    $(".sc-order-addresspc-set").removeClass("bd-active").find("input").prop(
        "checked", false)
    $(".sc-order-selffetch").find(".selffetch-title").addClass("fontW500")
    $(".sc-order-location").removeClass("hidden")
    $(".sc-order-custominfo").removeClass("customer-bdactive")
  }
  else {
    // $(".sc-order-addresspc-set").first().addClass("bd-active").find("input").prop("checked", true)
    $(".sc-order-location").addClass("hidden")
    $(".sc-order-selffetch").find(".selffetch-title").removeClass("fontW500")
    $(".sc-order-custominfo").first().addClass("customer-bdactive")
  }
}

//单选按钮样式变化
$(".sc-order-checked").click(function () {
  if ($(this).prop("checked")) { //true
    $(this).parent().css({
      "background-image": "url(\'../assets/icon/bg-right.svg\')",
      "border": "none"
    })
  } else {
    $(this).parent().css(
        {"background-image": "url('')", "border": "1px solid #000000"})
  }
});
//优惠券下拉框展示时，加上透明遮罩
$("#coupon-btn").click(function () {
  $("#coupon-mask").css("display", "block");
});
//点击优惠券透明遮罩，等同于提交操作
$("#coupon-mask").click(function () {
  $("#coupon-mask").css("display", "none");
});
$(".coupon-li").click(function (e) {
  e.preventDefault();
  e.stopPropagation();
  $(this).children(":first").toggleClass("checked")
});
$("#cancel").click(function () {
  $(".box").removeClass("checked");
  $("#coupon-mask").css("display", "none");
});
$("#submit").click(function () {
  $("#coupon-mask").css("display", "none");
});

$(".self-fecth").click(function () {
  if ($(this).prop("checked")) {
    $(".sc-order-custominfo").css({"opacity": "0.6"})
    $(".self-fecth").removeAttr("checked").parent().css({
      "background-image": "url('')",
      "border": "1px solid #000000"
    })
    $(this).prop("checked", "checked").parent().css({
      "background-image": "url(\'../assets/icon/bg-right.svg\')",
      "border": "none"
    })
  }
  else {
    $(".sc-order-custominfo").first().css({"opacity": "1"})
  }
})//自提
$(".sc-order-invoicetype").click(function () {
  if ($(".company").prop("checked")) {
    $(".sc-order-invoiceid").parent().parent().removeClass("hidden")
    $(".sc-order-invoiceheader").removeClass("hidden")
    $(".sc-order-name").parent().parent().addClass("hidden")

  }
  else {
    $(".sc-order-invoiceheader").addClass("hidden")
    $(".sc-order-name").parent().parent().removeClass("hidden")
    $(".sc-order-invoiceid").parent().parent().addClass("hidden")
  }
})//发票抬头类型为企业时显示纳税人识别号
$(".sc-order-nameset").click(function () {
  $(".sc-order-nameinfo").first().removeAttr("disabled")
})
$(".show-invoice").click(function () {
  $(this).find(".invoice-checked").prop("checked") ?
      $(".sc-order-invoice").children(".sc-order-invoice-show").removeClass(
          "hidden") :
      $(".sc-order-invoice").children(".sc-order-invoice-show").addClass(
          "hidden")

})//选中开具发票，显示具体发票信息
// 弹出修改收货地址
$(".sc-order-addresspc-set,.sc-order-custominfo").on("click", ".seteditaddress",
    function () {
      $(".sc-order-body").addClass("hidden")
      $(".modifyDefaultAddress").removeClass("hidden")
      closeAddressWindow()
      //弹窗数据绑定
      let name = $(this).parent().parent().find(".customer-name").text()
      let province = $(this).parent().parent().find(".customer-province").text()
      let city = $(this).parent().parent().find(".customer-city").text()
      let area = $(this).parent().parent().find(".customer-area").text()
      let addressdetail = $(this).parent().parent().find(
          ".customer-addressdetail").text()
      let phonenum = $(this).parent().parent().find(".customer-phonenum").text()
      $(".default-address").find(".name").prop("value", name)
      $(".default-address").find(".phone").prop("value", phonenum)
      new PCAS("user.province", "user.city", "user.area", province, city, area);
      $(".default-address").find(".detailaddress").prop("value", addressdetail)
    })
// 弹出新增收货地址
$(".setaddaddress").click(function (e) {
  e.preventDefault()
  $(".sc-order-body").addClass("hidden")
  $(".addAddress").removeClass("hidden")
  closeAddressWindow()
})
// 弹出修改定位
$(".set-location").click(function (e) {
  e.preventDefault()
  $(".sc-order-body").addClass("hidden")
  $(".change-location").removeClass("hidden")
})
//弹出窗 返回按钮 逻辑
$(".sc-order-return").click(function () {
  // $(".sc-order-body").removeClass("hidden")
  // $(".alert-content").addClass("hidden")
  //后台更新数据
  location.reload();
})
//弹出窗 确认按钮 逻辑
$(".sc-order-confirm").click(function () {
  //后台更新数据
  location.reload();
})
$(".filter-window").on("touchmove", function (e) {
  e.stopPropagation()
})
