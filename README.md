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

injectGlobal`
    body {
        color: red;
    }
`;
```
