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
        const props = ele.props as string;

        if (!allowList?.includes(props) || blockList?.includes(props)) return;
        const expression = (ele.children as string).replace(
          pxRegexp,
          (match, group) => (group ? `${Number(group) / remSize}rem` : match)
        );

        ele.return = `${props}:${expression};`;
      }
    }
  };

Object.defineProperty(pxToRem, "name", { value: "px2Rem" });

export default pxToRem;
