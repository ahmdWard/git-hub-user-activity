const { error } = require('console')
const x= require('fs')

const https= require('https')
const userName = process.argv[2]

const  url ="https://api.github.com/users/<username>/events"

const userURL= url.replace("<username>",userName)

var options = {
    host: 'api.github.com',
    path: '/users/' + userName + '/repos',
    method: 'GET',
    headers: {'user-agent': 'node.js'}
};

https.get(userURL,options,(res)=>{

   let data = ""

   res.on('data',(chunk)=>{

        data+=chunk
   })
  
   res.on('end',()=>{
    if(res.statusCode===200){
        const activites= JSON.parse(data)
        console.log(activites[1])
    }else{
        console.error("there is an error")
    }
       
   })

}).on('error',(err)=>{
    console.log(err.message)
})

