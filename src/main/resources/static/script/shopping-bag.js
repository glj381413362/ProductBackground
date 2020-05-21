// 初始化总价
const alloneprice = $(".sc-list-content1").find(".oneprice")
let alltotalprice = 0
for (let i = 0; i < alloneprice.length; i++) {
  alltotalprice += Number($(alloneprice[i]).text())
}
$(".alltotalprice").text(alltotalprice)
// function countallprice(){
// var g_totalprice=[]
//     alltotalprice=0
//     g_totalprice=$(".totalprice")
//
// for(i=0;i<g_totalprice.length;i++){
//         alltotalprice+=parseFloat(g_totalprice[i].innerText)
//     }
// }
//商品数目值输入
var oldnum
$(".numtotal").keydown(function () {
  oldnum = parseInt($(this).closest(".pagination-sm").find(".numtotal").val())//获取数量
})
$(".numtotal").keyup(function () {
  var price = parseFloat($(this).closest(".row").find(".oneprice").text())//获取单价
  var num = parseInt($(this).closest(".pagination-sm").find(".numtotal").val())//获取数量
  debugger
  if (!num) {
    if (10 <= oldnum && oldnum <= 99) {
      $(this).closest(".pagination-sm").find(".numtotal").val(oldnum)
    }
    aiboToast("fail", "请输入正确的数值！")
    num === 0 ? $(this).closest(".row").find(".reduce").addClass("disabled")
        : ''
    return
  }
  else if (num > 99) {
    if (1 < oldnum && oldnum <= 99) {
      $(this).closest(".pagination-sm").find(".numtotal").val(oldnum)

    }

    aiboToast("fail", "数量过多，至多为99件！")
    return
  }
  $(this).closest(".row").find(".reduce").removeClass("disabled")
  productprice = price * num
  $(this).closest(".row").find(".totalprice").text(productprice)
  $(".alltotalprice").text(alltotalprice)
});
//当前商品数量加1
$(".plus").click(function (e) {
  e.preventDefault()
  //clearTimeout(numb)
  var price = parseFloat($(this).closest(".row").find(".oneprice").text())//获取单价
  var num = parseInt($(this).closest(".pagination-sm").find(".numtotal").val())//获取数量
  num += 1
  productprice = price * num
  alltotalprice += price
  $(this).closest(".pagination-sm").find(".numtotal").val(num)
  $(this).closest(".row").find(".totalprice").text(productprice)
  $(".alltotalprice").text(alltotalprice)
  $(this).closest(".row").find(".reduce").removeClass("disabled")
  $(this).find("a").addClass("numbutton")
  var numb = setTimeout(function () {
    $(this).find("a").removeClass("numbutton")
  }.bind(this), 1000)

})
//当前商品数量减1
$(".reduce").click(function (e) {
  e.preventDefault()
  var price = parseFloat($(this).closest(".row").find(".oneprice").text())//获取单价
  var num = parseInt($(this).closest(".pagination-sm").find(".numtotal").val())//获取数量

  if (!num) {
    return
  }
  else {
    num -= 1
    if (!num) {
      $(this).addClass("disabled")
    }
    productprice = price * num
    alltotalprice -= price
    $(this).closest(".pagination-sm").find(".numtotal").val(num)
    $(this).closest(".row").find(".totalprice").text(productprice)
    $(".alltotalprice").text(alltotalprice)
  }

  $(this).find("a").addClass("numbutton")
  var numb = setTimeout(function () {
    $(this).find("a").removeClass("numbutton")
  }.bind(this), 1000)
})
// 删除商品
$(".sc-list-delete").click(function () {

  let totalprice = parseFloat(
      $(this).closest(".row").find(".totalprice").first().text())
  alltotalprice -= totalprice//总价再计算
  $(".alltotalprice").text(alltotalprice)
  if ($(this).parent("div").parent("div").parent("div").find(
      ".sc-list-content1").length == 1) {
    $(this).parent("div").parent("div").parent("div").remove()
    //当要删除商品为1时，删除改商品及店铺信息
  }
  else {
    $(this).parent("div").parent("div").remove()
  }
})

//单选
$(".sc-list-checked").click(function () {
  if ($(this).prop("checked")) { //true
    $(this).parent().css({
      "background-image": "url(\'../assets/icon/bg-right.svg\')",
      "border": "none"
    })
  } else {
    $(this).parent().css(
        {"background-image": "url('')", "border": "1px solid #000000"})
    $(this).parent().parent().parent().parent().find(
        ".sc-list-listchecked").prop({  //隐式迭代
      checked: false
      //设置当前品牌父类勾选checked状态
    }).parent().css(
        {"background-image": "url('')", "border": "1px solid #000000"})

    $(".sc-list-allchecked").prop({  //隐式迭代
      checked: false
      //设置所有品牌商品父类勾选checked状态
    }).parent().css(
        {"background-image": "url('')", "border": "1px solid #000000"})
  }
})
$(".sc-list-listchecked").click(function () {
  //判断是否选中（某一品牌全部商品）
  if ($(this).prop("checked")) { //true
    $(this).parent().css({
      "background-image": "url(\'../assets/icon/bg-right.svg\')",
      "border": "none"
    })
    //设置当前勾选样式
    $(this).parent().parent().parent().parent().find(".sc-list-checked").prop({  //隐式迭代
      checked: true
      //设置子类勾选checked状态
    }).parent().css({
      "background-image": "url(\'../assets/icon/bg-right.svg\')",
      "border": "none"
    })
    //设置子类勾选样式
  } else {
    $(this).parent().css(
        {"background-image": "url('')", "border": "1px solid #000000"})
    $(".sc-list-checked").prop({  //隐式迭代
      checked: false
    }).parent().css(
        {"background-image": "url('')", "border": "1px solid #000000"})
  }
})
$(".sc-list-allchecked").click(function () {
  //判断是否选中(全部商品)
  if ($(this).prop("checked")) { //true
    $("input[class$='checked']").prop({  //隐式迭代
      checked: true
    }).parent().css({
      "background-image": "url(\'../assets/icon/bg-right.svg\')",
      "border": "none"
    })
  } else {
    $("input[class$='checked']").prop({  //隐式迭代
      checked: false
    }).parent().css(
        {"background-image": "url('')", "border": "1px solid #000000"})
  }
})
//移动端购物袋结算模块悬浮
$(window).scroll(function () {
  //滑到接近底部
  $(window).scroll(function () {
    //滑到接近底部
    if ($(window).scrollTop() + document.documentElement.clientHeight + 120
        >= $(document.body).height()) {
      $(".sc-list-mbpayinfo").addClass("hidden-xs")
    } else {
      $(".sc-list-mbpayinfo").removeClass("hidden-xs")
    }
  });
});



