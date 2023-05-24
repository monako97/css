# css

css in js

> 基于 `emotion` 与 `stylis` 的 css in js

```shell
yarn add @moneko/css -S
```

## 在 web component 中使用

```javascript
import { css } from '@moneko/css';

const style = css`
  :host {
    --color: red;
  }
  p {
    color: var(--color, red);
    
    & span {
        color: green;
    }
  }
`;

function Comp() {
  return (
    <>
      <style>{style}</style>
      <p>aaa</p>
      <slot />
    </>
  );
}
```

## 插入全局样式

```javascript
import { injectGlobal } from '@moneko/css';

// 执行这段代码将样式插入到head中,返回一个消除函数
const flush = injectGlobal`
    body {
        color: red;
    }
`;

// 消除刚才插入的全局样式
flush();
```
