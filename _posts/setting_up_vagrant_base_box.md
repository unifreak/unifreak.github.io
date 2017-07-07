# see
- https://www.vagrantup.com/docs/virtualbox/boxes.html
- https://www.vagrantup.com/docs/boxes/base.html
- https://www.mojowill.com/geek/howto-install-php-5-4-5-5-or-5-6-on-centos-6-and-centos-7/

# use
- centos 6.8
- vbox 5.1
- vagrant 1.9.4

# following convention
0. machine setup
    1. 32G
    2. 512M
    3. no USB, no Audio
    4. vagrant user

0.1 basic @see link2

1. host ssh

在 vbox 的 guest 命令行界面不能拷贝粘贴, 十分不方便
所以第一件是就是弄好在 host ssh 的功能

3. nat port forwarding

        如果使用 root 提示认证失败, 是因为默认禁用 root ssh, 使用 vagrant 账户

2. guest addition

    如果失败, 可能是因为需要运行 `yum groupinstall "Developer Tools"`

3. install php5.6:link3

    - php-ldap
    - php-redis
    - php-pdo

4. php-fpm, phpunit
    - conf: display_errors:on

5. nginx, 
    - nginx 
    - config: user: vagrant(貌似不是必须)
    - chmod o+x /home/vagrant
    - iptables: http://www.binarytides.com/open-http-port-iptables-centos/

6. mysql, mysql-server

7. redis

8. disable selinux: https://www.centos.org/docs/5/html/5.2/Deployment_Guide/sec-sel-enable-disable.html

9. chkconfig nginx|php-fpm|mysqld|redis on

8. vagrant pacakge
    
    error: cannot load such file -- vagrant-share/helper/api
    solution?: ` vagrant plugin install vagrant-share --plugin-version 1.1.8`
    @see:


9. 配置: 参考 homestead

10. after.sh

    - 创建目录: /var/www/log; /storage/log, chmod 777
    - include params