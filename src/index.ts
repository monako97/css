import {
  serializeStyles,
  type Interpolation,
  type CSSInterpolation,
  type ArrayCSSInterpolation,
  type ComponentSelector,
  type CSSObject,
} from '@emotion/serialize';
import { StyleSheet } from '@emotion/sheet';
import { compile, middleware, prefixer, rulesheet, serialize, stringify } from 'stylis';
import type { PropertiesHyphen } from 'csstype';
import pxToRem from './px-to-rem';

export interface CSSProperties extends PropertiesHyphen {
  [key: `-${string}`]: string | number | undefined;
}

export { CSSInterpolation, ArrayCSSInterpolation, ComponentSelector, CSSObject };

export interface CSSStyleSheet extends StyleSheet {
  speedy(value: boolean): void;
}

export function css(...args: Array<TemplateStringsArray | Interpolation<CSSInterpolation>>) {
  if (!args[0]) {
    return '';
  }
  let styleStr = '';

  serialize(
    compile(serializeStyles(args).styles),
    middleware([
      pxToRem(),
      prefixer,
      stringify,
      rulesheet((str) => {
        styleStr += str;
      }),
    ])
  );

  return styleStr;
}

export function injectGlobal(
  ...args: Array<TemplateStringsArray | Interpolation<CSSInterpolation>>
) {
  const sheet = new StyleSheet({
    key: 'n-global',
    container: document.head,
  });
  const sty = css(...args);

  sheet.insert(sty);
  return () => sheet.flush();
}

export function cx(...args: (string | boolean | undefined | null)[]) {
  return args.filter(Boolean).join(' ');
}
