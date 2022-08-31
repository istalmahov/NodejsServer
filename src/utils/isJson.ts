export const isJson = (json: string): boolean => {
  if (!isString(json)) return false;

  json = json.replace(/\s/g, "").replace(/\n|\r/, "");

  if (/^\{(.*?)\}$/.test(json)) return /"(.*?)":(.*?)/g.test(json);

  if (/^\[(.*?)\]$/.test(json)) {
    return json
      .replace(/^\[/, "")
      .replace(/\]$/, "")
      .replace(/},{/g, "}\n{")
      .split(/\n/)
      .map((s) => isJson(s))
      .reduce((prev: boolean, curr: boolean) => prev && curr);
  }

  return false;
};

function isString(str: any) {
  return Object.prototype.toString.call(str) === "[object String]";
}

function isObject(obj: any) {
  return Object.prototype.toString.call(obj) === "[object Object]";
}
