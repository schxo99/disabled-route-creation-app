const express = require("express");
const router = express.Router();
const pool = require("../../middleware/db");

//사용자 위치로그 등록
router.post("/", async (req,res)=>{
	const { name, time, lat, log, target } = req.body;
	try{
		
		let today = new Date();
		let year = today.getFullYear();
		let month = today.getMonth() + 1;
		let date = today.getDate();
		const now = `${year}/${month}/${date}`
		const first_log = await pool.query("insert into 사용자로그 (닉네임, 날짜, 시간, 위도, 경도, 목적지) values (?,?,?,?,?,?)", [name, now, time, lat, log, target]);
	}catch(error){
		console.log(error)
	};
});

//경로 로그 조회
router.get("/:address", async (req, res) => {
  	const { address } = req.params;
	console.log(address)
	  try {
		const read_target = await pool.query("select * from 사용자로그 where 목적지 = ? order by 닉네임, 날짜, ID", [address]);
		console.log(read_target[0]);

		res.json(read_target[0]);
	  } catch (error) {
		console.log(error);
		// 오류가 발생했을 때 클라이언트에게 오류 응답
		res.status(500).json({ error: "오류가 발생했습니다." });
	  }
});

module.exports = router;


