package com.glj.million.level.product.service;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.InputStreamReader;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * <p>
 *
 * </p>
 *
 * @author gongliangjun 2019/07/01 11:18
 */

@Slf4j
@Service
public class TemplateService {

  @Value(value = "${nginx.html.root}")
  String htmlRoot;

  @Value(value = "${jfinal.templates.location}")
  String templatesLocation;


  public String getFileTemplateString() throws Exception {

    // tomcat 下部署项目，可以这么取
    // 获取 静态模板文件的输入流
    String file = templatesLocation + "jfinal_item.html";
    BufferedReader reader = new BufferedReader(new InputStreamReader(new FileInputStream(file)));

    // 读缓冲区
    StringBuffer sb = new StringBuffer();

    String lineStr = reader.readLine();
    while (lineStr != null) {
      sb.append(lineStr).append("\r\n");
      lineStr = reader.readLine();
    }
    reader.close();

    return sb.toString();
  }

  public void saveFileTemplateString(String content) throws Exception {

    String file = templatesLocation + "jfinal_item.html";

    BufferedWriter writer = new BufferedWriter(new FileWriter(file));
    writer.write(content);
    writer.flush();
    writer.close();
  }


}
