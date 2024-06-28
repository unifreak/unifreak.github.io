---
title: "SQL 基础快速参考"
layout: post
category: note
tags: [sql, database]
excerpt: " «SQL 必知必会» (英文名 Sams Teach Yourself SQL in 10 Minutes) 的笔记."
---

# 数据库基础

**模式**: 关于数据库和表的布局及特性的信息

正确的将数据分解为多个列极为重要, 这样才能利用特定的列队数据进行分类和过滤.

应该总是定义主键.

标准 SQL 有 ANSI 标准委员会管理, 称为 **ANSI SQL**. 各个实现有自己的名称, 如
**PL/SQL**, **Transact-SQL** 等.

# 使用注释

```sql
# 这是整行注释, 但很少得到支持.

/* 多行
   注释
*/

SELECT ... -- 行内注释
FROM ...
```

# 检索数据: SELECT, FROM

```sql
-- 检索单个列
SELECT prod_name FROM products;
-- 检索多个列
SELECT prod_id, prod_name, prod_price FROM products;
-- 检索所有列
SELECT * FROM products;
-- 检索不同的值: DISTINCT 作用于 **所有的列**, 不仅仅是跟在其后的那一列
SELECT DISTINCT vend_id FROM products;
```

如果愿意可以 _总是加上分号_

最好别使用 * 通配符, 会降低检索和应用程序的性能

虽然 SQL 是 **不区分大小写** 的, 但是表名, 列名和值可能有所不同 (依赖于具体的
DBMS 实现和配置)

将 SQL 语句 _分成多行_ 更容易阅读和调试

# 限制结果行数

SQL 虽然通常都有相当一致的实现, 但不能想当然的认为总是这样

- SQL Server / Access: `SELECT TOP 5 ... FROM ...`
- DB2: `SELECT ... FROM ... FETCH FIRST 5 ROWS ONLY;`
- Oracle: `SELECT .. FROM ... WHERE ROWNUM <= 5;`
- MySQL / MariaDB / PostgreSQL / SQLite: `SELECT ... FROM ... LIMIT 5 OFFSET 5;`

# 排序检索数据: ORDER BY

不应该假定检索出的数据的顺序有任何意义

在 **字典排序** 顺序中, A 被视为和 a 相同. 但许多 DBMS 允许管理员在需要时改变这
种行为

```sql
SELECT ...
FROM ...
ORDER BY            -- ORDER BY 总是 SELECT 语句中的 **最后一条子句**
    1,              -- 支持按相对位置排序. 支持混合使用列名和相对列位置
    prod_price DESC,-- 默认是升序 ASC, 指定 DESC 以降序. 只会应用到指定列
    prod_name       -- 用非检索的列排序数据是完全合法的
```

# 过滤数据 WHERE

|操作符|说明|操作符|说明|
|------|------|------|------|
|=|等于|\>|大于|
|<>|不等于|\>=|大于等于|
|!=|不等于|!>|不大于|
|<|小于|BETWEEN|两个值之间, **包括**开始值和结束值|
|<=|小于等于|IS NULL|为 NULL|
|!<|不小于|||

让客户端代码对返回数据进行循环, 提取需要的行, 通常这种做法极为不妥, 会影响应用性
能, 且不具备可伸缩性

```sql
SELECT ... FROM ...
WHERE prod_price < 10;
```

# 高级数据过滤: AND, OR, NOT, (), IN

许多 DBMS 在 OR 的第一个条件满足情况下就不再计算第二个条件了

不要过分依赖默认求值顺序, 都应该使用圆括号明确分组操作符

IN 完成了与 OR 相同的功能, 但有以下优点
- 语法更清楚直观
- 求值顺序更容易管理
- 一般比一组 OR 操作符执行更快
- 可以包含其他 SELECT 子句

NOT 一般能用 <> 代替, 但是在复杂子句中, NOT 是非常有用的

# 用通配符进行过滤: LIKE, %, _, [], ^

从技术上说, LIKE 是 **谓词** 而不是操作符

通配符 **只能用于文本字段**. 可用于搜索模式中的任意位置 (头, 尾, 中间), 并且可以
使用多个通配符
- % : 匹配给定位置的 0 个, 1 个或多个字符. 注意: 能匹配 0 个, 但匹配不了 NULL
- _ : 匹配 **单个** 字符
- []: 匹配指定 **一个位置** 是否在字符集内, 可以用 `^` 否定 (Acess 则是 `!`)

```sql
SELECT ... FROM ...
WHERE cust_contact LIKE '[^JM]%'
```


根据不同 DBMS 和配置, 搜索可以是区分大小写的

许多 DBMS 用空格填补字段内容, 所以形如 **`F%y` 不会匹配以 y 结尾但后跟空格的值
**. 可以
- 再加一个 %, 使用 `F%y%`
- 更好的办法是使用函数去掉空格

通配符搜索一般比其他搜索耗费**更长时间**, 不要过度使用通配符, 确实需要的话, 也**
尽量不要把它们用在搜索模式的开始**

# 创建计算字段

拼接字段:
- MySQL / MariaDB: `CONCAT()`
- SQLite: `||`
- Access: `+`

```sql
SELECT
    quantity * item_price -- 算术计算: +, -, *, /
    AS expanded_price     -- 使用 AS 指定别名

FROM vendors;
```

# 使用函数处理数据

SQL 函数不是可移植的. 如果决定使用函数, 应该保证做好代码注释

文本处理函数

|函数|说明|
|------|------|
|LEFT()|返回左边的字符|
|LENGTH(), DATELENGTH(), LEN()|返回长度|
|LOWER()|转换为小写|
|LTRIM()|去掉左边空格|
|RIGHT()|返回右边字符|
|RTRIM()|去掉右边空格|
|SOUNDEX()|返回 SOUNDEX 值 (Acess, PostgreSQL 不支持|
|UPPER()|转换为大写|

日期和时间处理函数: 可移植性最差

数值处理函数: 最一致统一的函数

|函数|说明|
|------|------|
|ABS()|绝对值|
|COS()|角度的余弦|
|EXP()|指数值|
|PI()|圆周率|
|SIN()|角度的正弦|
|SQRT()|平方根|
|TAN()|角度的正切|

# 汇总数据

**聚集函数**: 对某些行运行的函数, 就散并返回一个值. 得到了相当一致的支持

|函数|说明|
|------|------|
|AVG()|某列平均值|
|COUNT()|某列行数. 如果指定列名, 则忽略值为 NULL 的行. 如果是 COUNT(*), 则不忽略|
|MAX()|某列最大值|
|MIN()|某列最小值|
|SUM()|某列值和|

以上五个函数都可以指定 DISTINCT 参数, 以只包含不同的值

```sql
SELECT AVG(DISTINCT prod_price) AS avg_price
FROM products;
```

这些函数很高效, 比用客户端应用程序处理快得多

# 分组数据: GROUP BY, HAVING

使用 **分组** 可以将数据分为多个逻辑组, 对每个组进行聚集计算

GROUP BY 注意事项
- 可以包含任意数目的列, 对分组进行嵌套, 更细致的进行数据分组
- 如果嵌套了分组, 将在最后制定的分组上进行汇总
- 每一列都必须是检索列或有效的表达式 (但不能是聚集函数)
- 不允许带有长度可变的数据类型 (如文本)
- 如果分组列中具有 NULL 值的行, 则 NULL 将作为一个分组
- GROUP BY 必须出现在 WHERE 后, ORDER BY 前

WHERE 过滤行, 而 HAVING 过滤分组. WHERE 在分组前过滤, HAVING 在分组后过滤. WHERE
排除的行不包括在分组中

```sql
SELECT vend_id, COUNT(*) AS num_prods
FROM products
WHERE prod_price >= 4
GROUP BY vend_id
HAVING COUNT(*) >= 2
```


一般在使用 GROUP BY 时, 也应该给出 ORDER BY, 不要仅依赖 GROUP BY 排序数据

SELECT 子句顺序: SELECT -> FROM -> WHERE -> GROUP BY -> HAVING -> ORDER BY

# 使用子查询 (SELECT)

子查询总是 **从内向外** 处理

应该总是把子查询分解为多行并进行适当的缩进

由于性能的限制, 不要嵌套太多的子查询

作为子查询的 SELECT 语句只能查询 **单** 个列

```sql
-- 配合 IN 进行过滤
SELECT cust_name, cust_contact
FROM customers
WHERE cust_id IN (SELECT cust_id
                  FROM orders
                  WHERE order_num IN (SELECT order_num
                                      FROM orderitems
                                      WHERE prod_id = 'RGAN01'));

-- 作为计算字段
SELECT cust_name,
       cust_state,
       (SELECT COUNT(*)
        FROM orders
        -- 使用完全限定列名. 如果在 SELECT 语句中操作多个表, 就应使用完全限定列名避免歧义
        WHERE orders.cust_id = customer.cust_id) AS orders
FROM customers;
```

# 联接表: JOIN

相同的数据出现多次绝不是好事

联结几个表时, 关系是在运行中构造的. 实际要做的是将第一个表中的每一行与第二个表中
的每一行配对 (笛卡尔积). WHERE 子句作为过滤条件, 只包含那些匹配给定条件 (这里是
联结条件) 的行.

联结的表越多, 性能越差. 但许多 DBMS 处理联结远比处理子查询快得多

别名可用于列名, 计算字段以及表名. 区别是表别名不返回到客户端

```sql
-- 等值联结 / 内联结: 基于两个表之间的相等测试
-- 1: 使用 WHERE 创建
SELECT vend_name, prod_name, prod_price
FROM vendors, products
WHERE vendors.vend_id = products.vend_id
-- 2: 使用 inner JOIN 创建, ON 指定联结条件 (推荐)
SELECT vend_name, prod_name, prod_price
FROM vendors INNER JOIN products
ON vendors.vend_id = products.vend_id

-- 外连接: 包含了在相关表中没有关联行的行
-- 1. 左外联结
SELECT customers.cust_id, orders.order_num
FROM customers LEFT outer JOIN orders
ON customers.cust_id = orders.cust_id
-- 2. 右外联结: RIGHT outer join
-- 3. 全外连接: FULL OUTER join (Access, MariaDB, MySQL, SQLite 不支持)

-- 自联结: 联结两个相同的表
SELECT c1.cust_id, c1.cust_name, c1.cust_contact
FROM customers AS c1, customers AS c2
WHERE c1.cust_name = c2.cust_name
AND c2.cust_contact = 'Jim Jones';
```


# 组合查询: UNION

组合查询通常称为 **并** 或 **复合查询**. 主要两种情况使用:
- 一个查询中从不同的表返回结构相同的数据
- 对一个表执行多次查询, 按一个查询返回数据

UNION 注意事项
- 每个查询必须包含相同的列, 表达式或是聚集函数
- 列数据类型不必完全相同, 但必须是 DBMS 可以隐含转换以相互兼容的类型
- 默认重复行会被自动取消, 使用 UNION ALL 以包含重复行

```sql
SELECT cust_name, cust_contact, cust_email
FROM customers
WHERE cust_state IN ('IL', 'IN', 'MI')
UNION ALL
SELECT cust_name, cust_contact, cust_email
FROM customers
WHERE cust_name = 'Fun4All';
```


# 插入数据

```sql
-- INSERT INTO: 插入一行完整行或部分列
INSERT INTO customers(cust_id, cust_name) -- 虽然括号和其内的列名能省略, 最好不要这么做
values('`0006', 'Toy Land');

-- INSERT SELECT: 插入多行检索出的数据
INSERT INTO customers(cust_id, cust_name)
SELECT cust_id, cust_name
FROM custnew;

-- SELECT INTO: 导出数据
SELECT * INTO custcopy -- 会创建一个 custcopy 表, 把 customers 所有内容复制到新表中
FROM customers;
```

# 更新和删除数据: UPDATE, DELETE

重要原则:
- 除非确定, 否则绝对不要使用不带 WHERE 子句的 UPDATE 和 DELETE 语句
- 在 UPDATE 或 DELETE 前, 先用 SELECT 进行测试, 保证是正确的记录
- 如果支持, 应该施加约束, 防止执行不带 WHERE 子句的 UPDATE 或 delete
- 使用强制引用完整性的数据库

UPDATE 语句中可以使用子查询, 使得能用 SELECT 语句检索出的数据更新列数据

要删除某个列的值, 可设置它为 NULL (表定义允许 NULL 值的话)

```sql
UPDATE customers
SET cust_email = NULL
WHERE cust_id = '10005';
```

如果从表中删除所有行, 使用 TRUNCATE TABLE 比使用 DELETE 快

```sql
DELETE FROM customers
WHERE cust_id = '10006';
```

# 创建和操纵表

```sql
-- 1. 创建表
CREATE TABLE orderitems
(
    order_num INTEGER NOT NULL,
    order_item INTEGER NOT NULL,
    prod_id CHAR(10) NOT NULL,
    quantity INTEGER NOT NULL default 1, -- 指定默认值 (推荐)
    item_price DECIMAL(8,2) NOT NULL
)
-- 2. 更新表
-- 理想情况下, 不要在表中包含数据时对其进行更新
-- 应该在改动前做完整的备份
ALTER TABLE vendors
add vend_phone CHAR(20);

-- 3. 删除表
DROP TABLE custcopy;
```

# 视图

视图是虚拟的表, 它不包含数据, 只包含使用时 **动态** 检索数据的 **查询**. 它提供
了一种封装SELECT 语句的层次. 常用于:
- 重用 SQL 语句
- 简化复杂 SQL 操作
- 使用表的一部分而非整个表
- 保护数据. 授权用户访问表的特定部分的权限
- 可返回与底层表的表示和格式不同的数据, 更改数据格式和表示

最好创建不绑定特定数据的视图

如果你用多个联结和过滤创建了复杂的视图或者嵌套了视图, 性能可能会下降的很厉害

```sql
-- 1. 创建
CREATE VIEW productcustomers AS
SELECT cust_name, cust_contact, prod_id
FROM customers, orders, orderitems
WHERE customers.cust_id = orders.cust_id
AND orderitems.order_num = orders.order_num

-- 2. 使用
SELECT cust_name, cust_contact
FROM productcustomers
WHERE prod_id = 'RGAN01';

-- 3. 删除
DROP view productcustomers;
```

# 使用存储过程

经常会有一些复杂操作需要多条语句完成. 使用 **存储过程** 就是为以后使用而保存的一
条或多条 SQL 语句. 常用于:
- 封装复杂操作
- 保证数据一致性, 防止错误
- 简化对变动的管理. 如果表名, 列名或业务逻辑有变化, 只需修改存储过程, 使用它的人
  甚至不需要知道这些变化
- 安全性. 用它限制对基础数据的访问
- 提高性能. 存储过程通常以编译过的形式存储

缺陷:
- 不同 DBMS 存储过程语法有所不同, 可移植性差
- 比 SQL 语句复杂, 需要更高的经验

因为 DBMS 语法差别大, 这里省略示例

# 管理事务处理

**事务处理** 是一种机制, 用来管理必须成批执行的 SQL 操作, 保证数据库不包含不完整
的操作结果. 同一个事务中的一组操作, 要么完全执行, 要么完全不执行

不能用于回退 CREATE 或 DROP 操作

|-|SQL Server|MariaDB/MySQL|Oracle|
|------|------|------|------|
|开始|BEGIN TRANSACTION|START TRANSACTION|SET TRANSACTION|
|提交|COMMIT TRANSACTION|-|COMMIT|
|设置保留点|SAVE TRANSACTION|SAVEPOINT|SAVEPOINT|
|回退保留点|ROLLBACK TRANSACTION|ROLLBACK TO|ROLLBACK TO|

# 使用游标

SQL 检索操作返回一组称为 **结果集** 的行. **游标** 用于在结果集中前进或后退一行
或多行
- 使用游标前, 必须先声明 (定义) 它
- 一旦声明, 就必须打开游标以供使用
- 根据需要取出各行
- 结束游标使用时, 必须关闭游标 (如果不再次打开, 则不能使用), 可能的话, 释放游标

```sql
-- 1. 创建
-- DB2, MariaDB, MySQL, SQL Server
DECLARE custcursor CURSOR
FOR
SELECT * FROM customers;
-- Oracle, PostgreSQL
DECLARE CURSOR custcursor
IS
SELECT * FROM customers;

-- 2. 打开
OPEN CURSOR custcursor;

-- 3. 使用

-- 4. 关闭
CLOSE CUSTCURSOR
```

# 高级 SQL 特性

DBMS 通过在表上施加 **约束** 来实施引用完整性. 大多数约束是在表定义中定义的

```sql
-- 1. 在表定义中
CREATE TABLE ordersitems
(
    -- 主键约束
    id INTEGER NOT NULL PRIMARY key,
    -- 唯一约束
    hash CHAR(10) NOT NULL unique,
    -- 检查约束
    quantity INTEGER NOT NULL CHECK (quantity > 0)
    -- 外键约束
    cust_id CHAR(10) NOT NULL REFERENCES customers(cust_id)
);
-- 2. 使用 ALTER table, ADD CONSTRAINT
ALTER TABLE orderitems
add CONSTRAINT PRIMARY KEY (id),
add CONSTRAINT unique (hash),
add CONSTRAINT FOREIGN KEY (cust_id) REFERENCES customers(cust_id)
```

创建 **索引** 前, 记住
- 索引改善检索性能, 但降低了插入, 修改和删除的性能. 且可能要占用大量存储空间
- 不要在取值不多的数据上建立索引
- 如果经常以某种特定顺序排序数据, 可能适合做索引
- 最好定期检查索引效率 (使用实用程序), 并根据需要进行调整

```sql
CREATE INDEX prod_name_ind
ON products (prod_name);
```

**触发器** 是特殊的存储过程, 它在特定的数据库活动发生时自动执行. 它与**单个表**
相关联.

触发器内的代码可以访问以下数据:
- INSERT 操作中的所有新数据
- UPDATE 操作中的所有新数据和旧数据
- DELETE 操作中删除的数据

常用于:
- 保证数据一致
- 基于某个表的变动在其他表上执行活动. 如更新数据是将审计跟踪记录写入日志表
- 进行额外验证并根据需要回退数据
- 计算计算列的值或更新时间戳

约束的处理比触发器快, 如果可能, 尽量使用约束代替触发器

