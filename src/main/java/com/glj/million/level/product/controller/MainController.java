package com.glj.million.level.product.controller;

import static com.glj.million.level.product.constant.Constant.PRODUCT_BACKGROUND_HTML;
import static com.glj.million.level.product.constant.Constant.SUCCESS_HTML;

import com.glj.million.level.product.service.ItemService;
import java.util.HashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class MainController {


  @Autowired
  ItemService itemSrv;


  /**
   * 商品静态管理后台首页
   *
   * @return java.lang.String
   * @author gongliangjun 2020-05-20 1:08 PM
   */
  @RequestMapping
  public String index() {
    return PRODUCT_BACKGROUND_HTML;
  }

  /**
   * 表单接受，入库
   *
   * @param item
   * @param model
   * @return
   */
	/*@RequestMapping("add")
	public String add(Item item, Model model) throws Exception {

		Item itemRecord = itemSrv.add(item);

		model.addAttribute("msg", "添加商品成功, <a href = 'view?id="
		+itemRecord.getId()+"' target='_blank' class=\"layui-btn\">预览一下</a>");

		return "success";
	}*/

  /**
   * 生成首页
   *
   * @return java.lang.String
   * @author gongliangjun 2020-05-20 12:51 PM
   */
  @RequestMapping("generateMain")
  public String generateMain(Model model) {
    itemSrv.generatemain();
    String msg = "文件生成成功，<a href='main_1.html' target='_blank'>查看</a>";
    model.addAttribute("msg", msg);
    return SUCCESS_HTML;
  }


  /**
   * 根据不同的类别生成固定页数的静态页面
   *
   * @return java.lang.String
   * @author gongliangjun 2020-05-20 12:50 PM
   */
  @RequestMapping("generateCategory")
  public String generateCategory(Model model) {

    try {
      itemSrv.generateCategory();
    } catch (Exception e) {
      e.printStackTrace();
    }
    String msg = "文件生成成功，<a href='list_A_1.html' target='_blank'>查看</a>";
    model.addAttribute("msg", msg);
    return SUCCESS_HTML;
  }


  // 集群状态
  @RequestMapping("health")
  public String health(Model model) throws Exception {

    HashMap<String, Boolean> map = itemSrv.health();
    model.addAttribute("map", map);
    return "health";
  }


}
