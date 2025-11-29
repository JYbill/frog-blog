# CFW's Parsers功能使用总结

## 门槛

1. 已成功安装`clash for window`
2. 具备学习强国的订阅
3. 有一定的JS基础知识

> 因为Claude2刚出，但是限制美国、英国IP，手动切换而又比较麻烦，所以这里用cfw（clash for window缩写，下文都以该词同意替换）根据拉下来的订阅内容进行后处理，将手动配置切换为自动自定义配置，这样在访问claude2时能直接以美国IP访问，无需手动切换



## 配置文件预处理实战

- cfw`配置文件预处理`官方文档：[https://docs.cfw.lbyczf.com/contents/parser.html](https://docs.cfw.lbyczf.com/contents/parser.html)
- `作用`：会将`远程的yaml文件`下载后，与`配置文件预处理逻辑`进行合并，并保存在本地的"Profile/*"文件夹下

1. 打开预处理编辑器 -> edit编辑

![image-20230714143121451](https://image.jybill.top/md/20230714143123.png)

2. 在yml文件中输入一下内容

```yaml
parsers:
		# reg正则规则：http开头的订阅内容，全部影响
    - reg: ^http
    	# console：与JS console.log一致，输出内容请看第3点
    	# ⚠️ 官方没有写明允许使用的ES版本限制，但最好维持在ES6-7之间
      code: |
        module.exports.parse = async (raw, { axios, yaml, notify, console }, { name, url, interval, selected }) => {
          const configuration = yaml.parse(raw);
          const proxyUSAList = configuration.proxies
                    .filter(item => item.name.includes("美国"))
                    .map(item => item.name);
          // console.log(proxyUSAList);
          const proxyUSAField = "和平每一天🔫";
          configuration["proxy-groups"].push({
            name: proxyUSAField,
            type: "url-test",
            proxies: proxyUSAList,
            url: "https://www.anthropic.com/index/claude-2",
            interval: 86400,
          });
          // 根据域名关键字匹配
          configuration["rules"].unshift(
            `DOMAIN-KEYWORD,anthropic,${proxyUSAField}`,
            `DOMAIN-KEYWORD,claude,${proxyUSAField}`,
          )
          return yaml.stringify(configuration);
        }
```

说说这段代码干了啥：

- 将下载的yaml字符串转JS对象
- 找到"proxies"字段中包含"美国"的所有节点，将他们组成一个"proxy-group"并插入在最后
- 该代理组使用86400ms轮询测试可用性，自动选择可用的节点（如果想手动切换可以使用"select"字段，可以参考clash官方配置文档）
- 将`claude`相关的请求指定为我们设置的代理组内的节点访问

> 💡 文档
>
> [cfw官方文档配置文件预处理参数](https://docs.cfw.lbyczf.com/contents/parser.html#%E5%8F%82%E6%95%B0%E8%AF%B4%E6%98%8E)
>
> [cfw Parsers参数说明](https://docs.cfw.lbyczf.com/contents/parser.html#%E5%8F%82%E6%95%B0%E8%AF%B4%E6%98%8E-2)
>
> [clash官方proxy-group配置](https://dreamacro.github.io/clash/configuration/outbound.html#proxy-groups)（因为cfw是基于clash的，自然配置文件一致，且cfw官方的配置文件不完整）



3. console.log的内容会输出到这里

![image-20230714144727470](https://image.jybill.top/md/20230714144730.png)

> 如果你有自定义的需求，可以配合输出内容进行调试



4. 重启cfw
5. 访问https://www.anthropic.com/index/claude-2，并查看"Connections"的节点

![image-20230714145442654](https://image.jybill.top/md/20230714145444.png)