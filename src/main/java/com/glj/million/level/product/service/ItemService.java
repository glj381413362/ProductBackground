package com.glj.million.level.product.service;

import static com.glj.million.level.product.constant.Constant.GLJ_ITEM_MAIN_HTML;
import static com.glj.million.level.product.constant.Constant.GLJ_ITEM_MAIN_ONE_HTML;

import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.glj.million.level.product.entity.Item;
import com.glj.million.level.product.mapper.ItemMapper;
import com.glj.million.level.product.util.CRC32Util;
import com.jfinal.kit.Kv;
import com.jfinal.template.Engine;
import com.jfinal.template.Template;
import com.jfinal.template.ext.spring.JFinalViewResolver;
import java.io.File;
import java.net.InetAddress;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

@Slf4j
@Service
@Transactional
public class ItemService {

  private static List<Integer> locks = new ArrayList<Integer>();

  @Value("#{'${nginx.html.roots}'.split(',')}")
  List<String> htmlRoots;

  @Value(value = "${jfinal.templates.location}")
  String templatesLocation;

  @Autowired private ItemMapper itemMapper;

  public Item insert(Item item) {

    itemMapper.insert(item);
    return item;
  }

  public Item findById(int id) {
    return itemMapper.selectByPrimaryKey(id);
  }

  public List<Item> findAll() {
    return itemMapper.selectAll();
  }

  public void generateHtml(int id) {
    // 初始化模板引擎
    Engine engine = JFinalViewResolver.engine;
    // 从数据源，获取数据
    Item item = itemMapper.selectByPrimaryKey(id);
    // 前端模板用的键值对
    Kv kv = Kv.by("item", item);
    // 文件写入路径
    String fileName = "item" + id + ".html";
    // 这里和分发层的hash算法保持一致，不然生成的文件同步位置有问题
    String filePath = getFilePath(item.getId());
    // 路径 直接能被用户访问
    File file = new File(filePath + fileName);
    // 开始渲染 输出文件
    Template template = engine.getTemplate(item.getTemplateName() + ".html");
    template.render(kv, file);
    item.setHtmlStatus("成功");
    item.setLocation(filePath + fileName);
    itemMapper.updateByPrimaryKeySelective(item);
  }

  public List<Item> generateAll() {

    // 准备数据
    List<Item> list = itemMapper.selectAll();

    // 初始化模板引擎
    Engine engine = JFinalViewResolver.engine;
    String filePath;
    Set<String> collect = list.stream().map(Item::getTemplateName).collect(Collectors.toSet());
    Map<String, Template> templateMap = new HashMap<>();
    for (String tpl : collect) {
      // 获取模板
      Template t = engine.getTemplate(tpl + ".html");
      templateMap.put(tpl, t);
    }
    for (Item item : list) {
      // 这里和分发层的hash算法保持一致，不然生成的文件同步位置有问题
      filePath = getFilePath(item.getId());
      String templateName = item.getTemplateName();
      // 获取模板
      Template template = templateMap.get(templateName);
      Kv kv = Kv.by("item", item);
      // 路径 直接能被用户访问
      String fileName = "item" + item.getId() + ".html";
      File file = new File(filePath + fileName);
      try {
        // 开始渲染 输出文件
        template.render(kv, file);
        item.setHtmlStatus("成功");
        item.setLocation(filePath + fileName);
      } catch (Exception e) {
        // 记日志
        item.setHtmlStatus("失败");
      }
      itemMapper.updateByPrimaryKeySelective(item);
    }
    return list;
  }

  /**
   * 根据id 获取生成文件的path
   *
   * @param id
   * @author gongliangjun 2020-05-27 5:28 PM
   * @return java.lang.String
   */
  private String getFilePath(Integer id) {
    int index = (int) (CRC32Util.CRC32Long(id) % htmlRoots.size());
    return htmlRoots.get(index);
  }
 private String getFilePath(String str) {
   int index = (int) (CRC32Util.CRC32Long(str) % htmlRoots.size());
   return htmlRoots.get(index);
  }

  // 创建系统首页 html
  public void generatemain() {
    // 初始化模板引擎
    Engine engine = JFinalViewResolver.engine;

    int pageSize = 2;
    int total = itemMapper.selectCount(new Item());
    // 静态文件页数
    int staticPage = Math.min(2, (total / pageSize) + 1);
    PageHelper.startPage(0, staticPage * pageSize);
    // 从数据源，获取数据
    List<Item> items = itemMapper.select(new Item());
    int pages = (total / pageSize) + 1;
    // 开始渲染 输出文件
    Template template = engine.getTemplate(GLJ_ITEM_MAIN_ONE_HTML + ".html");
    for (int i = 1; i <= staticPage; i++) {
      List<Item> subList = items.subList(pageSize * (i - 1), Math.min(pageSize * i, total));
      // 前端模板用的键值对
      Kv kv = Kv.by("items", subList);
      kv.put("totalData", total);
      kv.put("page", pages);
      kv.put("pageSize", pageSize);
      kv.put("staticPage", staticPage);
      // 文件写入路径
      String fileName = "main_" + i + ".html";
      String filePath = getFilePath(i);
      // 路径 直接能被用户访问
      File file = new File(filePath + fileName);
      if (i != 1) {
        template = engine.getTemplate(GLJ_ITEM_MAIN_HTML + ".html");
      }
      template.render(kv, file);
    }
  }

  public HashMap<String, Boolean> health() throws Exception {

    HashMap<String, Boolean> map = new HashMap<>();

    map.put("192.168.150.113", null);
    map.put("192.168.150.213", null);
    map.put("192.168.150.133", null);

    for (String key : map.keySet()) {

      InetAddress inetAddress = InetAddress.getByName(key);
      boolean reachable = inetAddress.isReachable(3000);

      map.put(key, reachable);
    }
    return map;
  }

  public Item add(Item item) throws Exception {
    try {
      // 1. 写入数据库
      itemMapper.insert(item);
      // 2. 生成文件
      generateHtml(item.getId());
    } catch (Exception e) {
      log.warn("add item error :{}", e);
      TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
      throw new Exception("添加item失败");
    }
    return item;
  }

  public Item update(Item item) {
    itemMapper.updateByPrimaryKeySelective(item);
    return item;
  }

  public synchronized Boolean getLock(Integer id) {

    // 去 locks 里去 取 id ，有的话 说明不可写， 没有的话，添加一个id 进去
    int index = locks.indexOf(id);

    if (index == -1) {
      // 没有
      locks.add(id);
      return true;
    } else {
      // 有，代表 别人持有锁... 死锁问题？
      return false;
    }
  }

  public void releaseLock(Integer id) {

    locks.remove(id);
  }

  public List<Item> checkFile() {
    List<Item> list = itemMapper.selectAll();
    List<Item> errorList = new ArrayList<>();
    // 2. 比对这些id 在磁盘上有没有文件
    for (Item item : list) {
      String fileName = "item" + item.getId() + ".html";
      File file = new File(getFilePath(item.getId()) + fileName);
      if (!file.exists()) {
        errorList.add(item);
      }
    }
    // 3. 把没有的 返回去回来
    return errorList;
  }

  public Page<Item> findByPage(int pageNum, int pageSize) {
    // TODO Auto-generated method stub
    Page<Item> page = PageHelper.startPage(pageNum, pageSize);
    Item example = new Item();
    itemMapper.select(example);
    return page;
  }

  // 生成列表分页
  // 访问的时候 list_1.html 代表第一页 前3页生成静态
  public void generateCategory() {
    // TODO: 2020/5/20 假设就4个类别
    List<String> category =
        new ArrayList<String>() {
          {
            add("A");
            add("B");
            add("C");
            add("D");
          }
        };

    // 每页显示多少
    int pageSize = 2;

    for (String cate : category) {

      // 限制取出的数据量 两页数据
      int total =
          itemMapper.selectCount(
              new Item() {
                {
                  setCategory(cate);
                }
              });
      int pages = (total / pageSize) + 1;
      // 静态文件页数
      int staticPage = Math.min(2, (total / pageSize) + 1);

      // 取生成静态文件的数据
      Item dataExample =
          new Item() {
            {
              setCategory(cate);
            }
          };
      PageHelper.startPage(0, staticPage * pageSize);
      // 包含 staticPage* 页的数据
      List<Item> list = itemMapper.select(dataExample);
      // 初始化模板引擎
      Engine engine = JFinalViewResolver.engine;
      Template template = engine.getTemplate("glj_item_page_one.html");
      for (int i = 1; i <= staticPage; i++) {
        // 填充 两页的数据

        /*
         * pageSize = 3
         * staticPage = 2;
         *
         *  fromIndex                   toIndex
         *      0                           2
         *      i-1                      staticPage-1
         *      pageSize * (i-1)         pageSize * i -1
         */
        List<Item> subList = list.subList(pageSize * (i - 1), Math.min(pageSize * i, total));

        // 前端模板用的键值对
        Kv kv = Kv.by("items", subList);
        kv.put("totalData", total);
        kv.put("page", pages);
        kv.put("pageSize", pageSize);
        kv.put("staticPage", staticPage);
        kv.put("category", cate);
        // 文件写入路径
        String fileName = "list_" + cate + "_" + i + ".html";
        String filePath = getFilePath(cate+i);
        // 路径 直接能被用户访问
        File file = new File(filePath + fileName);
        // 开始渲染 输出文件
        if (i != 1) {
          template = engine.getTemplate("glj_item_page.html");
        }
        template.render(kv, file);
      }
    }
  }
}
