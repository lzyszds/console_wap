const fse = require('fs-extra')

export const scriptUtils = {


  'getScriptContent':async function getScriptContent(fName){

    let fileName = process.cwd()+'/src/script/' + fileName;
    return  new Promise((resolve, reject) => {
      fse.readFile(fileName, 'utf8')
      .then(filecontents => {
        resolve(filecontents); //异步处理 
      })
    });  

  },

  'test':async function test(){

    let fileName = process.cwd()+'/src/script/test.js';
    return  new Promise((resolve, reject) => {
      fse.readFile(fileName, 'utf8')
      .then(filecontents => {
        resolve(filecontents); //异步处理 
      })
    });  
    
  },

  'run_instagram':async function run_instagram(){

    let fileName = process.cwd()+'/src/script/run_instagram.js';
    return  new Promise((resolve, reject) => {
      fse.readFile(fileName, 'utf8')
      .then(filecontents => {
        resolve(filecontents); //异步处理 
      })
    });  
    
  },

  'login_instagram':async function login_instagram(){

    let fileName = process.cwd()+'/src/script/login_instagram.js';
    return  new Promise((resolve, reject) => {
      fse.readFile(fileName, 'utf8')
      .then(filecontents => {
        resolve(filecontents); //异步处理 
      })
    });  
    
  },

  'register_instagram':async function login_instagram(){

    let fileName = process.cwd()+'/src/script/register_instagram.js';
    return  new Promise((resolve, reject) => {
      fse.readFile(fileName, 'utf8')
      .then(filecontents => {
        resolve(filecontents); //异步处理 
      })
    });  
    
  },

  'create_group_instagram':async function create_group_instagram(){

    let fileName = process.cwd()+'/src/script/create_group_instagram.js';
    return  new Promise((resolve, reject) => {
      fse.readFile(fileName, 'utf8')
      .then(filecontents => {
        resolve(filecontents); //异步处理 
      })
    });  
    
  },

  'addperson_instagram':async function addperson_instagram(){

    let fileName = process.cwd()+'/src/script/addperson_instagram.js';
    return  new Promise((resolve, reject) => {
      fse.readFile(fileName, 'utf8')
      .then(filecontents => {
        resolve(filecontents); //异步处理 
      })
    });  
    
  },

  'privateletter_instagram':async function privateletter_instagram(){

    let fileName = process.cwd()+'/src/script/privateletter_instagram.js';
    return  new Promise((resolve, reject) => {
      fse.readFile(fileName, 'utf8')
      .then(filecontents => {
        resolve(filecontents); //异步处理 
      })
    });  
    
  },


  'automaticChat_instagram':async function automaticChat_instagram(){

    let fileName = process.cwd()+'/src/script/automaticChat_instagram.js';
    return  new Promise((resolve, reject) => {
      fse.readFile(fileName, 'utf8')
      .then(filecontents => {
        resolve(filecontents); //异步处理 
      })
    });  
    
  },

  'fosternumber_instagram':async function fosternumber_instagram(){

    let fileName = process.cwd()+'/src/script/fosternumber_instagram.js';
    return  new Promise((resolve, reject) => {
      fse.readFile(fileName, 'utf8')
      .then(filecontents => {
        resolve(filecontents); //异步处理 
      })
    });  
    
  },












}
//exports.scriptUtils = scriptUtils