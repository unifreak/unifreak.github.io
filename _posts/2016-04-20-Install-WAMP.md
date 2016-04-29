---
title: "手动安装 WAMP 环境"
layout: post
category: translation
tags: [wamp, tuts]
excerpt: "虽然集成环境很方便, 但是也经常遇到各种奇怪问题, 所以我最终打算自己搭建 WAMP 环境. 搜索网络在 stackoverflow 网站看到此问答, 按照其步骤安装成功. 所以将其整理翻译出来, 以备将来参考"
---
_原回答在 2014/04/30 由 `user256743` 发表于 <http://superuser.com/questions/748117/how-to-manually-install-apache-php-and-mysql-on-windows>_

#环境

我的系统是 Win7 32 位

如果你的系统是 64 的, 建议尽量下载并使用 64 位的各软件

你当然可以下载自己想要的版本的各软件, 也可以把各软件装到自己想要的目录中
但是为了避免不必要的麻烦, 建议完全跟着教程来

#参考

- http://httpd.apache.org/docs/current/platform/windows.html
- http://www.php.net/manual/en/install.windows.apache2.php

#准备

1. 下载 &nbsp;&nbsp;[Apache][apacheDown]
2. 下载 &nbsp;&nbsp;[PHP][phpDown]
3. 下载 &nbsp;&nbsp;[MySQL][mysqlDown]
4. 下载 &nbsp;&nbsp;[VS2012][vsDown][可选]

#安装

###安装 Apache

解压 Apache 到 C 盘根目录, 解压完后目录应该像这样: `C:\Apache24\bin`

打开 cmd, 运行

    cd C:\Apache24\bin
    httpd.exe

如果不报错, 则说明安装正常

如果报找不到 `MSVCR110.dll`, 则需要安装 `VS2012`

如果报无法绑定 80 端口, 检查是否有其他程序占用 80 端口, 关闭之

如果报 `Could not reliably determine the ...`:

- 打开 `C:\Apache2\conf\httpd.conf`
- 找到 `ServerName` 这一行, 替换为:

        ServerName localhost

确保防火墙没有屏蔽 Apache

打开 `http://localhost`, 如果你看到 `It Works` 字样, 说明运行成功

如果你想要开机自动启动 Apache, 运行 `httpd.exe -k install`. 然后可以在 windows 服务中控制 Apache2.4, 让其自动启动

###安装 PHP

在 C 盘根目录新建文件夹 `PHP/`, 解压 PHP  压缩包 到此文件夹中, 路径看上去是这样: `C:\PHP\ext`

在 `C:\PHP` 目录中, 重命名 `php.ini-production` 或者 `php.ini-development` 为 `php.ini`

打开 `php.ini`, 找到 `extension_dir = "ext"` 这一行并取消注释(去掉行前的 ;)

###配置 Apache 使用 PHP

打开 `C:\Apache24\conf\httpd.conf`

在所有的 `LoadModule` 那些行的下面, 添加下列内容:

    LoadModule php5_module C:/PHP/php5apache2_4.dll

    <IfModule php5_module>
        DirectoryIndex index.html index.php
        AddHandler application/x-httpd-php .php
        PHPIniDir "C:/PHP"
    </IfModule>

进入 `C:\Apache24\bin`, 运行 `httpd.exe`, 如果没有错误产生, 说明配置正常

在 `C:\Apache24\htdocs\` 下, 新建一个 `phpinfo.php` 文件, 内容如下:

    <?php phpinfo(); ?>

打开 `http://localhost/phpinfo.php`, 如果你看到类似如下输出, 说明 PHP 解析正常:

![phpinfo output](/images/posts/201604/phpinfoOutput.png)

###[可选] 启用 PHP MySql 扩展

打开 `C:\PHP\php.ini`

找到 `php_mysqli` 或 `php_pdo_mysql`, 取消注释

现在, 你变可以使用 `mysqli` 或 `PDO` 来操作 MySQL 数据库了

###安装 MySQL

双击下载的 MySQL 文件

选择 Developer default

安装时会让你配置 root 密码

安装完后, 可以右击右下角的 MySQL Notifier 图标, 禁用其开机自启动

###DONE

你现在已经配置完成整个 WAMP 环境了


[apacheDown]: http://www.apachelounge.com/download/VC11/binaries/httpd-2.4.20-win32-VC11.zip "httpd-2.4.20-win32-VC11.zip "
[phpDown]: http://windows.php.net/downloads/releases/php-5.6.20-Win32-VC11-x86.zip "php-5.6.20-Win32-VC11-x86.zip"
[mysqlDown]: https://dev.mysql.com/get/Downloads/MySQLInstaller/mysql-installer-web-community-5.6.27.0.msi "mysql-installer-web-community-5.6.27.0.msi"
[vsDown]: https://www.microsoft.com/en-us/download/details.aspx?id=30679 "vs download site"