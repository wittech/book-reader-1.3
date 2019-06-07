/*
 * @Author: hannianqi
 * @Date: 2019-04-08 11:31:06
 * @Last Modified by: 韩念琪 [18112596]
 * @Last Modified time: 2019-06-07 14:03:42
 *
 * 基于 BaseFetch 的业务 Fetch
 */

import { BaseFetch } from '@src/kits';

/** 可选配置项参数 */
interface IOpts {

}

/**
 * 继承 BaseFetch 类 的业务 Fetch 类
 */
class Fetch extends BaseFetch {
  opts: IOpts
  constructor(middlewares: BaseFetch.middleware[] = [], opts: IOpts = {}) {
    super(middlewares)
    this.opts = opts
  }

  /**
   * GET
   * @param uri
   * @param query
   * @param opts
   */
  get<T>(uri: string, query: object = {}, opts: IOpts = {}) {
    return this.common<T>(
      uri,
      { method: 'GET', data: query },
      { ...this.opts, ...opts }
    )
  }

  /**
   * POST
   * @param uri
   * @param data
   * @param opts
   */
  post<T>(uri: string, data?: object, opts: IOpts = {}) {
    return this.common<T>(
      uri,
      { method: 'POST', data },
      { ...this.opts, ...opts }
    )
  }

  /**
   * PUT
   * @param uri
   * @param data
   * @param opts
   */
  put<T>(uri: string, data: object = {}, opts: IOpts = {}) {
    return this.common<T>(
      uri,
      { method: 'PUT', data },
      { ...this.opts, ...opts }
    )
  }

  /**
   * DELETE
   * @param uri
   * @param data
   * @param opts
   */
  delete<T>(uri: string, data: object = {}, opts: IOpts = {}) {
    return this.common<T>(
      uri,
      { method: 'DELETE', data },
      { ...this.opts, ...opts }
    )
  }
}

const fetch = new Fetch()

export default fetch
