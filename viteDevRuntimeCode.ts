const isForwardRefComponent = (type: any): boolean =>
  typeof type === "function" &&
  type.$$typeof === Symbol.for("react.forward_ref");
  
const code = `
import * as ReactJSXDevRuntime from "react/jsx-dev-runtime";
const _jsxDEV = ReactJSXDevRuntime.jsxDEV;
export const Fragment = ReactJSXDevRuntime.Fragment;

const _isBrowser = typeof window !== "undefined";
const SOURCE_KEY = Symbol.for("__jsxSource__");

const cleanFileName = (f) => {
  if (!f) return "";
  if (f.includes("dev_server")) f = f.split("dev_server")[1].slice(1);
  if (f.includes("sandbox-scheduler/sandbox")) {
    const p = f.split("sandbox-scheduler/")[1];
    f = p.split("/").slice(1).join("/");
  }
  return f.replace(/^\\/dev-server\\//, "");
};

const sourceMap = new Map();
if (_isBrowser) window.sourceElementMap = sourceMap;

function getKey(si) {
  return \`\${cleanFileName(si.fileName)}:\${si.lineNumber}:\${si.columnNumber}\`;
}
function unregister(node, si) {
  const k = getKey(si);
  const r = sourceMap.get(k);
  if (r) {
    for (const ref of r) {
      if (ref.deref() === node) {
        r.delete(ref);
        break;
      }
    }
    if (r.size === 0) sourceMap.delete(k);
  }
}
function register(node, si) {
  const k = getKey(si);
  if (!sourceMap.has(k)) sourceMap.set(k, new Set());
  sourceMap.get(k).add(new WeakRef(node));
}
function getTypeName(t) {
  if (typeof t === "string") return t;
  if (typeof t === "function")
    return t.displayName || t.name || "Unknown";
  if (typeof t === "object" && t !== null)
    return (
      t.displayName ||
      t.render?.displayName ||
      t.render?.name ||
      "Unknown"
    );
  return "Unknown";
}

export function jsxDEV(type, props, key, isStatic, source, self) {
  if (!_isBrowser) return _jsxDEV(type, props, key, isStatic, source, self);

  if (source?.fileName && typeof type !== "string" && type !== Fragment) {
    const tn = getTypeName(type);
    const si = {
      fileName: cleanFileName(source.fileName),
      lineNumber: source.lineNumber,
      columnNumber: source.columnNumber,
      displayName: tn,
    };
    const orig = props?.ref;
    const enh = {
      ...props,
      // Only add a ref if the component actually supports it
      ...( (isForwardRefComponent(type) || typeof orig !== "undefined") && {
        ref: (n: any) => {
          if (n) {
            if (!n[SOURCE_KEY]) {
              n[SOURCE_KEY] = si;
              register(n, si);
            }
          }
          if (typeof orig === "function") orig(n);
          else if (orig && typeof orig === "object") orig.current = n;
        },
      }),
    };
    return _jsxDEV(type, enh, key, isStatic, source, self);
  }

  if (source?.fileName && typeof type === "string") {
    const si = {
      fileName: cleanFileName(source.fileName),
      lineNumber: source.lineNumber,
      columnNumber: source.columnNumber,
      displayName: type,
    };
    const orig = props?.ref;
    const enh = {
      ...props,
      ref: (n) => {
        if (n) {
          const ex = n[SOURCE_KEY];
          if (ex) {
            if (getKey(ex) !== getKey(si)) {
              unregister(n, ex);
              n[SOURCE_KEY] = si;
              register(n, si);
            }
          } else {
            n[SOURCE_KEY] = si;
            register(n, si);
          }
        }
        if (typeof orig === "function") orig(n);
        else if (orig && typeof orig === "object") orig.current = n;
      },
    };
    return _jsxDEV(type, enh, key, isStatic, source, self);
  }

  return _jsxDEV(type, props, key, isStatic, source, self);
}
`;
export default code;