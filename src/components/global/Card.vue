<template>
  <div class="card" :class="{ 'rank-card': isRank }" @click="onClick()">
    <p v-if="isRank" class="rank-text" :class="'rank-' + sort">{{ sort }}</p>
    <div class="image">
      <img v-lazy="movie.poster" />
    </div>
    <div class="descript">
      <h1 class="title">{{ movie.title }}</h1>
      <p v-if="movie.isPlay == '1'" class="rate">
        观众评:
        <span :class="{ text: movie.rate > 0 }">
          {{ movie.rate || "暂无" }}
        </span>
      </p>
      <p v-else class="pubdate">上映时间: {{ removeZh(movie.pubdate) }}</p>
      <p class="cast">主演: {{ casts }}</p>
      <p class="duration">时长: {{ movie.duration || "未知" }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useRouter } from "vue-router";
import { Movie, Performer } from "@/types/movie";

// 卡片的属性定义
interface CardProps {
  movie?: Movie;
  sort?: number;
}

export default defineComponent({
  name: "Card",
  props: ["movie", "sort"],
  // 将props设置为只读属性
  setup(props: Readonly<CardProps>, { emit }) {
    // 获取路由对象
    const router = useRouter();

    // 暴露出的属性和方法可以在模板中使用
    return {
      removeZh(str: string) {
        return str.replace("(中国大陆)", "");
      },
      // 计算属性：将movie中的所有演员join为一个字符串赋值casts
      casts: computed(() => {
        if (!props.movie) return "未知";
        return props.movie.casts.map((it: Performer) => it.name).join(",");
      }),
      // 排序用
      isRank: computed(() => {
        return typeof props.sort === "number";
      }),
      onClick() {
        if (!props.movie) return;
        // 路由到具体详情页
        router.push(`/movie/${props.movie.id}`);
        // 触发父级元素的select方法，传入参数为props.movie.id
        emit("select", props.movie.id);
      }
    };
  }
});
</script>

<style lang="stylus" scoped>
.card
  layout-flex(center);
  padding: 10px 20px;
  height: 140px;
  box-sizing: border-box;
  &.rank-card
    padding-left: 0;
    .rank-text
      width: 30px;
      height: 30px;
      margin: 0 10px;
      line-height: 30px;
      text-align: center;
      background-color: $color-background;
      color: $color-text-secondary;
      font-weight: 700;
      &.rank-1
        background: #ef4238;
        color: $color-white;
      &.rank-2
        background: #ffb400;
        color: $color-white;
      &.rank-3
        background: #FFB47A;
        color: $color-white;
  .image img
    width: 80px;
    height: 120px;
  .descript
    flex: 1;
    layout-flex();
    margin-left: 10px;
    flex-direction: column;
    box-sizing: border-box;
    line-height: 30px;
    font-size: 13px;
    color: $color-text-regular;
    border-bottom: 1px solid $border-color-base ;
    overflow: hidden;
    .title
      width: 100%;
      color: $color-text-primary;
      font-size: $font-size-medium;
      font-weight: 700;
      text-ellipsis();
    .rate
      .text
        font-size: $font-size-base;
        font-weight: 700;
        color: $color-golden;
    .cast
      width: 100%;
      text-ellipsis();
</style>
