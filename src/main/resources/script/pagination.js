/*分页配置*/
var togglecurrPage = 1;
(function ($) {
  var ms = {
    init: function (totalsubpageTmep, args) {
      return (function () {
        togglecurrPage = args.currPage;
        ms.fillHtml(totalsubpageTmep, args);
        ms.bindEvent(totalsubpageTmep, args);
        currentPageActived(togglecurrPage);
      })();
    },
    //填充html
    fillHtml: function (totalsubpageTmep, args) {
      return (function () {
        totalsubpageTmep = "";
        if (togglecurrPage > 1) {
          totalsubpageTmep = "<li class='ali'><a href='javascript:void(0);' class='geraltTb_pager'><ion class='glyphicon glyphicon-chevron-left'></ion></a></li>";
        }
        // 页码大于等于4的时候，添加第一个页码元素
        if (args.currPage != 1 && args.currPage >= 4 && args.totalPage != 4) {
          totalsubpageTmep += "<li class='ali'><a href='javascript:void(0);' class='geraltTb_pager' data-go='' >"
              + 1 + "</a></li>";
        }
        /* 当前页码>4, 并且<=总页码，总页码>5，添加“···”*/
        if (args.currPage - 2 > 2 && args.currPage <= args.totalPage
            && args.totalPage > 5) {
          totalsubpageTmep += "<li class='unborder'><span>...</span></li>";
        }
        /* 当前页码的前两页 */
        var start = args.currPage - 2;
        /* 当前页码的后两页 */
        var end = args.currPage + 2;

        if ((start > 1 && args.currPage < 4) || args.currPage == 1) {
          end++;
        }
        if (args.currPage > args.totalPage - 4 && args.currPage
            >= args.totalPage) {
          start--;
        }
        for (; start <= end; start++) {
          if (start <= args.totalPage && start >= 1) {
            totalsubpageTmep += "<li class='ali'><a href='javascript:void(0);' class='geraltTb_pager' data-go='' >"
                + start + "</a></li>";
          }
        }
        if (args.currPage + 2 < args.totalPage - 1 && args.currPage >= 1
            && args.totalPage > 5) {
          totalsubpageTmep += "<li class='unborder'><span>...</span></li>";
        }

        if (args.currPage != args.totalPage && args.currPage < args.totalPage
            - 2 && args.totalPage != 4) {
          totalsubpageTmep += "<li class='ali'><a href='javascript:void(0);' class='geraltTb_pager' data-go='' >"
              + args.totalPage + "</a></li>";
        }
        if (togglecurrPage < args.totalPage) {
          totalsubpageTmep += "<li class='ali'><a href='javascript:void(0);' class='geraltTb_pager'><ion class='glyphicon glyphicon-chevron-right'></ion></a></li>";
        }
        $(".pagination").html(totalsubpageTmep);
      })();
    },
    //绑定事件
    bindEvent: function (totalsubpageTmep, args) {
      return (function () {
        totalsubpageTmep.on("click", "a.geraltTb_pager", function (event) {
          var obj = $(this).children("ion");
          if (obj.length > 0) {
            if ($(obj[0]).hasClass("glyphicon-chevron-left") && togglecurrPage
                > 1) {
              togglecurrPage = togglecurrPage - 1;
            } else if ($(obj[0]).hasClass("glyphicon-chevron-right")
                && togglecurrPage < args.totalPage) {
              togglecurrPage = togglecurrPage + 1;
            }
          } else {
            togglecurrPage = parseInt($(this).text());
          }

          ms.fillHtml(totalsubpageTmep, {
            "currPage": togglecurrPage,
            "totalPage": args.totalPage,
            "turndown": args.turndown
          });
          if (typeof(args.backFn) == "function") {
            currentPageActived(togglecurrPage);
            args.backFn(togglecurrPage);
          }
        });
      })();
    }
  }
  $.fn.createPage = function (options) {
    ms.init(this, options);
  }
})(jQuery);

function currentPageActived(page) {
  var page_arr = $(".pagec a.geraltTb_pager");
  for (let page_i = 0; page_i < page_arr.length; page_i++) {
    let page_item = parseInt($(page_arr[page_i]).text());
    if (page === page_item) {
      console.log(page)
      $(page_arr[page_i]).addClass("current-page-actived");
    } else {
      if ((!isNaN(page_item)) && $(page_arr[page_i]).hasClass(
          "current-page-actived")) {
        $(page_arr[page_i]).removeClass("current-page-actived");
      }
    }

  }
}
