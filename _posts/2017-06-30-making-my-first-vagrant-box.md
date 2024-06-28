---
title: "制作自己第一个 vagrant box"
layout: post
category: [tutorial]
tags: [php, vagrant]
excerpt: "作为程序员, 基本上换一次工作, 换一个电脑就要搭建一次开发环境. 手工搭建环境并不是件容易的事儿. 虽然网上有很多教程和文档可供参考, 但是在实际操作时总是会遇到莫名其妙的坑, 一折腾就是半天. 所以自己终于下决心自己打包一个 vagrant box 了. 这篇文章就当是笔记, 为以后作参考"
---

作为程序员, 基本上每换一次电脑就要搭建一次开发环境. 手工搭建环境并不是件容易的事儿. 虽然网上有很多教程和文档可供参考, 但是在实际操作时总是会遇到莫名其妙的坑, 一折腾就是半天. 相信每个 PHP 程序员都对此深有体会

使用集成环境或 vagrant box 是另外一种选择, 但是这个选项的问题就是不够灵活: 可能版本不是你自己想要的, 又可能遇到问题的时候, 网上很难找到相关资料

我之前也试着用了几个 vagrant box, 包括 ubuntu-trusty64, [scotch box][scoth], 还有 laravel 的 [homestead][homestead]. homestead 的配置方式最为便捷, 尤其是如果你也使用 laravel 框架的话. 但是以上这些 box 都没能完全满足需求, 因为他们的 php 版本太高了, 而我所在公司还停留在 5.6

自己也折腾过手工降级 php, 但是总是还会遇到其他防不胜防的问题(比如装不上 php-ldap 扩展). 所以自己终于下决心自己打包一个 vagrant box 了. 这篇文章就当是笔记, 为以后作参考

# 准备工作

版本选择:

- centOS 5.6 64bit
- PHP 5.6
- MySQL 5.6
- redis 3.2
- nginx 1.10.2

先决条件:

- Host 机上装好 vagrant, virtualBox
- 下载好 centOS 虚拟镜像

# 安装虚拟机

具体虚拟机如何安装不具体讲了, virtualBox 安装算是比较简单的. 这是此次安装时的一些参数:

- 硬盘: 32GB
- 内存: 512MB
- 禁用 USB, 禁用音频
- 创建 vagrant 账户, 密码 vagrant. root 密码也是 vagrant

安装完虚拟机后, __最好先配置好 ssh, 然后从 Host 机 ssh 到虚拟机进行后续的步骤__. 否则直接在 vBox 的命令终端, 不能复制粘贴, 是非常蛋疼的. 我使用 NAT 端口转发实现 ssh 到虚拟机. 如下: 

1. 在 vBox 中打开该虚拟机的配置窗口, 选择 `Network->Adapter1(NAT)->Port Forwarding`
2. 添加一条端口转发规则: 
        
        |Name:ssh|Protocal:TCP|HostIP:127.0.0.1|HostPort:2222|GuestIP:127.0.0.1|GuestPort:22|

3. 保存, 然后尝试在 Host 机运行 `ssh -p 2222 vagrant@localhost`. 如果 ssh 不成功, 重启虚拟机试试
4. 不用尝试使用 `root@localhost` ssh, __centOS 默认禁用 root 远程登录的__

# 配置账号

- 配置 vagrant 账号, 使其 sudo 时无需密码:
    1. 确认已安装 sudo
    2. sudo 到 root 账号
    3. 运行 `visudo`, 会打开 `sudo` 的配置文件
    4. 在最后一行增加 `vagrant ALL=(ALL) NOPASSWD: ALL`, 保存

- 配置 vagrant 账户, 以在 Host 机直接 `vagrant ssh` 到虚拟机
    1. 复制 [这里][insecureKey] 的内容到 `~vagrant/.ssh/authorized_keys` 里
    2. 运行 `sudo chmod 0700 ~vagrant/.ssh/`
    3. 运行 `sudo chmod 0600 ~vagrant/.ssh/authorized_keys`

# 安装 virtualBox guest addition

1. 打开 vBox 窗口, 选择 `Devices->Insert Guest Additions CD Image`
2. 运行 `sudo yum groupinstall "Developer Tools"` 安装编译工具
3. 运行 `sudo mount /dev/cdrom /media/cdrom` 挂载 guest addition 光盘
4. 运行 `sudo sh /media/cdrom/VBoxLinuxAdditions.run` 安装 guest addition

以上便是 vagrant box 的标准操作流程, 可以参考[这里][convention]和[这里][basic]

接下来, 就要根据自己的需求安装特定软件以及进行相应配置了

# 安装定制软件

### Nginx

1. 运行 `sudo yum install nginx` 安装 nginx
2. 配置 `/etc/nginx/nginx.conf`, 把 `user` 配置为 `vagrant`

### PHP 相关

1. 运行以下命令, 以安装 PHP5.6 相关源:

        wget http://dl.fedoraproject.org/pub/epel/6/i386/epel-release-6-8.noarch.rpm
        wget http://rpms.famillecollet.com/enterprise/remi-release-6.rpm
        sudo rpm -Uvh remi-release-6*.rpm epel-release-6*.rpm

2. 运行 `sudo yum install php php-ldap php-redis php-pdo` 安装 PHP 以及自己需要的扩展
3. 运行 `sudo yum install php-fpm phpunit composer` 安装 PHP 相关的其他软件
4. 打开 `/etc/php-fpm.d/www.conf`, 找到 `php_flag[display_errors]` 这一行, 配置值为 `on`, 保存

相关资料看[这里][source]

### MySQL/Redis

运行 `sudo yum install mysql-server mysql redis` 安装数据库

### 开启系统自动运行服务

运行以下命令以开机启动服务:

- `sudo chkconfig nginx`
- `sudo chkconfig php-fpm`
- `sudo chkconfig mysqld`
- `sudo chkconfig redis`

### 其他

安装并配置完这些软件之后, 因为 centOS 的一些安全策略, 并不能保证能从 Host 访问到虚拟机中的网站, 因此需要额外进行些配置:

1. 运行 `sudo chmod o+x /home/vagrant` 以使 nginx 能访问 vagrant 家目录中的项目代码
2. 打开 `/etc/sysconfig/selinux`, 找到 `SELINUX` 项, 配置为 `disabled`. 保存
3. 运行 `sudo service iptables stop` 停用防火墙

相关资源可参考[这里][selinux]和[这里][iptables]

# 打包

至此, 预想中的虚拟机算是弄完了. 现在要做的就是把这个虚拟机打包成 vagrant box, 以便在任何地方重用

在 Host 机运行 `vagrant package --base <VBoxName> --output <saveFileName>` 即可将 vBox 中对应的虚拟机`<VBoxName>`打包输出为`<saveFileName>`

如果在打包过程中报 `error: cannot load such file -- vagrant-share/helper/api` 这样的错误, 尝试运行 `vagrant plugin install vagrant-share --plugin-version 1.1.8` 之后重试一遍

# 配置方式

Box 虽然弄完了, 但是使用 vagrant 另外一个很重要的方面就是 `provision` (不知道该翻译成什么好). 我之前也说过, laravel 的 homestead 的配置方法很便捷. 

所以我 fork 了一下它的代码, 根据自己需要, 加入了 "为每个站点引入 nginx include file" 的功能. 有兴趣可以[看看这里][uxinstead]



[scoth]: https://box.scotch.io/
[homestead]: https://laravel.com/docs/5.4/homestead
[convention]: https://www.vagrantup.com/docs/boxes/base.html
[basic]: https://www.vagrantup.com/docs/virtualbox/boxes.html
[insecureKey]: https://github.com/mitchellh/vagrant/blob/master/keys/vagrant.pub
[selinux]: https://www.centos.org/docs/5/html/5.2/Deployment_Guide/sec-sel-enable-disable.html
[iptables]: http://www.binarytides.com/open-http-port-iptables-centos/
[source]: https://www.mojowill.com/geek/howto-install-php-5-4-5-5-or-5-6-on-centos-6-and-centos-7/
[uxinstead]: https://github.com/UniFreak/uxinstead











