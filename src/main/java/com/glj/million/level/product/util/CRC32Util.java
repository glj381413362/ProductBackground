package com.glj.million.level.product.util;

import java.util.zip.CRC32;

/** @author gongliangjun 2019/07/01 11:18 */
public class CRC32Util {

  public static long CRC32Long(Integer id) {
    return CRC32Long(id.toString());
  }

  public static long CRC32Long(String str) {
    CRC32 c = new CRC32();
    c.reset();
    byte[] bytes = str.getBytes();
    c.update(bytes, 0, bytes.length);
    return c.getValue(); // 获取CRC32 的值  默认返回值类型为long 用于保证返回值是一个正数
  }
}
