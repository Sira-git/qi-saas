import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

const INDUSTRY_SOURCE_HOSTS = new Set([
  'www.ndrc.gov.cn',
  'www.echinagov.com',
  'www.miit.gov.cn',
  'cj.sina.cn',
  'm.sohu.com',
  'www.samr.gov.cn',
  'm.chinairn.com',
  'guancha.gmw.cn',
  'www.iim.net.cn',
  'caifuhao.eastmoney.com',
  'm.moji.com',
  'www.ce.cn',
  'it.caigou2003.com',
  'blog.csdn.net',
  'www.bokee.net',
  'www.docin.com',
  'wap.seccw.com',
  'k.sina.com.cn',
  'www.caict.ac.cn',
  'www.idc.com',
  'finance.sina.com.cn',
  'www.inspur.com',
  'www.sohu.com',
  'blog.51cto.com',
  'app.myzaker.com',
  'baike.baidu.com',
  'cn.geceo.com',
  'csdnnews.blog.csdn.net',
  'data.eastmoney.com',
  'ex.chinadaily.com.cn',
  'jjckb.xinhuanet.com',
  'm.10jqka.com.cn',
  'm.cniteyes.com',
  'm.toutiao.com',
  'mnews.tianyancha.com',
  'money.finance.sina.com.cn',
  'mtz.china.com',
  'news.pedaily.cn',
  'news.sina.cn',
  'paper.cnstock.com',
  'q.stock.sohu.com',
  'site.gdupt.edu.cn',
  'static.weeklyonstock.com',
  'std.samr.gov.cn',
  'stock.10jqka.com.cn',
  'stockmc.xueqiu.com',
  'tech.caijing.com.cn',
  'view.inews.qq.com',
  'work.weixin.qq.com',
  'www.163.com',
  'www.ccwork.com.cn',
  'www.eeo.com.cn',
  'www.epoint.com.cn',
  'www.ggzyzx.jl.gov.cn',
  'www.iesdouyin.com',
  'www.ithome.com',
  'www.iyiou.com',
  'www.kaipuyun.com',
  'www.lonsun.cn',
  'www.seeyon.com',
  'www.softxiaoer.com',
  'www.trs.com.cn',
  'www.weaver.com.cn',
  'xueqiu.com',
  'yiqiying.net',
  'zhuanlan.zhihu.com'
])

const escapeAttribute = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')

const createSourceFallbackHtml = ({ title, summary, source, date, sourceUrl, reason = '' }) => {
  const safeTitle = escapeAttribute(title || '友商动态原文')
  const safeSummary = escapeAttribute(summary || '该来源暂未返回可嵌入的正文内容。')
  const safeSource = escapeAttribute(source || '来源网站')
  const safeDate = escapeAttribute(date || '')
  const safeSourceUrl = escapeAttribute(sourceUrl || '#')
  const safeReason = escapeAttribute(reason)

  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}body{margin:0;background:#fff;color:#273142;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif}.article{max-width:920px;margin:0 auto;padding:54px 58px 80px}.source{margin-bottom:18px;color:#1677ff;font-size:14px;font-weight:600}.title{margin:0;color:#172033;font-size:30px;line-height:1.45;font-weight:700}.meta{display:flex;gap:18px;margin:18px 0 34px;padding-bottom:22px;color:#8a94a6;font-size:13px;border-bottom:1px solid #edf0f4}.content{color:#344054;font-size:17px;line-height:2;text-align:justify;white-space:pre-wrap}.notice{margin-top:38px;padding:14px 16px;color:#768397;font-size:13px;line-height:1.7;background:#f7f9fc;border-radius:8px}.original{display:inline-flex;align-items:center;margin-top:18px;color:#1677ff;text-decoration:none;font-size:14px}.original:hover{text-decoration:underline}@media(max-width:720px){.article{padding:32px 24px 56px}.title{font-size:24px}.content{font-size:16px}}</style></head><body><article class="article"><div class="source">${safeSource}</div><h1 class="title">${safeTitle}</h1><div class="meta"><span>${safeDate}</span><span>原文内容预览</span></div><div class="content">${safeSummary}</div><div class="notice">当前来源网站限制了站内嵌入，页面已展示附件中的原文摘要${safeReason ? `（${safeReason}）` : ''}。可通过下方链接查看来源网站完整内容。</div><a class="original" href="${safeSourceUrl}" target="_blank" rel="noopener noreferrer">在来源网站查看完整原文 →</a></article></body></html>`
}

const createToutiaoArticleHtml = ({ title, content, source, date, sourceUrl }) => {
  const safeTitle = escapeAttribute(title || '友商动态原文')
  const safeSource = escapeAttribute(source || '今日头条')
  const safeDate = escapeAttribute(date || '')
  const safeSourceUrl = escapeAttribute(sourceUrl || '#')
  const safeContent = String(content || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/\son\w+\s*=\s*(["']).*?\1/gi, '')
    .replace(/javascript:/gi, '')

  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}body{margin:0;background:#fff;color:#273142;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif}.article{max-width:920px;margin:0 auto;padding:46px 54px 80px}.source{margin-bottom:15px;color:#1677ff;font-size:14px;font-weight:600}.title{margin:0;color:#172033;font-size:30px;line-height:1.45;font-weight:700}.meta{display:flex;gap:18px;margin:16px 0 30px;padding-bottom:20px;color:#8a94a6;font-size:13px;border-bottom:1px solid #edf0f4}.content{color:#344054;font-size:16px;line-height:2;text-align:justify}.content p{margin:0 0 20px}.content strong{color:#202938;font-weight:600}.content img{display:block;max-width:100%;height:auto;margin:22px auto;border-radius:4px}.content .pgc-img-caption{text-align:center;color:#98a2b3;font-size:12px}.original{display:inline-flex;align-items:center;margin-top:20px;color:#1677ff;text-decoration:none;font-size:14px}.original:hover{text-decoration:underline}@media(max-width:720px){.article{padding:32px 24px 56px}.title{font-size:24px}.content{font-size:15px}}</style></head><body><article class="article"><div class="source">${safeSource}</div><h1 class="title">${safeTitle}</h1><div class="meta"><span>${safeDate}</span><span>原文</span></div><div class="content">${safeContent}</div><a class="original" href="${safeSourceUrl}" target="_blank" rel="noopener noreferrer">在来源网站查看原文 →</a></article></body></html>`
}

const createIndustrySourceProxy = () => {
  const handleRequest = async (req, res, next) => {
    const requestUrl = new URL(req.url || '/', 'http://localhost')
    if (requestUrl.pathname !== '/industry-source') {
      next()
      return
    }

    const fallbackData = {
      title: requestUrl.searchParams.get('title') || '',
      summary: requestUrl.searchParams.get('summary') || '',
      source: requestUrl.searchParams.get('source') || '',
      date: requestUrl.searchParams.get('date') || '',
      sourceUrl: requestUrl.searchParams.get('url') || ''
    }

    try {
      const sourceUrl = new URL(requestUrl.searchParams.get('url') || '')
      if (!['http:', 'https:'].includes(sourceUrl.protocol) || !INDUSTRY_SOURCE_HOSTS.has(sourceUrl.hostname)) {
        throw new Error('该原文地址不在允许嵌入的站点范围内')
      }

      if (['m.toutiao.com', 'www.toutiao.com'].includes(sourceUrl.hostname)) {
        const articleId = sourceUrl.pathname.match(/(?:group|article|i)\/?(\d{15,})/)?.[1]
          || sourceUrl.pathname.match(/(\d{15,})/)?.[1]
        if (articleId) {
          const articleResponse = await fetch(`https://m.toutiao.com/i${articleId}/info/?i=${articleId}`, {
            headers: {
              accept: 'application/json,text/plain,*/*',
              'accept-language': 'zh-CN,zh;q=0.9',
              'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148'
            }
          })
          const articleData = articleResponse.ok ? await articleResponse.json() : null
          if (articleData?.data?.content) {
            res.statusCode = 200
            res.setHeader('Cache-Control', 'private, max-age=300')
            res.setHeader('Content-Type', 'text/html; charset=utf-8')
            res.end(createToutiaoArticleHtml({
              title: articleData.data.title || fallbackData.title,
              content: articleData.data.content,
              source: articleData.data.source || fallbackData.source,
              date: fallbackData.date,
              sourceUrl: sourceUrl.href
            }))
            return
          }
        }
      }

      const response = await fetch(sourceUrl, {
        redirect: 'follow',
        headers: {
          accept: 'text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.8',
          'accept-language': 'zh-CN,zh;q=0.9',
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/138 Safari/537.36'
        }
      })

      if (!response.ok) throw new Error(`原文站点返回 ${response.status}`)

      const contentType = response.headers.get('content-type') || 'text/html; charset=utf-8'
      res.statusCode = response.status
      res.setHeader('Cache-Control', 'private, max-age=300')

      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
        res.setHeader('Content-Type', contentType)
        res.end(Buffer.from(await response.arrayBuffer()))
        return
      }

      const charset = contentType.match(/charset\s*=\s*([^;]+)/i)?.[1]?.trim().toLowerCase()
      const encoding = ['gbk', 'gb2312', 'gb18030'].includes(charset) ? 'gb18030' : 'utf-8'
      const html = new TextDecoder(encoding).decode(await response.arrayBuffer())
      const safeSourceUrl = escapeAttribute(response.url || sourceUrl.href)
      const baseTag = `<base href="${safeSourceUrl}" target="_blank">`
      const embeddableHtml = html
        .replace(/<meta[^>]+http-equiv=["']?content-security-policy["']?[^>]*>/gi, '')
        .replace(/<head([^>]*)>/i, `<head$1>${baseTag}`)

      const bodyHtml = embeddableHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || ''
      const visibleBodyText = bodyHtml
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      if (visibleBodyText.length < 80 && fallbackData.title) {
        res.end(createSourceFallbackHtml(fallbackData))
        return
      }

      res.end(embeddableHtml)
    } catch (error) {
      res.statusCode = 502
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      if (fallbackData.title) {
        res.statusCode = 200
        res.end(createSourceFallbackHtml({ ...fallbackData, reason: error.message }))
        return
      }
      res.end(`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><style>body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#f7f9fc;color:#475569;display:grid;place-items:center;min-height:100vh}.box{text-align:center;padding:32px}.title{font-size:18px;font-weight:600;color:#1f2937;margin-bottom:10px}.desc{font-size:14px;line-height:1.7}</style></head><body><div class="box"><div class="title">原文暂时无法嵌入</div><div class="desc">${escapeAttribute(error.message)}<br>请使用详情页右上角的“新窗口打开原文”。</div></div></body></html>`)
    }
  }

  return {
    name: 'industry-source-proxy',
    configureServer(server) {
      server.middlewares.use(handleRequest)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleRequest)
    }
  }
}

export default defineConfig({
  base: './',
  plugins: [vue(), createIndustrySourceProxy()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5176,
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },
  cacheDir: 'node_modules/.vite',
})
