package com.glj.million.level.product.controller;

import com.glj.million.level.product.service.TemplateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * <p>
 *
 * </p>
 *
 * @author gongliangjun 2019/07/01 11:18
 */

@Controller
@Slf4j
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class TemplateController {

  private final TemplateService templateService;


  /**
   * 修改模板
   */
  @RequestMapping("editTemplate")
  public String editTemplate(Model model) throws Exception {
    String tplStr = templateService.getFileTemplateString();
    model.addAttribute("tplStr", tplStr);
    return "glj_edit_template";
  }

  /**
   * 保存模板
   */
  @RequestMapping("saveTemplate")
  public String saveTemplate(Model model, String content) throws Exception {

    templateService.saveFileTemplateString(content);

    String msg = "保存成功。";
    model.addAttribute("msg", msg);
    return "success";
  }


  /**
   * 模板管理
   */
  @RequestMapping("templates")
  public String templates(Model model) {

    return "glj_templates";
  }

}
