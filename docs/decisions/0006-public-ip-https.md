# 决定 0006 · 使用可信 HTTPS 公网 IP 入口

日期：2026-10-26（北京时间）｜状态：已实机验证并启用；替代ADR0005的临时域名入口选择，其他运行时和存储决定保留。

用户要求先给CC一个现在可用的公网方式，并提供固定域名接入步骤。既有sslip.io域名失败不等于公网IP本身不可访问。固定Caddy2.11.7显式使用Let's Encrypt的`shortlived` profile申请IP证书：TLS-ALPN验证被连接重置，HTTP-01多点验证成功。公网IP证书与普通可信证书一样由客户端验证，不需要安装本地根证书或绕过警告。[Let's Encrypt说明](https://letsencrypt.org/2026/01/15/6day-and-ip-general-availability)、[Caddy配置](https://caddyserver.com/docs/caddyfile/directives/tls)。

浏览器访问IP通常不发送SNI，配置`default_sni 203.0.113.10`使服务器选择正确证书。[官方说明](https://caddyserver.com/docs/caddyfile/options#default_sni)。应用保持回环监听，Caddy代理外网；`CC_ORIGIN=https://203.0.113.10`，Secure/HttpOnly/SameSite会话及Origin保护保留。旧HTTP隧道不再是日常访问入口。

实际验证：外部TLS1.3连接、证书IP SAN、登录页/源码健康、未登录401、错Origin403、原密码登录、Secure cookie、已鉴权只读报表预览、云预算仍为6次/6451输入/325输出。本轮0模型调用。当前应用构建源为b4744a8，基础设施配置单独追踪；证据位于仓库外`evidence/public-ip-acceptance-20261026.json`及对应部署记录。

证书有效期为160小时，Caddy已设置开机启动和自动续期；不能声称未来续期已验证。保持80/443可达、证书持久目录权限和续期进程。初始证书到期为2026-11-02 03:24:57+08:00。域名必须另行配置DNS、证书、应用Origin及云平台要求；没有把IP证书套用于其他域名，也没有替用户注册免费域名。

公网可连接属于技术验证，不代表完成域名/备案手续。广州服务器后续正式接入按主管部门与云平台要求核实；IP可打开不构成免备案依据。[主管部门说明](https://jxca.miit.gov.cn/bsfw/bszn/cjwt/art/2020/art_869445de6a9f40e98732195df440f99d.html)。

未选择Quick Tunnel作为完整助手入口，因为官方列明临时隧道不支持SSE且域名随创建变化；会影响当前对话协议。[官方限制](https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/)。未迁移业务数据、引入额外代理服务或购买资源。
