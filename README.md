# 架构设计

![](https://user-images.githubusercontent.com/19701761/98553085-2f7f0300-22da-11eb-9f44-f8e14adc159c.png)

## 多级缓存解决问题

三级缓存：nginx 本地缓存 + redis 分布式缓存 + JVM 堆缓存

使用这个架构主要根据数据的时效性高低采用不同的缓存策略：

- 时效性要求非常高的数据：库存、价格等

  商品价格/库存是 **时效性要求高** 的数据，而且种类较少，因此服务系统每次发生了变更的时候，直接采取数据库和 redis 缓存双写的方案，这样缓存的时效性最高，前端通过ajax直接获取最新的库存，而不是生成静态的HTML进行缓存

- 时效性要求不高的数据：商品的基本信息（名称、颜色、版本、规格参数，等等）

  商品基本信息等 **时效性不高** 的数据，而且种类繁多，可能来自多种不同的系统，采取 MQ 异步通知的方式，写一个数据异构服务，监听 MQ 消息，然后异步拉取服务的数据，更新 jvm 缓存 + redis 缓存，最后作为商品静态HTML进行缓存

## 请求的流量走向

![](https://user-images.githubusercontent.com/19701761/98553707-de234380-22da-11eb-86d3-02d0ec1e9f92.png)

客户可以在后台选择做一个商品页面静态化HTML的缓存，防止过多请求打到Tomcat服务上。

### 访问商品详情页

```java
http请求--->LVS--->分发层Nginx--->应用层Nginx
```

商品详情页，这里选择做了缓存预热，把商品全部静态化页面缓存到应用层不同的Nginx上，在用户访问某个商品详情页时，在分发层对请求做一个定向流量分发到应用层，然后在应用层直接返回给用户，这时请求只能打到应用层，而且响应速度极快，效率极高

### 访问商品类别页

```java
http请求--->LVS--->分发层Nginx--->应用层Nginx--->Redis--->jvm cache--->mysql
```

通常情况下，用户访问一个商品的类别页，往往只会看一个类别页的前几页，所以在做缓存静态HTML时，对每种类别页的缓存只缓存了前三页，后续的请求都是通过nginx+Openresty + lua 脚本做页面动态生成，每次请求过来，优先从 nginx 本地缓存中提取各种数据，结合页面模板，生成需要的HTML页面，如果 nginx 本地缓存过期了，那么就从 nginx 到 redis 中去拉取数据，更新到 nginx 本地，如果 redis 中也没有，那么就从 nginx走 http 接口到后端的服务中拉取数据，数据生产服务中，先在本地 tomcat 里的 jvm 堆缓存（ehcache）中找，如果也被 LRU 清理掉了，那么就到MySQL去拉取数据，然后更新 tomcat 堆内存缓存 + redis 缓存，并返回数据给 nginx，nginx 缓存到本地

## 缓存数据变更走向

![](https://user-images.githubusercontent.com/19701761/98553809-f72bf480-22da-11eb-8a67-1efe11758130.png)

1. 服务有数据变更发送消息到 MQ
2. 数据异构服务监听 MQ 中的变更消息，调用服务的接口，仅仅拉取有变更的数据即可，然后将数据存储到 redis， 存储到 redis 中都是原子未加工数据
3. 数据异构服务发送消息到 MQ
4. 数据聚合服务监听到 MQ 消息，将原子数据从 redis 中取出，按照维度聚合后存储到 redis 中，包括多个维度

- 基本信息维度：基本信息、扩展属性 
- 商品介绍
- 其他信息：商品分类

## 多级缓存中各层缓存的意义

#### 一级缓存

**nginx本地缓存:**  抗的是热数据的高并发访问,这些热数据，利用 nginx 本地缓存，由于经常被访问，所以可以被锁定在 nginx 的本地缓存内，那么对这些热数据的大量访问，就直接走 nginx 就可以了，那么大量的访问，直接就可以走到 nginx 就行了，不需要走后续的各种网络开销了。

#### 二级缓存

**redis缓存:** 抗的是很高的离散访问， 缓存最大量的数据和最完整的数据； 支撑高并发的访问，QPS 最高到几十万; 可用性，非常好，提供非常稳定的服务。因为 nginx 本地内存有限，只能 cache 住部分热数据，其他相对不那么热的数据，可能流量会经常走到 redis 中;

#### 三级缓存

**jvm堆内存缓存:** 主要是抗 redis 大规模灾难的，如果 redis 出现了大规模的宕机，导致 nginx 大量流量直接涌入Tomcat服务，那么最后的 tomcat 堆内存缓存至少可以再抗一下，不至于让数据库直接裸奔。

# 环境准备

**OS:**        ubuntu server 16.04

## 配置hosts

在`/etc/hosts`添加如下几个域名和IP的映射关系:

```shell
106.13.111.01 nginx1
106.13.111.02 nginx2
106.13.111.03 nginx3
106.13.111.04 mysql.server
```

我这里是后端服务跑在了分发层的服务器上，nginx1作为分发层，nginx2和nginx3作为应用层,所以在文件同步的时候是`nginx1 —> nginx2,nginx3`

## 多Nginx同步数据

考虑到存在大量的静态HTML文件需要实时同步到应用层的Nginx服务上，所以需要使用rsync和sersync实现。参考

[参考1]: https://blog.51cto.com/net881004/2346924	"https://blog.51cto.com/net881004/2346924"
[参考2]: https://www.xiebruce.top/753.html

`rsync`是一个文件同步工具，`rsync`在同步的时候，只同步发生变化的文件或者目录,但是需要每个文件都扫描一遍才知道变化的文件，性能比较低。

`sersync`可以记录下被监听目录中发生变化的（包括增加、删除、修改）具体某一个文件或某一个目录的名字，所以sersync与rsync配合，可以减少rsync扫描文件的数量

### 配置rsync

1. 安装xinetd(nginx1和nginx2、nginx3)

   运行：`apt-get install rsync xinetd`

2. 配置rsync以xinetd方式启动(nginx1和nginx2、nginx3)

   因为ubuntu  16.04默认已安装rsync，所以只需要修改配置文件`/etc/default/rsync`的`RSYNC_ENABLE=inetd`为默认inted启动即可

3. 修改rsync启动方式的配置文件`/etc/xinetd.d/rsync`(nginx1和nginx2、nginx3)

   ```shell
   service rsync
   {
           disable         = no
           wait            = no
           socket_type     = stream
           user            = root
           server          = /usr/bin/rsync
           server_args     = --daemon
           log_on_failure += USERID
   }
   ```

   

4. 配置rsync需要同步的目录及密码文件(nginx1和nginx2、nginx3)

   - 复制配置文件:` cp /usr/share/doc/rsync/examples/rsyncd.conf /etc `

   - 编辑nginx1的`/etc/rsyncd.conf`

     ![](https://user-images.githubusercontent.com/19701761/98554055-3fe3ad80-22db-11eb-9b10-a371f59655ca.png)

   - 编辑nginx2和nginx3的`/etc/rsyncd.conf

     ![](https://user-images.githubusercontent.com/19701761/98554100-4e31c980-22db-11eb-934e-7f755f1a2cd2.png)

5. 创建rsyncd密码文件(nginx1和nginx2、nginx3)

   - nginx1服务器创建用户登录服务器端的密码文件,内容格式为 用户名：密码

     ```bash
     echo "123456" > /etc/rsyncd.password
     # 修改认证文件权限
     chmod 600 /etc/rsyncd.password
     ```

   - nginx2和nginx3服务器创建用户密码对

     ```bash
     echo "glj:123456" > /etc/rsyncd.secrets
     # 修改认证文件权限
     chmod 600 /etc/rsyncd.secrets
     ```

   **注意:** 服务器端的用户密码文件是“用户名:密码”，而客户端只需要密码，至于`.secrets`结束还是`.password`结束都无所谓，我写成`.secrets`和`.password`方便自己知道这是个什么文件

6. 重启xinetd(nginx1和nginx2、nginx3)

   运行：`/etc/init.d/xinetd restart`

   ![](https://user-images.githubusercontent.com/19701761/98566170-6b6d9480-22e9-11eb-9c45-3c1f33d55a33.png)

   查看rsync server是否启动:`netstat -ntpl|grep 873`

   ![](https://user-images.githubusercontent.com/19701761/98566219-77f1ed00-22e9-11eb-9028-231ceaec9ec1.png)

7. 测试-在nginx1机器上执行`rsync glj@nginx2::nginx_html_1`

   ![](https://user-images.githubusercontent.com/19701761/98566364-a1127d80-22e9-11eb-9b8b-f61f220fe768.png)

### 安装sersync

#### 下载安装

```bash
#安装sersync
cd ~/glj/ 
wget https://sersync.googlecode.com/files/sersync2.5.4_64bit_binary_stable_final.tar.gz
tar zxf sersync2.5.4_64bit_binary_stable_final.tar.gz
# /opt 用户级的程序目录 一般存放用户自己安装的程序
mv ~/glj/GNU-Linux-x86/ /opt/sersync
cd /opt/sersync
#配置下密码文件，因为这个密码是要访问服务器nginx2和nginx3需要的密码和上面服务器的密码必须一致
echo "123456" > /opt/sersync/user.pass
#修改权限
chmod 600 /opt/sersync/user.pass

```

#### 修改配置

修改confxml.conf运行`vi /opt/sersync/confxml.xml`

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<head version="2.5">
    <!-- hostip与port是针对插件的保留字段，对于同步功能没有任何作用，保留默认即可。  -->
    <host hostip="localhost" port="8008"></host>

    <!-- 是否开启debug模式 -->
    <debug start="false"/>

    <!-- 如果是xfs文件系统，则需要设置为true才能同步，rehat/REEL/CentOS/Fedora新版本默认都是xfs文件系统，可使用df -Th命令查看 -->
    <fileSystem xfs="false"/>

    <!-- 过滤器，设置为true则会对里面的exclude对应的正则匹配到的文件进行过滤，即不同步 -->
    <filter start="true">
        <!-- <exclude expression="(.*)\.svn"></exclude> -->
        <!-- <exclude expression="(.*)\.gz"></exclude> -->
        <!-- <exclude expression="^info/*"></exclude> -->
        <!-- <exclude expression="^static/*"></exclude> -->
        <exclude expression="^cache/*"></exclude>
    </filter>

    <!-- inotify是linux的内核功能，这里用于设置创建/删除/修改/移动文件时，是否视为文件改变(进而进行同步) -->
    <inotify>
        <!-- 删除一个文件是否视为文件改变(很明显我们要设置为true) -->
        <delete start="true"/>
        <!-- 创建一个文件夹是否视为文件改变(很明显我们要设置为true) -->
        <createFolder start="true"/>
        <!-- 创建一个文件是否触发文件改变事件(这里要设置false，因为创建一个文件除了有createFile事件还会有closeWrite事件，我们只要把closeWrite事件设置为true即可监控到创建一个文件) -->
        <createFile start="false"/>
        <!-- 创建文件或修改文件后再关闭会触发该事件，比如vim打开一个文件，修改后用(:wq)保存，则会触发该事件，当然创建新文件一样会触发 -->
        <closeWrite start="true"/>
        <!-- 从别的地方移到被监控目录是否视为文件改变，毫无疑问要设置为true -->
        <moveFrom start="true"/>
        <!-- 被监控目录中的某个文件被移动到其他地方算不算文件改变？毫无疑问要设置为true -->
        <moveTo start="true"/>
        <!-- 文件属性改变了，是否视为文件改变？这个我们可以认为文件没有改，所以设置false -->
        <attrib start="false"/>
        <!-- 文件内容被修改了是否视为文件改变？感觉文件改变肯定要设置为true，但其实不用，因为这个改变有可能是vim(:w)保存，还没有关闭文件，所以保存的时候没必要同步，而关闭的时候会触发closeWrite，所以修改的文件也是通过closeWrite来同步的 -->
        <modify start="false"/>
    </inotify>

    <!-- servsync的模块 -->
    <sersync>
        <!-- 指定要监控(即同步)的本地目录 -->
        <localpath watch="/root/glj/html01">
            <!-- ip指定同步到远程的哪个服务器，name填写远程服务器中rsync配置文件中的自定义模块名称(即中括号括起来的那个名称) -->
            <remote ip="nginx2" name="nginx_html_1"/>
        </localpath>
        <!-- rsync模块配置 -->
        <rsync>
            <!-- 公共参数，即我们手动执行rsync的时候要带的选项就填在这里，servsync会自动组装 -->
            <commonParams params="-azP"/>
            <!-- 密码文件及指定用户名(用户名就是rsync服务器端配置文件中的"auth user =" 指定的用户名) -->
            <auth start="true" users="glj" passwordfile="/opt/sersync/user.pass"/>
            <!-- 如果你rsync服务器不是默认端口873，那么就要在这里指定具体的端口，当然是默认的你也可以指定一下 -->
            <userDefinedPort start="false" port="873"/>
            <!-- rsync超时时间 -->
            <timeout start="false" time="100"/><!-- timeout=100 -->
            <!-- 是否使用ssh方式传输 -->
            <ssh start="false"/>
        </rsync>
        <!-- 对于失败的传输，会进行重新传送，再次失败就会写入rsync_fail_log，然后每隔一段时间（timeToExecute进行设置,单位sec）执行该脚本再次重新传送，然后清空该脚本。可以通过path来设置日志路径。 -->
        <failLog path="/tmp/rsync_html01_fail_log.sh" timeToExecute="60"/><!--default every 60mins execute once-->

        <!-- 定期整体同步功能，schedule表示crontab执行间隔，单位是min -->
        <crontab start="false" schedule="600"><!--600mins-->
            <!-- 同步过滤器，要开启请把start设置为true，用于 整体同步时，排除一些文件或目录，比如缓存目录可以不需要同步 -->
            <crontabfilter start="false">
                <exclude expression="*.php"></exclude>
                <exclude expression="info/*"></exclude>
            </crontabfilter>
        </crontab>
        <!-- 同步完成后，执行一个插件，name表示执行哪些插件，而这个插件必须在后边用plugin标签定义 -->
        <plugin start="false" name="command"/>
    </sersync>

    <!-- 定义一个command插件(command插件类型的一种，另外的类型有socket，refreshCDN,http(目前由于兼容性问题，http插件暂时不能用)) -->
    <plugin name="command">
        <!-- command插件其实就是“.sh”结尾的shell脚本文件，prefix和subffix用于拼成一条执行shell命令的命令 -->
        <param prefix="/bin/sh" suffix="" ignoreError="true"/>  <!--prefix /data/wwwroot/mmm.sh suffix-->
        <!-- 该脚本做操作时要过滤的文件正则 -->
        <filter start="false">
            <include expression="(.*)\.php"/>
            <include expression="(.*)\.sh"/>
        </filter>
    </plugin>

    <!-- 定义一个socket插件，注意插件定义了但没有调用的话，是不会被执行的 -->
    <plugin name="socket">
        <localpath watch="/data/wwwroot">
            <deshost ip="192.168.138.20" port="8009"/>
        </localpath>
    </plugin>

    <!-- 定义一个refreshCDN插件，主要用于同步数据到cdn -->
    <plugin name="refreshCDN">
        <localpath watch="/data0/htdocs/cms.xoyo.com/site/">
            <cdninfo domainname="ccms.chinacache.com" port="80" username="xxxx" passwd="xxxx"/>
            <sendurl base="http://pic.xoyo.com/cms"/>
            <regexurl regex="false" match="cms.xoyo.com/site([/a-zA-Z0-9]*).xoyo.com/images"/>
        </localpath>
    </plugin>
</head>

```

因为这里需要监听两个目录，所以就再建一个如confxml-1.xml 然后，localpath watch 改下，failLog path这个脚本文件也改下，每个xml文件中只保留自己的localpath watch 

```bash
cp  /opt/sersync/confxml.xml /opt/sersync/confxml-1.xml
vi /opt/sersync/confxml-1.xml
```

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<head version="2.5">
    <!-- hostip与port是针对插件的保留字段，对于同步功能没有任何作用，保留默认即可。  -->
    <host hostip="localhost" port="8008"></host>
    ......
    ......
    <!-- servsync的模块 -->
    <sersync>
        <localpath watch="/root/glj/html02">
            <remote ip="nginx3" name="nginx_html_2"/>
        </localpath>
        <!-- 对于失败的传输，会进行重新传送，再次失败就会写入rsync_fail_log，然后每隔一段时间（timeToExecute进行设置,单位sec）执行该脚本再次重新传送，然后清空该脚本。可以通过path来设置日志路径。 -->
        <failLog path="/tmp/rsync_html02_fail_log.sh" timeToExecute="60"/>
      ......
      ......
</head>
```





创建软链接，把sersync2加入到环境变量中：

```shell
ln -s /opt/sersync/sersync2 /usr/local/bin/sersync2
```

#### 启动`sersync`服务

1. 启动监听`/root/glj/html01`目录的`sersync`服务

   ```shell
   sersync2 -o /opt/sersync/confxml.xml -d
   ```

   ![](/Users/gongliangjun/%E5%9B%BE%E5%BA%8A/%E4%BA%BF%E7%BA%A7%E6%B5%81%E9%87%8F/blog/9.png)

   

2. 启动监听`/root/glj/html02`目录的`sersync`服务

   ```shell
   sersync2 -o /opt/sersync/confxml-1.xml -d
   ```

   ![](/Users/gongliangjun/%E5%9B%BE%E5%BA%8A/%E4%BA%BF%E7%BA%A7%E6%B5%81%E9%87%8F/blog/11.png)

#### 验证

- 在nginx1的`/root/glj/html01/`目录下创建文件

  ![](https://user-images.githubusercontent.com/19701761/98566456-bdaeb580-22e9-11eb-8322-c0f823919959.png)

- 删除刚刚创建的文件

  ![](https://user-images.githubusercontent.com/19701761/98566482-c3a49680-22e9-11eb-99e7-61678a57f409.png)

#### 配置sersync开机自启动

- 新建脚本文件sersync_start.sh

```she
#!/bin/bash
/opt/sersync/sersync2 -o /opt/sersync/confxml.xml -d
/opt/sersync/sersync2 -o /opt/sersync/confxml-1.xml -d
exit 0
```

- 设置权限
  `sudo chmod 755 sersync_start.sh`

- 链接到启动目录下
  sudo ln `pwd`/sersync_start.sh -s /etc/init.d/

- 添加到启动项目

  ```she
  cd /etc/init.d/
  # 99为优先级，越高越晚执行。。。
  sudo update-rc.d sersync_start.sh defaults 99
  ```

  **如果要移除开机自启，在`/etc/init.d/`下运行：** `sudo update-rc.d -f sersync_start.sh remove`

#### 监控sersync服务运行

防止sersync服务自动停止后数据不能实时同步，写一个定时任务检查sersync是否还在运行，不在运行则重新启动sersync服务

1. 新建`/opt/sersync/sersync_check.sh`(这里应该两个脚本)

   ```bash
   #!/bin/sh
   sersync="/opt/sersync/sersync2"
   confxml="/opt/sersync/confxml.xml"
   status=$(ps aux |grep 'sersync2'|grep -v 'grep'|wc -l)
   if [ $status -eq 0 ];
   then
   $sersync -d -o $confxml &
   else
   exit 0;
   fi
   ```

2. 添加脚本执行权限

   `chmod +x /opt/sersync/sersync_check.sh`

3. 设置定时任务

   ```shell
   crontab -e
   ```

   末尾添加一下内容:

   `*/5 * * * * root /opt/sersync/sersync_check.sh > /dev/null 2>&1`

   重新加载cron服务

   `/etc/init.d/cron restart`

### 注意

1. inotify队列max_queued_events最大长度，如果值太小，会出现” Event Queue Overflow “错误，导致监控文件不准确

   ```bash
   #查看inotify默认参数
   sysctl -a | grep max_queued_events
   sysctl -a | grep max_user_watches
   sysctl -a | grep max_user_instances
   #修改inotify默认参数
   sysctl -w fs.inotify.max_queued_events="99999999"
   # 要同步的文件包含多少目录，可以用：find /root/glj/html01 -type d | wc -l 统计，必须保证max_user_watches值大于统计结果（这里/root/glj/html01为同步文件目录）
   sysctl -w fs.inotify.max_user_watches="99999999"
   #每个用户创建inotify实例最大值
   sysctl -w fs.inotify.max_user_instances="65535"
   #生效
   sysctl -p
   ```

2. 最好更改最大连接数、最大文件描述符

   ```bash
   vi /etc/pam.d/login
   session required /lib64/security/pam_limits.so
   vi /etc/security/limits.conf
   *                soft    nproc          65535
   *                hard    nproc          65535
   *                soft    nofile         65535
   *                hard    nofile         65535
   # 最后重启服务器 使生效
   ```



## 分发层和应用层Nginx的lua-resty-http组件安装

```shell
# 安装 http 依赖
cd /usr/local/openresty/lualib/resty
wget https://raw.githubusercontent.com/pintsized/lua-resty-http/master/lib/resty/http_headers.lua  
wget https://raw.githubusercontent.com/pintsized/lua-resty-http/master/lib/resty/http.lua

```

## Openresty 安装

### Ubuntu安装Openresty

以Ubuntu举例,其他系统参照：http://openresty.org/cn/linux-packages.html 

在Ubuntu 系统中添加 APT 仓库，这样就可以便于未来安装或更新软件包（通过 `apt-get update` 命令）。 运行下面的命令就可以添加仓库（每个系统只需要运行一次）：

**注意：**确认是否存在`/etc/apt/sources.list.d/`这个目录，不存在先创建，不然后续操作会有问题

```shell
# 安装导入 GPG 公钥时所需的几个依赖包（整个安装过程完成后可以随时删除它们）：
sudo apt-get -y install --no-install-recommends wget gnupg ca-certificates

# 导入我们的 GPG 密钥：
wget -O - https://openresty.org/package/pubkey.gpg | sudo apt-key add -

# 添加我们官方 APT 仓库：
echo "deb http://openresty.org/package/ubuntu $(lsb_release -sc) main" \
    | sudo tee /etc/apt/sources.list.d/openresty.list
```

如果出现如下错误：

![](https://user-images.githubusercontent.com/19701761/98566592-e59e1900-22e9-11eb-81d9-f558f2d15f40.png)

需要先新建`/etc/apt/sources.list.d/`目录，运行：

```shel
sudo mkdir /etc/apt/sources.list.d
sudo chmod 755 /etc/apt/sources.list.d
```

更新 APT 索引,运行`sudo apt-get update`

安装openresty软件包,运行：`sudo apt-get -y install openresty`

如果出现以下错误:

![](https://user-images.githubusercontent.com/19701761/98566605-ecc52700-22e9-11eb-876e-7516f4436e3e.png)

需要进行如下操作解决:

```she
# 现将info文件夹更名
sudo mv /var/lib/dpkg/info /var/lib/dpkg/info.bak 
# 再新建一个新的info文件夹
sudo mkdir /var/lib/dpkg/info 
# 更新 APT 索引
sudo apt-get update
# 安装openresty软件包
sudo apt-get -y install openresty
# 
sudo mv /var/lib/dpkg/info/* /var/lib/dpkg/info.bak
# 把自己新建的info文件夹删掉
sudo rm -rf /var/lib/dpkg/info 
# 把以前的info文件夹重新改回名字
sudo mv /var/lib/dpkg/info.bak /var/lib/dpkg/info 
```

### Openresty 添加成service和开机启动

- 新建脚本文件start.sh

```she
#!/bin/bash
/usr/local/openresty/nginx/sbin/nginx -c /usr/local/openresty/nginx/conf/nginx.conf
exit 0
```

- 设置权限
  `sudo chmod 755 start.sh`

- 链接到启动目录下
  sudo ln `pwd`/start.sh -s /etc/init.d/

- 添加到启动项目

  ```she
  cd /etc/init.d/
  # 99为优先级，越高越晚执行。。。
  sudo update-rc.d start.sh defaults 99
  ```

  **如果要移除开机自启，在`/etc/init.d/`下运行：** `sudo update-rc.d -f start.sh remove`

### 集成 lua-resty-template

集成lua-resty-template的目的是当用户访问一个未静态化的页面时，不走到应用服务，直接由Nginx进行模板渲染，从而提高性能。

#### 下载lua-resty-template

```she
wget https://github.com/bungle/lua-resty-template/archive/v2.0.tar.gz
tar -xvzf v2.0.tar.gz
cp -r `pwd`/lua-resty-template-2.0/lib/resty/. /usr/local/openresty/lualib/resty
```

解压后可以看到lib/resty下面有一个template.lua和template目录，在template目录中还有两个lua文件，将这两个文件复制到`/usr/local/openresty/lualib/resty`中即可。

#### 配置模板位置

可以通过set指令定义template_location、template_root或者从root指令定义配置模板位置，在nginx.conf配置文件的server部分定义;开发模式下，可以把缓存关了。默认情况下lua_code_cache 是开启的，即缓存lua代码，即每次lua代码变更必须reload nginx才生效，如果在开发阶段可以通过lua_code_cache off;关闭缓存，这样调试时每次修改lua代码不需要reload nginx；但是正式环境一定记得开启缓存。

![](https://user-images.githubusercontent.com/19701761/98566709-0fefd680-22ea-11eb-805b-7230abf1ebd5.png)

配置完成后，将模板文件移动到`/root/glj/templates`目录下，然后重新加载Nginx的配置文件即可。

## Nginx SSI支持配置

SSI 是 Server Side Include 的首字母缩略词。包含有嵌入式服务器方包含命令的 HTML 文本。在被传送给浏览器之前，服务器会对 SHTML 文档进行完全地读取、分析以及修改;考虑到商品数量太多，如果每个静态页面都是一个完整的页面，会浪费大量磁盘空间，在生成静态文件时，也会影响效率。这里为了减小静态页面大小，我把静态页面分成了header、body、footer三个页面，然后在通过Nginx进行拼装返回完整页面给浏览器。

### 开启SSI支持配置

nginx 默认就自带了 SSI,不需要安装任何组件模块。 ssi配置可以放在http,server和location的作用域下，这里Nginx就是做定向流量转发的，所以我放到了http下了，修改nginx.conf配置文件增加以下内容：

![](https://user-images.githubusercontent.com/19701761/98566720-141bf400-22ea-11eb-9fe3-7d5172da8b93.png)

- ssi on ：开启ssi支持，默认是off
- ssi_silent_errors on ：默认值是off，开启后在处理SSI文件出错时不输出错误提示:”[an error occurred while processing the directive] ”
- 默认是ssi_types text/html，所以如果需要htm和html支持，则不需要设置这句

# 项目准备

## 静态资源

将静态资源移动到应用层的Nginx



## 分发层定向流量分发

这里的商品静态HTML不是全量同步到所有应用层的Nginx，因为rsync推送大量的HTML片段时，服务负载太高，性能较差。所以根据商品id或类别同步到某一台Nginx上，同时分发层 nginx 按照相同的逻辑路由请求到相应的Nginx上。

前台访问商品详情页的url为:`/item?id=1`,访问类别页的url为:`/category?code=A&page=1&pageSize=5`

分发层的定向流量分发脚本``如下：

```lua
-- 定义应用层Nginx ip
local host = {"106.13.xxx.xxx", "106.13.xxx.xxx"}
local uri_args = ngx.req.get_uri_args()
-- 获取到参数中的路径，比如你要访问 /item，则 method=item
local method = uri_args["method"]
local hash;
local requestBody ;
-- 访问商品详情页
if method == "item" then
  -- 获取商品id参数
	local productId = uri_args["id"]
	-- 对商品 id 取模并计算 hash 值
	hash = ngx.crc32_long(productId)
	hash = (hash % 2) + 1
  -- 拼接具体的访问地址不带 host，如：请求/item?id=1访问的静态HTML请求应该为/item_1.html
  requestBody = "/"..method.."_"..productId..".html"
-- 访问商品类别页
elseif( method == "category" )
then 
  -- 获取商品类别参数
	local code = uri_args["code"]
  -- 获取第几页
	local page = uri_args["page"]
  -- 获取页大小
	local pageSize = uri_args["pageSize"]
	-- 对商品 id 取模并计算 hash 值
  hash = ngx.crc32_long(code..page)
	hash = (hash % 2) + 1
	-- 拼接具体的访问地址不带 host，如：请求/category?code=A&page=1&pageSize=5访问的静态HTML请求应该为/list_A_1.html?page=1&pageSize=5
	requestBody = "/list_"..code.."_"..page.."?page="..page.."&pageSize="..pageSize;
else
  ngx.say("配置错误")  
end
-- 拼接 http 前缀
backend = "http://"..host[hash]
-- 获取 http 包
local http = require("resty.http")
local httpc = http.new()
-- 访问
local resp, err = httpc:request_uri(backend, {
    method = "GET",
    path = requestBody,
    keepalive=false
})

-- 如果没有响应则输出一个 err 信息
if not resp then
    ngx.say("request error :", err)
    return
end
-- 有响应测输出响应信息
ngx.say(resp.body)  
-- 关闭 http 客户端实例
httpc:close()
```









## 服务打包

这里为了方便，就直接本地打包了，真正开发时，可能需要配合Jenkins进行打包和发布。

## 启动服务

运行：` java -DDB_URL=jdbc:mysql://mysql.server:3306/product -DDB_USER_NAME=root -DDB_PWD=840416 -DNGINX_HTML_ROOT=/usr/local/openresty/nginx/html -DJFINAL_TEMPLATES_LOCATION=/root/glj/templates`

