---
title: "Mac 环境搭建 (一)"
layout: post
category: note
tags: [mac, osx, docker, php]
excerpt: "今天花了一天时间重装了一下 Mac 系统, 并且用 Docker 搭建了一下 PHP 开发环境. 这篇文章记录了这一天的折腾, 以备以后参考. 想从 Windows 转到 Mac 的程序员可以看看, 可能有一些参考意义"
---

今天花了一天时间重装了一下 Mac 系统, 并且用 Docker 搭建了一下 PHP 开发环境. 这篇文章记录了这一天的折腾, 以备以后参考. 想从 Windows 转到 Mac 的程序员可以看看, 可能有一些参考意义. 尤其是对于那些用 Windows 和 sublime text 快捷键已经用成肌肉记忆, 一切换到 Mac 就感觉水土不服的程序员, 可能帮助更大一些. 因为我特意花精力找软件去缩小了这些水土差异.

# 重装 OSX

因为这次想把能 Docker 化的服务都 Docker 化, 留一个干净的宿主环境, 感觉之前往宿主系统上装的东西没用了, 有必要清理一下, 所以我决定重装 OSX.

参考: <https://support.apple.com/kb/PH25649?locale=zh_CN&viewlocale=zh_CN>

__注意__: 上述操作会抹掉你 Mac 上的数据, 注意事先备份.

# 安装常用软件

## Google Chrome

我使用 Google Chrome 作为默认浏览器. 这也是必装的第一个应用.

介绍一下我常用的一些扩展:

- __Vimium__

    使用类似 Vim 中的快捷键导航网页, 操作标签页, 书签, 历史, 搜索等等...

    装完之后你可以刷新任意网页, 然后按 `shift` + `?` 看下它能做的事儿, 对于快捷键爱好者来说一定是必装的扩展.

    但是不知道为什么, 它的 `alt` + `p` (pin/unpin 标签页) 在 Mac 下并不好使. 有点遗憾.

    ![Vimium](/assets/img/posts/201806/vimium.jpg)

- __WEB前端助手(FeHelper)__

    这是前端妹子推荐给我的. 虽然我是个 PHP 开发, 但是这个扩展提供的一大堆功能也是我经常会用到的.

    ![feHelper](/assets/img/posts/201806/feHelper.jpg)


- __Xdebug helper__

    和 IDE 以及 PHP Xdebug 配合调试 PHP 应用用的. 如果你不是 PHP 开发就免了.

- __Markdown Reader__

    有做笔记习惯的开发肯定都知道 markdown. 我一般用 sublime text 编辑 markdown 文件, 然后使用 build 系统自动在 Chrome 中打开. 而 Markdown Reader 则为其生成 github 风格的样式和目录.

    安装之后记得在扩展管理页面允许它访问文件 url.

    ![markdownReader](/assets/img/posts/201806/markdownReader.jpg)

- __AdBlock__

    屏蔽广告. 不装这个的话, 世界会呱噪许多. 许多你熟悉的网站也可能面目全非到你不敢相信.

- __Set Character Encoding__

    新版本的 Chrome 竟然不支持手动切换网页编码了. 有时候这可能导致某些网页乱码. 而这个扩展就是把这个功能再还给你.

## Quicksilver

在 Windows 上切换应用很方便, 直接 `win` + `<num>` 就能直接切到任务栏对应位置的应用. Mac 原生并不支持这样做, 但是 Quicksilver 可以帮助我们.

安装完成之后打开主页面, 点选主菜单中的 Triggers, 然后点下面的 `+` 号, 选择 `Keyboard`, 就可以设置用哪些按键组合快速打开哪个应用了.

![quickSilver](/assets/img/posts/201806/quickSilver.jpg)

## divvy

Windows 上通过 `win` + `<方向键>` 能快速的安排各窗口位置, 左置, 右置或者最大最小化. Mac 上的话, 只能用 divvy 勉强模拟模拟了. 我的设置如下:

![divvy](/assets/img/posts/201806/divvy.jpg)

## tuxera disk manager

Mac 不支持写外置的 ntfs 格式的硬盘, 如果你经常在 Windows 和 Mac 之间倒腾文件的话, 这个软件就很有必要了. 否则是没办法用 Mac 往外置存储写数据的. 收费.

## iina

免费播放器, 支持格式丰富, 界面优雅且功能强大.

![iina](/assets/img/posts/201806/iina.jpg)

## 其他
- __cisco anyconnect__: 接入公司 vpn 用的.
- __shadow socks__: 接个人 vpn 用的.
- __迅雷__: 老实说我很反感迅雷, 但是也是在找不到像样且免费的下载客户端. 暂且用着吧.
- __qq__, __微信__: 这个不用说了.
- __xchat__: irc 聊天用. 见 <http://unifreak.github.io/tutorial/IRC-quick-start>

# 安装开发软件

## Homebrew

所谓 Mac 上缺失的包管理工具. 类似 `apt-get` 或 `yum`.

## sublime text 3

我用 sublime text 3 敲代码. 关于为什么用 sublime text 而不用其他编辑器或 IDE 其实没什么好说的. 跟浏览器一样, 大多数原因只是因为个人偏好.

装完 sublime text 3, 第一件事就是装扩展. 而装扩展的第一件事, 就是装 packageControl:

- __PackageControl__
    1. 按 `ctrl` + `~`, 打开控制台
    2. 输入下面内容, 并回车

        ```python
        import urllib.request,os,hashlib; h = '6f4c264a24d933ce70df5dedcf1dcaee' + 'ebe013ee18cced0ef93d5f746d80ef60'; pf = 'Package Control.sublime-package'; ipp = sublime.installed_packages_path(); urllib.request.install_opener( urllib.request.build_opener( urllib.request.ProxyHandler()) ); by = urllib.request.urlopen( 'http://packagecontrol.io/' + pf.replace(' ', '%20')).read(); dh = hashlib.sha256(by).hexdigest(); print('Error validating download (got %s instead of %s), please try manual install' % (dh, h)) if dh != h else open(os.path.join( ipp, pf), 'wb' ).write(by)
        ```

- __DirectOpen__

    自己写的插件, 用于快速打开常用但难找的的文件. 比如隐藏很深的 `host` 文件, `php.ini` 配置文件等

- __CTags__

    sublime text 3 已经内置了代码定义跳转的功能, 而且也挺好用. 但是唯一的缺憾就是不能跳过去再跳回来. 所以我得找扩展. 支持的扩展主要就是 SublimeCodeIntel 和 CTags 了. 试过 SublimeCodeIntel, 发现很多次都跳错地方, 所以还是选了 CTags.

    安装:

    1. 在终端运行 `brew install ctags` 安装 ctags 包
    2. 运行 `ctags --version` 确保正确安装了 ctags
    3. 运行 `which ctags`, 拷贝 ctags 执行文件的路径
    4. 在 sublime text 3 中使用 packageControl 搜索并安装 CTags 扩展

    配置:

    1. 通过菜单 `Sublime Text` > `Preference` > `Pacakges Settings` > `CTags` > `Setting - User` 打开配置文件
    2. 找到 `command:` 配置项, 配置为刚拷贝的路径

    使用:

    1. 使用 `ctrl` + `t` + `r` 生成 ctags 索引
    2. 使用 `ctrl` + `t` + `t` 跳转到定义
    3. 使用 `ctrl` + `t` + `b` 跳转回去

- __SublimeLinter__

    用于检查代码是否有错误, 是否符合规范等. 安装完 SublimeLinter 后, 还需要根据需要安装对应的 linter 扩展, 比如 SublimeLinter-php, SublimeLinter-phpmd 等. 而且也得安装对应的工具, 比如如果要用 SublimeLinter-phpmd 的话, 就得安装 phpmd 包. 由于 SublimeLinter 支持各种各样的语言和 lint 工具, 所以还是参考其文档去配置吧

- __MarkdownEditing__ & __Markdown Extend__

    MarkdownEditing 为你在编辑 markdown 文件时提供一些方便的补全功能. Markdown Extend 则为 markdown 文件提供额外的格式功能, 如代码块高亮.

- __Ayu__, __Boxy__, __Materialize__ 主题和 __Colorsublime__

    Sublime Text 3 吸引我的一大原因即是其漂亮的界面, 主题和灵活的可定制性. 我选定了 Ayu, Boxy, Materialize 这三个主题, Colorsublime 可以让你实时预览并安装可用的代码高亮主题.

    我最终应用了 Boxy 这个主题, 并做了一些配置. 整个配置文件如下:

    ```json
    {
        "always_show_minimap_viewport": true,
        "auto_find_in_selection": true,
        "bold_folder_labels": true,
        "caret_extra_width": 5,
        "caret_style": "solid",
        "color_scheme": "Packages/Boxy Theme/schemes/Boxy Nova.tmTheme",
        "default_line_ending": "unix",
        "drag_text": false,
        "font_size": 16,
        "ignored_packages":
        [
            "Markdown",
            "Vintage"
        ],
        "indent_guide_options":
        [
            "draw_active"
        ],
        "line_padding_bottom": 8,
        "line_padding_top": 8,
        "overlay_scroll_bars": "enabled",
        "remember_full_screen": true,
        "rulers":
        [
            80,
            100
        ],
        "scroll_speed": 0.1,
        "show_definitions": false,
        "show_encoding": true,
        "show_line_endings": true,
        // Boxy 主题配置
        "theme": "Boxy Nova.sublime-theme",
        "theme_button_rounded": true,
        "theme_dropdown_materialized": true,
        "theme_find_panel_close_hidden": true,
        "theme_find_panel_materialized": true,
        "theme_icon_button_highlighted": true,
        "theme_panel_switcher_atomized": true,
        "theme_scrollbar_rounded": true,
        "theme_tab_arrows_hidden": true,
        "theme_tab_rounded": true,
        "theme_tab_separator": true,
        "translate_tabs_to_spaces": true
    }
    ```

    最后看起来如下:

    ![sublimeText](/assets/img/posts/201806/sublimeText.jpg)

- __其他__

    + __AdvancedNewFile__: 这个扩展可以让我们快速的创建, 删除, 移动, 重命名文件.
    + __easyMotion__: 通过快捷键定位目标位置并移动光标到该位置
    + __MoveTab__: 通过快捷键移动当前 tab
    + __Origami__: 通过快捷键创建或删除拆分视图, 并移动或复制文件到指定视图
    + __PlainNotes__: 小巧的 todo list
    + __SyncedSideBar__: 实时在侧栏的目录中定位当前打开的文件

## dash

离线文档浏览器. 包含各种主流语言, 框架, 工具的文档和参考

![dash](/assets/img/posts/201806/dash.jpg)

## Docker

这次装系统的原因就是为了 Docker 化开发环境, 所以这本来应是重头戏来着. 但是感觉已经写不少了, 不如放到单独一篇中专门讲 Docker 了.

## 其他
- __sequal pro__: mysql 客户端
- __postman__: api 开发必备
