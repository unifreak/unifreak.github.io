---
title: "在 Jekyll 主题中支持 LaTeX 数学符号渲染"
layout: post
category: note
tags: [jekyll, tuts]
usemath: [latex, ascii]
---

Jekyll 可以通过 MathJax 插件支持对数学符号的渲染. 这篇文章记录如何配置 jekyll 和使用数学符号.

# 配置 jekyll

首先, 需要在 `_config.yml` 中进行配置, 在 kramdown 配置项中, 添加一条配置 `math_engine: MathJax`.
如下:

```yaml
kramdown:
  math_engine: MathJax
```


然后, 在 `_include/head.html` 中, 引入相关的 js 文件.

- 如果你打算使用 LaTeX 形式的数学标记, 引入

```html
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
```

- 如果你打算使用 asciimath 形式的数学标记, 引入

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.4/latest.js?config=AM_CHTML"></script>
```

很简单. 这样就配置完成了.

为了更加灵活, 你可以根据每篇文章中 front matter 中的变量, 条件引入相应的 js 文件. 在我的 jekyll 主题 [Textalic](https://github.com/UniFreak/jekyll-theme-textalic "Textalic") 中, 我就是这么做的. 每篇文章可以通过 `usemath: latex` 来启用 LaTeX 数学符号, 通过 `usemath: ascii`
启用 asciimath 数学符号, 也可以通过 `usemath: [latex, ascii]` 同时启用两者. 感兴趣的可以看下这个主题.

# 使用 LaTeX 数学符号

在文章中, 通过把数学公式包在 `$$` 中, 就可以渲染 LaTeX 语法的数学标记了.

比如公式 `$$x = {-b \pm \sqrt{b^2-4ac} \over 2a}.$$`, 渲染效果如下:

$$x = {-b \pm \sqrt{b^2-4ac} \over 2a}.$$

参见 mathjax 文档 <http://docs.mathjax.org/en/latest/index.html>

# 使用 asciimath 数学符号

通过把数学公式包在 <code>\`...\`</code> 中, 就可以渲染 asciimath 语法的数学标记了.

> mathjax 默认把 \`...\` 中的内容当做 asciimath 数学公式渲染, 我们必须转义每个反引号, 以避免 markdown 引擎把它们视作代码片段. 你也可以查阅 mathjax 文档自己配置界定符

比如公式: <code>\`sum_(i=1)^n i^3=((n(n+1))/2)^2\`</code>, 渲染效果如下: \`sum_(i=1)^n i^3=((n(n+1))/2)^2\`

参见 asciimath 文档 <http://asciimath.org/>
