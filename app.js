
const x= require('fs')

const https= require('https')


function fetchData(user,options){
    return new Promise ((resolve,rejects)=>{
        https.get(user,options,(res)=>{

        let data = ""
     
        res.on('data',(chunk)=>{
     
             data+=chunk
        })
       
        res.on('end',()=>{
         if(res.statusCode===200){
             const activites= JSON.parse(data)
             resolve(activites)
         }else{
             rejects("there is an error")
         }
            
        })
     
     }).on('error',(err)=>{
         rejects(err.message)
     })
     
}
    )}

function displayActivites(activites){
    

    if(!Array.isArray(activites)){
         console.log("invalid data")
         return 
    }
       activites.forEach(activity => {
             if(activity.type==='PushEvent'){
                console.log(`Pushed ${activity.payload.commits.length} commits to ${activity.repo.name}`);
             }else if (activity.type === 'IssuesEvent' && activity.payload.action === 'opened') {
                console.log(`Opened a new issue in ${activity.repo.name}`);
            } else if (activity.type === 'StarEvent') {
                console.log(`Starred ${activity.repo.name}`);
            }
       });
       
}

async function main() {
    try {
        const userName = process.argv[2]

        const  url =`https://api.github.com/users/${userName}/events`
        
        
        var options = {
            host: 'api.github.com',
            path: '/users/' + userName + '/repos',
            method: 'GET',
            headers: {'user-agent': 'node.js'}
        };
        const activites=await fetchData(url,options)
        displayActivites(activites)
        
    } catch (err) {
        console.log(err.message)
    }
 
}

main()