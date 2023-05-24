// @ts-nocheck
import { compile } from 'stylis';

function stringifyTree(elements) {
  return elements
    .map(function (element) {
      switch (element.type) {
        case 'import':
        case 'decl':
          return element.value;
        case 'comm':
          return element.props === '/' && element.value.includes('@') ? element.value : '';
        case 'rule':
          return `${element.value.replace(/&\f/g, '&')}{${stringifyTree(element.children)}}`;
        default: {
          return `${element.value}{${stringifyTree(element.children)}}`;
        }
      }
    })
    .join('');
}
function createRawStringFromTemplateLiteral(quasi) {
  const strs = quasi.quasis.map(function (x) {
    return x.value.cooked;
  });
  const src = strs
    .reduce(function (arr, str, i) {
      arr.push(str);

      if (i !== strs.length - 1) {
        arr.push(`xxx${i}:xxx`);
      }

      return arr;
    }, [])
    .join('')
    .trim();

  return src;
}
function haveSameLocation(element1, element2) {
  return element1.line === element2.line && element1.column === element2.column;
}
function isAutoInsertedRule(element) {
  return element.type === 'rule' && element.parent && haveSameLocation(element, element.parent);
}
function toInputTree(elements, tree) {
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const parent = element.parent,
      children = element.children;

    if (!parent) {
      tree.push(element);
    } else if (!isAutoInsertedRule(element)) {
      parent.children.push(element);
    }

    if (Array.isArray(children)) {
      element.children = [];
      toInputTree(children, tree);
    }
  }

  return tree;
}
function getDynamicMatches(str) {
  const re = /xxx(\d+):xxx/gm;
  let match;
  const matches = [];

  while ((match = re.exec(str)) !== null) {
    // so that flow doesn't complain
    if (match !== null) {
      matches.push({
        value: match[0],
        p1: parseInt(match[1], 10),
        index: match.index,
      });
    }
  }

  return matches;
}
function interleave(strings, interpolations) {
  return interpolations.reduce(
    function (array, interp, i) {
      return array.concat([interp], strings[i + 1]);
    },
    [strings[0]]
  );
}
function replacePlaceholdersWithExpressions(str, expressions, t) {
  const matches = getDynamicMatches(str);

  if (matches.length === 0) {
    if (str === '') {
      return [];
    }

    return [t.stringLiteral(str)];
  }

  const strings = [];
  const finalExpressions = [];
  let cursor = 0;

  matches.forEach(function (_ref, i) {
    const value = _ref.value,
      p1 = _ref.p1,
      index = _ref.index;
    const preMatch = str.substring(cursor, index);

    cursor = cursor + preMatch.length + value.length;

    if (!preMatch && i === 0) {
      strings.push(t.stringLiteral(''));
    } else {
      strings.push(t.stringLiteral(preMatch));
    }

    finalExpressions.push(expressions[p1]);

    if (i === matches.length - 1) {
      strings.push(t.stringLiteral(str.substring(index + value.length)));
    }
  });
  return interleave(strings, finalExpressions).filter(function (node) {
    return node.value !== '';
  });
}
function minify(path, t) {
  const quasi = path.node.quasi;
  const raw = createRawStringFromTemplateLiteral(quasi);
  const minified = stringifyTree(toInputTree(compile(raw), []));
  const expressions = replacePlaceholdersWithExpressions(minified, quasi.expressions || [], t);

  path.replaceWith(t.callExpression(path.node.tag, expressions));
}
function plugin({ types: t }) {
  const alis = ['injectGlobal', 'css'];

  return {
    visitor: {
      ImportDeclaration(path) {
        const { node } = path;
        const { specifiers, source } = node;

        // 判断导入来源是否匹配
        if (source.value === '@moneko/css') {
          specifiers.forEach((specifier) => {
            if (t.isImportSpecifier(specifier)) {
              // 判断是否为要替换的导入标识符
              if (alis.includes(specifier.imported.name)) {
                // 保存导入的别名和来源
                path.hub.file.metadata.importedCssAlias = specifier.local.name;
                path.hub.file.metadata.importedCssSource = source.value;
              }
            }
          });
        }
      },
      TaggedTemplateExpression(path) {
        // 判断是否为CSS模板字符串
        if (
          t.isIdentifier(path.node.tag) &&
          ['injectGlobal', 'css', path.hub.file.metadata.importedCssAlias].includes(
            path.node.tag.name
          ) &&
          path.hub.file.metadata.importedCssSource &&
          t.isTemplateLiteral(path.node.quasi)
        ) {
          minify(path, t);
        }
      },
    },
  };
}

export default plugin;
