package com.glj.million.level.product.controller;

import com.github.pagehelper.Page;
import com.glj.million.level.product.entity.Item;
import com.glj.million.level.product.service.ItemService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import static com.glj.million.level.product.constant.Constant.GLJ_ITEM_MAIN_HTML;

/**
 * <p>
 *  静态页面预览
 * </p>
 *
 * @author gongliangjun 2019/07/01 11:18
 */
@Controller
@Slf4j
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class StaicViewController {

	private final ItemService itemService;

	/**
	 * 临时预览，动态渲染静态页面
	 *
	 * @param model
	 * @param id
	 * @author gongliangjun 2020-05-20 12:54 PM
	 * @return java.lang.String
	 */
	@RequestMapping("view")
	public String view(Model model, int id) {
		Item item = itemService.findById(id);
		model.addAttribute("item", item);
		return item.getTemplateName();
	}


	/**
	 * 预览官网首页
	 *
	 * @param model
	 * @param pageNum
	 * @param pageSize
	 * @author gongliangjun 2020-05-20 1:22 PM
	 * @return java.lang.String
	 */
	@RequestMapping("main")
	public String main(Model model,
					   @RequestParam(defaultValue = "1") int pageNum,
					   @RequestParam(defaultValue = "5") int pageSize,
					   @RequestParam(required = false) String category) {
		// category 参数没穿
		Page<Item> items = itemService.findByPage(pageNum, pageSize);
		model.addAttribute("items", items);
		return GLJ_ITEM_MAIN_HTML;
	}

}
