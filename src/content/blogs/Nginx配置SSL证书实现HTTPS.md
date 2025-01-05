---
typora-root-url: images
---

# Nginx配置SSL证书实现HTTPS

## 前提

> 由于写好的springboot、小程序时普通http协议，所以不得不花一天搞一下Nginx + SSL证书实现HTTPS协议，从而上线自己的小程序...✨

+ 已安装好Nginx，不管是服务器还是本地机
+ 了解Nginx
+ 已购买域名、备案



## 一、获取免费SSL(腾讯云)

+ 阿里云、其他云道理一样

+ [https://console.cloud.tencent.com/ssl](https://console.cloud.tencent.com/ssl)

![](/Nginx配置SSL证书实现HTTPS1.png)

> 申请很简单，一步一步走就行了...😃

+ 一分钟内就可以领取到免费证书

![](/Nginx配置SSL证书实现HTTPS2.png)

> 下载的压缩包里面包含`tomcat`、`nginx`、`apache`...， 我们肯定只需要`nginx`的，想看更详细的操作：[https://cloud.tencent.com/document/product/400/35244](https://cloud.tencent.com/document/product/400/35244)

+ 将`Nginx`包下的两个文件：`*.crt`、`*.key`放在云服务器或者本地，随便放哪，**记住位置要用** 

## 二、配置Nginx的SSL证书并实现反向代理普通的HTTP

+ 我的证书在我的Linux服务器上

![Nginx配置SSL证书实现HTTPS3](/Nginx配置SSL证书实现HTTPS3.png)

+ config配置

```nginx
   server {
	server_name localhost; # 域名或者ip地址  
	listen 443;
	ssl on;
	#证书文件名称
        ssl_certificate /etc/nginx/1_www.jybill.top_bundle.crt; 
        #私钥文件名称
        ssl_certificate_key /etc/nginx/2_www.jybill.top.key; 
        ssl_session_timeout 5m;
        #请按照以下协议配置
        ssl_protocols TLSv1 TLSv1.1 TLSv1.2; 
        #请按照以下套件配置，配置加密套件，写法遵循 openssl 标准。
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE; 
        ssl_prefer_server_ciphers on;
    	# https://www.jybill.top/a/会代理到本地的9090端口
        location /a/ {
	    	proxy_pass http://localhost:9090/;
        }
    	# https://www.jybill.top/a/会代理到本地的8080端口
		location /b/ {
	    	proxy_pass http://localhost:8080/;
        }
   }
```

![](/Nginx配置SSL证书实现HTTPS4.png)

> `10.24` - 全年无BUG符！祝接下来的SprngClound、React、Taro学习顺畅物阻...😜