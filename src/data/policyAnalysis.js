const DOMAIN_TERMS = [
  '人工智能', '大模型', '智能体', 'AI', '数据要素', '公共数据', '授权运营', '数据治理',
  '高质量数据集', '数据集', '语料库', '知识库', '数据标注', '数据安全', '算力',
  '一网通办', '高效办成一件事', '政务服务', '智能办', '一网协同', '协同办公',
  '市场监管', '信用监管', '智慧监管', '门户网站', '网站群', '数字政府', '智慧城市'
]

const HEADING_PATTERN = /^(?:[一二三四五六七八九十]+、|（[一二三四五六七八九十]+）|\d+[.、])/
const METADATA_PATTERN = /^(?:发文机关|发文日期|时效性|发文字号|施行日期|效力级别|附件[:：]?|联系电话[:：]?)/

const capabilitySuggestions = {
  人工智能: {
    title: '形成星汉 Galaxy 政务大模型专项方案',
    content: '结合大汉软件已完成双备案的星汉 Galaxy 政务大模型、知识中枢、Agent 智能体和训推一体机能力，梳理政策对应的智能问答、辅助决策、智能办事等场景，形成可演示、可报价、可交付的专项方案。'
  },
  数据要素: {
    title: '对接公共数据治理与授权运营项目',
    content: '依托大汉软件公共数据运营资质和知识中枢平台，围绕数据归集、治理、登记、授权运营、价值挖掘和安全审计形成项目清单，优先对接数据主管部门及政策明确的试点场景。'
  },
  一网通办: {
    title: '推动“一网通办”智能化场景落地',
    content: '复用大汉软件在赣服通、泉城通办等项目中的建设经验，将智能咨询、智能预填、材料预审、政策匹配和“边聊边办”能力组合为本地化升级方案，争取形成区域标杆案例。'
  },
  一网协同: {
    title: '拓展机关协同办公智能化项目',
    content: '将大汉软件一网协同能力与智能公文、会议转记、知识助手、线上审批等大模型场景结合，面向党政机关和国企形成跨部门协同及内部数智化升级方案。'
  },
  市场监管: {
    title: '建设智慧监管与风险识别场景',
    content: '基于大汉软件市场监管全流程产品能力，叠加大模型数据分析和风险识别能力，围绕信用监管、分级分类监管、投诉处置及违规线索排查形成标准化解决方案。'
  },
  门户网站: {
    title: '推进政府门户智能化升级',
    content: '结合大汉软件政府网站群和智能门户建设经验，配置智能搜索、政策解读、AI 问答、内容推荐及多端服务能力，形成门户网站集约化与智能化升级方案。'
  },
  数字政府: {
    title: '参与数字政府底座与平台建设',
    content: '整合大汉软件一网通办、一网协同、数据要素和人工智能能力，围绕统一技术底座、知识中枢、数据共享和场景应用形成一体化数字政府解决方案。'
  }
}

const companyFitPoints = {
  人工智能: '政策涉及人工智能、大模型或智能体建设，与大汉软件已完成双备案的星汉 Galaxy 政务大模型、知识中枢和 Agent 智能体产品体系直接匹配。',
  数据要素: '政策涉及公共数据开发利用、数据治理或高质量数据集建设，与大汉软件公共数据运营资质、知识中枢平台和数据全流程治理能力高度契合。',
  一网通办: '政策涉及政务服务和“一网通办”升级，可复用大汉软件多级线上办事平台、智能咨询、政策匹配和智能办事场景的成熟建设经验。',
  一网协同: '政策涉及机关内部协同和跨部门数据流转，与大汉软件一网协同、智能公文、会议转记及线上审批能力相匹配。',
  市场监管: '政策涉及信用监管、分级分类监管或风险治理，与大汉软件市场监管全流程产品及大模型风险识别能力相匹配。',
  门户网站: '政策涉及政府网站、信息公开或公众服务入口建设，与大汉软件门户网站集约化、智能搜索和 AI 问答能力相匹配。',
  数字政府: '政策涉及数字政府整体建设，可由大汉软件的一网通办、一网协同、数据要素和人工智能能力形成一体化支撑。'
}

const trimSentence = (text, limit = 110) => {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim()
  if (normalized.length <= limit) return normalized
  return `${normalized.slice(0, limit).replace(/[，、；：\s]+$/, '')}……`
}

const ensureSentence = (text) => {
  const normalized = String(text || '').trim().replace(/[；;：:]+$/, '')
  return /[。！？]$/.test(normalized) ? normalized : `${normalized}。`
}

const isHeading = (text) => HEADING_PATTERN.test(text) && text.length <= 48

const isMeaningfulParagraph = (text) => {
  const normalized = String(text || '').trim()
  return normalized.length >= 18
    && !METADATA_PATTERN.test(normalized)
    && !/(?:联系电话|联系人：|工作日上午|工作日下午)/.test(normalized)
}

const splitSentences = (text) => String(text || '')
  .split(/(?<=[。！？；])/)
  .map(item => item.trim())
  .filter(Boolean)

const deriveTitle = (text, index) => {
  const sentence = splitSentences(text)[0] || text
  const fragment = sentence
    .replace(HEADING_PATTERN, '')
    .split(/[，。；：]/)[0]
    .trim()
  return fragment ? `要点${index + 1}：${trimSentence(fragment, 24)}` : `政策要点${index + 1}`
}

const getInterpretationInsight = (text) => {
  if (/到20\d{2}年|目标|达到|建成|不少于|以上/.test(text)) {
    return { label: '目标导向', content: '该条明确了阶段目标、覆盖范围或量化指标，是后续资源配置、项目推进和成效验收的重要依据。' }
  }
  if (/申报|奖补|补贴|支持|专项资金|模型券|算力券/.test(text)) {
    return { label: '支持方式', content: '该条释放了项目申报、资金支持或服务采购机会，需要持续跟踪主管部门后续细则和申报窗口。' }
  }
  if (/监管|规范|安全|备案|评估|审计|信用/.test(text)) {
    return { label: '合规重点', content: '该条强调制度规范、风险控制和过程留痕，相关系统建设需要同步满足数据安全、审计追溯及监管要求。' }
  }
  if (/一网通办|政务服务|办事|审批/.test(text)) {
    return { label: '服务升级', content: '该条推动政务服务从可办向好办、易办、智办升级，重点关注流程再造、数据共享和智能服务体验。' }
  }
  if (/数据|语料|知识库|模型|人工智能|智能体/.test(text)) {
    return { label: '建设重点', content: '该条的落地重点是打通数据、平台、模型与应用场景，形成可持续运营和迭代的数字化能力闭环。' }
  }
  return { label: '实施影响', content: '该条明确了具体工作方向，后续应重点关注责任主体、实施范围、时间节点及配套项目安排。' }
}

const collectCandidates = (paragraphs) => {
  const candidates = []
  let pendingHeading = ''

  paragraphs.forEach((paragraph, index) => {
    const text = String(paragraph || '').trim()
    if (!text) return
    if (isHeading(text)) {
      pendingHeading = text
      return
    }
    if (!isMeaningfulParagraph(text)) return

    candidates.push({
      index,
      text,
      title: pendingHeading || deriveTitle(text, candidates.length)
    })
    pendingHeading = ''
  })

  if (!candidates.length && paragraphs.length) {
    candidates.push({ index: 0, text: paragraphs[0], title: '政策核心内容' })
  }
  return candidates
}

const selectDistributed = (items, limit) => {
  if (items.length <= limit) return items
  const indexes = new Set()
  for (let index = 0; index < limit; index += 1) {
    indexes.add(Math.round(index * (items.length - 1) / (limit - 1)))
  }
  return [...indexes].map(index => items[index])
}

const extractTerms = (text) => DOMAIN_TERMS.filter(term => String(text || '').includes(term))

const findBestTargets = (text, candidates, tags = [], limit = 2) => {
  const searchTerms = [...new Set([...extractTerms(text), ...tags])]
  const ranked = candidates
    .map(candidate => ({
      candidate,
      score: searchTerms.reduce((score, term) => score + (candidate.text.includes(term) ? (term.length > 3 ? 3 : 2) : 0), 0)
    }))
    .sort((left, right) => right.score - left.score || left.candidate.index - right.candidate.index)

  const matched = ranked.filter(item => item.score > 0).slice(0, limit)
  const selected = matched.length ? matched : ranked.slice(0, 1)
  return selected.map(item => `paragraph-${item.candidate.index}`)
}

const parseNumberedPoints = (text) => {
  const normalized = String(text || '')
    .replace(/[；;]\s*(?=\d+[.、])/g, '\n')
    .trim()
  if (!normalized) return []

  const chunks = normalized.split(/(?=\d+[.、]\s*)/)
    .map(item => item.replace(/^\d+[.、]\s*/, '').trim())
    .filter(Boolean)

  return chunks.length > 1 || /^\d+[.、]/.test(normalized)
    ? chunks
    : [normalized]
}

const extractAnalysisSections = (analysis) => {
  const text = String(analysis || '').trim()
  if (!text) return { enterprise: [], suggestions: [] }

  const suggestionMarker = '【可落地的建议】'
  const markerIndex = text.indexOf(suggestionMarker)
  const enterpriseText = (markerIndex >= 0 ? text.slice(0, markerIndex) : text)
    .replace(/^【(?:与企业相关分析|与大汉软件相关性)】/, '')
    .trim()
  const suggestionText = markerIndex >= 0
    ? text.slice(markerIndex + suggestionMarker.length).trim()
    : ''

  return {
    enterprise: parseNumberedPoints(enterpriseText),
    suggestions: parseNumberedPoints(suggestionText)
  }
}

const createReferences = (text, candidates, tags, prefix) =>
  findBestTargets(text, candidates, tags).map((target, index) => ({
    id: `${prefix}-reference-${index + 1}`,
    label: String(index + 1),
    targets: [target]
  }))

const buildOverview = (policy, candidates) => {
  if (Array.isArray(policy?.overview) && policy.overview.length) return policy.overview

  const tags = policy?.tags?.length ? policy.tags.join('、') : '相关领域'
  const keySentences = selectDistributed(candidates, 3)
    .map(candidate => trimSentence(splitSentences(candidate.text)[0] || candidate.text, 120).replace(/[。！？；;：:]+$/, ''))
    .filter(Boolean)

  return [
    `${policy?.source || '政策发布单位'}于${policy?.publishDate || '近期'}发布该政策，核心聚焦${tags}，对相关工作的目标、任务或实施要求作出安排。`,
    keySentences.length
      ? `政策主要内容包括：${keySentences.join('；')}。`
      : '政策围绕相关领域明确了工作方向和实施要求。',
    `整体来看，该政策将推动${tags}相关能力建设和应用落地，后续需持续关注配套细则、责任分工、试点项目与采购申报机会。`
  ]
}

const buildInterpretation = (candidates) => selectDistributed(candidates, 8)
  .map((candidate, index) => {
    const sentences = splitSentences(candidate.text)
    const points = [
      { label: '核心内容', content: ensureSentence(trimSentence(sentences[0] || candidate.text, 105)) },
      getInterpretationInsight(candidate.text)
    ]
    if (sentences[1]) {
      points.splice(1, 0, { label: '具体安排', content: ensureSentence(trimSentence(sentences[1], 105)) })
    }

    return {
      key: `paragraph-${candidate.index}`,
      title: (candidate.title || `政策要点${index + 1}`).replace(/^要点\d+：/, `要点${index + 1}：`),
      points: points.slice(0, 3)
    }
  })

const buildEnterpriseAnalysis = (policy, candidates, parsedPoints) => {
  const tags = policy?.tags || []
  const points = [...parsedPoints]

  if (points.length < 2) {
    for (const tag of tags) {
      const fit = companyFitPoints[tag]
      if (fit && !points.some(point => point.includes(tag))) points.push(fit)
      if (points.length >= 3) break
    }
  }

  if (!points.length) {
    points.push('政策提出的建设与应用方向，可结合大汉软件现有数字政府产品体系、全国项目经验和本地化服务能力，进一步识别平台建设、运营服务及场景升级机会。')
  }

  const companyFallbacks = [
    '大汉软件具备从顶层规划、平台开发、模型训练、项目实施到长期运维和安全保障的全链条交付能力，可将政策任务转化为一体化建设及运营方案。',
    '大汉软件在全国多地设有分支机构并积累了政务标杆案例，可结合政策发布地区开展本地客户对接、生态合作和示范项目复制。'
  ]
  for (const fallback of companyFallbacks) {
    if (points.length >= 3) break
    points.push(fallback)
  }

  return points.slice(0, 5).map((content, index) => ({
    id: `enterprise-${index + 1}`,
    number: index + 1,
    content,
    references: createReferences(content, candidates, tags, `enterprise-${index + 1}`)
  }))
}

const parseSuggestion = (text, index) => {
  const separatorIndex = text.search(/[:：]/)
  if (separatorIndex > 0 && separatorIndex <= 24) {
    return {
      title: text.slice(0, separatorIndex).trim(),
      content: text.slice(separatorIndex + 1).trim()
    }
  }
  return { title: `行动建议${index + 1}`, content: text }
}

const buildSuggestions = (policy, candidates, parsedSuggestions) => {
  const tags = policy?.tags || []
  const suggestions = parsedSuggestions.map(parseSuggestion)

  if (!suggestions.length) {
    for (const tag of tags) {
      const suggestion = capabilitySuggestions[tag]
      if (suggestion && !suggestions.some(item => item.title === suggestion.title)) {
        suggestions.push(suggestion)
      }
      if (suggestions.length >= 3) break
    }
  }

  const fallbacks = [
    {
      title: '建立政策机会与项目跟踪清单',
      content: '安排专人跟踪发布单位、主管部门及重点地区的实施细则、试点名单、申报通知和采购计划，按客户、场景、预算、时间节点维护可持续更新的项目机会清单。'
    },
    {
      title: '形成行业化解决方案和标杆材料',
      content: '结合大汉软件现有产品、全国分支机构和标杆案例，把政策要求转化为功能清单、实施路径、演示场景及客户沟通材料，提升项目对接和方案响应效率。'
    },
    {
      title: '主动对接主管部门与生态伙伴',
      content: '围绕政策明确的建设任务，对接发布单位、数据和政务服务主管部门、本地高校及信创生态伙伴，推动联合申报、试点验证或项目合作。'
    }
  ]

  for (const fallback of fallbacks) {
    if (suggestions.length >= 3) break
    suggestions.push(fallback)
  }

  return suggestions.slice(0, 5).map((suggestion, index) => {
    const source = `${suggestion.title} ${suggestion.content}`
    return {
      id: `suggestion-${index + 1}`,
      number: index + 1,
      title: suggestion.title,
      content: suggestion.content,
      references: createReferences(source, candidates, tags, `suggestion-${index + 1}`)
    }
  })
}

export const buildPolicyAnalysis = (policy, paragraphs) => {
  const candidates = collectCandidates(paragraphs)
  const parsed = extractAnalysisSections(policy?.analysis)

  return {
    overview: buildOverview(policy, candidates),
    interpretation: buildInterpretation(candidates),
    enterprise: buildEnterpriseAnalysis(policy, candidates, parsed.enterprise),
    suggestions: buildSuggestions(policy, candidates, parsed.suggestions)
  }
}
