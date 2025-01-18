---
slug: nslookup-bad-address-problem
description: alpine dig/nslookup存在ipv4记录但ping命令报错bad address
---
# alpine dig/nslookup存在ipv4记录但ping命令报错bad address

## 错误分析

- Alpine Linux

```bash
cat /etc/issue 
Welcome to Alpine Linux 3.21
```



- nslookup

```bash
nslookup cmallapi.haday.cn
Server:         127.0.0.11
Address:        127.0.0.11#53

Non-authoritative answer:
Name:   cmallapi.haday.cn
Address: 61.142.172.204
** server can't find cmallapi.haday.cn: NXDOMAIN

# 单独查询ipv4记录
nslookup -q=A cmallapi.haday.cn
Server:         127.0.0.11
Address:        127.0.0.11#53

Non-authoritative answer:
Name:   cmallapi.haday.cn
Address: 61.142.172.204

# 单独查询ipv6记录
nslookup -q=AAAA cmallapi.haday.cn
Server:         127.0.0.11
Address:        127.0.0.11#53
# ⚠️NXDOMAIN(不存在的域名)
** server can't find cmallapi.haday.cn: NXDOMAIN
```

> ⚠️ 域名在ipv6查询下，返回的是NXDOMAIN，而不是No answer

- 比较存在ipv4无ipv6记录（有NS权威服务器）的域名

```bash
nslookup -q=A example.com
Server:         127.0.0.11
Address:        127.0.0.11#53

Non-authoritative answer:
Name:   example.com
Address: 93.184.215.14
```

```bash
nslookup -q=AAAA example.com
Server:         127.0.0.11
Address:        127.0.0.11#53

Non-authoritative answer:
Name:   example.com
Address: 2606:2800:21f:cb07:6820:80da:af6b:8b2c
```



- dig测试

```bash
# cmallapi.haday.cn
;; ANSWER SECTION:
cmallapi.haday.cn.      600     IN      A       61.142.172.204

;; AUTHORITY SECTION:
cmallapi.haday.cn.      600     IN      NS      xkmmns1.haday.cn.

;; ADDITIONAL SECTION:
xkmmns1.haday.cn.       306     IN      A       61.142.172.204
```

```bash
;; QUESTION SECTION:
;example.com.                   IN      A

;; ANSWER SECTION:
example.com.            1743    IN      A       93.184.215.14

;; AUTHORITY SECTION:
example.com.            53038   IN      NS      a.iana-servers.net.
example.com.            53038   IN      NS      b.iana-servers.net.

;; ADDITIONAL SECTION:
a.iana-servers.net.     1332    IN      A       199.43.135.53
b.iana-servers.net.     1486    IN      A       199.43.133.53
a.iana-servers.net.     171923  IN      AAAA    2001:500:8f::53
b.iana-servers.net.     1486    IN      AAAA    2001:500:8d::53
```





- 在alpine下ping（底层调用的是busybox操作系统的ping）

```bash
# 错误现象
ping cmallapi.haday.cn
ping: bad address 'cmallapi.haday.cn'
```

```bash
# 正常域名
ping example.com
PING example.com (93.184.215.14): 56 data bytes
64 bytes from 93.184.215.14: seq=0 ttl=51 time=193.177 ms
64 bytes from 93.184.215.14: seq=1 ttl=51 time=184.445 ms
```





## 原理总结

- 猜测问题

  1. cmallapi.haday.cn域名所属的NS权威机构禁用了AAAA DNS查询，这将导致NXDOMAIN问题

     ```bash
     nslookup -q=AAAA cmallapi.haday.cn
     Server:         127.0.0.11
     Address:        127.0.0.11:53
     
     ** server can't find cmallapi.haday.cn: NXDOMAIN
     ```



- 总结：

  - 在alpine linux（busybox）操作系统下，ping命令调用linux内核getaddrinfo()，发现返回的是`NXDOMAIN`会以错误形式返回，进而中断ping命令

    - 源码：[musl内核源码提交](https://git.musl-libc.org/cgit/musl/commit/?id=5cf1ac2443ad0dba263559a3fe043d929e0e5c4c)
    - issue参考：[alpine aports - issue: 自定义域名无法被解析](https://gitlab.alpinelinux.org/alpine/aports/-/issues/15762)

    > 官方认为：DNS查询ipv4与ipv6绑定的NS权威DNS服务应该一致，错误抛出更合理的（这一点不同于其他OS，一般glibc内核默认行为是回退）

  - nodejs DNS模块底层默认使用`dns.lookup`它的行为与ping命令一致，优先本地再DNS查询(使用getaddrinfo()内核方法堵塞式异步IO占用一个worker线程)，而dns.resolve*则只通过网络请求（非堵塞异步IO，不占用worker线程）

    > dns.lookup：发起异步任务 -> 内核getaddrinfo()（逻辑由linux内核getaddrinfo处理） -> 网卡
    >
    > dns.resolve*：发起异步任务 -> 网卡(逻辑由nodejs libuv层面处理)

- `综上所诉`：根本原因是alpine内核对DNS查询返回`NXDOMAIN`错误码，从而往上抛

```ts
await got("https://cmallapi.haday.cn") (业务层面代码)
got(第三方库)
dns.lookup() (node:dns)
linux::getaddrinfo(3)
```

```ts
// ❌错误类似
Uncaught Error: getaddrinfo ENOTFOUND cmallapi.haday.cn
    at GetAddrInfoReqWrap.onlookup [as oncomplete] (node:internal/dns/promises:86:17) {
  errno: -3008,
  code: 'ENOTFOUND',
  syscall: 'getaddrinfo',
  hostname: 'cmallapi.haday.cn'
}
```







## 解决方案

1. 在alpine容器内手动对`/etc/hosts`配置cmallapi.haday.cn域名的IP映射（最简单）

2. 使用alpine v3.12.x以下（不推荐）

3. 使用其他操作系统构建镜像（node:22-slim...，以debian slim为首）

4. 修复域名提供商对ipv6(AAAA)查询开放（治标治本）🔥

5. node层面解决：所有向外对请求都用dns.resolve*()代替dns.lookup()

   ```ts
   got(domain, {
     // 默认为dns.lookup()
     dnsLookup(domain, lookupOption, callback) {
       dns.resolve().then(() => {
         // result: [{address: "", family: 4|6}]
         callback(null, result);
       })
     }
   })
   ```

