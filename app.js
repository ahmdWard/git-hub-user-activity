
const fs= require('fs')
const path = require('path');
const https= require('https')


const cacheDuration =5*60*1000
const cacheFilePath= path.join(__dirname,'cacheData.json')


function readCachedData() {
    if (fs.existsSync(cacheFilePath)) {
        const cacheContent = JSON.parse(fs.readFileSync(cacheFilePath, 'utf-8'));
        const now = Date.now();

      
        if (now - cacheContent.timestamp > cacheDuration) {
            console.log("Cache expired, fetching new data...");
            fs.unlinkSync(cacheFilePath); 
            return null;
        }

        return cacheContent.data;
    }
    return null;
}
function writeCache(data){

    const cacheData={
        timestamp:Date.now(),
        data:data
    }

    fs.writeFileSync(cacheFilePath,JSON.stringify(cacheData),'utf-8')

}

function fetchData(user,options){

    const cache= readCachedData()
    if(cache)
        return  Promise.resolve(cache)

    return new Promise ((resolve,rejects)=>{
        https.get(user,options,(res)=>{
        
        let data = ""
     
        res.on('data',(chunk)=>{
     
             data+=chunk
        })
       
        res.on('end',()=>{
         if(res.statusCode===200){
             const activites= JSON.parse(data)
             writeCache(activites)
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
    
    console.log(activites)
    if(!Array.isArray(activites)){
         console.log("invalid data")
         return 
    }
       activites.forEach(activity => {
             if(activity.type==='PushEvent'){
                console.log(`Pushed ${activity.payload.commits.length} commits to ${activity.repo.name}`);
             }else if (activity.type === 'IssuesCommentEvent' && activity.payload.action === 'opened') {
                console.log(`Opened a new issue in ${activity.repo.name}`);
            } else if (activity.type === 'CreateEvent') {
                console.log(`Created ${activity.repo.name}`);
            }else if (activity.type === 'DeleteEvent') {
                console.log(`Deleted ${activity.repo.name}`);
            }else if (activity.type === 'PullRequestEvent') {
                console.log(`Pulled ${activity.repo.name}`);
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