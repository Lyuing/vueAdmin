// 防抖函数
// 在规定时间内只执行一次，如果在规定时间内再次触发，则重新计时
/**
 * 防抖函数 - 在规定时间内只执行一次，如果在规定时间内再次触发，则重新计时
 * @param func 需要防抖的函数
 * @param wait 需要等待的时间（毫秒）
 * @param immediate 是否立即执行，true表示立即执行，false表示等待结束后执行
 * @returns 返回处理后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 500,
  immediate?: boolean
): (this: ThisParameterType<T>, ...args: Parameters<T>) => ReturnType<T> {
  let timeout: ReturnType<typeof setTimeout> | null = null
  let result: ReturnType<T>

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) {
        result = func.apply(this, args)
      }
    }

    const callNow = immediate && timeout === null

    if (timeout !== null) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)

    if (callNow) {
      result = func.apply(this, args)
    }

    return result
  }
}

// 节流函数
// 在规定时间内最多执行一次，确保函数在一定时间段内只执行一次
/**
 * 节流函数 - 在规定时间内最多执行一次，确保函数在一定时间段内只执行一次
 * @param func 需要节流的函数
 * @param wait 间隔时间（毫秒）
 * @param options 选项配置
 * @param options.leading 开始时是否执行，默认为 true
 * @param options.trailing 结束时是否执行，默认为 true
 * @returns 返回处理后的函数，带有cancel方法用于取消延迟执行
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options?: { leading?: boolean; trailing?: boolean }
): ((this: ThisParameterType<T>, ...args: Parameters<T>) => ReturnType<T>) & {
  cancel: () => void
} {
  let timeout: ReturnType<typeof setTimeout> | null = null
  let result: ReturnType<T>
  let previous = 0
  const { leading = true, trailing = true } = options || {}

  const throttled = function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    const now = Date.now()
    if (!previous && !leading) {
      previous = now
    }
    const remaining = wait - (now - previous)

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      result = func.apply(this, args)
    } else if (!timeout && trailing) {
      timeout = setTimeout(() => {
        previous = !leading ? 0 : Date.now()
        timeout = null
        result = func.apply(this, args)
      }, remaining)
    }
    return result
  }

  // 取消节流函数
  throttled.cancel = function () {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    previous = 0
  }

  return throttled
}
