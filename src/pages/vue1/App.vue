<template>
  <div>
    <header>
      <!-- 姓名 -->
      <h1>{{ data.name }}</h1>
      <!-- 职位 -->
      <h2>{{ data.position }}</h2>
      <!-- 基本信息 -->
      <ul class="infos">
        <li
          v-for="({ icon, value },
          i) in data.infos"
          :key="i"
        >
          <i
            class="icon iconfont"
            :class="'icon-' + icon"
          ></i
          ><span>{{ value }}</span>
        </li>
      </ul>
    </header>
    <div>
      <!-- 其它附加信息 -->
      <ul class="exps">
        <li
          v-for="({ title, values },
          i) in data.exps"
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
