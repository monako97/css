import { DECLARATION, type Middleware } from 'stylis';

export type PxToRemOptions = {
  remSize?: number;
  allowList?: string[];
  blockList?: string[];
};

const pxRegexp = /"[^"]+"|'[^']+'|url\([^)]+\)|(\d*\.?\d+)px/g;
const pxToRem =
  ({ remSize = 16, allowList, blockList }: PxToRemOptions = {}): Middleware =>
  (element) => {
    if (element.type === DECLARATION) {
      const declarationHasPx = element.value.match(pxRegexp);

      if (declarationHasPx) {
        if (allowList && !allowList.includes(element.props as string)) return;
        if (blockList && blockList.includes(element.props as string)) return;

        const expression = (element.children as string).replace(pxRegexp, (match, group) =>
          group ? `${Number(group) / remSize}rem` : match
        );
        const reconstructedDeclaration = `${element.props}:${expression};`;

        element.return = reconstructedDeclaration;
      }
    }
  };

Object.defineProperty(pxToRem, 'name', { value: 'px2Rem' });

export default pxToRem;
