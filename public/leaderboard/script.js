
window.onload = ()=>{
    fetch({
        url:'/leaderboard',
        type:'POST',
    })
    .then((res)=>{return res.json})
    .then((res)=>{
        
    })

}