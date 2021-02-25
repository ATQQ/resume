<template>
  <div>
    <h1>{{ data.name }}</h1>
    <h2>{{ data.position }}</h2>
    <h3
      v-for="(item,
      index) in data.dataString"
      :key="index"
    >
      {{ item }}
    </h3>
  </div>
</template>

<script>
import { getSchema } from './../../utils/index';
export default {
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

<style></style>
