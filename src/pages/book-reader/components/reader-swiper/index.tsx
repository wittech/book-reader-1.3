import Taro, { useState, useRef, useLayoutEffect, useEffect } from '@tarojs/taro'
import { View, Image, Swiper, SwiperItem, Block } from '@tarojs/components'
import { from, Subject } from 'rxjs';
import { map, mapTo, flatMap, merge, mergeAll, startWith, withLatestFrom, tap } from 'rxjs/operators';
import { useObservable, useEventCallback } from 'rxjs-hooks-taro';
import webapi, { IChapter } from './webapi';
import './index.less'

interface IProps {
  bookId: string;
}

const magicSplitSign = '#QAQ#';

function BookSwiper(props: IProps) {
  const { bookId } = props;
  const [heightList$] = useState(new Subject<number[]>())
  const chapterList = useObservable(() => from(webapi.getChapterListById(bookId))
    .pipe(
      map(({ res }) => res),
    )
    , []);
  const [changePage, content] = useEventCallback((event$, input$) => event$
    .pipe(
      tap(data => console.log('changePage', data)),
      withLatestFrom(input$),
      map(([_, [chapterList]]) => from(webapi.getContentByChapterId(chapterList[0].chapterId))),
      mergeAll(),
      map(({ res }) => res.split(magicSplitSign))
    ),
    [],
    [chapterList]
  );

  const [paddingHeight, totalPage, onePageLine] = useObservable(() => heightList$
    .pipe(
      map(([swiperHeihgt, contentHeihgt]) => {
        const paddingHeight = (swiperHeihgt % 25 + 25) / 2;
        const onePageLine = (swiperHeihgt / 25 | 0) - 1;
        const totaLine = contentHeihgt / 25;
        const totalPage = Math.ceil(totaLine / onePageLine);
        console.log('paddingHeight', paddingHeight)
        console.log('onePageLine', onePageLine)
        console.log('totalPage', totaLine)
        console.log('totalPage', totalPage)
        return [paddingHeight, totalPage, onePageLine]
      })
    ),
    [0, 0, 0]
  )

  useLayoutEffect(() => {
    Promise.all(['.swiper-wrapper', '.content-wrapper-sample'].map(selector => new Promise<any>((reslove, reject) => {
      Taro
        .createSelectorQuery()
        .in(this.$scope)
        .select(selector)
        .boundingClientRect()
        .exec(function (res) {
          res[0] && reslove(res[0].height)
        })
    }))).then(
      (heightList) => heightList$.next(heightList)
    );
  }, [content])

  const pageNumList = [...(new Array(totalPage).keys())];
  return (
    <Block>
      <View className="content-wrapper-sample">
        {
          content.map((text, index) => <View className="text-paragraph" key={index}>{text}</View>)
        }
      </View>
      <Swiper
        circular={true}
        className="swiper-wrapper"
        style={{
          padding: `${paddingHeight}PX 0`
        }}
        onClick={(e) => {
          changePage(e);
          console.log('asdfhasdhfhasdfhash')
        }}
      >
        {pageNumList.map((pageNum) => (
          <SwiperItem key={pageNum}>
            <View
              style={{
                transform: `translateY(-${pageNum * onePageLine * 25}px)`
              }}
              className="content-wrapper"
            >
              {
                content.map((text, index) => <View className="text-paragraph" key={index}>{text}</View>)
              }
            </View>
          </SwiperItem>
        ))}
      </Swiper>
    </Block>
  )
}

export default BookSwiper;
