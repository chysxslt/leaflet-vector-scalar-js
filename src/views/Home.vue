<template>
  <div class="home">
    <!--	地图 -->
    <leaflet-map></leaflet-map>
    <!--	地图 control	-->
    <map-layer-control></map-layer-control>
  </div>
</template>

<script>
// @ is an alias to /src
import LeafletMap from "@/components/map/LeafletMap.vue";
import MapLayerControl from "@/components/map/MapLayerControl.vue";
import global from '../config/index'
import { isMobile } from "../utils/util"

export default {
  name: "Home",
  components: {
    LeafletMap,
    MapLayerControl,
  },
  data() {
    return {
      // eventSearchVal:''
      activeNames: ["1"],
      isMobile: isMobile()
    };
  },
  methods:{},
  created() {
    this.isMobile = isMobile()
  }
};
</script>
<style>
.el-collapse-item__content {
  color: white !important;
}
</style>
<style scoped>
.home>>>.el-collapse-item__header{
  height: 40px;
  line-height: 40px;
  font-size: 12px !important;
}
</style>
