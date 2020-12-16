import { toRefs, reactive, computed, watch, Ref } from "vue";

// 滚动状态，也可以理解为加载更多的相关状态
interface ScrollMoreState<T> {
  list: T[];
  loading: boolean;
  noMore: boolean;
}

// 外部state，用于改变page
interface OuterState {
  page: number;
}

// 外部数据，请求使用的列表数据
type OuterData<T> = Ref<{
  total: number;
  list: T[];
}>;

//
/**
 * 处理滚动加载更多通用逻辑
 * @param data useRequest请求的列表
 * @param outerState 调用时的state，用于改变page
 * @param fetch 请求函数，参看request.ts
 */
export default function useScrollMore<T>(
  data: OuterData<T>, // 外部传入的已有数据
  outerState: OuterState, // 外部状态
  fetch: () => Promise<void>
) {
  // 响应式对象，外部调用'更多'函数时，请求是异步的，
  // 那么界面的loading需要根据请求的完成来完成响应，
  // 返回一个响应式对象可以让界面变得响应
  const state: ScrollMoreState<T> = reactive({
    list: [],
    loading: false,
    noMore: computed(() => {
      return data.value.total <= state.list.length && data.value.total !== 0;
    })
  });

  const loadMore = async () => {
    // es6语法：解析构值，将state对象中list属性拿出来，相当于list=state.list
    const { list } = state;
    const { total } = data.value;
    // 响应式数据应该会保存list，所以list到达最大total时，就不再请求了??
    if (list.length >= total) return;
    outerState.page += 1;
    state.loading = true;
    await fetch(); // 等待请求完成
    state.loading = false;
  };

  // 监视data，将新值合并到原有对象中
  watch(data, newVal => {
    state.list = state.list.concat(newVal.list);
  });

  const refresh = () => {
    outerState.page = 0;
    state.list = [];
    fetch();
  };

  return {
    ...toRefs(state),
    loadMore,
    refresh
  };
}
