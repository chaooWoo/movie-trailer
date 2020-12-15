import axios, { AxiosResponse, AxiosRequestConfig, Method } from "axios";
import { reactive, toRefs, onMounted, ComputedRef, Ref } from "vue";

// export?可能是外部可使用的响应数据结构
export interface RequestResponse<T> {
  code: number; // 错误码
  data: T; // 数据
  errMsg: string; // 描述信息
}

// 请求状态
interface RequestState<T> {
  loading: boolean; // loading是否显示
  error: boolean; // 错误显示?跳转错误页?404
  data: T; // 请求的数据?
}

// 请求的参数
interface RequestParams {
  // []中的参数定义为数组的下标类型，后面的才是数组中元素的类型限定  
  [propName: string]: unknown;
}

// axios的请求参数设置定义
interface RequestConfig<T> extends AxiosRequestConfig {
  initialData?: T;
  immediate: boolean; // 是否立即请求
  onSuccess?: (data: RequestResponse<T>) => void; // 请求成功的回调
  onFail?: (data: RequestResponse<T>) => void; // 请求失败的回调
}

// 外部调用useRequest返回的对象接口定义
interface ReturnResult<T> {
  loading: Ref<boolean>; // 响应对象
  error: Ref<boolean>; // 响应对象
  data: Ref<T>; // 响应数据
  fetch: () => Promise<void>;
}

// 默认返回结果配置，和ReturnResult配置的默认实现
const defaultConfig = {
  immediate: true // 立即执行
};

// **********************************************

// 函数重载
function useRequest<T>(
  url: string | ComputedRef<string>,
  config?: Partial<RequestConfig<T>>
): ReturnResult<T>;

function useRequest<T>(
  url: string | ComputedRef<string>,
  params?: ComputedRef<RequestParams>,
  config?: Partial<RequestConfig<T>>
): ReturnResult<T>;

// 重载函数的具体实现
// 可以根据重载函数的参数数量进行不同的实现
function useRequest<T>(...args: any[]): ReturnResult<T> {
  let _url: { value: string };
  let _params: ComputedRef<RequestParams> | undefined; // 联合类型
  let _config: Partial<RequestConfig<T>> = {}; // 预置为空对象

  if (args.length >= 1) { // 放置空参数调用函数
    _url = args[0].value ? args[0] : { value: args[0] };
  }

  if (args.length > 2) { // 同时包含参数和配置
    _params = args[1];
    _config = args[2];
  } else { // 只有参数或配置
    if (args[1] && args[1].value) {
      _params = args[1];
    } else if (typeof args[1] === "object") {
      _config = args[1];
    }
  }

  // 将默认配置和发出请求的参数请求合并
  const combineConfig: RequestConfig<T> = { ...defaultConfig, ..._config };

  // es6语法，将combineConfig中的多个属性暴露
  const {
    initialData, // 传入的初始值，一般为空值
    immediate,
    onSuccess,
    onFail,
    ...axiosConfig
  } = combineConfig;

  // 请求状态的响应式对象
  const state: RequestState<T> = reactive({
    loading: false,
    error: false,
    // 传入的初始值，一般为空值，请求成功后将会被赋值为返回结果数据，
    // 将响应对象state暴露后，外部可以直接访问该数据
    // 目的(猜想)：满足不实现onSuccess或onFail，只想使用返回数据的场景
    data: initialData
  }) as RequestState<T>;

  // 真实请求函数
  const fetchFunc = () => {
    // loading动画开启
    state.loading = true;
    
    const matched = _url.value.match(/:(\S+)/); // 正则表达式匹配去除http(https)协议后的url
    const method: Method = matched ? (matched[1] as Method) : "get"; // 符合Method定义则转换为Method对象，否则当作get处理??
    // 变量保存是否是get的http方法
    const isGetMethod = method.toLowerCase() === "get";

    // 返回axios执行结果
    return axios({
      url: _url.value, // 请求url
      method, //　请求方法,get..post..
      params: isGetMethod ? _params?.value : undefined, // get方法则将参数挂到url后
      data: isGetMethod ? undefined : _params?.value, // 非get方法将参数放到属具体中
      ...axiosConfig // axios的配置?不知道从哪里来，等vscode应该能看
    })
      .then((response: AxiosResponse<RequestResponse<T>>) => { // 请求成功
        const result = response.data;
        if (result.code === 200) { // 是否成功由服务器返回状态码决定
          state.data = result.data;
          if (typeof onSuccess === "function") {
            // 请求成功的回调若是函数则执行
            onSuccess(result);
          }
        } else {
          if (typeof onFail === "function") {
            // 请求失败的回调若是函数则执行
            onFail(result);
          }
          // messaage.error
        }
        state.loading = false; // loading动画关闭
      })
      .catch(() => { // 请求异常
        state.error = true; // error
        state.loading = false; // loading动画关闭
      });
  };

  onMounted(() => {
    // 若是组件绑定后配置了立即请求数据则立即请求
    // 否则不马上发出请求
    if (immediate) {
      fetchFunc();
    }
  });

  // 将请求状态，请求函数封装后返回
  // 请求的函数fetch一同返回，可以让其他方法可以以相同的配置再次请求
  // 例子：useScrollMore(加载更多)
  return { ...toRefs(state), fetch: fetchFunc };
}

// **********************************************

// 将函数useRequest导出供外部使用
export { useRequest };

// axios实例
const instance = axios.create({
  timeout: 60000, // 请求超时
  baseURL: "/"
});

// 响应拦截
instance.interceptors.response.use(
  // 成功会执行的拦截函数
  res => res.data,
  // 异常会执行的拦截函数
  () => {
    // messaage.error
  }
);

export default instance; // 将axios实例暴露，可以直接使用post、get等方法
