<template>
  <div v-if="!!exps && exps.length > 0">
    <!-- 其它附加信息 -->
    <ul class="exps">
      <li
        v-for="({ title, values },
        i) in exps"
        :key="i"
      >
        <!-- 标题 -->
        <h3>{{ title }}</h3>
        <!-- 内容-多个 -->
        <div
          v-for="({ des, introduce },
          j) in values"
          :key="j"
        >
          <!-- 补充描述信息 -->
          <p class="des" v-if="!!des">
            <!-- 时间 -->
            <span
              v-if="!!des.time"
              class="time"
              >{{ des.time }}</span
            >
            <!-- 其它属性 -->
            <span
              v-for="(str,
              k) in des.tips"
              :key="k"
              >{{ str }}</span
            >
          </p>
          <!-- 详细信息描述 -->
          <div
            class="introduce"
            v-if="
              !!introduce &&
                introduce.length !== 0
            "
          >
            <p
              v-for="(str,
              i) in introduce"
              :key="i"
            >
              {{ str }}
            </p>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'exps',
  props: {
    exps: {
      type: Array,
      default: [],
    },
  },
};
</script>
