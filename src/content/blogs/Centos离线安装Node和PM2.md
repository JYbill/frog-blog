---
typora-root-url: images
---

# Centos离线安装Node和PM2

## 准备

+ `node-linux.tar.gz`下载：[https://npm.taobao.org/mirrors/node/v14.2.0/node-v14.2.0-linux-x64.tar.gz ](https://npm.taobao.org/mirrors/node/v14.2.0/node-v14.2.0-linux-x64.tar.gz)

> 想要其他版本可以自己去看，这是淘宝镜像源



## 安装Node

+ 上传到服务器并解压

```shell
tar -xvf  node-v14.2.0-linux-x64.tar.gz
```

+ 修改全局变量并重新加载

```shell
vi /etc/profile

# 修改内容
export NODE_HOME=/usr/local/node/node-v14.2.0# 这里写自己解压后的文件根目录
export PATH=$NODE_HOME/bin:$PATH

# 重新加载
source /etc/profile
```

+ 检测

```shell
npm -v
node -v
```

## 安装PM2

+ npm install

```shell
npm install pm2 -g
```

+ 检测

```shell
pm2 -v
```

