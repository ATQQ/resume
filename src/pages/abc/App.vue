<template>
  <div id="app">
    <header>
      <h1>{{ schema.name }}</h1>
      <h2>{{ schema.position }}</h2>
    </header>
    <div class="infos">
      <p
        v-for="(info,
        i) in schema.infos"
        :key="i"
      >
        {{ info }}
      </p>
    </div>
  </div>
</template>

<script>
import { getSchema } from '../../utils';
export default {
  data() {
    return {
      schema: getSchema(),
    };
  },
  mounted() {
    window.refresh = this.refresh;
  },
  methods: {
    refresh() {
      this.schema = getSchema();
    },
  },
};
</script>
