package com.glj.million.level.product.controller;

import com.glj.million.level.product.entity.Item;
import com.glj.million.level.product.service.ItemService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

import static com.glj.million.level.product.constant.Constant.*;

/**
 * <p>
 * 商品
 * </p>
 *
 * @author gongliangjun 2019/07/01 11:18
 */
@Controller
@Slf4j
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class ItemComtroller {


	private final ItemService itemService;

	/**
	 * 显示添加item页面
	 *
	 *
	 * @author gongliangjun 2020-05-20 12:53 PM
	 * @return java.lang.String
	 */
	@RequestMapping("/addtor")
	public String addtor() {
		return GLJ_ADD_HTML;
	}

	/**
	 * 保存新增的item
	 *
	 * @param item
	 * @param model
	 * @author gongliangjun 2020-05-20 12:54 PM
	 * @return java.lang.String
	 */
	@PostMapping("/addItem")
	public String add(Item item, Model model) throws Exception {

		Item itemRecord = itemService.add(item);

		model.addAttribute("msg", "新商品添加成功, <a href = 'view?id="
				+ itemRecord.getId() + "' target='_blank' class=\"layui-btn\">预览一下</a>");

		return SUCCESS_HTML;
	}

	/**
	 * 保存item修改
	 *
	 * @param item
	 * @param model
	 * @author gongliangjun 2020-05-20 12:52 PM
	 * @return java.lang.String
	 */
	@RequestMapping("editSave")
	public String editSave(Item item, Model model) {

		Item itemRecord = itemService.update(item);
		model.addAttribute("msg", "添加商品成功, <a href = 'view?id="
				+itemRecord.getId()+"' target='_blank' class=\"layui-btn\">预览一下</a>");

		itemService.releaseLock(item.getId());
		return SUCCESS_HTML;
	}



	/**
	 * item 列表，可以生成html文件，修改item信息
	 *
	 * @param model
	 * @author gongliangjun 2020-05-20 12:55 PM
	 * @return java.lang.String
	 */
	@RequestMapping("itemList")
	public String itemList(Model model) {

		List<Item> items = itemService.findAll();
		model.addAttribute("items", items);
		return GLJ_ITEM_LIST_HTML;
	}


	/**
	 * 显示编辑item页面
	 * 防止多个人同时编辑，进行了加锁
	 *
	 * @param id
	 * @param model
	 * @author gongliangjun 2020-05-20 12:55 PM
	 * @return java.lang.String
	 */
	@RequestMapping("editor")
	public String editor(Integer id, Model model) {
		Item itemRecord = itemService.findById(id);
		Boolean canWrite = itemService.getLock(id);
		model.addAttribute("canWrite", canWrite);
		model.addAttribute("item", itemRecord);
		return GLJ_EDITOR_HTML;
	}

	/**
	 * 生成所有静态页面
	 *
	 * @param model
	 * @author gongliangjun 2020-05-20 12:56 PM
	 * @return java.lang.String
	 */
	@RequestMapping("generateAll")
	public String generateAll(Model model) {

		List<Item> list = itemService.generateAll();
		model.addAttribute("items", list);
		return GLJ_ITEM_LIST_HTML;
	}

	/**
	 *
	 * item 列表，可以生成html文件，修改item信息
	 * @param model
	 * @param id
	 * @author gongliangjun 2020-05-20 12:48 PM
	 * @return java.lang.String
	 */
	@RequestMapping("generate")
	public String generate(Model model, int id) {

		itemService.generateHtml(id);
		String msg = "文件生成成功，<a href='item"+id+".html' target='_blank'>查看</a>";
		model.addAttribute("msg", msg);
		return SUCCESS_HTML;
	}

	/**
	 * 静态文件检查
	 *
	 * @param model
	 * @author gongliangjun 2020-05-20 12:48 PM
	 * @return java.lang.String
	 */
	@RequestMapping("check")
	public String check(Model model) {
		List<Item> errorList = itemService.checkFile();
		model.addAttribute("errorList", errorList);
		return GLJ_CHECK_HTML;
	}



}
