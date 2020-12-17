<template>
  <div class="search-box">
    <i class="iconfont icon-search" />
    <input
      :value="inputValue"
      type="text"
      class="search-input"
      @input="onChange"
      :placeholder="placeholder"
    />
    <i v-show="inputValue" class="iconfont icon-delete" @click="handleClear" />
  </div>
</template>

<script lang="ts">
import { defineComponent, toRef } from "vue";

export default defineComponent({
  props: {
    placeholder: {
      type: String,
      default: "请输入"
    },
    value: {
      type: String
    }
  },
  setup(props, { attrs, emit }) {
    // attrs上下文对象，从上下文对象中获取modelValue转变为响应数据
    const inputValue = toRef(attrs, "modelValue");

    const handleClear = () => {
      emit("update:modelValue", "");
      emit("change", "");
      emit("clear");
    };

    // 当输入框发生变化时，将输入框中的值拿出来，并触发'update:modelValue'和'change'两个事件
    // 父元素选择哪个事件触发父元素自己的自定义函数，由父元素自行决定和处理
    const onChange = (e: Event) => {
      const value = (e.target as HTMLInputElement).value;
      emit("update:modelValue", value);
      emit("change", value);
    };

    return { handleClear, attrs, onChange, inputValue };
  }
});
</script>

<style lang="stylus" scoped>
.search-box
  layout-flex(center, normal);
  flex-wrap: nowrap;
  padding: 0 10px;
  background: $color-white;
  border: $bordered;
  border-radius: $border-radius-base;
  .iconfont
    font-size: $font-size-medium;
    color:  $color-text-secondary;
  .search-input
    margin: 8px 20px 8px 5px;
    font-size: $font-size-small;
    border: none;
    outline: none;
    width: calc(100% - 60px);
    color: $color-text-primary;
</style>
