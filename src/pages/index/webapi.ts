import fetch from "@src/fetch";

export interface IBook {
  bookName: string;
  bookId: number;
  bookCover: string;
  author: string;
  desc: string;
}

class WebApi {
  /** 获取图书列表 */
  getBookList() {
    return fetch.get<IBook[]>('http://mock.bddiagram.cn/mock/34/novel/getBookList')
  }
}

export default new WebApi;
