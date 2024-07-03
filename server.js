const express=require("express")
const main = require("./scrape_function/scrape");
const app=express();

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.post("/api/vi/scrap",async(req,res)=>{
    const {videoId,minLikes}=req.body
    let data= await main(videoId,minLikes)
    res.status(200).send({
        status : "ok",
        list:data
    })

})

app.listen(3000,()=>{
    console.log("server is running")
})