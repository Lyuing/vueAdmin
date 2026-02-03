// hooks/usePagination.ts
import { reactive, computed } from 'vue'
import { type PageResponse } from '../types/api'

// 实例化参数
interface PaginationOptions {
  currentPage?: number
  pageSize?: number
  totalElements?: number
  pageSizes?: number[]
  layout?: string
  onChange?: (params: PageParams) => void
}

type ChangeType = 'currentPage' | 'pageSize' | 'reset'

// 回调数据
export interface PageParams {
  currentPage: number
  pageSize: number
  changeType?: ChangeType
}

export function usePagination(options: PaginationOptions = {}) {
  const {
    currentPage = 1,
    pageSize = 10,
    totalElements = 0,
    pageSizes = [10, 20, 50, 100],
    // layout = 'totalElements, sizes, prev, pager, next, jumper',
    layout = 'total, totalElements, sizes, prev, pager, next',
    onChange
  } = options

  // 分页参数
  const pagination = reactive({
    currentPage,
    pageSize,
    totalElements,
    totalPage: 0,
    pageSizes,
    layout
  })

  // 是否已结束
  const isFinished = computed(() => pagination.totalPage <= pagination.currentPage)

  // 获取分页参数 并回传
  const getPaginationParams = (type: ChangeType): PageParams => ({
    currentPage: pagination.currentPage,
    pageSize: pagination.pageSize,
    changeType: type
  })

  // 序列化 分页参数
  const serializeParams = () => ({
    currentPage: pagination.currentPage,
    pageSize: pagination.pageSize
  })

  /**
   * 方法
   */
  // 改变页码
  const handleCurrentChange = (val: number) => {
    pagination.currentPage = val
    onChange?.(getPaginationParams('currentPage'))
  }

  // 改变每页条数
  const handleSizeChange = (val: number) => {
    pagination.pageSize = val
    pagination.currentPage = 1
    onChange?.(getPaginationParams('pageSize'))
  }

  // 重置分页
  const resetPagination = () => {
    pagination.currentPage = 1
    pagination.pageSize = pageSize
    onChange?.(getPaginationParams('reset'))
  }

  // 同步分页参数
  const updatePagination = (params: PageResponse) => {
    // 去掉 pageSize 防止后端给出错误的值
    const { currentPage, totalElements, totalPage } = params
    // console.log('updatePagination', { ...params })
    pagination.currentPage = currentPage
    // pagination.pageSize = pageSize
    pagination.totalElements = totalElements || 0
    pagination.totalPage = totalPage || 0
  }

  return {
    pagination,
    isFinished,
    handleCurrentChange,
    handleSizeChange,
    resetPagination,
    updatePagination,
    serializeParams
  }
}

/**
 * 使用案例

<el-pagination
  background
  :current-page="pagination.currentPage"
  :totalElements="pagination.totalElements"
  :page-sizes="pagination.pageSizes"
  :page-size="pagination.pageSize"
  :layout="pagination.layout"
  @current-change="handleCurrentChange"
  @size-change="handleSizeChange"
/>


  
import { type PageRequest } from '@/types/api.ts'
import { usePagination } from '@/composables/usePagination'
const {
  pagination,             // 分页参数 - 赋值给 el-pagination
  isFinished,             // 是否已结束
  handleCurrentChange,    // 当前页码改变时调用 - 赋值给 el-pagination 回调
  handleSizeChange,       // 每页数量改变时调用 - 赋值给 el-pagination 回调
  serializeParams,        // 获取分页参数 - 业务逻辑接口取用
  updatePagination,       // 更新分页参数 - 接口数据就位后手动更新分页数据
  resetPagination         // 重置分页参数 - 业务逻辑中重置等操作 手动调用
} = usePagination({
  onChange: fetchData     // 分页参数改变时触发 - 用来通知调用请求
})

const loading = ref(false)
const tableData = ref<any[]>([])
async function fetchData () {
  loading.value = true
  try {
    const response = await requestList({
      keyword: '业务字段',
      ...serializeParams()
    })
    tableData.value = response.list
    updatePagination(response)    // 更新分页参数
  } catch (error) {
    console.error('请求失败:', error)
  } finally {
    loading.value = false
  }
}

 */
