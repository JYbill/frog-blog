---
slug: nginx-nps-https
description: 利用nginx和nps搭建内网穿透测试环境且为https
---
# 利用nginx和nps搭建内网穿透测试环境且为https

- 基本的nginx、nps这里不再说明

> 背景：公司开发云直播需要使用https协议且测试人员不方便访问，干脆用云服务器干点活，闲着也是闲着

1. 云服务器上对nginx配置ssl证书并代理nps指定的端口
2. nps指定端口并指定内网端口

![image-20220624175946494](https://image.jybill.top/md/20220624180004.png)

> nps本身很像nginx，也可以反向代理，对nps熟悉的话可以直接取消nginx这一层
