<h1 align="center">🛬 Arrestor Gear</h1>
<p align="center">
<a href="https://github.com/A2Workspace/arrestor-gear">
    <img alt="" src="https://github.com/A2Workspace/arrestor-gear/actions/workflows/coverage.yml/badge.svg">
</a>
<a href="https://codecov.io/gh/A2Workspace/arrestor-gear">
    <img alt="" src="https://img.shields.io/codecov/c/github/A2Workspace/arrestor-gear.svg?style=flat-square">
</a>
<a href="https://github.com/A2Workspace/arrestor-gear/blob/master/LICENSE">
    <img alt="" src="https://img.shields.io/github/license/A2Workspace/arrestor-gear?style=flat-square">
</a>
<a href="https://npmjs.com/package/@a2workspace/arrestor-gear">
    <img alt="" src="https://img.shields.io/npm/v/@a2workspace/arrestor-gear.svg?style=flat-square">
</a>
<a href="https://npmjs.com/package/@a2workspace/arrestor-gear">
    <img alt="" src="https://img.shields.io/npm/dt/@a2workspace/arrestor-gear.svg?style=flat-square">
</a>
</p>
<p align="center">Elegant handling Axios errors.</p>
<p align="center">優雅的處理 Axios 錯誤。</p>

## Installation | 安裝

Using npm:
```bash
npm install -s @a2workspace/arrestor-gear
```

Using yarn:
```bash
yarn add @a2workspace/arrestor-gear
```


## Quick Start | 快速開始

```js
import arrestorGear from '@a2workspace/arrestor-gear';

// 將須處理的 `Promise Object` 透過 `arrestorGear` 函數包裹起來
const ag = arrestorGear(() => {
  return axios.post(API_URL, { formData });
});

// 註冊一回呼函數。當 `Promise` 成功完成時會執行此函數，並傳入解析的值。類似於 Promise.then((resolved) => {})。
ag.onFulfilled((resolved) => {
  this.$message.success('Created');
  this.$router.back(-1);
});

// 註冊一回呼函數。當 `Promise` 完成時，無論結果，執行此函數。類似於 Promise.finally(() => {})。
ag.finally((isFulfilled) => {
  this.processing = false;
});

// 當 `Promise` 為被拒絕 (rejected) 時，且狀態為 422 的情形，執行此回呼函數。反之交由後續的 `capture*` 函數處理。
ag.captureValidationError((messageBag) => {
  this.$message.error(messageBag.first());

  this.errors = messageBag.all((messages) => messages[0]);
});

// 當 `Promise` 為被拒絕 (rejected) 時，且符合給定條件的狀態碼的情形，執行此回呼函數。反之交由後續的 `capture*` 函數處理。
ag.captureStatusCode([401, 403], (axiosError) => {
  this.$message.error('Forbidden');
});

// `ag.captureStatusCode` 的另一種寫法，支援字串符搜尋比對。
ag.captureStatusCode('5XX', (axiosError) => {
  this.$message.error('Server Error');
});

// 當 `Promise` 為被拒絕 (rejected) 時，且為 AxiosError 的情形，執行此回呼函數。反之交由後續的 `capture*` 函數處理。
ag.captureAxiosError((axiosError) => {
  this.$message.error(`Bad Request: ${axiosError.response.status}`);
});

// 攔截所有 rejected 結果，並執行此回呼函數。適用於放在鏈的最後，後續的攔截函數將不會處理。
ag.captureAny((error) => {
  this.$message.error('Something wrong here');
  
  console.error(error);
});
```


## Usage | 如何使用

### arrestorGear()

支援以下寫法:

```js
import arrestorGear from '@a2workspace/arrestor-gear';

// 直接包裹住 `Promise` 物件
const ag = arrestorGear(axios.post(API_URL, { formData }));

// 傳統函數
const ag = arrestorGear(function () {
  return axios.post(API_URL, { formData });
});

// 箭頭函數
const ag = arrestorGear(() => axios.post(API_URL, { formData }));
```

### ArrestorGear.onFulfilled()

類似於 Promise.then((resolved) => {})。

當 `Promise` 成功完成時會呼叫回呼函數，並傳入解析的值。

不同的是，你可以註冊多個回呼函數，他們會被依序呼叫**且彼此不會相互影響**，即便拋出錯誤也會被內部攔截。

```js
ag.onFulfilled((resolved) => {
  this.$message.success('Updated.');
});

ag.onFulfilled((resolved) => {
  this.$fetch();
});
```

更多的使用情境是在組件間共享請求執行結果:

```js
// src/utils/ProductService.js
const ProductService = {
  update(formData) {
    this.loading = true;

    const ag = arrestorGear(axios.put(this.api, formData));

    // 這裡會被執行，當成功時刷新資料
    ag.onFulfilled((res) => {
      this.$fetch();
    });

    ag.finally(() => {
      this.loading = false;
    })

    return ag;
  }
}

// src/pages/ProductPage.vue
function updateProduct(formData) {
  const ag = ProductService.update(formData);

  // 這裡也會被執行，當成功時顯示頁面的提示訊息
  ag.onFulfilled((res) => {
    this.$message.success(res);
    this.$router.push(-1);
  });

  ag.captureValidationError((messageBag) => {
    this.errors = messageBag.all((messages) => messages[0]);
  });
}

```

### ArrestorGear.finally()

類似於 Promise.finally(() => {})。

無論結果為何都會執行。

且**回傳 Promise 物件**，設計可用來嫁接 `Async/Await`。

```js
async function handleSubmit() {
  const ag = arrestorGear(() => axios.post(API_URL, { formData }));

  ag.captureValidationError((messageBag) => {
    this.errors = messageBag.all((messages) => messages[0]);
  });

  await ag.finally();
}
```


## Capture Methods

這個套件的關鍵核心---攔截器函數。

目前提供以下:

- `ArrestorGear.captureValidationError()`
- `ArrestorGear.captureStatusCode()`
- `ArrestorGear.captureAxiosError()`
- `ArrestorGear.captureAny()`

### ArrestorGear.captureValidationError()

捕獲 Http Status 422 並傳入 `ValidationMessageBag`。

```js
const ag = arrestorGear(() => axios.post(API_URL, { formData }));

ag.captureValidationError((messageBag) => {
  this.$message.error(messageBag.first());

  this.errors = messageBag.all((messages) => messages[0]);
});
```

#### ValidationMessageBag

- `ValidationMessageBag.response`
- `ValidationMessageBag.message`
- `ValidationMessageBag.errors`
- `ValidationMessageBag.has(key: string)`
- `ValidationMessageBag.get(key: string)`
- `ValidationMessageBag.first(key?: string)`
- `ValidationMessageBag.all((messages) => any)`

### ArrestorGear.captureStatusCode()

捕獲給訂條件 Http Status 。支援以下寫法:

```js
// 一般情形
ag.captureStatusCode(401, (axiosError) => {
  this.$message.info('未登入');
});

// 支援多個狀態碼
ag.captureStatusCode([403, 404], (axiosError) => {
  this.$message.error('找不到資源');
});

// 支援字符匹配
ag.captureStatusCode('5XX', (axiosError) => {
  this.$message.error('伺服器錯誤');
});

// 我全都要
ag.captureStatusCode([400, '5XX'], (axiosError) => {
  this.$message.info('了解');
});
```

### ArrestorGear.captureAxiosError()

捕獲任何 `AxiosError`。

**注意，後續的 `captureStatusCode()` 即便條件符合也不會執行。**

```js
const ag = arrestorGear(() => axios.post(API_URL, { formData }));

ag.captureAxiosError((axiosError) => {
  this.$message.error('停在這裡');
});

ag.captureStatusCode('5XX', (axiosError) => {
  this.$message.info('永遠輪不到我');
});
```

### ArrestorGear.captureAny()

捕獲所有錯誤類型。

通常使用情境是放在鏈的最後，作為通用的錯誤處理。

**注意，僅處理一開始建構 Promise rejected 的內容，執行期其他函數拋出的錯誤不會呼叫此函數**

```js
const ag = arrestorGear(() => axios.post(API_URL, { formData }));

ag.captureAxiosError((axiosError) => {
  this.$message.error('伺服器錯誤');
});

ag.captureAny((error) => {
  console.error(error);
});
```


## Tips | 其他小技巧

### 書寫順序不重要

除了 `Capture Methods` 受執行時的順序影響，其他的函數可任意擺放。

```js
// 將須處理的 `Promise Object` 透過 `arrestorGear` 函數包裹起來
const ag = arrestorGear(() => Promise.resolve(true)));

// 放這
ag.onFulfilled((resolved) => {
  console.log('A');
});

ag.captureAny((error) => {
  console.log('B');
});

// 放這
ag.onFulfilled((resolved) => {
  console.log('C');
});

ag.finally((isFulfilled) => {
  console.log('D');
});

// 或放這
ag.onFulfilled((resolved) => {
  console.log('E');
});

// 執行結果為:
// => A
// => C
// => E
// => D
```

### 支援鏈式呼叫

支援鏈式呼叫，但不推薦此作法。

鏈式呼叫加上回呼函數的寫法不僅對排版不友好，也影響整齊與美觀。

```js
arrestorGear(() => {
  //
  // ...
  //
  return Promise.resolve(true);
}))
  .onFulfilled((resolved) => {
    //
    // ...
    //
  })
  .captureStatusCode((resolved) => {
    //
    // ...
    //
  })
  .captureAny((resolved) => {
    //
    // ...
    //
  })
  .finally((resolved) => {
    //
    // ...
    //
  })
```


## About | 開發者碎碎念

此套件的最初目的，是為解決 `Axios` 採用 `Promise` 的諸多限制，尤其是肥大的 `then/catch` 區塊加上鏈式寫法，每每佔去檔案的大半空間。為了讓使用率高的 `Axios` 函數也能用起來優雅，我們在經過內部專案五六次疊代後開發出了這個套件。

### 這會不會又是一個過度設計?

也許有點。但在我近期的兩個專案中使用的結果來看。不僅美化了程式碼區塊、減少了行數，~~也讓程式碼複製起來更為方便~~ 也讓程式碼重用起來更為方便。

### 為甚麼不用 Async/Await 或 try-catch 處理就好

首先這兩者搭在一起的寫法本身就不美觀。




