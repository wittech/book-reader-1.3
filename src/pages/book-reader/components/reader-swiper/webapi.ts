import fetch from "@src/fetch";

export interface IChapter {
  chapterId: string;
  chapterName: string;
}

class WebApi {
  /**
   * @description 根据书籍ID获取章节列表
   * @param { string } bookId
   */
  getChapterListById(bookId: string) {
    return fetch.get<IChapter[]>('http://mock.bddiagram.cn/mock/34/novel/getChapterListById', {
      bookId
    })
  }

  /**
   * @description 根据章节ID获取章节内容
   * @param { string } chapterId
   */
  getContentByChapterId(chapterId: string) {
    return fetch.get<string>('http://mock.bddiagram.cn/mock/34/novel/getContentByChapterId', {
      chapterId
    })
  }
}

export default new WebApi;
