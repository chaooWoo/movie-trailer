import { ref } from "vue";

// 防抖函数
// 防止短时间内某个函数被频繁触发导致的系统卡顿，后端服务压力大等
// 例如，input输入框有文字时触发搜索请求，若是用户还没输入完成(或输入错误)，几乎每次都会发生请求
//     则会导致后端压力增大，防抖函数即在等待一定时间后若是用户没有继续输入，则执行该函数
export default function useDebounce(handler: () => void, time = 500) {
  const timer = ref<number>();

  return (...args: never[]) => {
    // 若setTimeout()没有执行，则将其取消执行，重新延迟执行函数
    if (timer.value) {
      clearTimeout(timer.value);
    }
    // 返回一个id，可以提供给clearTimeout()来取消执行setTimeout()
    timer.value = setTimeout(handler.bind(null, ...args), time);
  };
}

// https://zhuanlan.zhihu.com/p/86426949  知乎的一个实现，可以参考，也可以使用本来的实现
