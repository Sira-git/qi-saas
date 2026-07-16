<template>
  <div class="home-page">
    <nav class="top-nav">
      <div class="nav-container">
        <div class="nav-logo">
          <svg class="logo-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- 简洁的放大镜图标，代表"察" -->
            <circle cx="18" cy="18" r="10" stroke="#4096ff" stroke-width="3" fill="none"/>
            <line x1="25" y1="25" x2="32" y2="32" stroke="#4096ff" stroke-width="3" stroke-linecap="round"/>
            <circle cx="18" cy="18" r="4" fill="#4096ff" opacity="0.3"/>
          </svg>
          <span class="logo-text">企情察</span>
        </div>
        <div class="nav-right">
          <router-link to="/dashboard" class="nav-link workbench-btn">工作台</router-link>
          <router-link to="/admin" class="nav-link console-btn">控制台</router-link>
          <router-link to="/login" class="nav-link">登录</router-link>
          <router-link to="/register" class="btn-primary nav-btn">免费试用</router-link>
        </div>
      </div>
    </nav>

    <section class="hero-section">
      <div class="page-container">
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="hero-title">
              企业情报智能洞察<br />
              <span class="gradient-text">SaaS 服务</span>
            </h1>
            <p class="hero-subtitle">
              整合市场、政策、行业、竞品、招投标多维度数据，<br />
              一键生成可视化报告，全方位支撑企业经营决策
            </p>
            <div class="hero-actions">
              <router-link to="/register" class="btn-primary hero-cta">
                立即免费试用
              </router-link>
              <a href="#features" class="btn-outline">了解更多</a>
            </div>
          </div>
          <div class="hero-visual">
            <div class="visual-cards">
              <div class="visual-card vc-1">
                <div class="vc-icon"><FileTextOutlined /></div>
                <div class="vc-text">政策分析</div>
                <div class="vc-trend new">新政策上线</div>
              </div>
              <div class="visual-card vc-2">
                <div class="vc-icon"><AimOutlined /></div>
                <div class="vc-text">竞品监测</div>
                <div class="vc-trend">3 家动态</div>
              </div>
              <div class="visual-card vc-3">
                <div class="vc-icon"><ApartmentOutlined /></div>
                <div class="vc-text">行业洞察</div>
                <div class="vc-trend up"><ArrowUpOutlined /> 热度上升</div>
              </div>
              <div class="visual-card vc-4">
                <div class="vc-icon"><TrophyOutlined /></div>
                <div class="vc-text">中标数据</div>
                <div class="vc-trend up"><ArrowUpOutlined /> 持续增长</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="features" class="features-section">
      <div class="page-container">
        <h2 class="section-title">快速掌握企业情报</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon-wrap"><ProfileOutlined /></div>
            <h3>智能报告生成</h3>
            <p>一键生成日报、周报、月报，自动整合五大维度数据，告别繁琐的手工整理</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon-wrap blue"><ReadOutlined /></div>
            <h3>政策追踪分析</h3>
            <p>实时跟踪适配企业的政策内容，解读政策要点及对企业的影响，抢占先机</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon-wrap green"><RadarChartOutlined /></div>
            <h3>竞品动态监测</h3>
            <p>持续追踪竞品动向，分析竞争格局，量化差距，助力企业保持竞争优势</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon-wrap orange"><LineChartOutlined /></div>
            <h3>行业趋势洞察</h3>
            <p>深入分析行业数据，呈现市场规模、发展趋势及核心痛点，辅助战略决策</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon-wrap purple"><TrophyOutlined /></div>
            <h3>中标数据洞察</h3>
            <p>追踪招投标市场，挖掘与企业业务相关的潜在商机，发现增长新机会</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon-wrap cyan"><AlertOutlined /></div>
            <h3>智能消息推送</h3>
            <p>报告生成即时提醒，支持微信服务号推送，不打扰用户，支持免打扰时段</p>
          </div>
        </div>
      </div>
    </section>

    <section class="cta-section">
      <div class="page-container">
        <div class="cta-card">
          <h2>立即开始，提升企业决策效率</h2>
          <p>免费注册，快速配置，5 分钟生成第一份报告</p>
          <router-link to="/register" class="btn-primary-cta">免费注册</router-link>
        </div>
      </div>
    </section>

    <footer class="site-footer">
      <div class="page-container">
        <div class="footer-content">
          <div class="footer-left">
            <div class="footer-phone-section">
              <div class="footer-label">服务热线</div>
              <div class="footer-phone">400-969-0828</div>
            </div>
            <div class="footer-copyright">© 大汉软件股份有限公司</div>
          </div>
          
          <div class="footer-center">
            <div class="footer-address-section">
              <div class="footer-label">联系地址</div>
              <div class="footer-address">江苏省南京市玄武区玄武大道 699-40 号</div>
            </div>
            <div class="footer-icp">
              <a href="https://beian.miit.gov.cn/" target="_blank">苏 ICP 备 05075050 号</a>
              <span class="icp-divider">|</span>
              <a href="http://www.beian.gov.cn/portal/registerSystemInfo" target="_blank">
                <span class="police-icon">🔵</span> 苏公网安备 32010202010709 号
              </a>
            </div>
          </div>
          
          <div class="footer-right">
            <div class="footer-label">关注我们</div>
            <div class="footer-qrcode">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://qi-saas.example.com" alt="微信公众号二维码" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import {
  SearchOutlined, BarChartOutlined, FileTextOutlined, AimOutlined,
  ApartmentOutlined, ArrowUpOutlined, ProfileOutlined, ReadOutlined,
  RadarChartOutlined, LineChartOutlined, TrophyOutlined, AlertOutlined,
} from '@ant-design/icons-vue'

import { useUserStore } from '@/stores/user'
import { computed } from 'vue'

const userStore = useUserStore()
const isLoggedIn = computed(() => userStore.isLoggedIn)
</script>

<style scoped>
.home-page { background: #f5f7ff; min-height: 100vh; }

.top-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  z-index: 100;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.nav-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 36px;
  height: 36px;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: #181818;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-link {
  color: #181818;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  padding: 8px 0;
  transition: all 0.2s;
  position: relative;
}

.nav-link:hover {
  color: #4096ff;
}

.workbench-btn {
  color: #181818;
}

.workbench-btn:hover {
  color: #4096ff;
}

.console-btn {
  color: #181818;
}

.console-btn:hover {
  color: #4096ff;
}

.nav-btn {
  padding: 8px 20px;
  font-size: 14px;
  text-decoration: none;
  display: inline-block;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-primary {
  background: #4096ff;
  color: #ffffff;
}

.btn-primary:hover {
  background: #1677ff;
  color: #ffffff;
}

.hero-section { padding: 120px 0 80px; background: linear-gradient(180deg, #ffffff 0%, #f0f5ff 100%); }

.hero-content { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }

.hero-title { font-size: 48px; font-weight: 800; line-height: 1.2; margin-bottom: 20px; color: #1a202c; }

.hero-subtitle { font-size: 16px; color: #64748b; line-height: 1.8; margin-bottom: 32px; }

.hero-actions { display: flex; gap: 16px; align-items: center; }

.hero-cta { padding: 14px 32px; font-size: 16px; text-decoration: none; display: inline-block; }

.visual-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.visual-card {
  background: #ffffff; border: 1px solid rgba(0, 0, 0, 0.08); border-radius: 12px;
  padding: 20px; text-align: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06); transition: all 0.3s;
}
.visual-card:hover {
  box-shadow: 0 4px 20px rgba(22, 119, 255, 0.12);
  border-color: rgba(22, 119, 255, 0.3); transform: translateY(-2px);
}

.vc-icon { font-size: 32px; color: #1677ff; margin-bottom: 8px; }
.vc-text { font-size: 14px; font-weight: 600; color: #1a202c; margin-bottom: 4px; }
.vc-trend { font-size: 12px; color: #64748b; }
.vc-trend.up { color: #16a34a; display: flex; align-items: center; justify-content: center; gap: 2px; }
.vc-trend.new { color: #1677ff; }

.features-section { padding: 80px 0; background: #f5f7ff; }

.section-title { font-size: 36px; font-weight: 700; text-align: center; margin-bottom: 48px; color: #1a202c; }

.features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }

.feature-card {
  background: #ffffff; border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px; padding: 28px; transition: all 0.3s;
}
.feature-card:hover { border-color: rgba(22, 119, 255, 0.3); box-shadow: 0 4px 20px rgba(22, 119, 255, 0.1); transform: translateY(-2px); }

.feature-icon-wrap {
  width: 52px; height: 52px; border-radius: 12px;
  background: rgba(22, 119, 255, 0.1);
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; color: #1677ff; margin-bottom: 16px;
}
.feature-icon-wrap.blue { background: rgba(22, 119, 255, 0.1); color: #1677ff; }
.feature-icon-wrap.green { background: rgba(22, 197, 94, 0.1); color: #16a34a; }
.feature-icon-wrap.orange { background: rgba(250, 139, 48, 0.1); color: #ea6a10; }
.feature-icon-wrap.purple { background: rgba(139, 92, 246, 0.1); color: #7c3aed; }
.feature-icon-wrap.cyan { background: rgba(6, 182, 212, 0.1); color: #0891b2; }

.feature-card h3 { font-size: 18px; font-weight: 600; margin-bottom: 10px; color: #1a202c; }
.feature-card p { font-size: 14px; color: #64748b; line-height: 1.7; }

.cta-section { padding: 40px 0 80px; background: #f5f7ff; }

.cta-card {
  background: linear-gradient(135deg, #1677ff 0%, #5b8def 100%);
  border-radius: 16px; padding: 48px; text-align: center; color: #ffffff;
}
.cta-card h2 { font-size: 28px; font-weight: 700; margin-bottom: 12px; color: #ffffff; }
.cta-card p { color: rgba(255, 255, 255, 0.85); margin-bottom: 28px; }

.btn-primary-cta {
  background: #ffffff; color: #1677ff; padding: 14px 40px; font-size: 16px; font-weight: 600;
  display: inline-block; text-decoration: none; border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15); transition: all 0.3s;
}
.btn-primary-cta:hover { background: #f0f5ff; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2); }

.site-footer { background: #ffffff; border-top: 1px solid rgba(0, 0, 0, 0.06); padding: 40px 0 24px; }

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  gap: 60px;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0 40px;
}

.footer-left, .footer-center, .footer-right {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.footer-label {
  font-size: 16px;
  font-weight: 500;
  color: #1a202c;
  margin-bottom: 8px;
}

.footer-phone-section {
  margin-bottom: 8px;
}

.footer-phone {
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
  letter-spacing: 0.5px;
}

.footer-copyright {
  font-size: 14px;
  color: #94a3b8;
  margin-top: 8px;
}

.footer-address {
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
  line-height: 1.6;
}

.footer-icp {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #94a3b8;
  margin-top: 8px;
}

.footer-icp a {
  color: #94a3b8;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: color 0.2s;
  white-space: nowrap;
}

.footer-icp a:hover {
  color: #1677ff;
}

.icp-divider {
  color: #d1d5db;
  display: flex;
  align-items: center;
}

.police-icon {
  display: inline-block;
  width: 14px;
  height: 14px;
  line-height: 14px;
  text-align: center;
  font-size: 12px;
}

.footer-qrcode {
  width: 100px;
  height: 100px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-qrcode img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

@media (max-width: 768px) {
  .hero-content { grid-template-columns: 1fr; }
  .hero-title { font-size: 32px; }
  .hero-visual { display: none; }
  .features-grid { grid-template-columns: 1fr; }
  .footer-links { gap: 30px; flex-wrap: wrap; }
  .footer-content { 
    flex-direction: column; 
    gap: 30px; 
    align-items: flex-start;
    padding: 0 20px;
  }
  .footer-phone { font-size: 22px; }
  .footer-address { font-size: 15px; }
  .footer-qrcode { margin: 0; }
}
</style>
