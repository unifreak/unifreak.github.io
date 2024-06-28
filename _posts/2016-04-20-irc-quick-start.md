---
title: "IRC 急速入门"
layout: post
category: tutorial
tags: [irc, tuts]
excerpt: "该教程只是为了让你在几分钟内就连上 IRC 网络并开始聊天. IRC 功能强大,
如果要深入了解, http://www.irchelp.org 是个不错的资源"
---

# 名词

**IRC**
: 一种网络聊天协议.

**IRC 网络**
: 依据 IRC 协议组成的聊天网络,比较知名的有 freenode (现已被 Libra.Chat 取代),
  EFnet, DALnet 等.

**IRC 服务器**
: 每个 IRC 网络由多个 IRC 服务器互相连接形成.

  假设 freenode 由 A,B,C 三台服务器互联而成,那么你随意连接到其中一台便意味着你连
  接上了 freenode 网络, 便可进入其中的聊天室聊天.

**IRC 聊天室 (channel)**
: 当你连接到 IRC 网络后 (比如 freenode), 便可以进入网络上的聊天室进行聊天.

  聊天室多以主题为名, 如 #javascript, #php, #unixporn, #hacker 等

  并不是所有的聊天都可以任意进入,有些聊天室只能被邀请进入, 有些聊天室只允许已经
  注册昵称的用户进入, 等等.

**昵称 (nickname)**
: 在聊天室, 昵称即你的显示名字, 比如我在 freenode 的注册昵称就是 unifreak.

**IRC 客户端**
: 连接到 IRC 网络需要对应的客户端(就好比浏览网页需要网页客户端, 即浏览器一样).

  知名的 GUI 客户端有 mIRC, xChat, HexChat 等. 在命令行上用的最多的是 irssi. 本
  文中我以 HexChat 为例, 其它都大同小异.

**IRC 命令**
: 使用 IRC 必须掌握几个必须的命令 (尤其是如果你用 irssi 的话, 只能用命令来进行各
  种操作). 命令以 / 开头.
  
常用命令:

|/server irc.freenode.net|连接到 freenode 网络|
|/nick myName|更换昵称为 myName|
|/msg nickserv register password me@163.com|注册昵称, 密码为 password, 邮箱为 me@163.com|
|/join #java|进入 #java 聊天室|
|/msg alis list \*linux\*|列出 linux 相关聊天室|

...等等

# 示例

1. 下载并安装 HexChat: https://hexchat.github.io/downloads.html.

    > HexChat 在 2024 年发布了最后一个版本, 已经不再更新, 但不影响使用. 如果你也
    > 是喜欢简单够用就行的工具的话, 我推荐试一下 Irssi 这个命令行客户端.

2. 配置网络

    首次打开 hexChat 会自动弹出网络配置窗口. 也可以使用菜单 HexChat → Network
    Lists 打开该窗口.

    ![配置窗口](/assets/img/posts/201604/hexChatServerlist.png)

    填写自己想要的昵称: 在 Networks 的列表中点选 freenode, 然后点击 Connect 连接
    到 freenode.

3. 连接成功后会弹出此窗口

    ![连接成功](/assets/img/posts/201604/hexChatConnSuccess.png)

    取消选中 "always show this ...", 点击 OK.

4. 现在来到主界面

    ![主界面](/assets/img/posts/201604/hexChatUI.png)

    输入 `/msg NickServ register <password> <email>` 以注册当前昵称.

    **注意**: 把 `<password>` 换成你自己的密码, 把 `<email>` 换成你自己的邮箱地址

5. 进入邮箱, 收取邮件. 把邮件中给你的命令粘贴到消息输入框, 回车, 以完成验证.

6. 现在输入命令 `/join #irchelp` 以加入 #irchelp 聊天室, 在这里你可以问任何有关
   irc 的问题. 当然你也可以使用 /msg alis 命令搜索并加入其它感兴趣的聊天室.

现在你已经注册了昵称, 最好再打开网络列表面板, 配置一下自动登陆. 否则每次连到网络
后, 都需要使用`/msg NickServ identify <nick> <password>` 重新认证.

# 我常逛的 Channels

- archlinux
- linux
- go-nuts
- php
- programming
