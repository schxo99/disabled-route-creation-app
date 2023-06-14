const express = require("express");
const router = express.Router();
const axios = require('axios');
const pool = require("../../middleware/db");

//이동경로 생성
router.post("/" , async (req,res)=>{
	
	const { origin, destination, type } = req.body;
	
	origin.sort((a,b)=>parseFloat(b)-parseFloat(a))
	destination.sort((a,b)=>parseFloat(b)-parseFloat(a))
	
	
	try{
		
		const result = await main(origin, destination, type)
		
		res.send([result])
		
	}catch(error){
		
		console.log(error)
	}
})


async function main(origin, destination, type){
	
	var direction = []
	
	try{
		
		const transfer = await getTransfer(origin, destination, type)
		
		if (transfer !== false){
			console.log("대중교통 이용합니다")
			const getTransport = await findTransport(origin, destination, transfer)
			return getTransport
			
		} else{
			console.log("대중교통 경로가 없습니다.")
			const getWalk = await findWalk(origin, destination, direction)
			var uniqueResult = Array.from(new Set(getWalk));
			const walkResult = []
			for(var i = 0; i<uniqueResult.length; i++){
				walkResult.push("도보",uniqueResult[i])
			}
			
			return walkResult
		}
		
		
	}catch(error){
		console.log("mainError", error)
	}
}


//대중교통 경로 생성 타워
async function findTransport(origin, destination, transfer){
	console.log("대중교통 경로 생성합니다.")
	try{
		var startWalk = []
		var endWalk = []
		const orderLine = await orderPath(transfer)
		// console.log("시작",origin, orderLine[0][1])
		// console.log("종료", orderLine[orderLine.length-1][1], destination)
		// console.log(orderLine.length)
		// return orderLine
		const startResult = await findWalk(origin, orderLine[0][1], startWalk)
		const endResult = await findWalk(orderLine[orderLine.length-1][1], destination, endWalk)
		const addType = []
		for(var i = 0; i< startResult.length; i++){
			addType.push("도보", startResult[i])
		}
		for (var i = 0; i < orderLine.length; i++){
			addType.push(orderLine[i])
		}
		
		for (var i = 0; i < endResult.length; i++){
			addType.push("도보",endResult[i])
		}
		
		return addType
		
	}catch(error){
		console.log("findTransport", error)
	}
}



//도보경로 생성 타워
async function findWalk(origin, destination, direction){
	console.log("도보 경로 생성합니다.")
	try{
		
		const getDirection = await findDirection(origin, destination , direction)
		return getDirection
		
	}catch(error){
		console.log("findWalkError", error)
	}
}

//대중교통 경로 정리
async function orderPath(transfer){
	console.log("대중교통 경로 정리합니다.")
	try{
		const line = []
		for( var i = 0; i < transfer.length; i++ ){
			if (transfer[i].trafficType === 3){
				//경유할 시 도보이동 로직 작성
			}else if(transfer[i].trafficType === 1){ //지하철인 경우
				for(var j = 0; j < transfer[i].passStopList.stations.length; j++){
					line.push(transfer[i].lane[0].name, [ parseFloat(transfer[i].passStopList.stations[j].x) , parseFloat(transfer[i].passStopList.stations[j].y)])
				}
			}else if(transfer[i].trafficType === 2){
				//버스인경우 로직 작성
			}
		}
	return line
	}catch(error){
		console.log("orderPathError", error)
	}
}


//도보 경로 생성
async function findDirection(origin, destination, direction){
	console.log("도보 경로를 생성합니다.")
	try{
		const getTmap = await Tmap(origin, destination, 1) //출발부터 도착까지 경로 좌표만 조회
		const barriers = (await pool.query("select * from 배리어 where 우회여부 = 1"))[0]; //우회불가능한 배리어 조회
		for (var i = 0; i < getTmap.length-1; i++){
			for(var j = 0; j < barriers.length; j++){
				const meetBarrierTF = await barrierTF(getTmap[i], getTmap[i+1], barriers[j]);//배리어 만남여부
				if (meetBarrierTF === 1){
					const nearPoint = await findNearPoints(getTmap[i], destination, barriers[j]);//돌아갈 주변 좌표 구하기
					console.log('nearPoints', nearPoint)
					const lastPoint = await findLastPoint(nearPoint, direction); //탐색된 경로와 이어주기
					console.log("lastPoint",lastPoint)
					const bridge = await Tmap(direction[direction.length-1], nearPoint,1)
					for (var k = 0; k < bridge.length; k++){
						direction.push(bridge[k]);
					}
					const newDirection = await findDirection(nearPoint, destination, direction)
					if (newDirection){
						return direction
					}
				}else if(meetBarrierTF === 0){
					direction.push(getTmap[i])
				}
			}
		}
		return direction
	}catch(error){
		console.log("findDirection", error)
	}
}
//저장된 경로중 가까운 좌표 조회
async function findLastPoint(nearPoint, direction){
	console.log("경로를 재설정합니다.")
	try{
		var distances = []
		for(var i = 0; i < direction.length; i++){
			const distance = await Tmap(direction[i], nearPoint, 2)
			distances.push(distance)
		}
		const minV = Math.min(...distances)
		const minI = distances.indexOf(minV)
		
		if (direction.length > minI){
			direction.splice(minI+1)
		}
	
		return direction
	}catch(error){
		console.log("findLastPointError", error)
	}
}

//좌표 주면 다른 좌표 조회
async function findNearPoints(center, destination, barrier){
	console.log("경로를 재탐색합니다.")
	try{
		const radius = 50;
		const numPoints = 8
		const nearPoints = []
		const angleIncrement = (2*Math.PI) / numPoints;
		
		for (var i = 0; i < numPoints; i++){
			const angle = i * angleIncrement;
			const latitudeOffset = (radius / 6371000) * (180 / Math.PI);
			const longitudeOffset = (radius / (6371000 * Math.cos(Math.PI * center[1] / 180))) * (180 / Math.PI);
			const x = center[0] + longitudeOffset * Math.cos(angle);
			const y = center[1] + latitudeOffset  * Math.sin(angle);
			nearPoints.push([x, y]);
		}
		var eachDistance = [];
		for (var j = 0; j < nearPoints.length; j++){
			eachDistance.push(Math.sqrt((nearPoints[j][1] - barrier.위도)**2 + (nearPoints[j][0] - barrier.경도)**2))
		}
		
		for (var j = 0; j < 3; j++){
			const minV = Math.min(...eachDistance)
			const minI = eachDistance.indexOf(minV)
			eachDistance.splice(minI, 1)
			nearPoints.splice(minI, 1)
		}
		for (var j = 0; j < 3; j++){
			const maxV = Math.max(...eachDistance)
			const maxI = eachDistance.indexOf(maxV)
			eachDistance.splice(maxI, 1)
			nearPoints.splice(maxI, 1)
		}
		const getNewRoadTime = []
		for(var i = 0; i < nearPoints.length; i++){
			const selectDirection = await Tmap(nearPoints[i], destination, 2)
			getNewRoadTime.push(selectDirection)
		}
		const minGeo = Math.min(...getNewRoadTime)
		const minGeoI = getNewRoadTime.indexOf(minGeo)
		
		return nearPoints[minGeoI]
		
	}catch(error){
		console.log("nearPointsERROR", error)
	}
}

//배리어 만남 여부
async function barrierTF(now, next, barrier){
	console.log("배리어로 지나갈 수 없습니다.")
	try{
		const distanceTF = await isItDistance(now, next, barrier) //다음 좌표보다 가까운지
		const angleTF = await isItAngle(now, next, barrier) //다음좌표랑 각도차가 적은지
		if (distanceTF === 1 && angleTF === 1){
			return 1 //배리어 만남
		}else{
			return 0 //배리어 안만남
		}
	}catch(error){
		console.log("barrierTFError", error)
	}
}

//다음포인트와 배리어간의 백터예각 구하기
async function isItAngle(now, next, barrier){
	console.log("각도를 구합니다.")

	try{
		const vector1 = [next[0] - now[0], next[1] - now[1]];
		const vector2 = [barrier.경도 - now[0], barrier.위도 - now[1]];
		const dotProduct = vector1[0] * vector2[0] + vector1[1] * vector2[1];
		const magnitude1 = Math.sqrt(vector1[0]**2 + vector1[1]**2);
		const magnitude2 = Math.sqrt(vector2[0]**2 + vector2[1]**2);
		const angleInRadians = Math.acos(dotProduct / (magnitude1 * magnitude2));
		const angleInDegrees = (angleInRadians * 180) / Math.PI;
		
		if (angleInDegrees < 20){
			return 1
		} else if (angleInDegrees >= 20){
			return 0
		}
		
	}catch(error){
		console.log("getNBAngleERROR", error)
	}
}

//배리어 거리계산
async function isItDistance(now, next, barrier){
	console.log("배리어와의 거리를 계산합니다.")
	try{
		const nextDistance = Math.sqrt((now[0] - next[0])**2 + (now[1] - next[1])**2)
		const barrierDistance = Math.sqrt((now[0] - barrier.경도)**2 + (now[1] - barrier.위도)**2)
		if (nextDistance > barrierDistance){ //다음좌표보다 배리어가 가까우면
			return 1
		} else if (nextDistance <= barrierDistance){ //다음좌표가 더 가까우면
			return 0
		}
	}catch(error){
		console.log("isItDistance", error)
	}
}

//Tmap api사용
async function Tmap(origin, destination, ch){
	console.log("Tmap api를 사용합니다.")

	try{
	const options = {
		  method: 'POST',
		  url: 'https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&callback=function&searchOption=30',
		  headers: {
			accept: 'application/json',
			'content-type': 'application/json',
			appKey: 'yx3uwUXf7n4KcEJPttv8PaY7k8ZAmMAq5e3dfzic'
		  },
		  data: {
			startX: origin[0],//129..
			startY: origin[1],//35...
			angle: 20,
			speed: 5,
			endPoiId: '10001',
			endX: destination[0],
			endY: destination[1],
			// passList: '129.0093,35.1467',
			reqCoordType: 'WGS84GEO',
			startName: '%EC%B6%9C%EB%B0%9C',
			endName: '%EB%8F%84%EC%B0%A9',
			searchOption: '30',
			resCoordType: 'WGS84GEO',
			sort: 'index'
		  }
		};
        const response = await axios.request(options);
		
		if (ch === 1){//좌표만
			var pathData = await getOnlyPoint(response.data.features, 1) 
		}else if (ch === 2){//경로시간
			var pathData = response.data.features[0].properties.totalTime
		}
		
		return pathData
	}catch(error){
		console.log("Tmap", error)
	}
}

//경로데이터 좌표만 모음
async function getOnlyPoint(data, ch){
	console.log("경로 좌표만 모읍니다.")
	var pathData = []
	
	try{
		
		for (var i = 0; i < data.length; i++){
			if (data[i].geometry.type === "LineString"){
				for (var j = 0; j < data[i].geometry.coordinates.length; j++){
					pathData.push(data[i].geometry.coordinates[j].sort((a,b)=>parseFloat(b)-parseFloat(a)))
				}
			}
		}
		var pathData = [...new Set(pathData.map(JSON.stringify))].map(JSON.parse);
		
		return pathData
		
	} catch(error){
		
		console.log("getOnlyPointERROR", error)
	}
}

//대중교통 이동가능 여부
async function getTransfer(origin, destination, type){
	console.log("ODsat api 사용합니다.")
	
	// ODsay KEY
	const apiKey = 'hvtVh2422VhUGUcAiMKB5R2aLPxNm5EgNdXPdbcyc/w'
	let url
	
	try{
		if (type === 1){//전체 대중교통
			url = `https://api.odsay.com/v1/api/searchPubTransPathT?SX=${origin[0]}&SY=${origin[1]}&EX=${destination[0]}&EY=${destination[1]}&apiKey=${apiKey}&OPT=0`;
		}else if (type === 2){//지하철
			url = `https://api.odsay.com/v1/api/searchPubTransPathT?SX=${origin[0]}&SY=${origin[1]}&EX=${destination[0]}&EY=${destination[1]}&apiKey=${apiKey}&OPT=0&SearchPathType=1`;
		}
		const response = await axios.get(url)
		
		if (response.data.result !== undefined){
			
			const path = response.data.result.path[0].subPath
			return path
		}else{
			
			return false
			
		}
	}catch(error){
		
		console.log("getTransferError", error)
	}
}

module.exports = router;