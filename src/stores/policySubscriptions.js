import { defineStore } from 'pinia'

const STORAGE_KEY = 'qi_policy_subscription_strategies'

const defaultStrategies = [
  {
    id: 'strategy-1',
    region: '江苏省',
    target: '企业',
    policyType: '政策法规',
    industry: '信息传输、软件和信息技术服务业',
    topic: '科技创新',
    tags: [],
  },
  {
    id: 'strategy-2',
    region: '国家',
    target: '企业',
    policyType: '政策法规',
    industry: '信息传输、软件和信息技术服务业',
    topic: '科技创新',
    tags: ['数据资源', '数据安全'],
  },
  {
    id: 'strategy-3',
    region: '国家',
    target: '企业',
    policyType: '政策法规',
    industry: '信息传输、软件和信息技术服务业',
    topic: '数字化转型',
    tags: ['AI创新'],
  },
]

const cloneDefaults = () => defaultStrategies.map(strategy => ({
  ...strategy,
  tags: [...strategy.tags],
}))

const loadStrategies = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return cloneDefaults()
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : cloneDefaults()
  } catch {
    return cloneDefaults()
  }
}

export const usePolicySubscriptionsStore = defineStore('policySubscriptions', {
  state: () => ({
    strategies: loadStrategies(),
  }),
  actions: {
    persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.strategies))
    },
    addStrategy(strategy) {
      this.strategies.push({
        ...strategy,
        id: strategy.id || `strategy-${Date.now()}`,
        region: strategy.region === '全国' ? '国家' : strategy.region,
        tags: Array.isArray(strategy.tags) ? strategy.tags : strategy.tag ? [strategy.tag] : [],
      })
      this.persist()
    },
    removeStrategy(index) {
      this.strategies.splice(index, 1)
      this.persist()
    },
  },
})
