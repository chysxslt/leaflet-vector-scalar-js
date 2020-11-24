<template>
    <div v-if="isShow" class="progress-container" :style="{height: clientHeight}">
      <div class="progress-body">
        <div class="progress-outside">
          <span :style="{width: proBar + '%', display: 'inline-block', backgroundColor: '#409EFF', height: '16px'}"></span>
        </div>
        <!-- <div class="progress-value">{{proBar}}%</div> -->
        <div class="progress-text">数据加载中...{{`(${proBar}%)`}}</div>
      </div>
      <div class="fullbg" :style="{height: `calc(100% - ${offSetHeight}px)`}"></div>
    </div>
</template>

<script>
export default {
  name: "Progress",
  props: ['offSetHeight'],
  data: function() {
    return {
      // clientHeight: window.screen.width + 'px',
      // clientHeight: document.documentElement.offsetHeight - 260 + 'px',
      clientHeight: window.screen.height - 260 + 'px',
      proBar: 0,
      isShow: false
    };
  },
  mounted() {
    // this.getProgress()
  },
  methods: {
    setProgress(num) {
      this.proBar = num
    },
    getProgress(type) {
      this.isShow = true
      this.proBar = 0
      this.startProgress(type)
    },
    startProgress(type) {
      const that = this
      let a = 0, timer = null, count = 0
      timer = setInterval(() => {
        if (type === 'loading') {
          if (this.proBar<99) {
            a = 100
          } else {
            a = 0
          }
        } else if (type === 'finish') {
          that.proBar = 100
        }
        count = a / 100
        if (this.proBar >= 100) {
          let timer1 = null
          timer1 = setTimeout(() => {
            this.isShow = false
            clearInterval(timer)
            if (timer1 !== null) {
              clearInterval(timer1)
            }
          }, 1000);
          return false
        }
        this.proBar += count
        // console.log(this.proBar)
      }, 105);
    }
  }
};
</script>
<style scoped>
.progress-container {display: flex;align-items: center;justify-content: center;position: absolute;width: 100%;}
.progress-body {z-index: 100;width: 50%;margin: 0 auto;}
.progress-outside {background: #ebeef5;border-radius: 99px;overflow: hidden;height: 4px;}
.progress-value {margin-top: -18px;text-align: center;}
.progress-text {font-size: 10px;text-align: center;color: #eeeeee;}
.fullbg {
  background-color:rgba(9,7,37,0.85);
  left:0;
  opacity: 0.4;
  position: absolute;
  top: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  filter: alpha(opacity=50);
}
</style>
