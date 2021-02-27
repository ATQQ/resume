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
        <i
          class="icon iconfont"
          :class="'icon-' + icon"
        />
        <!-- 内容 -->
        <span>{{ value }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'infos',
  props: {
    infos: {
      type: Array,
      default: [],
    },
  },
};
</script>
