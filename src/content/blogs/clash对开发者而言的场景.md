# 总结

> 我和你之间就差亿条隧道

> 💡 后文仅做技术原理分析，不会对clash做入门教程



# 前言

- 我们知道clash只要用TUN模式网卡流量，或者普通的HTTP(S)流量，主要目的在于`透明代理`

```
显式代理：本机 -> 代理服务 -> 目标服务
透明代理：本机 -- 代理服务 -- 目标服务
```

> 💡 本质区别在于代理服务对本机是否可见
>
> 🌰 clash开启TUN/系统代理（HTTP(s)）如果访问google.com命中代理规则，则会发送给代理服务，再由代理服务访问google.com。如果未命中规则则由系统直接向google.com发起



# SSH透明代理

- 对于linux服务器最常用的SSH默认都是支持做`透明代理`的，比如

```bash
# 开启SSH透明代理
ssh -D [本地端口] [用户名]@[远程主机]

# 设置环境变量，大部分软件尊重下面的代理环境变量
export https_proxy=http://127.0.0.1:{本地端口}
export http_proxy=http://127.0.0.1:{本地端口}
export all_proxy=socks5://127.0.0.1:{本地端口}

# 通过透明代理发起https，此时www.baidu.com拿到的是[远程主机]的IP
curl https://www.baidu.com
```



# clash + SSH透明代理访问公司局域网

- 正因SSH具备透明代理能力，所以在clash "全局扩展脚本"中可以直接配置成

```ts
function main(config, profileName) {
  const proxies = config["proxies"];
  proxies.unshift({
    name: "🌐 穿透内网221", 
    type: "ssh",
    // 一般是内网穿透的公网IP
    // 🔐 同时为了安全性，该内网穿透应该限制访问的IP，不应该让所有人都能碰到该端口或该服务器
    server: "x.x.x.x",
    port: 22,
    username: "xxx", // SSH 用户名
    password: "xxx" // SSH 密码
  });
  
  // 分流：当访问192.168.8.0/24网段时，直接由上面配置好的SSH透明代理访问
  config["rules"].unshift(`IP-CIDR,192.168.8.0/24,🌐 穿透内网221,no-resolve`);
  return config;
}
```

- ⚠️ 在开启`tun.auto-route`下路由表默认`route-exclude-address`会排除`192.168.0.0/16`的网段。假设需要访问公司局域网网段`192.168.8.0/24`，还需要在"全局扩展覆写配置"中调整

```yaml
tun:
  enable: true
  stack: mixed
  auto-route: true
  auto-detect-interface: true
  # ⚠️ 家里需要用的局域网网段
  route-exclude-address:
    - 192.168.1.0/24
    - 192.168.10.0/24
```

- 此时如果没问题可以看到

<img src="https://image.jybill.top/md/20251129151722063.png" alt="image-20251129151719652" style="zoom:45%;" />

- 测试：浏览器访问内网任意能够直接访问的地址，没问题就完成了 ✅

> 💡 好处在于能够保持公司网段与家庭网段一致，家里办公就像在公司一样





# 链式clash + SSH透明代理

- 🤔 很时候可能某个服务只有公司内网机器B能访问到，此时我们就需要做成代理链。简单来说就是让最后发起代理的机器由机器A来完成，之前的各种代理都是为了连接上机器A
- 🌰 本机 -> 公网内网穿透(对应公司内网机器A) -> 公司内网B -> 专属服务(公司内网C)

```ts
function main(config, profileName) {
  const proxies = config["proxies"];
  proxies.unshift({
    name: "🌐 内网代理链223", 
    type: "ssh",
    server: "192.168.8.223",
    port: 22,
    username: "xxx",
    password: "xxx",
    "dialer-proxy": "🌐 穿透内网221", // ⚠️ 设置已有的代理名作为"跳板"，也就是跳板 -> 本代理，最终由本代理发起流量
  },{
    name: "🌐 穿透内网221", 
    type: "ssh",
    server: "x.x.x.x",
    port: 22,
    username: "xxx",
    password: "xxx"
  });
  
  // 分流：当访问192.168.8.0/24网段时，现在直接由192.168.8.223发起该网段的流量
  config["rules"].unshift(`IP-CIDR,192.168.8.0/24,🌐 内网代理链223,no-resolve`);
  return config;
}
```

<img src="https://image.jybill.top/md/20251129152800345.png" alt="image-20251129152758653" style="zoom:45%;" />

> 代理路径：本机 -> 内网穿透(内网221) -> 内网代理链223 -> 192.168.8.0/24网段的流量





# 适用场景

- 居家办公想连接公司局域网
- 私有化出现了问题，通过链式clash + SSH透明代理，也能够在本机就完成私有化的访问
- macos无法下载VPN或VPN与clash冲突，此时本机连接windows（开启局域网连接clash socks代理），让widnows本机转发流量
- ...