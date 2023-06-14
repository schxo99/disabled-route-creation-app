const express = require("express");
const router = express.Router();
const pool = require("../../middleware/db");

//홈 지도 화장실정보 및 배리어정보
router.get("/", async(req,res)=>{
	try{
		const restroom_info = await pool.query("select * from 화장실")
		const barrier = await pool.query("select * from 배리어")
		
		res.json({
			restroom_info: restroom_info[0],
			barrier: barrier[0],
		})
	}catch(error){
		console.log(error);
	}
})

//배리어등록
router.post("/insertBarrier", async(req,res)=>{
	try{
		const { type, address, lat, log, pass, name, image, address_detail } = req.body;
		// console.log(type, address, lat, log, pass, name, image, address_detail)
		const insert_info = await pool.query("insert into 배리어(유형, 주소, 위도, 경도, 우회여부, 닉네임, 사진, 상세주소) values(?, ?, ?, ?, ?,?,?,?)",[type, address, lat, log, pass, name, image, address_detail]);
		res.send("등록이 완료되었습니다.")
	}catch(error){
		
	}
});

//배리어조회
router.get("/barrier", async(req,res)=>{
	try{
		const selectBarrier = await pool.query("select * from 배리어")
		
		res.json(selectBarrier)
	}catch(error){
		console.log(error)
	}
})

//화장실조회
router.get("/restRoom", async(req,res)=>{
	try{
		const selectRestRoom = await pool.query("select * from 화장실")
		
		res.json(selectRestRoom)
	}catch(error){
		console.log("restRoomError", error)
	}
})

	
//관광지 조회
router.get("/trip", async(req,res)=>{
	try{
		const selectTrip = await pool.query("select * from 관광지")
		
		res.json(selectTrip)
	}catch(error){
		console.log(error)
	}
})

//휠체어 조회
router.get("/wheel", async(req,res)=>{
	try{
		const selectWheel = await pool.query("select * from 휠체어")
		
		res.json(selectWheel)
	}catch(error){
		console.log(error)
	}
})






module.exports = router;