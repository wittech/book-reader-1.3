import Taro, { } from '@tarojs/taro'
import { View, Image, Block } from '@tarojs/components'
import webapi from '../../webapi';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';
import { useObservable } from 'rxjs-hooks-taro';
import './index.less'

interface IProps {
}

function BookList(props: IProps) {
  const bookList = useObservable(() => from(webapi.getBookList())
    .pipe(
      map(({ res }) => res)
    ),
    []
  )
  return (
    <Block>
      {bookList.map(book => (
        <View
          className="book-item"
          key={book.bookId}
          onClick={() => {
            Taro.navigateTo({
              url: `/pages/book-reader/index?bookId=${book.bookId}`
            })
          }}
        >
          <Image className="book-cover" src={book.bookCover} />
          <View className="book-name">书名: {book.bookName}</View>
          <View className="book-author">作者: {book.author}</View>
          <View className="book-desc">简介: {book.desc}</View>
        </View>
      ))}
    </Block>
  )
}

export default BookList;
