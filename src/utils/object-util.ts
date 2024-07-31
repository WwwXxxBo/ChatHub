// 复制对象
export const copyObj = (obj: object | undefined) => {
  if (!obj) {
    return obj;
  }
  // JSON.parse() 方法可以将字符串转化为 JavaScript 对象
  // JSON.stringify() 方法将 JavaScript 对象转换为字符串
  return JSON.parse(JSON.stringify(obj));
};

export const copyFields = (source: object, target: object) => {
  for(const key in source){
    if(Object.prototype.hasOwnProperty.call(source, key)){
      target[key] = source[key]
    }
  }
}