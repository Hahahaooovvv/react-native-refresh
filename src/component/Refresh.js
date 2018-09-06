import React, { Component } from 'react';
import { View, FlatList, RefreshControl, ActivityIndicator, Text } from 'react-native';

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
            loadMoreing: false, // 指示是否处于加载数据中
            render: () => { }
        }
    }
    // 初始化数据
    componentDidMount() {
        this.refresh();
    }
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
    // 加载方法
    loadMore() {
        this.setState({
            loadMoreing: true
        }, () => {
            const { method, pageSize } = this.props;
            let { dataList, pageNum } = this.state;
            method && method((pageNum + 1), pageSize, (data, count) => {
                // 合并当前的data和新加载的data
                dataList = [...dataList, ...data];
                // 将pageNum更新为第一页
                this.setState({
                    dataList,
                    count,
                    pageNum: pageNum + 1,
                    loadMoreing: false
                })
            })
        })
    }
    render() {
        const { dataList, refreshing, pageNum, count } = this.state;
        const { render, pageSize } = this.props;
        return (
            <FlatList
                onScroll={this.onScrollMethod}
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

                refreshing={refreshing}
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
}