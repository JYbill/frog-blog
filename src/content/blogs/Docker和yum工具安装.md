# 安装yum工具

1. 安装yum工具

```bash
yum install -y yum-utils \
           device-mapper-persistent-data \
           lvm2 --skip-broken
```

2. 更新镜像源

```bash
# 设置docker镜像源
yum-config-manager \
    --add-repo \
    https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
    
sed -i 's/download.docker.com/mirrors.aliyun.com\/docker-ce/g' /etc/yum.repos.d/docker-ce.repo

yum makecache fast
```







# Docker安装

1. 卸载Docker

```bash
yum remove docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-selinux \
                  docker-engine-selinux \
                  docker-engine \
                  docker-ce
```

2. 安装Docker

```bash
yum install -y docker-ce
```

> ce免费版，ee社区收费版

3. 启动Docker

```bash
# docker启动
systemctl start docker
# docker状态
systemctl status docker
# docker停止
systemctl stop docker
# docker重启
systemctl restart docker
```

4. Docker版本

```bansh
docker -v
```

5. 修改Docker的镜像源
   [详细查看腾讯云Docker镜像配置: https://cloud.tencent.com/document/product/1207/45596](https://cloud.tencent.com/document/product/1207/45596)

```bash
vim /etc/docker/daemon.json

# 粘贴内容并保存
{
    "registry-mirrors": [
     	"https://mirror.ccs.tencentyun.com"
    ]
}

# 重启docker
systemctl restart docker
```

