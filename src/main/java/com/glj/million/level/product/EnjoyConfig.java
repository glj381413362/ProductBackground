package com.glj.million.level.product;

import com.jfinal.template.Engine;
import com.jfinal.template.ext.spring.JFinalViewResolver;
import com.jfinal.template.source.FileSourceFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class EnjoyConfig {

  @Value(value = "${jfinal.templates.location}")
  String templatesLocation;

  @Bean(name = "jfinalViewResolver")
  public JFinalViewResolver getJFinalViewResolver() {

    // 创建用于整合 spring boot 的 ViewResolver 扩展对象
    JFinalViewResolver jfr = new JFinalViewResolver();

    // 对 spring boot 进行配置
    jfr.setSuffix(".html");
    jfr.setContentType("text/html;charset=UTF-8");
    jfr.setOrder(0);

    // 获取 engine 对象，对 enjoy 模板引擎进行配置
    Engine engine = JFinalViewResolver.engine;

    // 热加载配置能对后续配置产生影响，需要放在最前面
    engine.setDevMode(true);
    engine.setSourceFactory(new FileSourceFactory());
    // 在使用 ClassPathSourceFactory 时要使用 setBaseTemplatePath
    // 代替 jfr.setPrefix("/view/")
    engine.setBaseTemplatePath(templatesLocation);

    // 使用 ClassPathSourceFactory 从 class path 与 jar 包中加载模板文件
   /* engine.setToClassPathSourceFactory();
    // 在使用 ClassPathSourceFactory 时要使用 setBaseTemplatePath
    // 代替 jfr.setPrefix("/view/")
    engine.setBaseTemplatePath("/templates/");*/
    return jfr;
  }
}