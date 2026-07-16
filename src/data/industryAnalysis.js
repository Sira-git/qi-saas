const FEATURED_TITLE = '建设开放共享安全的全国一体化数据市场'

const featuredOverview = '本文由国家信息中心专家撰写，围绕全国一体化数据市场展开系统性分析。首先明确数据要素作为第五大生产要素的战略定位，结合2022年、2026年国家级顶层政策，梳理近十年我国数据市场发展完整脉络；从交易载体、数据资源、流通服务机构、新型数据基础设施四大维度，论证当前建设已具备成熟落地基础；深度剖析场内场外市场协同、多层次交易场所搭建、三类流通机构分工、数据基建短板四大核心发展难题；最后围绕开放、共享、安全三大主线，给出中长期落地实施路径。全文立足“十五五”数字中国建设目标，是解读国内公共数据授权运营、数据流通、政务数据市场化的权威政策参考，与大汉软件数据要素、政务大数据、政务大模型、数字政府全业务高度契合。'

const featuredCorePoints = [
  '国家将一体化数据市场作为“十五五”数字中国核心任务，持续推动公共数据资源市场化、产品化。大汉具备公共数据运营资质与政务数据全链路治理能力，高度契合政策发展主线，全国多地分支机构可承接省市数据市场配套数字化项目。',
  '国内数据交易规模持续高速增长，市场划分数据交易所、流通平台、数据商三类主体，大汉可同时承担政务数据流通平台与行业数据商角色，开发政务、民生、监管标准化数据类产品，对接各地数据交易载体落地合作。',
  '全国大力布局可信数据空间、一体化算力、跨域数据网络等新型数字基建，但普遍存在标准不统一、算力适配差、区域发展不均衡问题。大汉自研轻量化政务大模型、统一数据底座与安全管控体系，能适配各地尤其是市县低算力环境，弥补区域数据建设短板。',
  '行业鼓励场内场外两种交易模式协同发展，搭建国家、区域、行业多层级数据交易体系。政务数据产品具备差异化竞争力，大汉可分省、市、区县提供分级数据流通解决方案，避免同质化平台建设。',
  '发展重点包含公共数据共享授权、行业数据集开发、数据全流程安全合规等板块。大汉知识中枢平台与星汉政务大模型组合可形成数据归集治理、语料数据打造、AI价值挖掘、安全审计一体化闭环方案，覆盖市场核心需求。',
  '政策导向破除区域数据流通壁垒、简化交易流程、健全数据安全全流程管控体系。大汉跨区域政务项目落地经验可支撑跨省数据互通工程，全栈信创安全底座能够满足数据交易全流程合规监管要求。'
]

const cleanText = (value) => String(value || '').replace(/\s+/g, ' ').trim()

const splitCorePoints = (analysis) => cleanText(analysis)
  .replace(/^【核心要点】/, '')
  .split(/(?=[①②③④⑤⑥⑦⑧⑨⑩])/)
  .map((point) => point.replace(/^[①②③④⑤⑥⑦⑧⑨⑩]/, '').replace(/[；。]\s*$/, '').trim())
  .filter(Boolean)

const createGenericOverview = (item) => {
  const content = cleanText(item.content)
  const excerpt = content.length > 520 ? `${content.slice(0, 520)}……` : content
  return `本文由${item.source}发布，围绕“${item.title}”展开行业信息梳理。${excerpt}`
}

export const getIndustryAnalysis = (item) => {
  if (item.title === FEATURED_TITLE) {
    return {
      overview: featuredOverview,
      coreTitle: '1. 顶层战略层面匹配',
      corePoints: featuredCorePoints
    }
  }

  const points = splitCorePoints(item.analysis)
  return {
    overview: createGenericOverview(item),
    coreTitle: '1. 与企业业务的核心关联',
    corePoints: points.length ? points : ['原文聚焦行业发展趋势，可结合企业现有业务能力进一步研判项目机会与落地路径。']
  }
}
