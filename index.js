var http = require('http')
const express = require('express')
const fs = require('fs')
const app = new express()
app.use(express.json());

const port = 3000

//server creation
const server = http.createServer(app)

app.get('/',(req,res)=>{
    res.sendFile(__dirname+'/public/main/index.html')
})

app.get('/script.js',(req,res)=>{
    res.sendFile(__dirname+'/public/main/script.js')
})

app.get('/style.css',(req,res)=>{
    res.sendFile(__dirname+'/public/main/style.css')
})

//game
app.get('/game',(req,res)=>{
    res.sendFile(__dirname+'/public/game/index.html')
})

app.get('/game/script.js',(req,res)=>{
    res.sendFile(__dirname+'/public/game/script.js')
})

app.get('/game/style.css',(req,res)=>{
    res.sendFile(__dirname+'/public/game/style.css')
})

app.get('/game/favicon.ico',(req,res)=>{
    res.sendFile(__dirname+'/public/game/media/icon.ico')
})

//leaderboard
app.get('/leaderBoard',(req,res)=>{
    res.sendFile(__dirname+'/public/leaderboard/index.html')
})

app.get('/leaderBoard/script.js',(req,res)=>{
    res.sendFile(__dirname+'/public/leaderboard/script.js')
})

app.get('/leaderBoard/style.css',(req,res)=>{
    res.sendFile(__dirname+'/public/leaderboard/style.css')
})


//libraries

app.get('/lib/js-cookie.js',(req,res)=>{
    res.type('application/javascript')
    res.sendFile(__dirname+'/public/lib/js-cookie.js')
})

app.get('/three/*',(req,res)=>{
    //res.type('application/javascript')
    //console.log(req.params[0])
    try{
        res.sendFile(__dirname+`/node_modules/three/${req.params[0]}`)
    }catch(err){
        res.send(err)
    }
})

//give models
app.get('/models/*',(req,res)=>{
    //res.type('application/javascript')
    //console.log(req.params[0])
    try{
        res.sendFile(__dirname+`/public/models/${req.params[0]}`)
    }catch(err){
        res.send(err)
    }
})

//handle POST requests

app.post('/login',(req,res)=>{
    const post = req.body

    res.type('application/json')
    fs.readFile('userData.json',(err,data)=>{
        if(err) throw err;
        const userMap = jsonToMap(data)

        if(!userMap.has(post.user)){
            res.json({error:'username username not found in database'})
        }else if(userMap.get(post.user).pass != post.pass){
            res.json({error:'incorrect password'})
        }else{
            res.cookie('uuid',userMap.get(post.user).uuid)
            res.json({message:'success'})
            console.log('successful login')
        }
    })
})

app.post('/create',(req,res)=>{
    console.log(req.body)
    const post = req.body

    res.type('application/json')
    fs.readFile('userData.json',(err,data)=>{
        if(err) throw err;
        const userMap = jsonToMap(data)
        if(post.user.split('').length <= 2){
            res.json({error:'username must be more than two characters'})
        }else if(post.pass.split('').length <= 4){
            res.json({error:'password must be more than four characters'})
        }else if(userMap.has(post.user)){
            res.json({error:'username already in use'})
        }else{
            const details= {uuid:uuidv4(),pass:post.pass,}
            res.cookie('uuid',details.uuid)
            userMap.set(post.user,details)
            fs.writeFile('userData.json',mapToJson(userMap),()=>{
                res.json({message:'success'})
                console.log('successfull acct creation')
            })
        }
    })
    
})


//websocket stuff
const WebSocket = require('ws')
//const wss =  new WebSocket.Server({port:3001})
const wss =  new WebSocket.Server({server:server})

const clients = new Map();

wss.on('connection', (ws) => {
    var id = uuidv4();
    var metadata = { id ,active:true};

    clients.set(ws, metadata);

    ws.on('message', (messageAsString) => {
        const message = JSON.parse(messageAsString);
        const metadata = clients.get(ws);

        message.sender = metadata.id;
        message.active = true;
        
        
        console.clear()
        console.table(clients)
        //console.log(message)

        const outbound = JSON.stringify(message);

        [...clients.keys()].forEach((client) => {
        client.send(outbound);
        });
    });

    ws.on("close", () => {
        
        //send that the client is logged off
        [...clients.keys()].forEach((client) => {
            client.send(JSON.stringify({
                sender: clients.get(ws).id,
                active:false,
            }));
        });

        //delete client from map locally
        clients.delete(ws);
    });
});

//listen on port
server.listen(port, ()=>{
    console.log(`listening on port ${port}`)
})

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function mapToJson(map) {
    return JSON.stringify([...map]);
}
function jsonToMap(jsonStr) {
    return new Map(JSON.parse(jsonStr));
}



function loop(){
    
    console.clear()
    console.table(clients)
    setTimeout(loop(),1000)
}

//loop()


