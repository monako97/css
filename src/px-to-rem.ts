import { DECLARATION, type Middleware } from "stylis";

export type PxToRemOptions = {
  remSize?: number;
  allowList?: string[];
  blockList?: string[];
};

const pxRegexp = /"[^"]+"|'[^']+'|url\([^)]+\)|(\d*\.?\d+)px/g;
const pxToRem =
  ({ remSize = 16, allowList, blockList }: PxToRemOptions = {}): Middleware =>
  (ele) => {
    if (ele.type === DECLARATION) {
      const declarationHasPx = ele.value.match(pxRegexp);

      if (declarationHasPx) {
        if (allowList && !allowList.includes(ele.props as string)) return;
        if (blockList && blockList.includes(ele.props as string)) return;

        ele.return = `${ele.props}:${(ele.children as string).replace(
          pxRegexp,
          (match, group) => (group ? `${Number(group) / remSize}rem` : match)
        )};`;
      }
    }
  };

Object.defineProperty(pxToRem, "name", { value: "px2Rem" });

export default pxToRem;
