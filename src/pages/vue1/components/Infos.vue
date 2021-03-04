<template>
  <div
    v-if="!!infos && infos.length > 0"
  >
    <ul class="infos">
      <li
        v-for="({ icon, value },
        i) in infos"
        :key="i"
      >
        <!-- 图标 -->
        <i v-html="svg[icon]"> </i>
        <!-- 内容 -->
        <span>{{ value }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
import svgList from './../../../constants/svgs';
const svg = svgList('#fff');

export default {
  name: 'infos',
  props: {
    infos: {
      type: Array,
      default: [],
    },
  },
  data() {
    return {
      svg,
    };
  },
};
</script>
