<template>
  <div>
    <header>
      <!-- 姓名 -->
      <h1>{{ data.name }}</h1>
      <!-- 职位 -->
      <h2>{{ data.position }}</h2>
      <!-- 基本信息 -->
      <Infos :infos="data.infos" />
    </header>
    <Exps :exps="data.exps" />
  </div>
</template>

<script>
import { getSchema } from './../../utils/index';
import Exps from './components/Exps.vue';
import Infos from './components/Infos.vue';

export default {
  components: {
    Infos,
    Exps,
  },
  data() {
    return {
      data: getSchema(),
    };
  },
  mounted() {
    window.refresh = this.refresh;
  },
  methods: {
    refresh() {
      this.data = getSchema();
    },
  },
};
</script>
