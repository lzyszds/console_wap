
const fse = require('fs-extra')

export function getProbability(value) {

  let v = Number(value) / 100
  return Math.random() <= v;

}

//生成随机整数
export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


export function getFileContent(filePath) {
  return new Promise((resolve, reject) => {
    let fileName = filePath;
    //let fileName = process.cwd()+'/script/tiktok/stop.js';
    //let fileName = "D:/www/chuhai/console/dist/win-unpacked/script/tiktok/stop.js";
    fse.readFile(fileName, 'utf8')
      .then(filecontents => {
        resolve(filecontents); //异步处理 
      })
      .catch(err => {
        console.log(err);
        reject(err);
      })
  });
}

//递归查找对象中指定值的所有键名
export function findNamesByPropertyValue(obj, propertyName, propertyValue) {
  let result = [];

  function recurse(current) {
    if (current.value && current.value[propertyName] === propertyValue) {
      result.push(current.name);
    }
    if (current.children && current.children.length > 0) {
      current.children.forEach(child => recurse(child));
    }
  }

  obj.forEach(item => recurse(item));
  return result;
}


//判断当前系统文档中是否存在项目文件夹
export function isProjectDir(projectDir) {

  if (!fse.existsSync(projectDir)) {
    fse.mkdirSync(projectDir)
  }
  return projectDir
}
