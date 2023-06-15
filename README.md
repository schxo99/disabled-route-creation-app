### 앱 이름: 마장동(마포구 장애인 동행)
##### 2023 피우다 프로젝트 공모전에 관광, 경로 (배리어프리) 주제를 선택하여 참가하였습니다.

### 아이디어배경 & 인터뷰
#### ● 장애인분들은 관광 시 로드뷰, 블로그를 통해 본인이 먼저 갈 수 있는지 이미지를보며 배리어를 파악
#### ● 이동 시 배리어와 마주치면 돌아가는 일 빈번하게 일어남
#### ● 이동 경로 간 배리어가 어디있는지 모름
#### ● 피하고 싶은 위치가 있지만, 경로를 생성해주는 서비스가 없음

### 솔루션
#### ● 배리어 등록기능
#### ● 배리어 조회기능
#### ● 배리어회피기능

### 프로젝트 목표
#### 장애인 이동 시 배리어를 확인할 수 있고, 등록하여 다른사람이 인지시키고, 배리어를 회피하여 경로를 생성해주는 앱 성장형 개발

### 기대효과
#### ●장애인 이동 편의성 확대
<div align = "center"> 
  <br>
    <h2>시스템 구성도</h2>
    <img style="float: left;" src="https://github.com/schxo99/disabled-route-creationApp/blob/master/image/system%20diagram.PNG" width="700" height="auto"/>
  </br>
  <br>
    <h2>팀원소개</h2>
    <img style="float: left;" src="https://github.com/schxo99/disabled-route-creationApp/blob/master/image/ourTeam.PNG" width="700" height="auto"/>
  </br>
  <br>
    <h2>앱 UI</h2>
    <img style="float: left;" src="https://github.com/schxo99/disabled-route-creationApp/blob/master/image/ui1.PNG" width="700" height="auto"/>
    <img style="float: left;" src="https://github.com/schxo99/disabled-route-creationApp/blob/master/image/ui2.PNG" width="700" height="auto"/>
    <img style="float: left;" src="https://github.com/schxo99/disabled-route-creationApp/blob/master/image/ui3.PNG" width="700" height="auto"/>
  </br>
</div>

### 핵심기술 : 배리어 회피기술
#### 기존 지도에서는 배리어 회피경로를 생성서비스를 제공하지 않음.

### API 선정 이유
#### ODsay API - 대중교통 경로생성에서 최적된 순서대로 경로를 다 주었기에 경로를 비교할 수 있어 사용
#### Tmap API - Google maps API는 도보 경로 생성 X, Naver maps API보다 정확한 측면이 있었고, 옵션중에 계단 회피 경로 생성이 있어서 사용

### 경로 알고리즘
1. 클라이언트로부터 출발 도착 좌표 수신
2. 경로 조회
   1. 대중교통 이용 시
     - 대중교통을 이용할 수 있으면 ODsay API에서 경로 조회 모든 대중교통=0, 지하철경로=1
     - 대중교통 처음 좌표와 나의 출발좌표 도보경로 생성, 대중교통 내리는지점과 나의 목적지 좌표를 도보생성하여 경로 return
    2. 도보이동 시
       -Tmap API를 사용하여 계단 회피 최적경로 받음
3. 도보 경로 배리어 회피
     1. Tmap으로 받은 최적의 경로와 DB로 부터 받은 배리어 위치를 비교
     2. 경로중 i번째 좌표와 i+1좌표, i번째 좌표와 배리어간의 거리를 구함
     3. 만약 i+1과의 거리보다 배리어의 거리가 가까우면 i와 i+1의 선분과 i와 배리어 선분을 구하여 겹친 각도를 구함.
     4. 만약 각도가 i의 골목 내에 해당되면 i주면의 40m간격의 원형좌표를 구하고 배리어 주변의 좌표들 제거 및 i-1의 주변 좌표들 제거.
     5. 남은 원형좌표중 목적지와의 이동거리를 Tmap API에서 조회하여 최단 시간이 걸리는 좌표를 선택한 후 경로 재설정.
     6. 재설정된 시작 좌표와 지나왔던 좌표들간의 거리를 구하여 최단번째 인덱스 이후로 삭제하고 이어서 경로탐색

### 아쉬운 점
사업성 측면에서 부족하여 좋지않은 결과...ㅠ
