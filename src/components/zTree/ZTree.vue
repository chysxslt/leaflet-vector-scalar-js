<template>
  <div id="areaTree">
    <div class="tree-box">
      <div class="zTreeDemoBackground left">
        <ul id="treeDemo" class="ztree ztree-oil-pc"></ul>
      </div>
    </div>
  </div>
</template>

<script>
import '../../plugins/zTree/css/metroStyle/metroStyle.css'
import { mapState } from 'vuex'
export default {
  name: "zTree",
  computed: {
      ...mapState('moduleForecast',{
        oilPoints: state => state.oilPoints,
        oilPointsReloadFlag: state => state.oilPointsReloadFlag
      })
  },
  watch: {
    oilPointsReloadFlag() {
      if (this.oilPointsReloadFlag) {
        this.setValue(this.oilPoints)
      }
    }
  },
  data: function() {
    return {
      setting: {
        data: {
          simpleData: {
            enable: true,
            idKey: "id",
            pIdKey: "pid",
            rootPId: 0
          }
        },
        view: {
          showIcon: false
        },
        check: {
          enable: true,
          autoCheckTrigger: true,
          chkboxType: { "Y" : "", "N" : "" }
        },
        callback: {
          onCheck: this.zTreeOnCheck,
          onClick: this.zTreeOnClick
        }
      },
      zNodes: [],
      timeoutId: null,
      zTreeObj: null,
      searchKey: '',
      nameKey: '',
      rexMeta: null,
      isExpand: false
    };
  },
  methods: {
    setValue(data) {
      let list = this.zNodes
      list.forEach((item, index) => {
        const i = data.findIndex(_ => _.id+'' === item.id+'')
        if (i > -1) {
          list[index].checked = true
        }
      })
      this.$store.commit('moduleForecast/SET_OILFIELD_POINTS_RELOAD_FALSE')
      this._getData(list)
    },
    zTreeOnClick(event, treeId, treeNode) {
      if(treeNode.checked) {
        this.$store.commit('moduleForecast/SHOW_OIL_FIELD_POINT', treeNode.id)
      }
    },
    zTreeOnCheck(event, treeId, treeNode) {
      // console.log(treeId)
      console.log(treeNode)
      // console.log(treeNode.tId + ", " + treeNode.name + "," + treeNode.checked)
      if (treeNode.pid+'' === '0') {
        this.handleCheckedAll(treeNode)
      }
      this.$store.commit('moduleForecast/SET_OILfIELD_POINTS', {...treeNode})
      this.$store.commit('moduleForecast/SHOW_OIL_FIELD_POINT', treeNode.id)
      // console.log(JSON.stringify(treeNode))
    },
    handleCheckedAll(treeNode) {
      let list = this.zNodes
      list.forEach((item, index) => {
        if (item.id+'' === treeNode.id+'') {
          list[index].checked = treeNode.checked
        }
        if (item.pid+'' === treeNode.id+'') {
          list[index].checked = treeNode.checked
          list.forEach((item1, index1) => {
            if (item1.pid+'' === list[index].id+'') {
              list[index1].checked = treeNode.checked
              this.$store.commit('moduleForecast/SET_OILfIELD_POINTS', {...list[index1]})
            }
          })
          this.$store.commit('moduleForecast/SET_OILfIELD_POINTS', {...list[index]})
        }
      })
      this._getData(list)
    },
    _search(searchKey) {
      this.searchKey = searchKey
      if (this.timeoutId) {
        //如果不为空,结束任务
        clearTimeout(this.timeoutId);
      }
      this.timeoutId = setTimeout(() => {
        this.searchNodeLazy(this.zTreeObj, searchKey); //调用延时处理
      }, 500);
    },
    _getData(data) {
      this.zNodes = data;
      this.zTreeObj = $.fn.zTree.init($("#treeDemo"), this.setting, this.zNodes);
      window.zTreeObj = this.zTreeObj
      // this.zTreeObj.expandAll(true)
    },
    fuzzySearch(zTreeId, searchField, isHighLight, isExpand) {
      this.isHighLight = isHighLight
      this.isExpand = isExpand
      this.zTreeObj = $.fn.zTree.getZTreeObj(zTreeId); //获取树对象
      if (!this.zTreeObj) {
        console.log("获取树对象失败");
        return false
      }
      this.nameKey = this.zTreeObj.setting.data.key.name; //获取name属性的key
      isHighLight = isHighLight === false ? false : true; //除直接输入false的情况外,都默认为高亮
      isExpand = isExpand ? true : false;
      this.zTreeObj.setting.view.nameIsHTML = isHighLight; //允许在节点名称中使用html,用于处理高亮

      const metaChar = "[\\[\\]\\\\\^\\$\\.\\|\\?\\*\\+\\(\\)]"; //js正则表达式元字符集
      this.rexMeta = new RegExp(metaChar, "gi"); //匹配元字符的正则表达式
    },
    // 过滤ztree显示数据
    ztreeFilter(zTreeObj, _keywords, callBackFunc) {
      if (!_keywords) {
        _keywords = ""; //如果为空，赋值空字符串
      }
      const nodesShow = this.zTreeObj.getNodesByFilter(this.filterFunc); //获取匹配关键字的节点
      this.processShowNodes(nodesShow, _keywords); //对获取的节点进行二次处理
    },

    // 查找符合条件的叶子节点
    filterFunc(node) {
      if (node && node.oldname && node.oldname.length > 0) {
        node[this.nameKey] = node.oldname; //如果存在原始名称则恢复原始名称
      }
      //node.highlight = false; //取消高亮
      this.zTreeObj.updateNode(node); //更新节点让之前对节点所做的修改生效
      if (this.searchKey.length == 0) {
        //如果关键字为空,返回true,表示每个节点都显示
        this.zTreeObj.showNode(node);
        this.zTreeObj.expandNode(node, this.isExpand); //关键字为空时是否展开节点
        return true;
      }
      //节点名称和关键字都用toLowerCase()做小写处理
      if ( node[this.nameKey] &&  node[this.nameKey].toLowerCase().indexOf(this.searchKey.toLowerCase()) != -1) {
        if (this.isHighLight) {
          //如果高亮，对文字进行高亮处理
          //创建一个新变量newKeywords,不影响_keywords在下一个节点使用
          //对_keywords中的元字符进行处理,否则无法在replace中使用RegExp
          const newKeywords = this.searchKey.replace(this.rexMeta, function(matchStr) {
            //对元字符做转义处理
            return "\\" + matchStr;
          });
          node.oldname = node[this.nameKey]; //缓存原有名称用于恢复
          //为处理过元字符的_keywords创建正则表达式,全局且不分大小写
          const rexGlobal = new RegExp(newKeywords, "gi"); //'g'代表全局匹配,'i'代表不区分大小写
          //无法直接使用replace(/substr/g,replacement)方法,所以使用RegExp
          node[this.nameKey] = node.oldname.replace(rexGlobal, function(originalText) {
            //将所有匹配的子串加上高亮效果
            const highLightText = `<span style="color: whitesmoke;background-color: darkred;">${originalText}</span>`;
            return highLightText;
          });
          //================================================//
          //node.highlight用于高亮整个节点
          //配合setHighlight方法和setting中view属性的fontCss
          //因为有了关键字高亮处理,所以不再进行相关设置
          //node.highlight = true;
          //================================================//
          this.zTreeObj.updateNode(node); //update让更名和高亮生效
        }
        this.zTreeObj.showNode(node); //显示符合条件的节点
        return true; //带有关键字的节点不隐藏
      }

      this.zTreeObj.hideNode(node); // 隐藏不符合要求的节点
      return false; //不符合返回false
    },
    // 有输入后定时执行一次，如果上次的输入还没有被执行，那么就取消上一次的执行
    searchNodeLazy(zTreeObj, _keywords) {
      if (this.timeoutId) {
        //如果不为空,结束任务
        clearTimeout(this.timeoutId);
      }
      this.timeoutId = setTimeout(() =>{
        this.ztreeFilter(zTreeObj, _keywords); //延时执行筛选方法
      }, 500);
    },
    // 对符合条件的节点做二次处理
    processShowNodes(nodesShow, _keywords) {
      const that = this
      if (nodesShow && nodesShow.length > 0) {
        //关键字不为空时对关键字节点的祖先节点进行二次处理
        if (_keywords.length > 0) {
          $.each(nodesShow, function(n, obj) {
            const pathOfOne = obj.getPath(); //向上追溯,获取节点的所有祖先节点(包括自己)
            if (pathOfOne && pathOfOne.length > 0) {
              //对path中的每个节点进行操作
              // i < pathOfOne.length-1, 对节点本身不再操作
              for (let i = 0; i < pathOfOne.length - 1; i++) {
                that.zTreeObj.showNode(pathOfOne[i]); //显示节点
                that.zTreeObj.expandNode(pathOfOne[i], true); //展开节点
              }
            }
          });
        } else {
          //关键字为空则显示所有节点, 此时展开根节点
          const rootNodes = this.zTreeObj.getNodesByParam("level", "0"); //获得所有根节点
          $.each(rootNodes, function(n, obj) {
            that.zTreeObj.expandNode(obj, that.isExpand); //展开所有根节点
          });
        }
      }
    }
  }
};
</script>

<style>
.ztree li a {
  color: white !important;
}
.ztree li span.button.chk.checkbox_false_full,
.ztree li span.button.chk.checkbox_false_full_focus,
.ztree li span.button.chk.checkbox_true_full,
.ztree li span.button.chk.checkbox_true_full_focus,
.ztree li span.button.chk.checkbox_true_part,
.ztree li span.button.chk.checkbox_false_part,
.ztree li span.button.chk.checkbox_true_part_focus,
.ztree li span.button.chk.checkbox_false_part_focus {
  float: right;
}
</style>
<style scoped>
@import "../../plugins/zTree/css/zTreeStyle/zTreeStyle.css";
#areaTree {
  margin-bottom: 2px;
  border-radius: 4px;
  overflow: hidden;
}
</style>
