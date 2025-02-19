/**
 * 匹配错误提示 
 * 
 */

export function matchErrorTip(error) {
  const { message } = error;
  const errorTip = {
    'script_content': '话术分类不存在，前往话术资源添加此话术',
  }
  for (let key in errorTip) {
    if (message.includes(key)) {
      return errorTip[key];
    }
  }
  return message || '未知错误';
}
