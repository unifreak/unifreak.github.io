---
star: 3
date: 2019-12-08
title: 书评 -- Nginx Cookbook
tags: [nginx]
---

(看的英文, 2019 update 版本)

看这本书之前最好先通过官网或者其他书, 了解一下更基础的 nginx 知识. 比如
- nginx 如何处理请求 (phase handler, load balancer, filter...)
- 整体架构 (master, slave, core, module...)
- 以及配置相关的概念 (context, block, variable, directives...)

这本书因为是 cookbook 形式的, 虽然在提到的时候, 会介绍一下相关概念或流程, 但是不够系统, 所以最好还是当做一本参考书, 而不是一本入门教程. 书中的代码多属于示范性的, 用户需要根据情况, 依照其介绍的工具或诀窍, 自己根据情况适配

书中的确有挺多有用的用例, 比如如何绕过 cache 以便线上调试, 如何配置进行追踪请求链路, 如何配置 CORS 等等. 但是我发现系统管理员可能更适合读这本书, Web 开发者能从中获益的并不太多, 它甚至没讲怎么配置 PHP 站点

总的来说, 新手和 Web 开发者不太适合看这本书, 适合随便翻翻, 当做参考