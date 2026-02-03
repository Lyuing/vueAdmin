// hooks/usePaginationWithSearch.ts
import { ref, type Ref } from 'vue'
import { usePagination, type PageParams } from './usePagination'
import { type PageResponse } from '../types/api'

// 通用搜索参数接口
interface SearchParams {
  [key: string]: any
}

// Hook 配置选项
interface UsePaginationWithSearchOptions<T extends SearchParams, R = any> {
  // 搜索参数（响应式对象）
  searchParams: T
  // 请求函数
  fetchFunction: (params: any) => Promise<PageResponse>
  // 请求参数转换函数（可选）
  transformRequest?: (params: any) => any
  // 数据转换函数（可选）
  transformResponse?: (response: any) => PageResponse & { list: R[] }
  // 默认分页大小
  defaultPageSize?: number
  // 是否立即执行初始请求
  immediate?: boolean
}

export function usePaginationWithSearch<T extends SearchParams, R = any>(
  options: UsePaginationWithSearchOptions<T, R>
) {
  const {
    searchParams,
    fetchFunction,
    transformRequest,
    transformResponse,
    defaultPageSize = 10,
    immediate = true
  } = options

  // 数据列表
  const dataList = ref<R[]>([]) as Ref<R[]>

  // 是否正在加载
  const loading = ref(false)
  // 使用基础的分页 Hook
  const {
    pagination,
    handleCurrentChange,
    handleSizeChange,
    resetPagination,
    updatePagination,
    serializeParams
  } = usePagination({
    pageSize: defaultPageSize,
    onChange: handlePageChange
  })

  // 分页变化处理函数
  async function handlePageChange(params: PageParams) {
    await fetchData(params)
  }

  // 获取完整的请求参数
  function getRequestParams() {
    const params = {
      ...serializeParams(),
      ...searchParams
    }
    return transformRequest ? transformRequest(params) : params
  }

  // 执行请求
  async function fetchData(params?: PageParams) {
    try {
      loading.value = true
      const requestParams = getRequestParams()
      const response = await fetchFunction(requestParams)

      // 使用转换函数或默认处理
      if (transformResponse) {
        const transformed = transformResponse(response)
        dataList.value = transformed.list || []
        updatePagination(transformed)
      } else {
        // 默认处理逻辑
        dataList.value = (response.list || []) as R[]
        updatePagination(response)
      }
    } finally {
      loading.value = false
    }
  }

  // 重置搜索
  function handleReset() {
    // 重置搜索参数
    Object.keys(searchParams).forEach(key => {
      const value = searchParams[key]

      // 根据数据类型设置默认值
      if (Array.isArray(value)) {
        Object.assign(searchParams, { [key]: [] })
      } else if (typeof value === 'string') {
        Object.assign(searchParams, { [key]: '' })
      } else if (typeof value === 'number') {
        Object.assign(searchParams, { [key]: null })
      } else if (typeof value === 'boolean') {
        Object.assign(searchParams, { [key]: false })
      } else {
        Object.assign(searchParams, { [key]: null })
      }
    })

    // 重置分页并触发请求
    resetPagination()
  }

  // 搜索方法（重置页码到第一页）
  function handleSearch() {
    pagination.currentPage = 1
    fetchData()
  }

  // 手动刷新数据（保持当前分页状态）
  async function refreshData() {
    await fetchData()
  }

  // 如果有需要，立即执行初始请求
  if (immediate) {
    // 使用 nextTick 确保组件已挂载
    Promise.resolve().then(() => {
      fetchData()
    })
  }

  return {
    // 分页相关
    pagination,
    handleCurrentChange,
    handleSizeChange,

    // 数据相关
    dataList,
    loading,

    // 操作相关
    handleSearch,
    handleReset,
    refreshData,
    // fetchData,

    // 参数相关
    // searchParams,
    getRequestParams
  }
}

/**
 * 使用案例

<el-button type="primary" @click="handleSearch">搜索</el-button>
<el-button @click="handleReset">重置</el-button>

<el-pagination
  background
  :current-page="pagination.currentPage"
  :total="pagination.totalElements"
  :page-sizes="pagination.pageSizes"
  :page-size="pagination.pageSize"
  :layout="pagination.layout"
  @current-change="handleCurrentChange"
  @size-change="handleSizeChange"
/>


import { reactive } from 'vue'
import { usePaginationWithSearch } from '@/composables/usePaginationPro'
import { getUsersList } from '@/api/user'


// 初始化搜索参数
interface UserSearchParams {
  keyword: string
  status: string
}
const searchParams = reactive<UserSearchParams>({
  keyword: '',
  status: ''
})

// 初始化分页
const {
  pagination,
  loading,
  dataList: userList,     // 业务数据 列表
  handleCurrentChange,    // 分页页码改变
  handleSizeChange,       // 分页大小改变
  handleSearch,           // 筛选框 搜索方法
  handleReset,            // 筛选框 重置搜索
  refreshData             // 手动刷新
} = usePaginationWithSearch<
  UserSearchParams,       // 搜索参数类型
  User                    // 返回的业务数据类型
>({
  searchParams,
  fetchFunction: getUsersList,
  defaultPageSize: 10,
  immediate: true,        // 页面加载时自动请求，若不需要，请设置为 false，并手动调用 refreshData
  transformRequest: (params) => {
    // 可选
    // 如果需要转换请求参数，例如重命名字段或添加额外参数
    // params 是原始查询参数 返回值是请求体中参数
    return {
      ...params,
      searchKeyword: params.keyword, // 重命名 keyword 为 searchKeyword
      statusFilter: params.status     // 重命名 status 为 statusFilter
    }
  },
  transformResponse: (response) => {
    // 可选
    // 如果后端返回的数据结构不符合预期，可以在这里转换
    return {
      list: response.data?.records || [],
      currentPage: response.data?.current,
      pageSize: response.data?.size,
      totalElements: response.data?.total
    }
  }
})


// 其他业务场景需要更新数据的场景，
// 如：新建完用户、删除用户等
// 调用 refreshData
async function onCreatedUser () {
  await refreshData()
},


 */
