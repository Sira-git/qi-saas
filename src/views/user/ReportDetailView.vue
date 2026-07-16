<template>
  <div class="report-detail-page">
    <!-- 统一顶部导航 -->
    <TopNav />

    <!-- 页面内容区 -->
    <div class="page-content">
      <div class="page-container">
        <!-- 页面标题栏 -->
        <div class="page-header-bar">
          <div class="page-title-section">
            <button class="back-btn" @click="$router.back()">← 返回</button>
            <div class="title-info">
              <h1>{{ reportData?.title || '大汉软件每日市场简报' }}</h1>
              <span class="report-meta">
                {{ reportData?.date || '2026 年 4 月 28 日' }} · 
                {{ reportData?.type === 'daily' ? '日报' : reportData?.type === 'weekly' ? '周报' : '月报' }}
                <a-tag :color="reportData?.generate_type === 'manual' ? 'blue' : 'green'" size="small" style="margin-left: 8px;">
                  {{ reportData?.generate_type === 'manual' ? '手动生成' : '定时生成' }}
                </a-tag>
              </span>
            </div>
          </div>
          <div class="page-actions">
            <button class="icon-btn" @click="toggleFavorite" :title="favorited ? '取消收藏' : '收藏'">
              {{ favorited ? '⭐' : '☆' }}
            </button>
            <button class="btn-primary" @click="handleExport">导出报告</button>
          </div>
        </div>

        <!-- Tab 内容区：5 个卡片作为 Tab 入口 -->
        <div class="tab-cards-section">
          <div class="tab-card" :class="{ active: currentTab === 'market' }" @click="currentTab = 'market'">
            <div class="card-icon"><BarChartOutlined /></div>
            <div class="card-num">4</div>
            <div class="card-label">市场洞察</div>
          </div>
          <div class="tab-card" :class="{ active: currentTab === 'policy' }" @click="currentTab = 'policy'">
            <div class="card-icon"><FileTextOutlined /></div>
            <div class="card-num">6</div>
            <div class="card-label">政策速递</div>
          </div>
          <div class="tab-card" :class="{ active: currentTab === 'industry' }" @click="currentTab = 'industry'">
            <div class="card-icon"><ApartmentOutlined /></div>
            <div class="card-num">5</div>
            <div class="card-label">行业动态</div>
          </div>
          <div class="tab-card" :class="{ active: currentTab === 'competitor' }" @click="currentTab = 'competitor'">
            <div class="card-icon"><RadarChartOutlined /></div>
            <div class="card-num">3</div>
            <div class="card-label">友商动态</div>
          </div>
          <div class="tab-card" :class="{ active: currentTab === 'bid' }" @click="currentTab = 'bid'">
            <div class="card-icon"><TrophyOutlined /></div>
            <div class="card-num">3</div>
            <div class="card-label">中标数据</div>
          </div>
        </div>

        <!-- Tab 内容显示区 -->
        <div class="tab-display-area">
          <!-- 市场机会 Tab 内容 -->
          <div v-show="currentTab === 'market'" class="tab-panel">
            <!-- 核心市场机会 -->
      <section class="content-section">
        <div class="section-header">
          <h2>🚀 今日市场洞察</h2>
          <span class="section-subtitle">贴合大汉软件全流程服务</span>
        </div>
        <div class="opportunity-content">
          <div class="opportunity-block">
            <h3>AI 合规审查优势</h3>
            <p>工信部等十部门《人工智能科技伦理审查与服务办法（试行）》于 2026 年 3 月 20 日发布，要求 AI 服务建立伦理审查机制；国家网信办《人工智能拟人化互动服务管理暂行办法》自 2026 年 7 月 15 日起施行；网信办《数字虚拟人信息服务管理办法（征求意见稿）》公开征求意见中。</p>
            <div class="opportunity-highlight">
              <strong>大汉优势：</strong>大汉软件"星汉 Galaxy 大模型"已通过国家网信办"双备案"（深度合成服务算法备案 + 生成式人工智能服务备案），在合规性上已具备明显优势。随着上述 AI 监管政策密集落地，各级政府在使用大模型辅助政务服务时，将优先选择已备案合规厂商的产品。
            </div>
          </div>
          <div class="opportunity-block">
            <h3>长三角政务服务智能化</h3>
            <p>上海市《促进长三角政务服务"一网通办"规定》自 2026 年 5 月 1 日起施行，明确提出：安全稳妥有序推进人工智能等数智技术在长三角政务服务"一网通办"中的应用，加强高质量数据集和语料库、可信知识库建设，为企业和个人提供智能引导、智能预填、智能帮办等服务。</p>
            <div class="opportunity-highlight">
              <strong>大汉优势：</strong>大汉软件总部位于南京，第一事业部和一网协同事业部均覆盖江苏、上海区域，上述政策直接利好公司在长三角区域的政务服务平台智能化升级项目。
            </div>
          </div>
          <div class="opportunity-block">
            <h3>"高效办成一件事"场景</h3>
            <p>安徽省印发《"高效办成一件事"2026 年度第一批拓展重点事项清单》，要求 2026 年 9 月底前完成国家部署的 13 个重点事项上线运行、10 月底前完成功能核验。上海市规定自 2026 年 5 月 1 日起施行，推进长三角"一网通办"向"免申即享""直达快享"演进。</p>
            <div class="opportunity-highlight">
              <strong>大汉优势：</strong>大汉软件在政府门户网站集约化、"互联网 + 政务服务"领域深耕多年，在"高效办成一件事"场景下，多端一体化、中台架构的产品体系可直接对接政府平台建设需求。
            </div>
          </div>
          <div class="opportunity-block">
            <h3>人工智能 + 教育</h3>
            <p>教育部等五部门《"人工智能 + 教育"行动计划》（教科信〔2026〕1 号）提出：利用人工智能赋能教育治理，围绕便捷服务、精准管理、科学决策，打造教育智能大脑；推动智能命题、智能组卷、智能监考、智能评卷等应用；打造智能化就业服务系统。</p>
            <div class="opportunity-highlight">
              <strong>大汉优势：</strong>大汉软件一网协同事业部覆盖江苏、浙江、上海、安徽高校市场，大模型业务已涵盖高校协同办公数智化转型，该政策直接利好公司在高校 AI 场景的拓展。
            </div>
          </div>
        </div>
      </section>

      <!-- 关键数据洞察 -->
      <section class="content-section">
        <div class="section-header">
          <h2>📈 关键数据洞察</h2>
        </div>
        <div class="data-insights">
          <div class="insight-card">
            <div class="insight-num">22.5 万亿美元</div>
            <div class="insight-desc">IDC 预测，到 2031 年 AI 将累计创造的经济价值</div>
            <div class="insight-source">来源: IDC Directions 2026</div>
          </div>
          <div class="insight-card">
            <div class="insight-num">AI Agent</div>
            <div class="insight-desc">IDC 定义"Agent 即应用"新模式：AI Agent 将应用从用户交互工具转为自主执行结果的系统</div>
            <div class="insight-source">来源: IDC Directions 2026</div>
          </div>
          <div class="insight-card">
            <div class="insight-num">2029 年</div>
            <div class="insight-desc">IDC 预测 AI 市场将迎来拐点，Agent 部署将达到数十亿规模</div>
            <div class="insight-source">来源: IDC Directions 2026</div>
          </div>
        </div>
      </section>

      <!-- 政策 - 业务机会对照表 -->
      <section class="content-section">
        <div class="section-header">
          <h2>🎯 政策 - 业务机会对照表</h2>
        </div>
        <div class="table-wrapper">
          <table class="policy-table">
            <thead>
              <tr>
                <th>政策名称</th>
                <th>关键政策点</th>
                <th>大汉软件可切入业务</th>
                <th>对应事业群</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>《人工智能科技伦理审查与服务办法（试行）》</td>
                <td>建立 AI 科技伦理审查机制，覆盖研发到服务全生命周期</td>
                <td>AI 合规审查平台、伦理治理解决方案</td>
                <td><span class="tag">技术研发部</span></td>
              </tr>
              <tr>
                <td>《人工智能拟人化互动服务管理暂行办法》</td>
                <td>2026 年 7 月 15 日起施行；提供者须备案、配备安全管理措施</td>
                <td>政务 AI 助手合规建设、智能问答系统</td>
                <td><span class="tag">星汉大模型相关业务</span></td>
              </tr>
              <tr>
                <td>《上海市促进长三角政务服务"一网通办"规定》</td>
                <td>2026 年 5 月 1 日起施行；推进 AI 数智技术应用；"免申即享"</td>
                <td>政务服务平台智能化升级、一网通办平台</td>
                <td><span class="tag">第一事业部</span><span class="tag">一网协同事业部</span></td>
              </tr>
              <tr>
                <td>《数字虚拟人信息服务管理办法（征求意见稿）》</td>
                <td>数字虚拟人须标识"数字人"字样；政务领域须人工监督审核</td>
                <td>数字政务虚拟人、政务服务虚拟形象</td>
                <td><span class="tag">第四/六/三事业部</span></td>
              </tr>
              <tr>
                <td>《安徽省"高效办成一件事"第一批清单》</td>
                <td>2026 年 9 月底前完成 13 个重点事项上线；10 月底完成核验</td>
                <td>政府门户网站集约化、"高效办成一件事"平台</td>
                <td><span class="tag">第四/六事业部</span></td>
              </tr>
              <tr>
                <td>《"人工智能 + 教育"行动计划》</td>
                <td>2030 年 AI 与教育深度融合；打造教育智能大脑</td>
                <td>高校 AI 门户、智慧校园、政务 AI 助手</td>
                <td><span class="tag">一网协同事业部</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 事业群覆盖表 -->
      <section class="content-section">
        <div class="section-header">
          <h2>🗺️ 事业群覆盖区域</h2>
        </div>
        <div class="table-wrapper">
          <table class="dept-table">
            <thead>
              <tr>
                <th>事业群名称</th>
                <th>覆盖区域</th>
                <th>业务范围</th>
                <th>备注</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>第一事业部</strong></td>
                <td>江苏省、上海市、山西省、湖南省、海南省、云南省</td>
                <td>所有主营业务</td>
                <td>含安徽省（部分政法委单位）</td>
              </tr>
              <tr>
                <td><strong>第二事业部</strong></td>
                <td>江西省、陕西省、湖北省、广东省（央国企）</td>
                <td>所有主营业务；广东省央国企业务</td>
                <td>——</td>
              </tr>
              <tr>
                <td><strong>第三事业部</strong></td>
                <td>国家部委（部分）、北京市（部分）</td>
                <td>所有主营业务</td>
                <td>——</td>
              </tr>
              <tr>
                <td><strong>第四事业部</strong></td>
                <td>山东省、河南省（政府门户/政务公开）、安徽省/贵州省/青海省/西藏（大模型）、全国税务行业、四川省/重庆市</td>
                <td>政府门户网站集约化、政务公开；政务服务；大模型相关业务；税务垂直行业</td>
                <td>含国家税务局；含甘肃烟草内网协同（部分）</td>
              </tr>
              <tr>
                <td><strong>一网协同事业部</strong></td>
                <td>江苏、浙江、上海、安徽（高校、民企）</td>
                <td>高校、民企主营业务</td>
                <td>高校含：江苏/上海/浙江/安徽（不含浙江 3 所高校）；民企含江苏/上海</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 核心能力区 -->
      <section class="content-section">
        <div class="section-header">
          <h2>⚙️ 大汉软件核心能力</h2>
        </div>
        <div class="capabilities-grid">
          <div class="capability-group">
            <h3>技术能力</h3>
            <ul>
              <li>✦ 移动多端全栈开发技术</li>
              <li>✦ 数据智能与挖掘技术</li>
              <li>✦ 互联网应用安全与认证技术</li>
              <li>✦ 高性能服务支撑技术</li>
              <li>✦ 互联网门户支撑技术</li>
            </ul>
          </div>
          <div class="capability-group">
            <h3>产品能力</h3>
            <ul>
              <li>✦ 知识助手</li>
              <li>✦ 公文辅助</li>
              <li>✦ 智慧热线</li>
              <li>✦ 智能帮办</li>
              <li>✦ 智策大脑</li>
              <li>✦ 报告助理</li>
            </ul>
          </div>
          <div class="capability-group">
            <h3>资质荣誉</h3>
            <ul>
              <li>✦ 国家信创图谱入选</li>
              <li>✦ 国家网信办"双备案"（深度合成 + 生成式 AI）</li>
              <li>✦ IDC《中国数字政府应用解决方案 2024》领导者</li>
              <li>✦ 2024 中国政务大模型应用市场份额第 2 名</li>
              <li>✦ 参与《政务服务平台基本功能规范》等国家标准制定</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- 区域 - 政策机会映射 -->
      <section class="content-section">
        <div class="section-header">
          <h2>🗺️ 区域 - 政策机会精准映射</h2>
        </div>
        <div class="table-wrapper">
          <table class="mapping-table">
            <thead>
              <tr>
                <th>区域</th>
                <th>对应事业群</th>
                <th>当前政策机会</th>
                <th>大汉软件可对接能力</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>上海</strong></td>
                <td>第一事业部</td>
                <td>《长三角一网通办规定》5 月 1 日施行；推进 AI 数智技术应用</td>
                <td>政务服务平台、一网通办平台、星汉大模型</td>
              </tr>
              <tr>
                <td><strong>江苏</strong></td>
                <td>第一事业部、一网协同事业部</td>
                <td>长三角一网通办；教育 AI 行动计划</td>
                <td>政务服务 + 高校 AI 门户</td>
              </tr>
              <tr>
                <td><strong>浙江</strong></td>
                <td>第六事业部、一网协同事业部</td>
                <td>教育 AI 行动计划；长三角一网通办</td>
                <td>高校 AI 门户、智慧校园</td>
              </tr>
              <tr>
                <td><strong>安徽</strong></td>
                <td>第四/六事业部、一网协同事业部</td>
                <td>《安徽省"高效办成一件事"》9 月底前完成；大模型相关业务</td>
                <td>政府门户集约化、星汉大模型</td>
              </tr>
              <tr>
                <td><strong>全国高校</strong></td>
                <td>一网协同事业部</td>
                <td>"人工智能 + 教育"行动计划；2030 年 AI 与教育深度融合</td>
                <td>高校 AI 门户、协同办公数智化</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
        </div>

          <!-- 政策分析 Tab -->
          <div v-show="currentTab === 'policy'" class="tab-panel">
            <div class="section-header">
              <h2>📰 政策速递</h2>
              <span class="section-subtitle">6 条政策</span>
            </div>
            <div class="policy-list">
              <div class="policy-card">
                <div class="policy-header">
                  <h3>关于印发《高新技术企业认定管理办法》的通知</h3>
                  <a-tag color="blue">国科发火〔2026〕1 号</a-tag>
                </div>
                <div class="policy-body">
                  <p>为加快建立以企业为主体、市场为导向、产学研深度融合的技术创新体系，进一步规范高新技术企业认定管理工作，科技部、财政部、国家税务总局联合印发《高新技术企业认定管理办法》。</p>
                  <div class="policy-meta">
                    <span>📅 发布日期：2026-03-15</span>
                    <span>🏢 发布机构：科技部、财政部、国家税务总局</span>
                  </div>
                </div>
                <div class="policy-footer">
                  <a-button type="link" size="small">查看详情 →</a-button>
                </div>
              </div>

              <div class="policy-card">
                <div class="policy-header">
                  <h3>人工智能科技伦理审查与服务办法（试行）</h3>
                  <a-tag color="green">工信部等十部门</a-tag>
                </div>
                <div class="policy-body">
                  <p>为规范人工智能科技伦理审查与服务活动，促进人工智能健康有序发展，工信部等十部门联合发布《人工智能科技伦理审查与服务办法（试行）》，要求 AI 服务建立伦理审查机制。</p>
                  <div class="policy-meta">
                    <span>📅 发布日期：2026-03-20</span>
                    <span>🏢 发布机构：工信部等十部门</span>
                  </div>
                </div>
                <div class="policy-footer">
                  <a-button type="link" size="small">查看详情 →</a-button>
                </div>
              </div>

              <div class="policy-card">
                <div class="policy-header">
                  <h3>人工智能拟人化互动服务管理暂行办法</h3>
                  <a-tag color="orange">国家网信办</a-tag>
                </div>
                <div class="policy-body">
                  <p>国家网信办发布《人工智能拟人化互动服务管理暂行办法》，自 2026 年 7 月 15 日起施行。提供者须备案、配备安全管理措施，规范拟人化 AI 服务。</p>
                  <div class="policy-meta">
                    <span>📅 发布日期：2026-04-01</span>
                    <span>🏢 发布机构：国家网信办</span>
                  </div>
                </div>
                <div class="policy-footer">
                  <a-button type="link" size="small">查看详情 →</a-button>
                </div>
              </div>

              <div class="policy-card">
                <div class="policy-header">
                  <h3>上海市促进长三角政务服务"一网通办"规定</h3>
                  <a-tag color="blue">上海市人大</a-tag>
                </div>
                <div class="policy-body">
                  <p>自 2026 年 5 月 1 日起施行，推进 AI 数智技术应用，实现"免申即享"。加强长三角政务服务一体化，推动智能引导、智能预填、智能帮办等服务。</p>
                  <div class="policy-meta">
                    <span>📅 发布日期：2026-04-10</span>
                    <span>🏢 发布机构：上海市人大常委会</span>
                  </div>
                </div>
                <div class="policy-footer">
                  <a-button type="link" size="small">查看详情 →</a-button>
                </div>
              </div>

              <div class="policy-card">
                <div class="policy-header">
                  <h3>数字虚拟人信息服务管理办法（征求意见稿）</h3>
                  <a-tag color="gray">国家网信办</a-tag>
                </div>
                <div class="policy-body">
                  <p>数字虚拟人须标识"数字人"字样；政务领域须人工监督审核。公开征求意见中，进一步规范数字虚拟人服务管理。</p>
                  <div class="policy-meta">
                    <span>📅 发布日期：2026-04-15</span>
                    <span>🏢 发布机构：国家网信办</span>
                  </div>
                </div>
                <div class="policy-footer">
                  <a-button type="link" size="small">查看详情 →</a-button>
                </div>
              </div>

              <div class="policy-card">
                <div class="policy-header">
                  <h3>"人工智能 + 教育"行动计划</h3>
                  <a-tag color="purple">教育部等五部门</a-tag>
                </div>
                <div class="policy-body">
                  <p>教育部等五部门发布《"人工智能 + 教育"行动计划》（教科信〔2026〕1 号），提出利用 AI 赋能教育治理，打造教育智能大脑，推动智能命题、智能组卷、智能监考等应用。</p>
                  <div class="policy-meta">
                    <span>📅 发布日期：2026-04-20</span>
                    <span>🏢 发布机构：教育部等五部门</span>
                  </div>
                </div>
                <div class="policy-footer">
                  <a-button type="link" size="small">查看详情 →</a-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 行业分析 Tab -->
          <div v-show="currentTab === 'industry'" class="tab-panel">
            <div class="section-header">
              <h2>🏭 行业动态</h2>
              <span class="section-subtitle">5 条资讯</span>
            </div>
            <div class="industry-list">
              <div class="industry-card">
                <div class="industry-header">
                  <h3>政务服务数字化转型加速推进</h3>
                  <a-tag color="blue">数字化转型</a-tag>
                </div>
                <p>2026 年第一季度，全国政务服务数字化转型取得显著进展，超过 80% 的省级部门已完成数字化改造。</p>
                <div class="industry-meta">
                  <span>📅 2026-04-28</span>
                  <span>📰 来源：政务信息化报</span>
                </div>
              </div>

              <div class="industry-card">
                <div class="industry-header">
                  <h3>长三角一体化政务服务新突破</h3>
                  <a-tag color="green">区域协同</a-tag>
                </div>
                <p>长三角三省一市实现政务服务"一网通办"全覆盖，跨省通办事项增至 150 项。</p>
                <div class="industry-meta">
                  <span>📅 2026-04-26</span>
                  <span>📰 来源：长三角发展报</span>
                </div>
              </div>

              <div class="industry-card">
                <div class="industry-header">
                  <h3>AI 大模型在政务场景应用深化</h3>
                  <a-tag color="purple">人工智能</a-tag>
                </div>
                <p>各地政府积极探索 AI 大模型在智能审批、政策咨询等场景的应用，提升政务服务效率。</p>
                <div class="industry-meta">
                  <span>📅 2026-04-25</span>
                  <span>📰 来源：科技日报</span>
                </div>
              </div>

              <div class="industry-card">
                <div class="industry-header">
                  <h3>"高效办成一件事"改革成效明显</h3>
                  <a-tag color="orange">政务服务</a-tag>
                </div>
                <p>全国"高效办成一件事"改革试点取得阶段性成果，企业群众办事平均时限压缩 60%。</p>
                <div class="industry-meta">
                  <span>📅 2026-04-24</span>
                  <span>📰 来源：人民日报</span>
                </div>
              </div>

              <div class="industry-card">
                <div class="industry-header">
                  <h3>数字政府建设标准体系发布</h3>
                  <a-tag color="red">标准规范</a-tag>
                </div>
                <p>国家出台数字政府建设标准体系，为各地数字政府建设提供统一规范。</p>
                <div class="industry-meta">
                  <span>📅 2026-04-22</span>
                  <span>📰 来源：中国政府网</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 竞品分析 Tab -->
          <div v-show="currentTab === 'competitor'" class="tab-panel">
            <div class="section-header">
              <h2>🔍 友商动态</h2>
              <span class="section-subtitle">3 条情报</span>
            </div>
            <div class="industry-list">
              <div class="industry-card">
                <div class="industry-header">
                  <h3>某科技公司发布政务大模型 2.0 版本</h3>
                  <a-tag color="blue">产品发布</a-tag>
                </div>
                <p>竞争对手推出新一代政务大模型，支持多轮对话和智能决策辅助。</p>
                <div class="industry-meta">
                  <span>📅 2026-04-28</span>
                  <span>🏭 来源：行业监测</span>
                </div>
              </div>

              <div class="industry-card">
                <div class="industry-header">
                  <h3>某企业中标江苏省政务服务平台项目</h3>
                  <a-tag color="green">中标信息</a-tag>
                </div>
                <p>竞争对手在江苏省政务服务平台升级项目中中标，金额约 5000 万元。</p>
                <div class="industry-meta">
                  <span>📅 2026-04-25</span>
                  <span>🏆 来源：招标网</span>
                </div>
              </div>

              <div class="industry-card">
                <div class="industry-header">
                  <h3>某公司获得人工智能领域专利授权</h3>
                  <a-tag color="orange">技术专利</a-tag>
                </div>
                <p>竞争对手在自然语言处理领域获得 3 项发明专利授权。</p>
                <div class="industry-meta">
                  <span>📅 2026-04-20</span>
                  <span>🔍 来源：知识产权局</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 中标数据 Tab -->
          <div v-show="currentTab === 'bid'" class="tab-panel">
            <div class="section-header">
              <h2>🏆 中标数据</h2>
              <span class="section-subtitle">3 条机会</span>
            </div>
            <div class="industry-list">
              <div class="industry-card">
                <div class="industry-header">
                  <h3>上海市某区智慧政务平台建设项目</h3>
                  <a-tag color="blue">政府门户</a-tag>
                </div>
                <p>项目预算：3000 万元，预计 2026 年 6 月启动招标。</p>
                <div class="industry-meta">
                  <span>📅 2026-04-29</span>
                  <span>💰 预算：3000 万元</span>
                </div>
              </div>

              <div class="industry-card">
                <div class="industry-header">
                  <h3>江苏省某市一网协同平台升级项目</h3>
                  <a-tag color="green">一网协同</a-tag>
                </div>
                <p>项目预算：2000 万元，支持高校和民企市场。</p>
                <div class="industry-meta">
                  <span>📅 2026-04-27</span>
                  <span>💰 预算：2000 万元</span>
                </div>
              </div>

              <div class="industry-card">
                <div class="industry-header">
                  <h3>安徽省某县数字政府建设项目</h3>
                  <a-tag color="orange">大模型</a-tag>
                </div>
                <p>项目预算：1500 万元，重点建设 AI 应用场景。</p>
                <div class="industry-meta">
                  <span>📅 2026-04-26</span>
                  <span>💰 预算：1500 万元</span>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TopNav from '@/components/TopNav.vue'
import { SearchOutlined, BellOutlined, UserOutlined, FileTextOutlined, BarChartOutlined, ApartmentOutlined, RadarChartOutlined, TrophyOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()
const favorited = ref(false)
const currentTab = ref('market') // market, policy, industry, competitor, bid
const currentEntId = ref('')
const mockEnterprises = ref([
  { id: '1', name: '大汉软件股份有限公司' },
  { id: '2', name: '测试企业' },
])

// Tab 配置
const tabs = [
  { key: 'market', label: '市场洞察' },
  { key: 'policy', label: '政策分析' },
  { key: 'industry', label: '行业分析' },
  { key: 'competitor', label: '竞品分析' },
  { key: 'bid', label: '中标数据' }
]

// Mock 政策数据
const mockPolicies = [
  {
    title: '关于印发《高新技术企业认定管理办法》的通知',
    documentNumber: '国科发火〔2026〕1 号',
    publishingOrg: '科技部',
    publishDate: '2026-04-15',
    summary: '为进一步规范高新技术企业认定工作，提高认定质量，现印发《高新技术企业认定管理办法》。',
    url: '#'  
  },
  {
    title: '关于促进人工智能产业发展的指导意见',
    documentNumber: '工信部信软〔2026〕2 号',
    publishingOrg: '工信部',
    publishDate: '2026-04-10',
    summary: '为推动人工智能产业健康发展，提出加强技术创新、完善产业生态等政策措施。',
    url: '#'
  },
  {
    title: '上海市促进长三角政务服务"一网通办"规定',
    documentNumber: '沪府令〔2026〕3 号',
    publishingOrg: '上海市人民政府',
    publishDate: '2026-05-01',
    summary: '推进 AI 数智技术应用，实现"免申即享"，提升政务服务效率。',
    url: '#'
  },
  {
    title: '数字虚拟人信息服务管理办法（征求意见稿）',
    documentNumber: '网信办〔2026〕4 号',
    publishingOrg: '国家网信办',
    publishDate: '2026-04-20',
    summary: '数字虚拟人须标识"数字人"字样，政务领域须人工监督审核。',
    url: '#'
  },
  {
    title: '安徽省"高效办成一件事"第一批清单',
    documentNumber: '皖政办〔2026〕5 号',
    publishingOrg: '安徽省人民政府',
    publishDate: '2026-04-25',
    summary: '2026 年 9 月底前完成 13 个重点事项上线，10 月底完成核验。',
    url: '#'
  },
  {
    title: '"人工智能 + 教育"行动计划',
    documentNumber: '教科信〔2026〕1 号',
    publishingOrg: '教育部',
    publishDate: '2026-04-18',
    summary: '2030 年 AI 与教育深度融合，打造教育智能大脑。',
    url: '#'
  }
]

// 报告数据
const reportData = ref(null)

const handleTabChange = (tabKey) => {
  currentTab.value = tabKey
  console.log('切换 Tab:', tabKey)
}

const handleEnterpriseChange = (val) => {
  console.log('切换企业:', val)
}

const handleLogout = () => {
  console.log('退出登录')
  // TODO: 实现退出登录逻辑
}

const toggleFavorite = () => {
  favorited.value = !favorited.value
}

const handleExport = () => {
  // TODO: 实现导出功能
  console.log('导出报告')
}

const goToPolicyList = () => {
  const reportId = route.params.id || route.query.id || 'mock_report_001'
  const baseTitle = reportData.value?.title || '大汉软件每日市场简报'
  const dateStr = reportData.value?.date || '2026-04-28'
  const typeText = reportData.value?.type === 'daily' ? '日报' : reportData.value?.type === 'weekly' ? '周报' : reportData.value?.type === 'monthly' ? '月报' : '日报'
  
  console.log('跳转到政策列表，reportId:', reportId, 'baseTitle:', baseTitle, 'dateStr:', dateStr, 'typeText:', typeText)
  router.push({
    path: '/report/policy-list',
    query: { 
      reportId, 
      reportBaseTitle: baseTitle,
      reportDate: dateStr,
      reportType: reportData.value?.type || 'daily'
    }
  })
}

const goToIndustryList = () => {
  const reportId = route.params.id || route.query.id || 'mock_report_001'
  const baseTitle = reportData.value?.title || '大汉软件每日市场简报'
  const dateStr = reportData.value?.date || '2026-04-28'
  const typeText = reportData.value?.type === 'daily' ? '日报' : reportData.value?.type === 'weekly' ? '周报' : '月报'
  
  console.log('跳转到行业动态，reportId:', reportId, 'baseTitle:', baseTitle, 'dateStr:', dateStr, 'typeText:', typeText)
  router.push({
    path: '/report/industry-list',
    query: { 
      reportId, 
      reportBaseTitle: baseTitle,
      reportDate: dateStr,
      reportType: reportData.value?.type || 'daily'
    }
  })
}

const goToCompetitorList = () => {
  const reportId = route.params.id || route.query.id || 'mock_report_001'
  const baseTitle = reportData.value?.title || '大汉软件每日市场简报'
  const dateStr = reportData.value?.date || '2026-04-28'
  const typeText = reportData.value?.type === 'daily' ? '日报' : reportData.value?.type === 'weekly' ? '周报' : '月报'
  
  console.log('跳转到友商动态，reportId:', reportId, 'baseTitle:', baseTitle, 'dateStr:', dateStr, 'typeText:', typeText)
  router.push({
    path: '/report/competitor-list',
    query: { 
      reportId, 
      reportBaseTitle: baseTitle,
      reportDate: dateStr,
      reportType: reportData.value?.type || 'daily'
    }
  })
}

const goToBidList = () => {
  const reportId = route.params.id || route.query.id || 'mock_report_001'
  const baseTitle = reportData.value?.title || '大汉软件每日市场简报'
  const dateStr = reportData.value?.date || '2026-04-28'
  const typeText = reportData.value?.type === 'daily' ? '日报' : reportData.value?.type === 'weekly' ? '周报' : '月报'
  
  console.log('跳转到中标数据，reportId:', reportId, 'baseTitle:', baseTitle, 'dateStr:', dateStr, 'typeText:', typeText)
  router.push({
    path: '/report/bid-list',
    query: { 
      reportId, 
      reportBaseTitle: baseTitle,
      reportDate: dateStr,
      reportType: reportData.value?.type || 'daily'
    }
  })
}

// 加载报告数据
const loadReport = () => {
  const reportId = route.params.id
  console.log('加载报告 ID:', reportId)
  
  // TODO: 从 API 获取真实数据
  // 暂时使用 Mock 数据
  reportData.value = {
    id: reportId || 'mock_report_001',
    title: '大汉软件每日市场简报',
    date: '2026-04-28',
    type: 'daily',
  }
}

onMounted(() => {
  loadReport()
})

// 监听路由参数变化，重新加载报告
watch(() => route.params.id, (newId, oldId) => {
  console.log('路由 ID 变化:', oldId, '->', newId)
  loadReport()
}, { immediate: false })
</script>

<style scoped>
/* 页面容器 *//* 页面整体 */
.report-detail-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-top: 64px; /* 为固定导航留出空间 */
}

/* Tab 导航样式 */
.tab-cards-section {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  overflow-x: auto;
}

.tab-card {
  flex: 1;
  min-width: 0;
  background: #ffffff;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  padding: 12px 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-card:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.25);
}

.tab-card.active {
  border-color: #1890ff;
  background: #e6f7ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.card-icon {
  font-size: 24px;
  margin-bottom: 6px;
  color: #1890ff;
}

.card-num {
  font-size: 22px;
  font-weight: 700;
  color: #1890ff;
  line-height: 1.2;
}

.card-label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin: 4px 0 2px;
}

.card-desc {
  font-size: 11px;
  color: #999;
}

/* Tab 内容显示区 */
.tab-display-area {
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  min-height: 400px;
}

.tab-display {
  animation: fadeIn 0.3s;
}

/* Tab 导航样式（旧的，保留以防需要） */
.tab-bar {
  display: flex;
  border-bottom: 1px solid #e8e8e8;
  background: #ffffff;
  margin-bottom: 24px;
  padding: 0 16px;
}

.tab-item {
  padding: 16px 24px;
  cursor: pointer;
  font-size: 15px;
  color: #666;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
  position: relative;
}

.tab-item:hover {
  color: #1890ff;
  background: #f0f7ff;
}

.tab-item.active {
  color: #1890ff;
  font-weight: 600;
  border-bottom-color: #1890ff;
}

/* Tab 内容区 */
.tab-content {
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.tab-panel {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-state h3 {
  margin: 16px 0 8px;
  font-size: 18px;
  color: #666;
}

.empty-state p {
  margin: 0 0 24px;
  font-size: 14px;
  color: #999;
}

/* 政策列表 */
.policy-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.policy-card {
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s;
}

.policy-card:hover {
  border-color: #1890ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
}

.policy-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.policy-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  line-height: 1.5;
}

.policy-body {
  margin-bottom: 12px;
}

.policy-body p {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.policy-meta {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: #999;
}

.policy-footer {
  text-align: right;
}

/* 行业列表 */
.industry-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.industry-card {
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s;
}

.industry-card:hover {
  border-color: #1890ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
}

.industry-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.industry-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  line-height: 1.5;
}

.industry-card p {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.industry-meta {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: #999;
}

/* 行业列表 */
.industry-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.industry-card {
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s;
}

.industry-card:hover {
  border-color: #1890ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
}

.industry-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.industry-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  line-height: 1.5;
}

.industry-card p {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.industry-meta {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: #999;
}

.nav-container {
  width: 100%;
  max-width: 1200px;
  height: 64px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 32px;
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

.nav-menu {
  display: flex;
  gap: 24px;
  margin-left: 32px;
  padding-left: 24px;
  border-left: 1px solid #e8e8e8;
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

.nav-link.active {
  color: #4096ff;
  font-weight: 600;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #4096ff;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-icon {
  cursor: pointer;
  font-size: 18px;
  color: #181818;
}

.nav-icon:hover {
  color: #4096ff;
}

.nav-icon .icon {
  font-size: 18px;
}

.user-avatar {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s;
  color: #181818;
  font-size: 14px;
}

.user-avatar:hover {
  background: #f5f5f5;
}

.user-avatar .icon {
  font-size: 18px;
}

.user-avatar span {
  font-size: 14px;
  color: #1a202c;
}

/* 页面内容区 */
.page-content {
  padding-top: 24px;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 页面标题栏 */
.page-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title-section {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.back-btn {
  background: none;
  border: none;
  color: #666;
  font-size: 16px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.title-info h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.report-meta {
  font-size: 13px;
  color: #999;
  display: block;
  margin-top: 4px;
}

.page-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.back-btn {
  background: none;
  border: none;
  color: #666;
  font-size: 16px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.header-info {
  flex: 1;
  text-align: center;
}

.header-info h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.report-meta {
  font-size: 13px;
  color: #999;
  display: block;
  margin-top: 4px;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.icon-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: #f5f5f5;
}

.btn-primary {
  background: #1890ff;
  color: #ffffff;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #40a9ff;
}

/* 顶部概览卡片 */
.overview-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.overview-card {
  background: #ffffff;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  border: 1px solid #e8e8e8;
  transition: all 0.2s;
}

.overview-card {
  cursor: pointer;
}

.overview-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.overview-card.clickable {
  cursor: pointer;
  transition: all 0.2s;
}

.overview-card.clickable:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.overview-icon {
  font-size: 28px;
  margin-bottom: 8px;
  color: #1677ff;
}

.overview-num {
  font-size: 32px;
  font-weight: 700;
  color: #1890ff;
  line-height: 1;
  margin-bottom: 4px;
}

.overview-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.overview-desc {
  font-size: 12px;
  color: #999;
}

/* 内容区块 */
.content-section {
  background: #ffffff;
  border-radius: 10px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid #e8e8e8;
}

.section-header {
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.section-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.section-subtitle {
  display: block;
  font-size: 13px;
  color: #999;
  margin-top: 4px;
}

/* 市场机会 */
.opportunity-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.opportunity-block {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid #1890ff;
}

.opportunity-block h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.opportunity-block p {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.opportunity-highlight {
  background: #e6f7ff;
  border-radius: 6px;
  padding: 12px;
  font-size: 14px;
  color: #333;
  line-height: 1.6;
}

.opportunity-highlight strong {
  color: #1890ff;
}

/* 数据洞察 */
.data-insights {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.insight-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  padding: 24px;
  color: #ffffff;
  text-align: center;
}

.insight-num {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
  line-height: 1.2;
}

.insight-desc {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
  line-height: 1.4;
}

.insight-source {
  font-size: 12px;
  opacity: 0.7;
}

/* 表格样式 */
.table-wrapper {
  overflow-x: auto;
}

.policy-table,
.dept-table,
.mapping-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.policy-table th,
.dept-table th,
.mapping-table th {
  background: #fafafa;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e8e8e8;
}

.policy-table td,
.dept-table td,
.mapping-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  color: #666;
  line-height: 1.5;
}

.policy-table tr:hover,
.dept-table tr:hover,
.mapping-table tr:hover {
  background: #fafafa;
}

.tag {
  display: inline-block;
  padding: 4px 10px;
  background: #e6f7ff;
  color: #1890ff;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 4px;
  margin-bottom: 4px;
}

/* 核心能力 */
.capabilities-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.capability-group {
  background: #fafafa;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e8e8e8;
}

.capability-group h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  padding-bottom: 8px;
  border-bottom: 2px solid #1890ff;
}

.capability-group ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.capability-group li {
  padding: 8px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  border-bottom: 1px dashed #e8e8e8;
}

.capability-group li:last-child {
  border-bottom: none;
}

/* 响应式 */
@media (max-width: 1024px) {
  .overview-section,
  .data-insights,
  .capabilities-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .overview-section,
  .data-insights,
  .capabilities-grid {
    grid-template-columns: 1fr;
  }
  
  .page-header .page-container {
    flex-wrap: wrap;
  }
  
  .header-info {
    order: 3;
    width: 100%;
    text-align: left;
    margin-top: 12px;
  }
}
</style>
