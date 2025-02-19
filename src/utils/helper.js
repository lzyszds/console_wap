const fse = require('fs-extra')



export const helper = {

  'getTxtContent':function getTxtContent(fileName){

    return  new Promise((resolve, reject) => {
      fse.readFile(fileName, 'utf8')
      .then(filecontents => {
        resolve(filecontents); //异步处理 
      })
    });  
  
  }


}
