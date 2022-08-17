//---------------------------------------------------------------------------
//pow2 - powers of 2 game = 1024 = slide the tiles to combine powers of 2
const pow2 = (function() {
	//private member variables
	type TILE = HTMLElement | null;
	let _aTiles:TILE[][] = [ //2D array of <div> tiles;  null = empty tile
		[null, null, null, null],
		[null, null, null, null],
		[null, null, null, null],
		[null, null, null, null]
	];
	let _isGameOver = false; //true if no empty spots and no combineable tiles
	let _isSliding = false; //true if slide animation is in progress
	let _aOldTiles:HTMLElement[] = []; //tiles that were combined (destroy after slide animation)
	let _maxExp = 1; //max tile value achieved  i.e. 1,2,4,8,16...
	let _score = 0; //game score
	let _gameID = ''; //game ID = assigned by server; '' = don't keep score
	let _elemTilt:HTMLInputElement | null = null;  //show tilt animation
	const _tileSize = 50; //width/height of tile in pixels (must match css)


function SlideLeft() {
	if(_isSliding)  return; //finish previous slide before starting another one
	for(let y = 0;  y < 4;  y++) {
		let dist = _aTiles[0][y] ? 0 : 1; //number of spots to slide
		for(let x = 1;  x < 4;  x++) {
			const tile1 = _aTiles[x][y];
			if(!tile1)
				dist++; //empty spot
			else {
				//is tile to the left a match?
				const tile2 = (x-dist > 0)  ?  _aTiles[x-dist-1][y]  :  null;
				if(tile2  &&  tile2.textContent === tile1.textContent) {
					_aOldTiles.push(tile2); //this tile will be combined
					tile1.textContent += 'x'; //already combined, ensure no more matches
					dist++; //create a new empty spot
				}
				if(dist)  SlideStart(x,y, x-dist,y); //slide right
			}
		} //for x
	} //for y
	if(_isSliding) {
		if(!_elemTilt  ||  _elemTilt.checked) //if no checkbox or checkbox is checked
			document.getElementById('pow2Board')!.style.transform = "rotateY(-30deg)"; //tilt
		setTimeout(SlideStop, 250);
	}
} //SlideLeft


function SlideRight() {
	if(_isSliding)  return; //finish previous slide before starting another one

	for(let y = 0;  y < 4;  y++) {
		let dist = _aTiles[3][y] ? 0 : 1; //number of spots to slide
		for(let x = 2;  x >= 0;  x--) {
			const tile1 = _aTiles[x][y];
			if(!tile1)
				dist++; //empty spot
			else {
				//is tile to the right a match?
				const tile2 = (x+dist < 3)  ?  _aTiles[x+dist+1][y]  :  null;
				if(tile2  &&  tile2.textContent === tile1.textContent) {
					_aOldTiles.push(tile2); //this tile will be combined
					tile1.textContent += 'x'; //already combined, ensure no more matches
					dist++; //create a new empty spot
				}
				if(dist)  SlideStart(x,y, x+dist,y); //slide right
			}
		} //for x
	} //for y
	if(_isSliding) {
		if(!_elemTilt  ||  _elemTilt.checked) //if no checkbox or checkbox is checked
			document.getElementById('pow2Board')!.style.transform = "rotateY(30deg)"; //tilt
		setTimeout(SlideStop, 250);
	}
} //SlideRight


function SlideUp() {
	if(_isSliding)  return; //finish previous slide before starting another one
	for(let x = 0;  x < 4;  x++) {
		let dist = _aTiles[x][0] ? 0 : 1; //number of spots to slide
		for(let y = 1;  y < 4;  y++) {
			const tile1:TILE = _aTiles[x][y];
			if(!tile1)
				dist++; //empty spot
			else {
				//is tile above a match?
				const tile2 = (y-dist > 0)  ?  _aTiles[x][y-dist-1]  :  null;
				if(tile2  &&  tile2.textContent === tile1.textContent) {
					_aOldTiles.push(tile2); //this tile will be combined
					tile1.textContent += 'x'; //already combined, ensure no more matches
					dist++; //create a new empty spot
				}
				if(dist)  SlideStart(x,y, x,y-dist); //slide right
			}
		} //for y
	} //for x
	if(_isSliding) {
		if(!_elemTilt  ||  _elemTilt.checked) //if no checkbox or checkbox is checked
			document.getElementById('pow2Board')!.style.transform = "rotateX(30deg)"; //tilt
		setTimeout(SlideStop, 250);
	}
} //SlideUp


function SlideDown() {
	if(_isSliding)  return; //finish previous slide before starting another one
	for(let x = 0;  x < 4;  x++) {
		let dist = _aTiles[x][3] ? 0 : 1; //number of spots to slide
		for(let y = 2;  y >= 0;  y--) {
			const tile1:TILE = _aTiles[x][y];
			if(!tile1)
				dist++; //empty spot
			else {
				//is tile below a match?
				const tile2 = (y+dist < 3)  ?  _aTiles[x][y+dist+1]  :  null;
				if(tile2  &&  tile2.textContent === tile1.textContent) {
					_aOldTiles.push(tile2); //this tile will be combined
					tile1.textContent += 'x'; //already combined, ensure no more matches
					dist++; //create a new empty spot
				}
				if(dist)  SlideStart(x,y, x,y+dist); //slide down
			}
		} //for y
	} //for x
	if(_isSliding) {
		if(!_elemTilt  ||  _elemTilt.checked) //if no checkbox or checkbox is checked
			document.getElementById('pow2Board')!.style.transform = "rotateX(-30deg)"; //tilt
		setTimeout(SlideStop, 250);
	}
} //SlideDown


//---------------------------------------------------------------------------
//SlideStart - called only from SlideLeft/Right/Up/Down
function SlideStart(x0, y0, x1, y1) {
	_aTiles[x0][y0]!.style.left = (x1 * _tileSize) + 'px';
	_aTiles[x0][y0]!.style.top  = (y1 * _tileSize) + 'px';
	_aTiles[x1][y1] = _aTiles[x0][y0];
	_aTiles[x0][y0] = null;
	_isSliding = true;
} //SlideStart


//---------------------------------------------------------------------------
//SlideStop - called when sliding animation is done
//  Combine tiles, update score, create a new tile, check for GameOver
function SlideStop() {
	//remove all combined tiles (now that they finished sliding)
	_aOldTiles.forEach(tile => {
		const points = parseInt(tile.textContent!) * 2;
		_score += points;
		if(points > _maxExp)  _maxExp = points;

		const x = parseInt(tile.style.left) / 50;
		const y = parseInt(tile.style.top)  / 50;
		_aTiles[x][y]!.textContent = points.toString();
		_aTiles[x][y]!.classList.replace("tile" + tile.textContent, "tile" + points);
		document.getElementById('pow2Board')!.removeChild(tile);
	});
	_aOldTiles = [];

	CreateTile();
	if(_gameID)  UpdateScores(); //AI player (_gameID=0) doesn't update scores
	document.getElementById('pow2Board')!.style.transform = 'none'; //untilt
	_isSliding = false; //done with slide animations

	//look for empty spots
	for(let y = 0;  y < 4;  y++)
		for(let x = 0;  x < 4;  x++)
			if(_aTiles[x][y] === null)
				return; //there's still space, keep playing

	//no empty spots available; check for combineable tiles
	//Note: no need to check all four neighbors, only check [x+1] and [y+1] neighbors
	for(let y = 0;  y <= 3; y++) {
		for(let x = 0;  x <= 3;  x++) {
			const val = _aTiles[x][y]?.textContent;
			if( (x < 3  &&  _aTiles[x+1][y]?.textContent === val)
			 || (y < 3  &&  _aTiles[x][y+1]?.textContent === val))
				return; //found a match, keep playing
		} //for x
	} //for y

	//Game Over - no empty spots, no combineable tiles
	_isGameOver = true;
	if(document.getElementById('pow2GameOver'))
		document.getElementById('pow2GameOver')!.style.display = 'block'; //show 'Game Over' text
} //SlideStop


//---------------------------------------------------------------------------
//CreateTile - create a new tile at a random location
function CreateTile() {
	//choose a random location, if it's empty create a tile, else try again
	// This "shuffles" array with Fisher-Yates algorithm.
	var aIndex = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
	for(let i = 15;  i > 0;  i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const x = aIndex[j] % 4;
		const y = Math.floor(aIndex[j] / 4);
		if(_aTiles[x][y] === null) { //found an empty spot
			//create a new HTML tile
			const aTileVal = ['1','1','1','2'];  //or maybe try: [1,1,1,1,2,2,2,4]
			const val = aTileVal[Math.floor(Math.random() * aTileVal.length)];
			const div = document.createElement('div');
			div.textContent = val;
			div.classList.add("tile"+val)
			div.style.left = (x * _tileSize) + 'px';
			div.style.top  = (y * _tileSize) + 'px';
			_aTiles[x][y] = div;
			document.getElementById('pow2Board')!.appendChild(div);
			return true; //tile created
		}
		//swap indices, try again
		const tmp = aIndex[i];
		aIndex[i] = aIndex[j];
		aIndex[j] = tmp;
	} //for i
	return false; //no empty spot found, unable to create a new tile
} //CreateTile


//---------------------------------------------------------------------------
//UpdateScores - retrieve high scores from server, update table
function UpdateScores() {
	//display new score
	if(document.getElementById('pow2Score'))
		document.getElementById('pow2Score')!.textContent = _score.toString();
	if(document.getElementById('pow2Level'))
		document.getElementById('pow2Level')!.textContent = Math.log2(_maxExp).toString();

	if(_gameID === '')  return; //gameID = '' = don't keep score
	//1 SEND) send current score to server
	//2 RECV) update score board with high scores from server
	//TODO: Validate score on server side (i.e. prevent submissions of false scores)
	const opt = {
		method: 'PUT',
		headers: {'Content-Type':'application/x-www-form-urlencoded'},
		body: `score=${_score}&level=`+ Math.log2(_maxExp) +`&uid=${_gameID}`
	};
	fetch('/content/pow2/index.php', opt).then(resp => resp.json()).then(aScores => {
		if(!Array.isArray(aScores)  ||  !aScores.length)  return; //no new high scores

		//update high scores
		const tbl = document.querySelector('#pow2Scores') as HTMLTableElement|null;
		if(!tbl)  return; //table not found, don't update high scores
		tbl.replaceChildren(); //remove all old scores
		let rank = 1;
		for(const score of aScores) {
			let tr = tbl.insertRow();
			tr.insertCell().appendChild(document.createTextNode((rank++).toString()));
			for(const txt of score) {
				let td = tr.insertCell();
				td.appendChild(document.createTextNode(txt));
				if(td.cellIndex > 3)
					td.classList.add('wide_only');
			} //for td
		} //for tr
	}); //fetch
} //UpdateScores


//---------------------------------------------------------------------------
//Autoplay - Automatically make another turn (AI)
function Autoplay(delay=2000) {
	if(_isSliding)  return; //wait for previous slide to end
	if(_isGameOver) { //game over, start a new game
		setTimeout(Reset, 10*1000); //wait 10 seconds to reset
		setTimeout(Autoplay, 12*1000); //wait another 2 seconds to start playing again
		return;
	}

	//slide a random direction
	switch(Math.floor(Math.random() * 4)) {
		case 0: SlideLeft();  break;
		case 1: SlideRight(); break;
		case 2: SlideUp();    break;
		case 3: SlideDown();  break;
	}
	setTimeout(pow2.Autoplay, 2000); //2 second delay between frames
} //Autoplay


//---------------------------------------------------------------------------
//Reset - start a new game (clear board, create two random tiles)
function Reset() {
	_isSliding = false;
	_isGameOver = false;
	_maxExp = 1;
	_score = 0;
	_gameID = '';
	_elemTilt = document.getElementById('pow2Tilt') as HTMLInputElement;
	const gameBoard = document.getElementById('pow2Board');
	if(!gameBoard) { //gameBoard must exist
		_isSliding = true; //disable game
		return;
	}

	//remove all tiles from previous game
	for(let y = 0;  y < 4;  y++)
		for(let x = 0;  x < 4;  x++) {
			if(_aTiles[x][y])  gameBoard.removeChild(_aTiles[x][y]!);
			_aTiles[x][y] = null;
		}

	//make sure slide animation(s) are empty
	_aOldTiles.forEach(tile => { gameBoard.removeChild(tile); });
	_aOldTiles = [];

	//start a new game
	CreateTile();
	CreateTile();
	if(document.getElementById('pow2GameOver'))
		document.getElementById('pow2GameOver')!.style.display = 'none'; //hide Game Over text
	if(document.getElementById('pow2Scores')) //if scoreboard, fetch _gameID
		fetch('/content/pow2/index.php?id').then(res=>res.text()).then(id=>{
			_gameID = id;
			UpdateScores();
		});
} //Reset


	Reset();
	return { //exported functions
		IsSliding : function()  { return _isSliding; },
		SlideLeft:SlideLeft, SlideRight:SlideRight, SlideUp:SlideUp, SlideDown:SlideDown,
		Autoplay:Autoplay,
		Reset:Reset
	}
})(); //pow2
