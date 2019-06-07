/*
 * @Author: hannianqi
 * @Date: 2019-04-03 20:03:23
 * @Last Modified by: 韩念琪 [18112596]
 * @Last Modified time: 2019-06-07 14:22:03
 *
 * 封装基于 Taro 封装的通用 BaseFetch 类
 */

import Taro from '@tarojs/taro';


const __DEV__ = process.env.NODE_ENV === "development";

/** 返回数据 泛型定义 */
interface IResponse<R> {
  data: R
  msg: string
  code: string | number
}

/** 对外返回的数据结构 */
interface IResult<T> {
  err: Error
  res: T
  code: string | number | RequestSign
}

/** 请求结果标识枚举类 */
enum RequestSign {
  /** 接口异常 */
  EXCEPTION,
  /** 业务异常 */
  BUSINESS_EXCEPTION,
  /** 请求成功 */
  SUCCESS
}

/** 中间件全局 state */
interface middlewareState<T> {
  /** 中间件调用链回溯阶段会添加 ret字段 */
  ret?: IResult<T>
  /** state 可以扩展自定义字段 */
  [key: string]: any
}

namespace BaseFetch {
  /** 中间件函数 */
  export type middleware<T = any> = (
    next: (
      requestConfig: Taro.request.Param,
      state: middlewareState<T>
    ) => Promise<any>
  ) => (
    requestConfig: Taro.request.Param,
    state: middlewareState<T>
  ) => Promise<any>
}

/**
 * 基础 fetch 类，支持中间件机制
 */
class BaseFetch {
  /** 请求结果标识枚举类 */
  static readonly RequestSign = RequestSign
  /** 最大请求超时时间 */
  private readonly NETWORK_TIMEOUT: number = 5

  /** axios 请求基础参数 */
  private readonly requestConfig: Partial<Taro.request.Param> = {
    method: 'GET'
  }

  /** 请求调用链 */
  private requestChain: <T>(
    requestConfig: Taro.request.Param,
    state: middlewareState<T>
  ) => Promise<any>

  constructor(
    /** 中间件函数数组 */
    private readonly middlewares: BaseFetch.middleware<any>[] = []
  ) {
    this.requestChain = this.applyMiddlewares()
    this.common = this.common.bind(this)
  }

  /**
   * 实现中间件调用链
   */
  private applyMiddlewares<T = any>() {
    const finalMiddleware = async (
      requestConfig: Taro.request.Param,
      state: middlewareState<T>
    ) => {
      const result = await Promise.race([
        this.request(requestConfig),
        this.requestTimeout()
      ])
      state.ret = result
      return result
    }
    return this.middlewares.reduceRight(
      (chain, middleware) => middleware(chain),
      finalMiddleware
    )
  }

  /** 请求超时方法 */
  private requestTimeout(): Promise<IResult<any>> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          res: null,
          err: new Error('请求超时'),
          code: RequestSign.EXCEPTION
        })
      }, this.NETWORK_TIMEOUT * 1000)
    })
  }

  /**
   * 通用的系统增加前缀的 log: [system] ...
   * @param args
   */
  private log(...args: any[]) {
    console.log('[system]', ...args)
  }

  /**
   * 格式化 axios 返回值
   */
  private async request<T = any>(
    requestConfig: Taro.request.Param
  ): Promise<IResult<T>> {
    if (__DEV__) {
      this.log('HTTP REQUEST=>' + requestConfig.url)
      this.log('     REQUEST body =>', requestConfig)
    }
    const requestResponse = Taro.request<IResponse<T>>(requestConfig)
    const { data: responseData } = await requestResponse;
    const { code, data, msg } = responseData
    const result = {
      res: null,
      err: null,
      code
    }
    if (code === '000000') {
      result.res = data
      if (__DEV__) {
        this.log('     HTTP RESPONSE', data)
      }
    } else {
      result.err = new Error(msg)
    }

    return result
  }

  /**
   * 基础 fetch 组件
   * @param urlPath 输入url等
   * @param init 初始化http header信息等
   * @param state 中间件全局 state
   */
  async common<T>(
    urlPath: string,
    init: Partial<Taro.request.Param> = {},
    state: middlewareState<T> = {}
  ) {

    /** 请求参数 */
    const requestConfig: Taro.request.Param = {
      ...this.requestConfig,
      url: urlPath,
      ...init
    }

    await this.requestChain(requestConfig, state)
    return state.ret
  }
}

export default BaseFetch
