## 不多BB 先上效果图哈哈

## 具体实现
### 下拉刷新
1. 新建一个项目
~~~
	react-native init demo
~~~
2. 创建好项目之后在项目目录下创建src 和 src/component 两个文件夹和 src/component/Refresh.js 文件<br/>
<img style="width:200px" src="https://tangdaben.oss-cn-shanghai.aliyuncs.com/web%2Fblog_web%2Farticle%2FReactNative%2FRefalsh%2Fdir.png" />

3. 在src/component/Refresh.js 中创建好组件
~~~
  import React, { Component } from 'react';
  import { View, FlatList } from 'react-native';

  export default class Refresh extends Component {
      // 获取默认Props
      static defaultProps = {
          method: null,   // 子组件传过来的刷新的方法
          pageSize: 20,   // 一页展示的数量
      }
      constructor(props) {
          super(props);
          this.refresh = this.refresh.bind(this);
          this.loadMore = this.loadMore.bind(this);
          this.onScrollMethod = this.onScrollMethod.bind(this);
          this.state = {
            dataList: [],   // 数据
            pageNum: 1,     // 页码
            count: 0,       // 数据总数，用于分页
            refreshing: false, // 指示是否正处于刷新中
            loadMoreing: false // 指示是否处于加载数据中
        }
      }
      // FlatList滑动监听
      onScrollMethod(){
      
      }
      // 刷新方法
      refresh() {

      }
      // 加载方法
      loadMore(){

      }
      render() {
          return (
              <FlatList />
          );
      }
  }
~~~
4. 在 refresh 方法里面我们需要实现刷新数据的方法，因为要做到通用方法，所以这
需要在父组件里面传过来，现在吧原来的App.js代码替换为如下方法。这个地方因为简便，
我已经写出了刷新组件的具体调用方法，如果不理解的可以先往下面看 QAQ
~~~
  import React, { Component } from 'react';
  import { View } from 'react-native';
  import Refresh from './src/component/Refresh';

  export default class App extends Component {
    constructor(props) {
      super(props);
      this.bindData = this.bindData.bind(this);
    }
    /**
     * 绑定数据方法
     * @param {*页码} pageNum 
     * @param {*一页展示的数量} pageSize 
     * @param {*回调方法，回调返回的数据} result 
     */
    bindData(pageNum, pageSize, result) {
      // 模拟ajax获取数据的异步方法
      setTimeout(() => {
        // 执行回调方法
        // 第一个参数为Refresh所需要的data,第二个参数为分页需要的数据的总个数
        result([1, 2, 3, 4, 5, 6, 7, 9, 10], 100);
      }, 2000);
    }
    render() {
      return (
        <Refresh
            render={({ item }) => {
              return (
                <View style={{ justifyContent: "center", alignItems: "center", height: 100 }} >
                  <Text>
                    {item}
                  </Text>
                </View>
              )
            }}
            pageSize={10}
            method={this.bindData} />
      );
    }
  }
~~~
5. 在App.js已经传入了method参数之后我们就需要在 Refresh组件里面干一些事情，比如
首次绑定数据什么的，先把之前预留的 refresh 方法修改一下，并增加componentDidMount方法
~~~
    // 初始化数据
    componentDidMount() {
    	// 组件加载时调用一次获取数据
    	this.refresh();
    }
    // 刷新方法
    refresh() {
        // 执行刷新事件
        this.setState({
            refreshing: true
        }, () => {
            const { method, pageSize } = this.props;
            /**
             * 判断method是否传入增加容错率，这个method实际上是App.js传入过来的bindData方法，
             * 该方法获取3个参数 一个是页码，一个是展示的数量，pageSize也是由父组件决定的，
             * 在这个地方传入只是为了处理比较方便,第三个参数就是回调方法啦，并接受一个参数
             * 需要展示的data和后台返回来的数据总数
             * 而且 既然是刷新 直接把页码传入为1就行了
             */
            method && method(1, pageSize, (data, count) => {
                // 将pageNum更新为第一页
                this.setState({
                    dataList: data,
                    count,
                    pageNum: 1,
                    refreshing: false
                })
            })
        })
    }
~~~
6. 现在获取数据的方法我们基本写好，接下就完成下拉刷新。这个做法可以吧FlatList 和 官方提供
的另外一个组件 RefreshControl 配合使用。现在修改一下refresh组件的 render方法。
~~~
    // react-native新导入RefreshControl
    import { View, FlatList, RefreshControl, Text } from 'react-native';
    .....
    .....
    render() {
        const { dataList, refreshing } = this.state;
        const { render } = this.props;
        return (
            <FlatList
                refreshControl={
                    <RefreshControl
                        // 是否展示刷新组件
                        refreshing={refreshing}

                        // 达到刷新条件时处理的事情
                        onRefresh={() => {
                            // 如果正处于刷新状态 直接返回
                            if (refreshing) {
                                return;
                            }
                            this.refresh();
                        }}
                        tintColor="#4ba5fe"
                        title="加载中..."
                        titleColor="#4ba5fe"
                        colors={['#4ba5fe', '#4ba5fe', '#4ba5fe']}
                        progressBackgroundColor="#ffffff"
                    />}
                // 给flatList绑定数据
                data={dataList}

                // 每一行展示的样式 建议看看官方文档的 FlatList的用法
                renderItem={render}
            />
        );
     }
~~~
下拉看看 我们的下拉刷新组件已经开始工作啦

### 上拉加载
1. 下载加载已经完成，现在增加下拉刷新功能，同样的，将预留的loadMare方法
修改一下
~~~
    // 加载方法
    loadMore() {
        this.setState({
            loadMoreing: true
        }, () => {
            const { method, pageNum } = this.props;
            const { dataList } = this.state;
            method && method((pageNum + 1), pageSize, (data, count) => {
                // 合并当前的data和新加载的data
                dataList = [...dataList, ...data];
                // 将pageNum更新为第一页
                this.setState({
                    dataList: data,
                    count,
                    pageNum: pageNum + 1,
                    loadMoreing: false
                })
            })
        })
    }
~~~
2. ok 现在方法有了 就要去触发他，触发他的条件就是在上啦列表的时候
距离底部一定位置来去然后就触发这个方法，FlatList有个onScroll方法。
现在修改一下预留的onScrollMethod方法。
~~~
    import { View, FlatList, RefreshControl, ActivityIndicator, Text } from 'react-native';
    ****
    ****
    onScrollMethod(e) {
    	const { pageSize } = this.props;
        const { pageNum, count, loadMoreing } = this.state;
        if (!loadMoreing) {
            // 判断是否还有数据
            if (pageSize * pageNum <= count) {
                var offsetY = e.nativeEvent.contentOffset.y; //滑动距离
                var contentSizeHeight = e.nativeEvent.contentSize.height; //scrollView contentSize高度
                var oriageScrollHeight = e.nativeEvent.layoutMeasurement.height; //scrollView高度
                if (offsetY + oriageScrollHeight >= contentSizeHeight - 200) {
                    // 滑动距离底部只有200高度，调用加载方法
                    this.loadMore();
                }
            }
        }
    }
    ******
    ******
    // 并且在FlatList的props绑定方法
    render(
        const { dataList, refreshing, pageNum, count } = this.state;
        const { render, pageSize } = this.props;
        <FlatList
            onRefresh={this.onScrollMethod}
            ListFooterComponent={() => {
                    return (
                        <View style={{ height: 50, alignContent: "center", alignSelf: "center" }} >
                            {
                                !refreshing &&
                                (
                                    pageSize * pageNum <= count ?
                                        <ActivityIndicator />
                                        :
                                        <Text>
                                            没有更多了
                                        </Text>
                                )
                            }
                        </View>
                    )
                }}
            *****
            *****
        />
    )
    
    
~~~

