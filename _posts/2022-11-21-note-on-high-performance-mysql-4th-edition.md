---
title: "笔记 - 高性能 MySQL (第四版)"
layout: post
category: note
tags: [mysql, sql, database, perf]

excerpt: "这是我阅读 «高性能 MySQL 第四版» 时做学习笔记. 我认为这本书依然是优化 MySQL 和
运维 MySQL 极具实践性的最佳指导. 这篇笔记大部分内容都整理自此书, 主要用于自己日后参考用, 不适
合当作教程. 笔记中重点放在了查询优化的三大章节, 其它部分以后可能会更新上. 图来源于英文原版."
---

书评: <https://unifreak.github.io/book_review/high_performance_mysql_4th_edition>

# 监控

商业选项: SolarWinds.

开源选项:

* Percona 的 PMM.
* 将慢查询和 performance schema 输出到集中位置, 使用 pt-query-digest 分析

## 可用性

Threads_running 可作为关键指标, 它跟踪当前正运行的查询数量. 如果它快速增长, 说明查询不够快;
如果它超过了 cpu 核数, 可能表明服务器正处于不稳定状态. 它与 max_connections 差值, 可以说明
工作是否过载.

## 查询延迟

## 报错

* lock wait timeout: 若它增加, 可能是主节点上行级锁争用在扩大, 即事务不断重试但仍失败, 这可
  能是无法写入的前兆.
* aborted connections: 客户端与数据库实例间某个访问层出现了问题.
* Connection_errors_xxx
* 只读模式
* too many connections: 连接数超标.

## 连接数

* threads_running/threads_connected 比值低, 可能说明应用打开了很多未使用的连接

## 复制延迟

## I/O 使用率

## 自增键空间

```sql
SELECT
  t.TABLE_SCHEMA AS `schema`,
  t.TABLE_NAME AS `table`,
  t.AUTO_INCREMENT AS `auto_increment`,
  c.DATA_TYPE AS `pk_type`,
  (
    t.AUTO_INCREMENT / (
      CASE DATA_TYPE WHEN 'tinyint' THEN IF(
        COLUMN_TYPE LIKE '%unsigned', 255,
        127
      ) WHEN 'smallint' THEN IF(
        COLUMN_TYPE LIKE '%unsigned', 65535,
        32767
      ) WHEN 'mediumint' THEN IF(
        COLUMN_TYPE LIKE '%unsigned', 16777215,
        8388607
      ) WHEN 'int' THEN IF(
        COLUMN_TYPE LIKE '%unsigned', 4294967295,
        2147483647
      ) WHEN 'bigint' THEN IF(
        COLUMN_TYPE LIKE '%unsigned', 18446744073709551615,
        9223372036854775807
      ) END / 100
    )
  ) AS `max_value`
FROM
  information_schema.TABLES t
  INNER JOIN information_schema.COLUMNS c ON t.TABLE_SCHEMA = c.TABLE_SCHEMA
  AND t.TABLE_NAME = c.TABLE_NAME
WHERE
  t.AUTO_INCREMENT IS NOT NULL
  AND c.COLUMN_KEY = 'PRI'
  AND c.DATA_TYPE LIKE '%int';
```

# Performance Schema

Performance Schema (以下简写为 PS).提供了服务器内部运行的操作上的底层指标.

"程序插桩 (instrument)" 指在 mysql 代码中插入探测代码. setup_instruments 表包含了支持的
插桩列表. 所有插桩的名称由 / 分隔的部件组成, 如 `statement/sql/select`, 最左代表桩类型, 其
余则是从通用到特定的子系统.

"消费者表 (consumer)" 指是插桩发送信息的目的地, 测量结果存在 performance schema 库的多个表
中.

sys Schema 是为了方便使用 performance schema 的, 它全部基于 performance_schema 上的视
图和存储例程.

PS 将数据存在 PERFORMANCE_SCHEMA 引擎的表中, 这个引擎将数据存在内存中. 可通过启动变量来调
整使用的内存大小.

使用 PS 有如下局限性:

* 如果组件没在支持插桩, 也就没法用 PS 监控它了.
* 它只能在开启某个桩之后才开始收集数据, 不能用它查看开启之前的信息.
* 它很难释放自己已经占用了的内存.

早期版本的 PS 实现不够理想, 资源消耗过高, 一般建议关闭; 对于新版建议启用并按需动态地启用插桩和
消费者表, 它可以解决查询性能, 锁定, I/O, 错误等问题.

## 启用

将配置变量 performance_schema 设为 ON 即可启用 PS.

有三个方法启用插桩:

* 将 setup_instruments 表中相应插桩的 ENABLED 列改为 "YES".
* 调用 sys schema 中的 sys.ps_setup_enable_instrument 存储过程.
* 使用 performance-schema-instrument 启动参数.

同理, 也有三个方启用消费者表:

* setup_consumers 表
* sys.ps_setup_enable_consumer 或 sys.ps_setup_disable_consumer
* peprformance-schema-consumer 启动参数.

对于特定 "对象" (包括: EVENT, FUNCTION, PROCEDURE, ENABLE, TRIGGER) 的监控配置可通过
setup_objects 表完成;

对于*后台线程*的监控配置可通过 setup_threads 表完成; 对于*用户线程*则可通过 setup_actors
表.

## 优化 SQL

相关桩:

    Instrument class        Description
    ---------------------------------------------------------------------------
    statement/sql           SQL statements, such as SELECT or CREATE TABLE
    statement/sp            Stored procedures control
    statement/scheduler     Event scheduler
    statement/com           Commands, such as quit, KILL, DROP DATABASE, or Binlog Dump.
                            Some are not available for users and are called
                            by the mysqld process itself.
    statement/abstract      Class of four commands: clone, Query, new_packet, and relay_log

对于常规 SQL 语句, 要关注以下输出列:

    Column                      Desc
    ------------------------------------------------------------------------------------
    CREATED_TMP_DISK_TABLES     The query created this number of disk-based temporary
                                tables. You have two options to resolve this issue:
                                optimize the query or increase maximum size for in-
                                memory temporary tables.
    CREATED_TMP_TABLES          The query created this number of memory-based
                                temporary tables. Use of in-memory temporary tables is
                                not bad per se. However, if the underlying table grows,
                                they may be converted into disk-based tables. It is good
                                to be prepared for such situations in advance.
    SELECT_FULL_JOIN            The JOIN performed a full table scan because there is
                                no good index to resolve the query otherwise. You need
                                to reconsider your indexes unless the table is very
                                small.
    SELECT_FULL_RANGE_JOIN      If the JOIN used a range search of the referenced
                                table.
    SELECT_RANGE                If the JOIN used a range search to resolve rows in the
                                first table. This is usually not a big issue.
    SELECT_RANGE_CHECK          If the JOIN is without indexes, which checks for keys
                                after each row. This is a very bad symptom, and you
                                need to reconsider your table indexes if this value is
                                greater than zero.
    SELECT_SCAN                 If the JOIN did a full scan of the first table. This is an
                                issue if the table is large.
    SORT_MERGE_PASSES           The number of merge passes that the sort has to
                                perform. If the value is greater than zero and the query
                                performance is slow, you may need to increase
                                sort_buffer_size.
    SORT_RANGE                  If the sort was done using ranges.
    SORT_ROWS                   The number of sorted rows. Compare with the value of
                                the returned rows. If the number of sorted rows is
                                higher, you may need to optimize your query.
    SORT_SCAN                   If the sort was done by scanning a table. This is a very
                                bad sign unless you purposely select all rows from the
                                table without using an index.
    NO_INDEX_USED               No index was used to resolve the query.
    NO_GOOD_INDEX_USED          Index used to resolve the query is not the best. You
                                need to reconsider your indexes if this value is greater
                                than zero.

可以使用上述列与 0 比较, 筛出想要优化的语句, 如

    # 没有使用合适索引
    WHERE NO_INDEX_USED > 0 OR NO_GOOD_INDEX_USED > 0;
    # 创建了临时表
    WHERE CREATED_TMP_TABLES > 0 OR CREATED_TMP_DISK_TABLES > 0;
    # 返回了错误
    WHERE ERRORS > 0;
    # 时间超过 5s
    WHERE TIMER_WAIT > 5000000000;

sys schema 相关视图:

    statement_analysis
    statement_with_(errors_or_warnings|full_table_scans)
    statement_with_(runtimes_in_95th_percentile|sorting|temp_tables)

## 预处理语句
## 存储例程
## 语句剖析

启用 'stage/%' 模式的桩, 然后查看 events_stages_* 表, 可以用来找出 "查询执行的哪个阶段花费
了非常长时间".

注意, 只有通信服务模块支持, 引擎不支持剖析.

## 读写性能

读写比例:

```sql
SELECT EVENT_NAME, COUNT(EVENT_NAME)
FROM events_statements_history_long
GROUP BY EVENT_NAME;
```

语句延迟:

```sql
SELECT EVENT_NAME, COUNT(EVENT_NAME),
SUM(LOCK_TIME/1000000) AS latency_ms
FROM events_statements_history
GROUP BY EVENT_NAME ORDER BY latency_ms DESC;
```

## 元数据锁

启用 wait/lock/meta-data/sql/mdl 桩.

## 内存使用

memory 类的桩.

## 变量

三个相关表: global_variables, session_variables, variables_by_thread.

## 常见错误

表: events_errors_summary_global_by_error.

# OS 和硬件

最常见的瓶颈是 CPU 耗尽. I/O 饱和也会发生, 但比 CPU 耗尽少得多. 配置大内存的主要原因不是为了
在内存中保存数据, 而是为了避免磁盘 I/O.

## RAID

RAID 代替不了备份.

应明智的使用 RAID 缓存: 用于读操作通常是浪费 (因为 linux 和数据库服务器都有更大的缓存), 通常
将其用于写操作. 但除非有备用电池单元 (BBU), 否则不应启用写缓存.

## 网络配置

大多数时候, 默认值就行, 只在发生异常情况时才更改它们:

DNS 过程可能很慢, 建议启用 skip_name_resolve.

可能需要将本地端口范围以及请求队列调大:

    $ echo 1024 65535 > /proc/sys/net/ipv4/ip_local_port_range
    $ echo 4096 > /proc/sys/net/ipv4/tcp_max_sync_backlog

## 文件系统

大多数 FS 表现相近, *单纯*为性能而寻找 FS 实际是一种干扰.

最好使用日志型 FS, 如 ext4, XFS 或 ZFS, 否则系统崩溃后检查 FS 可能需要很长时间. ext4 在
特定内核版本中存在性能问题, 但它是一个可以接受的选项. 通常建议使用 XFS.

对于 ext4, 日志级别可设置为 3 (在 /etc/fstab 挂载选项中设置); 最好禁用记录访问时间:

    /dev/sda2 /usr/lib/mysql ext3 noatime,nodiratime,data=writeback 0 1

对于磁盘队列调度器, noop 和 deadline 的差别很小, 最重要的是**不要使用 CFQ**, 它会导致非常糟
的响应时间.

## 内存和交换

确保更快内存访问的最佳方法之一, 仍然是**用 tcmalloc/jemalloc 替换内置的 glibc**.

建议完全**不使用交换空间**. 并将 swappiness 设置为 0:

    $ echo 0 > /proc/sys/vm/swappiness

大多数时候都希望 vmstat 的 si,so 值为 0, 绝对不希望看到它超过 10.

强烈建议识别所有关键进程 (如 ssh, mysql), 主动调整 OOM Killer 分值, 防止它们被首先终止.

## 工具

系统自带的:

* vmstat
* iostat
* mpstat 查看 CPU 统计数据
* perf

第三方工具:

* dstat, collectl
* blktrace 检查 I/O 使用情况
* Percona 的 pt-diskstats 是 iostat 的替代品

# 服务器设置

为 mysql 创建合适的配置文件是一不迂回的过程.

建议:

* 仅专注于优化*峰值*工作负载, 在 "足够好" 的时候就停止优化.
* 仅正确的配置*基本配置* (多数情况下只有少数设置是重要的), 将更多时间放在 schema 优化, 索
  引和查询设计上.
* 应该根据**工作负载, 数据和应用需求**来配置, 并且每次更改了查询和 schema 后可能需要重新评估配置.
* 应该使用版本控制跟踪配置变更.

不建议:

* 永远不应该盲目相信网络上的所谓的最佳配置, 或使用别人的调优脚本.
* "按比率调优", 如 "InnoDB 缓冲池命中率应高于某个百分比". 这种建议通常是错误的.

## 配置文件

找到配置文件:

    $ which mysqld
    /usr/sbin/mysqld
    $ /usr/sbin/mysqld --verbose --help | grep -A 1 'Default options'
    /eetc/mysql/my.cnf ~/.my.cnf /usr/etc/my.cnff

配置文件采用 INI 格式. 配置的作用域有以下三种, 每个具体配置项可能有多种作用域:

* 服务器 (全局)
* 会话 (每连接)
* 基于每个对象的

除了配置文件, 很多变量也可以用 SET 动态更改:

    SET sort_buffer_size = <value>;
    SET GLOBAL sort_buffer_size = <value>;
    SET @@sort_buffer_size := <value>;
    SET @@session.sort_buffer_size := <value>;
    SET @@global.sort_buffer_size := <value>;

一般来说, 使用 SET 的更改重启后失效, 但 v8 引入了 "持久化系统变量" 功能, 来进行持久化:

    SET PERSIST ...

在每次更改后, 应检查 SHOW GLOBAL VARIABLES 确保其生效了.

## 最小化配置

以下是基于 v8.0 构建的:

    [mysqld]
    # GENERAL
    datadir                                         = /var/lib/mysql
    socket                                          = /var/lib/mysql/mysql.sock
    pid_file                                        = /var/lib/mysql/mysql.pid
    user                                            = mysql
    port                                            = 3306
    # INNODB
    innodb_buffer_pool_size                         = <value>
    innodb_log_file_size                            = <value>
    innodb_file_per_table                           = 1
    innodb_flush_method                             = O_DIRECT
    # LOGGING
    log_error                                       = /var/lib/mysql/mysql-error.log
    log_slow_queries                                = /var/lib/mysql/mysql-slow.log
    # OTHER
    tmp_table_size                                  = 32M
    max_heap_table_size                             = 32M
    max_connections                                 = <value>
    thread_cache_size                               = <value>
    table_open_cache                                = <value>
    # 应尽可能大: 找开文件句柄的成本很低, 否则可能看到 "too many open files" 错误.
    open_files_limit                                = 65535
    [client]
    socket                                          = /var/lib/mysql/mysql.sock
    port                                            = 3306

v8.0 引入了 innodb_dedicated_server 这个选项, 用它来让 mysql 自配置上面四个 innodb_*
变量通常是最佳方式.

## 内存

使用 innodb_dedicated_server 通常会占用 50%-75% 内存, 这样, 至少有 25% 内存可用于每个连
接的内存分配, OS 开销和其他内存设置.

### 每连接内存

了解峰值使用期间内存使用是很有用的, 但不需要假设最坏情况. 如假设配置为最多允许 100 个连接, 理
论上所有 100 个连接可能都执行大型查询, 但实际上不太可能会发生. 使用许多大型临时表或复杂存储过
程的查询最有可能占用大量内存.

### 为操作第统预留内存

判断 OS 是否有足够内存的方式就是看有没有发生交换.

### InnoDB 缓冲池

这通常是最重要的变量. 可以使用 SHOW 或 innotop 监控 innodb 缓冲池的内存使用情况.

不要过度分配, 太大缓冲池会有以下挑战:

* 更长的关闭(刷脏页). 可以通过 innodb_buffer_pool_pages_dirty 状态变量或 SHOW INNODB
  STATUS 查看脏页数量.
* 更长的预热时间. 庆幸的是, 默认情况下 innodb_buffer_pool_dump_at_shutdown 和 innodb_
  buffer_pool_load_at_startup 可以替代等待自然填充的过程.

### 线程缓存

thread_cache_size (-1) 指定了可以保存在缓存中的线程数, 通常不需更改.

要检查它是否足够大, 需查看 Threads_created 状态, 应尽量保持每秒创建的新线程数少于 10 个.
另外为了处理波动, 需查看 Threads_connected: 如果它通常在 100 到 120 之间, 可以将缓存大小设
为 20 (差值).

把它设置过小也并不会节省内存. 每个处于缓存或休眠状态的线程通常只有 256K 大.

## I/O 行为

一些选项会影响将*数据同步到磁盘*和*执行恢复*的方式, 对性能影响很大, 它们也代表了性能和数据安全
之间的权衡.

### 事务日志和日志缓冲区

"事务日志" 文件总大小由 innodb_log_file_size, innodb_log_files_in_group 控制, 这对写
入性能非常重要. 建议让 innodb_dedicated_server 自动管理.

"日志缓冲区" 不需要设置太大, 建议 innodb_log_buffer_size 的范围是 1-8MB, 除非写入很多大的
BLOB 记录. 使用 innodb_flush_log_at_trx_commit 控制它刷到磁盘上的日志文件的频率如下:

* 0: 每秒将日志缓冲区写入日志文件并刷盘, 但在事务提交时不做任何操作.
* 1: 每次事务提交时写入文件并刷盘. 这是默认(也是最安全)的设置. 除非磁盘或操作系统*假装*刷盘,
  它保证不丢失已提交的事务.
* 2: 每次事务提交时写入文件, 但不刷盘. 如果 mysql 崩溃, 不会丢失事务; 但如果服务器断电或崩溃,
  仍可能丢失事务.

在崩溃和断电时, 设置 0 和 2 通常会导致**最多 1 秒**的数据丢失, 但某些情况下, 刷新暂停时, 可能
会丢失**超过 1 秒**的事务. 有时, 硬盘控制器或 OS 通过将数据放入另一个缓存 (如硬盘自身缓存) 来
"假装" 刷盘, 这样速度更快但非常危险, 如果驱动器断电, 数据不仅可能丢失, 还可能导致**数据损坏**.

高性能事务需求的最佳配置是将它设为 1 并将日志文件放在有**备用电池的写缓存和 SSD 的 RAID 卷**
上, 这既安全又非常快. 任何需要重要工作的生产数据库都需要这种硬件.

innodb_flush_method 可以控制 innodb 与 FS 的实际交互方式, 它同时影响日志文件和数据文件.
如果我们有刚刚所述的硬件, 建议设为 O_DIRECT, 否则还是让 innodb_dedicated_server 自行设置
吧.

### 表空间

    innodb_data_home_dir = /var/lib/mysql/
    innodb_data_file_path = ibdata1:1G;ibdata2:1G;ibdata3:1G;autoextend:max:2G

上面的配置创建了一个 3GB 的表空间, 跨越了 3 个文件, 并允许空间不足时自动扩展最后一个文件. 如
果允许自动扩展, 最好用 max: 设置一个上限, 以防止它变的过大, 因为一旦增长, 就无法再收缩 (除非
你将数据导出, 关闭 mysql 并删除所有文件, 再恢复数据).

将多个文件分散到不同驱动器上**不会**有太多性能提升, 因为 innodb 还是将它们串连起来使用: 填满
一个再填下一个. 更好的方式是使用 RAID 控制器分散负载.

使用 innodb_file_per_table 可以让 innodb 为每个表使用单独文件, 在以前版本中它会导致 DROP
TABLE 变慢, 但 v8.0 中建议使用, 它提供了额外的可管理性和可视性.

如果事务长时间保持打开, innodb 将无法删除旧版本的行. 如果 undo 日志很大, 且表空间因此而增大,
可以设置 innodb_max-purge_lag 强制 mysql 放慢速度来让 innodb 的清理线程跟上. 否则 innodb
会不断写入数据直到磁盘或表空间耗尽. 这是别无选择的选择, 两害取其轻.

### 其它

sync_binlog 控制二进制日志的刷盘行为, 强烈建议设置为 1.

## 并发

对于 v5.7 如果遇到并发问题, 通常解决方案就是升级服务器.

对于新版, 大多数情况下无需限制并发性. 如果遇到并发瓶颈, 最好的选择是**数据分片**. 不可行的话才
考虑使用 innodb_thread_concurrency 限制并发性. 建义首先将其置为与可用 CPU 数相同的值, 然
后跟据需要调整. 另外两个相关配置是 innodb_thread_sleep_delay 和 innodb_concurrency_tickets.

## 安全

* max_connect_errors (100): 默认值很小, 如果你知道服务器对暴力攻击有足够的安全性, 可以将它
  设置的很大, 以避免由于连接错误而阻塞主机. 但注意, 如果启用了 skip_name_resolve 则会忽略此
  选项.
* max_connections (151): 默认值对于很多应用来说都不够. 应该额外保留一些连接以用于管理. 注意
  观察 max_used_connections 状态, 如果它到达 max_connections, 则客户至少被拒绝了一次.
* skip_name_resolve: 建议设置它以禁用身份验证时的 DNS 查找.
* sql_mode, sysdate_is_now: 这两项的设置会产生升级兼容问题.
* read_only, super_read_only: 强烈建议使用这两个配置以将副本设为只读模式 (没必要同时使用,
  因为开启 super_read_only 会隐式开启 read_only; 关闭 read_only 会隐式关闭 super_read_only).

## 高级设置

* innodb_autoinc_lock_mode: 在高并发插入时, 如何生成自增主键可能是个瓶颈. 若在 SHOW ENGINE
  STATUS 中有很多事务在等待自动增量锁, 则应该调查此设置.
* innodb_buffer_pool_instances: 将缓冲池划分为多个段. 这可能是提高多核机器上高并发负载下
  可伸缩性**最重要**的方法之一.
* innodb_io_capacity: 告知 innodb 有多少 I/O 容量可用.
* innodb_read_io_threads, innodb_write_io_threads (4): 控制有多少后台线程可用于 I/O.
  4 个一般够用了. 但若你有很多硬盘和高并发负载, 且发现线程很难跟上, 可以调大.
* innodb_strict_mode: 有时它有些悲观和过度限制. 若启用, 最好检查所有 CREATE TABLE.
* innodb_old_blocks_time: 建议设为一个较小的值如 1000 (1 秒).

# Schema 设计与管理

应根据系统将要运行的特定查询设计 schema.

## 选择数据类型

几个原则:

* 在确保没有低估的情况下, 更小的通常更好.
* 简单为好: 将日期和时间存储为内置类型而非字符串; 用**整型存 IP, 可用 INET_ATON() 和
  INET_NTOA() 转换**. 如果担心可读性, 可以使用视图.
* 避免存储 NULL. 有 NULL 的查询对 mysql 来说更难优化, NULL 使得索引, 索引统计和值比较都更
  复杂. 可为 NULL 的列会使用更多存储空间. 可用 0, 特殊值或空字符串替代. 但调优时, 没有必要先
  优化 NULL. 但是, 若需要表示 "未知值" 时, 也不要太害怕使用 NULL. mysql 会对 NULL 进行索
  引, 而 oracle 不会.

## 选择标识符

* 应该与联接表中的对应列保持一致, 类型应*完全*匹配, 包括 UNSIGNED 等属性.
* 整数通常是最佳选择.
* 若用 UUID, 应删除破折号. 但更好的是使用 UNHEX() 转为 16 字节数字, 存在 BINARY(16) 中,
  并使用 HEX() 以十六进制格式进行检索.

## 设计陷阱

* 太多的列: innodb 的行格式总是需要转换的, 转换成本取决于列数.
* 太多的联接: "实体属性值 (entity attribute value, EAV)" 模式是一种非常糟糕的设计, 它需要
  许多自连接. mysql 中每个联接限制为 **61 个表**. 即使联接数小于 61, 优化查询成本对 mysql
  也会成为问题. 经验是: 若要以高并发性快还执行查询, **联接最好少于十几个表**.
* 全能的枚举: 小心过度使用 ENUM. 另外, 当值是互斥时, 应使用 ENUM 而不是 SET.

## Schema 管理

Skeema 是一个在跨多个环境的版本控制中管理 schema 更改的开源解决方案.

在生产环境运行 schema 更改, 可以考虑:

* v8.0 引入的 INPLACE 或 INSTANT 原生 DDL 更改而不停机.
* Percona 的 pt-online-schema-change
* GitHub 的 gh-ost

# 索引

创建一个最优索引经常需要配合重写查询.

评价索引的 "三星系统":

1. 将相关记录放到*一起*.
2. 索引中的数据*顺序*和查找中的排列顺序一致.
3. 索引中的列包含查询中需要的全部列.

## 前缀索引和索引的选择性

"选择性" 指不重复的索引值 (也叫基数) 与记录总数的比值.

高选择性的索引可在查找时过滤更多的行. 既要选择足够长的前缀以保证较高的选择性, 又不能太长以节约空
间. 即前缀的基数应接近于完整列的基数. 如可以使用以下 SQL 计算不同长度前缀时的选择性:

    SELECT COUNT(DISTINCT LEFT(city, 3))/COUNT(*) AS sel3,
    COUNT(DISTINCT LEFT(city, 4))/COUNT(*) AS sel4,
    COUNT(DISTINCT LEFT(city, 5))/COUNT(*) AS sel5,
    COUNT(DISTINCT LEFT(city, 6))/COUNT(*) AS sel6,
    COUNT(DISTINCT LEFT(city, 7))/COUNT(*) AS sel7
    FROM sakila.city_demo;

前缀索引能使索引更小更快, 但:

* 无法使用前缀索引做 ORDER BY 和 GROUP BY
* 也无法使用它做覆盖扫描.

## 多列索引

在多列上独立创建多个单列索引, 在大部分情况下*不能*提高查询性能. 虽

然 mysql 引入了 "索引合并" 一定程度上能用多个单列索引定位指定行. 索引合并可应用于以下情况:

* OR 条件的联合 (union).
* AND 条件的相交 (intersection).
* 组合前两种情况的联合及相交.

但它更多是索引设计不佳的指示, 因为:

* 当优化器需要做相交时, 通常意味着需要一个包含所有相关列的多列索引.
* 当优化器需要做联合时, 通常需要在算法的缓存, 排序和合并操作上耗费大量 cpu 和内存.
* 优化器不会把这些操作计算到 "查询成本" 里, 使得查询的成本被低估, 导致该执行计划还不如直接进行
  全表扫描.

如在 EXPLAIN 中的 Extra 可以看到类似 "Using union(PRIMARY, idx_fk_film_id);", 就说明
用了索引合并, 可以:

* 检查一下查询语句和表的结构是不是最优的了, **使用 UNIOIN 改写查询** 往往是最好的办法.
* 通过参数 optimizer_switch 关闭索引合并.
* 使用 IGNORE INDEX 让优化器强制忽略掉某些索引, 避免使用有索引合并的执行计划.

为多列索引选择正确的列顺序依赖于使用该索引的查询语句 (WHERE), 同时要考虑满足排序 (ORDER BY)
和分组 (GROUP BY) 的需要.

如无需考虑排序和分组, 通常将选择性高的放在前面. 同时也要注意列中的**离群值**.

## 聚簇索引

innodb 用主键来聚集数据. 如果没有定义主键, 会选择一个唯一的非空索引代替; 如果没有这样的索引,
它会隐式定义一个主键来作为聚簇索引 -- 所有需要使用这种隐藏主键的表都依赖于一个单点的 "自增值",
这可能会导致非常高的锁竞争.

使用聚簇索引的优点是: 关联的数据存在一起, 索引和数据存在一起, 能减少 I/O; 使用覆盖索引扫描的查
询可以直接使用叶节点中的主键值.

它的缺点是:

* 它最大限度的提高了 I/O 密集型应用的性能, 但如果数据全部都放在内存中, 就没什么优势了.
* **插入速度依赖于插入顺序**. 按主键顺序插入行是将数据加载到 innodb 表中最快的方式. 如果不是这样,
  最好在加载完后使用 OPTIMIZE TABLE 重新组织一下表. 随机插入主键慢的原因在于:
  - 写入的目标页可能已经刷到磁盘并从缓存中移除, 或者还没被加载到缓存中, 在插入之前不得不先找到
    它们, 并从磁盘加载到内存中. 这将导致大量随机 I/O.
  - 因为写入是乱序的, 不得不频繁做页分裂, 页分裂导致移动大量数据, 一次插入最少需要修改三个而不
    是一个页面.
  - 由于页分裂, 页会变得稀疏并被不规则的填充, 最终数据会有碎片.
* **更新聚簇索引列的代价很高**, 因为它会强制将每个被更新的行移动到新位置.
* 表在插入行或主键被更新时, 可能产生页分裂.
* 可能导致全表扫描变慢, 尤其是当行比较稀疏, 或由于页分裂导致数据不连续时.
* 二级索引因引用主键列, 占用更多空间.
* 二级索引访问需要两次索引查找 (回表).

避免随机的 (如 UUID) 聚簇索引. 如果没有什么数据需要聚集, 可以定义一个 AUTO_INCREMENT 的
"**代理键**" 作为主键.

但按主键插入也可能有以下问题:

* 高并发的插入, 导致主键的上界成为热点, 导致间隙锁竞争.
* 另一个热点是 AUTO_INCRERMENT 锁机制. 如果遇到这个问题, 可能需要重新设计表或者应用, 或者更
  改 innodb_autoinc_lock_mode 配置.

## 覆盖索引

使用了覆盖索引时, EXPLAIN 的 Extra 列会有 "Using index" 信息.

## 使用索引扫描做排序

mysql 有两种生成有序结果的方式: 通过排序操作, 或者按索引顺序扫描. 如果 EXPLAIN 中的 type 为
"index", 则说明使用了后者.

扫描索引*本身*很快, 但如果索引不能覆盖所需的全部列, 就不得不每扫描一条索引记录就**回表**一次,
这基本上都是随机 I/O, **因此按索引顺序读取数据的速度通常要比顺序地全表扫描慢**. 设计索引应尽
可能同时满足这两个任务.

能使用索引做排序的条件是:

* 索引的顺序和 ORDER BY 子句顺序完全一致. 一种特殊情况是, 若前导列为常量, 可以不满足最左前缀.
* 且所有列的*排序方向*都一样. 如果需要按不同方向排序, 一个技巧是存储该列值的**反转串或相反数**.
* 若需联接多张表, 只有当 *ORDER BY 子句引用的字段全在第一个表*中时.

综上, 假设有如下表:

```sql
CREATE TABLE rental (
  ...PRIMARY KEY (rental_id),
  UNIQUE KEY rental_date (
    rental_date, inventory_id, customer_id
  ),
  KEY idx_fk_inventory_id (inventory_id),
  KEY idx_fk_customer_id (customer_id),
  KEY idx_fk_staff_id (staff_id),
  ...
);
```

则以下能用:

    ... WHERE rental_date = '2005-05-25' ORDER BY inventory_id, customer_id;
    ... WHERE rental_date = '2005-05-25' ORDER BY inventory_id DESC;
    ... WHERE rental_date > '2005-05-25' ORDER BY rental_date, inventory_id;

以下不能用:

    ... WHERE rental_date = '2005-05-25' ORDER BY inventory_id DESC, customer_id ASC;
    ... WHERE rental_date = '2005-05-25' ORDER BY inventory_id, staff_id;
    ... WHERE rental_date = '2005-05-25' ORDER BY customer_id;
    ... WHERE rental_date > '2005-05-25' ORDER BY inventory_id, customer_id;
    ... WHERE rental_date = '2005-05-25' AND inventory_id IN(1,2) ORDER BY customer_id

使用索引做排序的另一个最重要的场景是, 查询语句中同时有 ORDER BY 和 LIMIT 子句的情况.

## 避免冗余和重复索引和未使用的索引

mysql 允许在相同列上创建多个相同索引, 但应该避免. 可以使用 Percona 的 pt-duplicate-key-checker
来识别这类索引.

另外, 使用下面语句可以找出哪些索引从来没被使用过:

    SELECT * FROM sys.schema_unused_indexes;

## 维护索引和表

可以用 CHECK TABLE 检查表是否损坏.

可以用 REPAIR TABLE 修复表, 或一个 noop 的 ALTER 来重建表.

如果 innodb 的表发生了损坏, 一定是发生了严重错误, 需立刻调查一下原因. 通可通过设置 innodb_
force_recovery 参数进入 innodb 的强制恢复模式来修复数据.

innodb 通过抽样方式来计算统计信息, 可用 innodb_stats_sample_pages 设置样本页数量. 它也会
在以下情况触发统计信息的更新:

* 打开某些 information_schema 表时.
* SHOW TABLE STATUS 时
* SHOW INDEX 时
* 客户端开启自动补全功能时

如果表很多, 这可能导致变慢, 可以通过关闭 innodb_stats_on_metadata 参数来避免.

可以用 ANALYZE TABLE 来重新生成统计信息, 用 INFORMATIONI_SCHEMA.STATISTICS 查询这些信息.

有三种类型的 "数据碎片":

* 行碎片: 数据行被存在多个地方的多个片段中.
* 行间碎片: 逻辑上顺序的页或行在磁盘上不是顺序的.
* 剩余空间碎片: 数据页中有大量空余空间.

可以用 OPTIMIZE TABLE 或导出再导入的方式重新整理数据, 或者一个 noop 的 ALTER 来重建表.

# 查询

查询是由一系列子任务组成的, 优化查询实际上就是优化其子任务: 要么不做, 要么少做, 要么快做.

## 优化数据访问

应用层: 是否请求了不必要的数据?

* 查询了不需要的记录 → LIMIT
* 多表联接时返回全部列 → SELELCT * => SELECT T1.*
* 总是取出全部列 → 审视 SELECT *
* 重复查询相同数据 → 缓存

服务器层: 是否在扫描额外记录?

mysql 能使用以下三种方式应用 WHERE 条件, 从好到坏:

1. 在索引中使用 WHERE 条件过滤不匹配的行. 在引擎层完成.
2. 使用索引覆盖扫描 (Extra: Using index) 直接从索引中过滤不需要的记录. 这在服务器层完成, 但
   无须回表.
3. 从数据表中返回数据, 过滤不满足条件的行 (Extra:Using where). 这服务器层完成, 需回表.

如果发现查询需扫描大量数据但只返回少数行, 通常要:

* 使用索引覆盖扫描.
* 改变库表结构. 如使用单独的**汇总表**.
* 重写这个复杂查询 (下节)

## 重写查询

* 使用多个简单查询替代一个复杂查询.

  mysql 从设计上让连接和断开连接都很轻量, 在返回一个小的查询结果方面很高效.

* 切分查询.

  可以将一个大查询分而治之, 分成小查询, 每个查询只完成一小部分, 分多次完成. 如清除大量数据时,
  一次删除一万行数据一般来说是比较高效且对服务器影响较小的做法. 也可在中间都暂停一会儿, 将原本
  的一次性压力分散到一个长时间段中.

* 分解联接查询.

  即将一个联接查询分成对每个表进行一次单表查询, 然后在*应用中*进行联接. 这样做在如下情况下有优势:

  - 如果可以利用缓存重用结果时. 许多应用可以方便的缓存单列查询结果.
  - 当在多台服务器上分发数据时. 在应用层做联接, 更容易对数据库进行拆分和扩展.
  - 当能用前面得到的数据放到后面查询的 IN() 子句中, 代替联接时, 查询本身效率也可能会有提升.
  - 当一次联接查询中多次引用同一张表时, 能减少对冗余记录的访问. 在数据库进行联接, 可能需要重复
    地访问一部分数据.

## 优化器的局限性

mysql 无法像很多其它数据库那样, 利用多核来并行执行查询 -- 不要花时间去尝试.

---

mysql **不允许同时进行查询和更新**. 下面是一个符合标准的的 SQL:

```sql
UPDATE tbl AS outer_tbl
SET c = (
SELECT count(*) FROM tbl AS inner_tbl
WHERE inner_tbl.type = outer_tbl.type
);
```

但在 mysql 中会报:

    ERROR 1093 (HY000): You can't specify target table 'outer_tbl' for update in FROM clause

可以使用 "生成表" 的形式绕过这种限制:

```sql
UPDATE tbl
    INNER JOIN(
        SELECT type, count(*) AS c
        FROM tbl
        GROUP BY type
    ) AS der USING(type)
SET tbl.c = der.c;
```

## 优化特定类型查询

**以下这些技巧是版本相关的**, 对于未来 mysql 版本未必适用.

### COUNT()

COUNT() 有两种非常不同的作用:

* 统计 "有值 (value)" 的次数: 如果指定的是列名或其它表达式, 它计算总共有多少次那个列或表达式
  是不为 NULL 的 (NULL 代表 "值的缺失").
* 统计结果集的 "行数": 如果 mysql 知道括号内的表达式的值*不可能为 NULL*时, 就会直接统计行数.
  `COUNT(*)` 是 COUNT() 的一种特殊用法, mysql 不会将 * 扩展为全部列名, 而是统计行数.

若只关心行数, 应始终使用 `COUNT(*)`, 这样能更清晰的表达意图, 也能避免糟糕的性能.

使用 COUNT() 在同一个查询中统计同一列的不同值的数量, 就是在统计值, 如下面的 SQL 统计 color
分别为 blue 和 red 的数量:

```sql
SELECT
    COUNT(color = 'blue' OR NULL) AS blue,
    COUNT(color = 'red' OR NULL) AS red
FROM items;
```

通常来说, COUNT() 查询需要扫描大量行才能获得精确结果, 因此是很难优化的, 思路是:

* 如果返似值是可接受的, 就使用近似值替代.
* 去掉那些对总数影响很小, 去掉却能提升性能的约束条件. 如去掉 DISTINCT 以避免排序.
* 如果还不够, 考虑增加外部缓存系统如 redis.

"快速, 精确, 简单" 三者只能选两个.

### 联接查询

* 确保 ON 或 USING 子句中的列上有索引. 在创建索引的时候要考虑联接的顺序. 当表 A 和表 B 用列
  c 联接时, 如果优化器的联接顺序是 B, A, 那么就无需在 B 表的对应列上建索引. 一般来说, 除非有
  其它理由, 否则**只需在联接顺序中的*第二个*表的相应列上创建索引**.
* 确保任何 GROUP BY 和 ORDER BY 的表达式只涉及*一个表中的列*, 这样才可能使用索引来优化.

### 超级聚合

有时需要对返回的分组再做一次 "超级聚合". 一般使用 WITH ROLLUP 来实现, 但可能优化不够好. 优
化思路如下:

* 如果可以, 在应用中做超级聚合更好.
* 也可以在 FROM 子句中嵌套使用子查询.
* 或者通过一个临时表存放中间数据, 然后和临时表执行 UNION 来得到最终结果.

### 分页, 排名

在分页的偏移量非常大的时候, 如 LIMIT 1000,20 这样的查询, mysql 需要查询 10020 条记录然后只
返回最后 20 条, 代价非常高.

优化思路是:

* 限制可见的分页的数量.

* "**延迟连接**": 尽可能地使用索引覆盖扫描, 而非查询所有行. 然后根据需要做一次联接操作再返回所需的列.

  如下面的分页查询:

  ```sql
  SELECT film_id, description FROM sakila.film ORDER BY title LIMIT 50, 5;
  ```

  如果表非常大, 可以改成这样:

  ```sql
  SELECT film.film_id, film.description
  FROM sakila.film
  INNER JOIN (
      SELECT film_id FROM sakila.film
      ORDER BY title LIMIT 50, 5
  ) AS lim USING(film_id);
  ```

  如此, 内层的 SELECT file_id 可以仅用索引找出所需的行, 然后与整个表联接, 从行中取出
  description. 类似技术也适用于带有 LIMIT 子句的联接.

* 通过预先计算出边界值, 将 LIMIT 查询转为*已知位置*的查询, 让 mysql 通过范围扫描获得对应的结
  果. 对数据进行排名的问题也类似, 但往往还会同时和 GROUP BY 混合使用. 在这种情况下通常需要预
  先计算并存储排名信息.

  ```sql
  SELECT film_id, description FROM sakila.film
  WHERE position BETWEEN 50 AND 54 ORDER BY position;
  ```

* 使用**书签**记录上页的位置. 如假设上页中主键最大的记录是 16030:

  ```sql
  SELECT * FROM sakila.rental
  WHERE rental_id > 16030
  ORDER BY rental_id DESC LIMIT 20;
  ```

* 预先计算的汇总表.
* 联接到一个冗余表, 冗余表只包含主键列和需要做排序的数据列.

### 分页总数

分页时另一个常用技巧是在 LIMIT 语句中加上 SQL_CALC_FOUND_ROWS 提示, 这样就可以获得去掉
LIMIT 后满足条件的行数, 因此可以作为总数. 但实际上, 加上这个提示后, 会让 mysql 扫描所有满足
条件的行才能计算出, **该提示的代价可能非常高**.

更好的设计是:

* 将具体的页数换成 "下一页" 按钮. 假设每页显示 20 条, 每次查询时**多查一条 (21 条)**, 如果第
  21 条存在就显示 "下一页".
* 先获取并**缓存较多的数据**, 然后每将都分页都从缓存中取.
* 有时也可以考虑使用 EXPLAIN 结果中的 rows 值作为总数的近似值. 当需要精确结果时再单独 `COUNT(*)`.

### UNION 查询

mysql 无法将限制条件从 UNION 的外层下推到内层, 本能限制部分返回结果的条件无法应用到内层上. 如:

    (SELECT ...)
    UNION ALL
    (SELECT ...)
    LIMIT 20;

这个查询会把两张表的所有记录放在临时表中, 然后取出前 20 条. 因此很多优化策略在 UNION 查询中都
没法很好的使用, 经常需要手工地将 WHERE, LIMIT, ORDER BY 等子句 "下推" 到 UNION 的各个子句
中, 如为两个子查询分别加上 LIMIT:

    (SELECT ... LIMIT 20)
    UNION ALL
    (SELECT ... LIMIT 20)
    LIMIT 20;

除非确实需要服务器消除重复行, 否则一定要**使用 UNION ALL 而非 UNION**. 如果没有 ALL, mysql
会给临时表加上 DISTINCT, 导致对整个临时表做唯一性检查, 这样代价很高.

# 复制

复制常见用途是:

* 数据分发.
* 读流量扩展.
* 备份. 复制是一个*有助于*备份的技术, 但它不能取代备份.
* 分析与报告. 为 OLAP 使用专用副本.
* 高可用性和故障切换.
* mysql 升级测试.

建议:

* **始终使用基于行的复制**.
* **强烈建议启用 GTID 功能**.

建议的配置:

    innodb_flush_log_at_trx_commit = 1;
    # 每次事务执行时把二进制日志写入磁盘.
    sync_binlog = 1;
    # 以前, mysql 的复制依赖磁盘文件来踪踪复制位置, 这意味着复制完成事务操作后, 还需要完成同
    # 步写入磁盘操作. 如果事务提交和同步之间发生崩溃, 文件将可能包含错误的位置信息.
    # 使用下面配置, 可将位置信息存在 innodb 表中, 以原子操作完成.
    replay_log_info_repository = TABLE;
    # 让副本在检测到崩溃时丢弃所在本地中继日志, 从源获取丢失的数据. 这确保在崩溃中发生的磁盘上
    # 的损坏或不完整的中继日志是可恢复的. 配置这个参数后, 就无需再配置 sync_relay_log 了.
    replay_log_recovery = ON;

## 延迟复制

有时会故意让副本有一些复制延迟: 假设意外的删了一个表, 从备份中恢复可能需要很久, 如果使用了延迟
副本, 则可以找到 DROP TABLE 对应的 GTID, 使副本复制到表被删除的之前的时间点, 这会大大减少修
复时间.

## 多线程复制 (Multithreaded Replication)

mysql "多线程复制" 的能力可以在副本端运行多个*SQL 线程, 加快本地中继日志的应用*. 开启多线程
复制由于需要使用协调线程, 会有一定开销. 把 replica_parallel_workers 设为非 0 值即可开启,
一般是 **3-4 个之间**, 超出此范围的线程很少被用到.

它有两种模式 (由 replica_parallel_type 设置):

* DATABASE 模式. 可用多线程更新*不同的数据库*, 但不会有两个线程同时更新同一个数据库.
* LOGICAL_CLOCK 模式. 允许对同一个数据库并行更新, 只要它们都是同一个二进制日志*组提交*的一部
  分.

> "组提交" 即在 fsync() 之前等待一段时间让更多事务成批.
> 相关配置有 binlog_group_commit_sync_delay, binlog_group_commit_sync_no_delay_count.

## 半同步复制

启用 "半同步复制" 后, 源在完成每个*事务提交时*, 都需要确保事务至少被 rpl_semi_sync_source_
wait_for_replica_count 个副本所接收并将其*写入了中继日志* (不一定应用到本地数据中). 注意,
如果在一定时间内没有副本确认事务, mysql 会恢复到标准的 "异步复制" 模式, 事务并不会失败. 即
半同步复制**不是**一种防止数据丢失的方法, 只是让你拥有更具弹性的故障切换.

这会为事务增加额外延迟, 需根据情况考虑是否开启. 考虑到异步复制的回退, 一般**不会启用**它.

## 复制过滤器

可以让副本仅复制一部分数据 -- 这个功能并没有想象中那么实用, 更重要的是 `*_do_db*` 和 `*_ignore
_db` 并不像预期那样工作: 你可能认为它会根据数据库名过滤, 但它们是根据*当前的默认数据库*进行过
滤的. **不建议使用此功能**.

![](/assets/img/mysql/rep_filter.png)

## 复制切换 (故障转移)

计划内切换的一般步骤为:

1. 确定新源, 一般是包含所有数据的那个副本 (操作目标).
2. 检查延时, 确保在秒级别.
3. 通过设置 super_read_only 停止写入源.
4. 等待目标完全同步, 可通过 GTID 来确定这一点.
5. 在目标上取消 read_only.
6. 将流量切换到目标上.
7. 将所有副本 (包括刚降级的旧源) 指向新源. 若配置了 GTID 和 AUTO_POSITION=1, 这很简单.

计划外切换的一般步骤为:

1. 确定目标, 通常是有最完整数据的副本.
2. 关闭目标的 read_only.
3. 将流量切换到目标上.
4. 将所有副本 (包括恢复后的旧源) 指向新源.

还需注意, 旧源重新上线时要启用 super_read_only, 防止意外写入.

## 复制拓扑

在能满足需求前提下, 建议尽可能保持复制拓扑的简单.

### 主动/被动 (Active/Passive)

![](/assets/img/mysql/rep_active_passive.png)

* **读写**都由单个源负责.
* 尽量让源和副本有相同硬件配置, 以确保切换后支持原先的容量和吞吐量.
* 推荐至少三台服务器的 n+2 冗余, 以同时满足故障切换和备份.

这种拓扑不用担心因复制延迟导致的读延迟. 但如果达到读扩展上限, 要么需要分片, 要么需要演进到更复
杂的拓扑.

### 主动/只读 (Active/Read Pool)

![](/assets/img/mysql/rep_read_pool.png)


* 源负责写, 源和副本都可以负责读.
* 至少要有一个(最好两个)副本与源有相同配置.

应用必须对延迟读有一定的容忍度.

### 其它不建议的拓扑

双源主动-主动:

![](/assets/img/mysql/rep_dual_active.png)

双源主动-被动:

![](/assets/img/mysql/rep_dual_activepassive.png)

有副本的双源:

![](/assets/img/mysql/rep_dual_src_with_rep.png)

环形复制:

![](/assets/img/mysql/rep_ring.png)

多源复制:

![](/assets/img/mysql/rep_multisrc.png)

## 管理

复制延迟: 用 SHOW REPLICA STATUS 的 Seconds_behind_source 显示了副本的延迟, 但不总是准
确的, 最好**忽略它**并使用心跳来检测, 如 Percona 的 heartbeat 脚本.

常见问题及解决方案:

* 源端二进制日志损坏 → 只能重建副本.
* 非唯一的服务器 ID: 在源上只能看到两个副本中的一个, 在副本上有频繁的断开和重新连接错误 → 使用
  机器 IP 最后一个 octet 做为 ID.
* 未配置服务器 ID, 会在启动复制时看到 "not configured as replica" → 显式设置 server_id.
* 临时表丢失 → 使用基于行的复制.
* 复制延迟过大 → 多线程复制; 分片
* 来自源的超大数据包: 无休止的错误循环, 重试或中继日志损坏 → 匹配源和副本的 max_allowed_packet 设置.
* 磁盘空间耗尽 → 监控磁盘并设置 relay_log_space

# 备份与还原

"还原" 指从备份中获取数据并加载到 mysql. "恢复" 指当异常发生后对系统的拯救, 包括还原.

有两种主要类型的备份:

* "裸文件备份/物理备份": 指文件系统中的文件副本.
* "逻辑备份": 指重建数据所需的 SQL 语句.

建议:

* 裸文件备份是必需的: 逻辑备份太慢, 从中恢复也需很长时间. 对于小数据库, 逻辑备份可以很好的胜任.
* 保留多个备份集.
* 定期从备份中抽取数据进行恢复测试.
* ...

在线备份和离线备份
逻辑备份和裸文件备份
备分什么?
增量备份和差异备份

工具:

* MySQL Enterprise Backup
* Percona XtraBackup
* mydumper
* mysqldump

# 扩展

读池和分片.

Vitness 和 ProxySQL.
