import React, { Component } from 'react';
import { View, Text } from 'react-native';
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