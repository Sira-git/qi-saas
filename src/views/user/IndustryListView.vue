<template>
  <div class="industry-list-page">
    <TopNav />

    <main class="page-content">
      <div class="page-container">
        <header class="page-header">
          <h1>行业动态</h1>
          <span class="count-badge">共 {{ filteredIndustries.length }} 条</span>
        </header>

        <section class="filter-bar" aria-label="行业动态筛选">
          <a-select
            v-model:value="selectedBusinessField"
            class="business-select"
            :options="businessFieldOptions"
          />
          <a-input-search
            v-model:value="searchKeyword"
            class="title-search"
            placeholder="根据标题搜索"
            enter-button
            allow-clear
          />
        </section>

        <section v-if="paginatedIndustries.length" class="industry-list" aria-live="polite">
          <article v-for="item in paginatedIndustries" :key="item.id" class="industry-card">
            <div class="industry-card-header">
              <div class="business-tags">
                <span
                  v-for="field in item.businessFields"
                  :key="field"
                  class="business-tag"
                  :style="getTagStyle(field)"
                >
                  {{ field }}
                </span>
              </div>
              <time class="publish-date" :datetime="item.publishDate">{{ item.publishDate }}</time>
            </div>

            <h2 class="industry-title">{{ item.title }}</h2>
            <p class="industry-content" :title="item.content">{{ item.content || '暂无正文内容' }}</p>

            <footer class="industry-footer">
              <span class="industry-source"><FileTextOutlined />{{ item.source }}</span>
              <button class="detail-link" type="button" @click="openSource(item)">
                查看详情 <ArrowRightOutlined />
              </button>
            </footer>
          </article>
        </section>

        <a-empty v-else class="empty-state" description="暂无符合条件的行业动态" />

        <div v-if="filteredIndustries.length > pageSize" class="pagination-wrap">
          <a-pagination
            v-model:current="currentPage"
            v-model:page-size="pageSize"
            :total="filteredIndustries.length"
            :page-size-options="['10', '20', '30']"
            show-size-changer
            show-quick-jumper
            @show-size-change="handlePageSizeChange"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { ArrowRightOutlined, FileTextOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import TopNav from '@/components/TopNav.vue'
import { industryBusinessFields, industryRecords } from '@/data/industryRecords'

const ALL_FIELDS = '全部业务领域'
const router = useRouter()

const selectedBusinessField = ref(ALL_FIELDS)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const businessFieldOptions = [
  { label: ALL_FIELDS, value: ALL_FIELDS },
  ...industryBusinessFields.map((field) => ({ label: field, value: field }))
]

const filteredIndustries = computed(() => {
  const keyword = searchKeyword.value.trim().toLocaleLowerCase('zh-CN')

  return industryRecords.filter((item) => {
    const matchesField = selectedBusinessField.value === ALL_FIELDS
      || item.businessFields.includes(selectedBusinessField.value)
    const matchesTitle = !keyword || item.title.toLocaleLowerCase('zh-CN').includes(keyword)

    return matchesField && matchesTitle
  })
})

const paginatedIndustries = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredIndustries.value.slice(start, start + pageSize.value)
})

const tagColors = {
  人工智能: { color: '#52c41a', borderColor: '#95de64', background: '#f6ffed' },
  一网通办: { color: '#1677ff', borderColor: '#91caff', background: '#e6f4ff' },
  一网协同: { color: '#722ed1', borderColor: '#d3adf7', background: '#f9f0ff' },
  数据要素: { color: '#fa8c16', borderColor: '#ffd591', background: '#fff7e6' },
  门户网站: { color: '#13a8a8', borderColor: '#87e8de', background: '#e6fffb' },
  市场监管: { color: '#eb2f96', borderColor: '#ffadd2', background: '#fff0f6' }
}

const getTagStyle = (field) => tagColors[field] || {
  color: '#64748b',
  borderColor: '#cbd5e1',
  background: '#f8fafc'
}

const handlePageSizeChange = () => {
  currentPage.value = 1
}

const openSource = (item) => {
  router.push({ name: 'IndustryDetail', params: { id: item.id } })
}

watch([selectedBusinessField, searchKeyword], () => {
  currentPage.value = 1
})
</script>

<style scoped>
.industry-list-page {
  min-height: 100vh;
  padding-top: 64px;
  background: #f3f5f8;
}

.page-content {
  padding: 28px 0 48px;
}

.page-container {
  width: min(1480px, calc(100% - 64px));
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  color: #1f2937;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
}

.count-badge {
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 12px;
  color: #389e0d;
  font-size: 13px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 16px;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 22px;
}

.business-select {
  width: 200px;
  flex: 0 0 200px;
}

.title-search {
  width: min(680px, calc(100% - 214px));
}

.industry-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.industry-card {
  padding: 24px 28px 22px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.industry-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
}

.industry-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  min-height: 28px;
  margin-bottom: 12px;
}

.business-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.business-tag {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  font-size: 12px;
  line-height: 22px;
  border: 1px solid;
  border-radius: 5px;
}

.publish-date {
  flex: 0 0 auto;
  padding-top: 3px;
  color: #9ca3af;
  font-size: 13px;
}

.industry-title {
  margin: 0 0 12px;
  color: #222b3a;
  font-size: 16px;
  font-weight: 600;
  line-height: 22px;
}

.industry-content {
  max-width: calc(100% - 24px);
  margin: 0 0 20px;
  overflow: hidden;
  color: #687386;
  font-size: 14px;
  line-height: 22px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.industry-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px dashed #e5e7eb;
}

.industry-source {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  color: #737f91;
  font-size: 13px;
}

.detail-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 0;
  color: #1677ff;
  font-size: 13px;
  font-weight: 500;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.detail-link:hover {
  color: #0958d9;
}

.empty-state {
  margin-top: 48px;
  padding: 60px 20px;
  background: #fff;
  border-radius: 12px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  padding: 28px 0 0;
}

@media (max-width: 900px) {
  .page-container {
    width: min(100% - 32px, 1480px);
  }

  .filter-bar {
    align-items: stretch;
    flex-direction: column;
  }

  .business-select,
  .title-search {
    width: 100%;
    flex-basis: auto;
  }

  .industry-card {
    padding: 20px;
  }
}
</style>
