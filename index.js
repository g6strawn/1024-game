//---------------------------------------------------------------------------
//swipe - handle swipe & mouse drags
const swipe = (function() {
	const _swipeMinDist = 20; //min distance before it counts as a swipe
	const _swipeMaxTime = 1000; //max ms before ignoring swipe (ex: ignore 2 sec swipes)
	var _xSwipe, _ySwipe;
	var _timeStart = 0;

function Start(event) {
	if(event.changedTouches) {
		//TouchEvent doesn't have screenX/Y but changedTouches[0] does
		//Note: MouseEvent does have screenX/Y so it works fine
		Start(event.changedTouches[0]);
		event.preventDefault();
		return;
	} else if(event.type === 'mousedown')
		event.preventDefault(); //prevent selection (which hides mouseup)
	_xSwipe = event.screenX;
	_ySwipe = event.screenY;
	_timeStart = Date.now();
	return true;
} //Start

function End(event) {
	if(!_timeStart //ignore End without Start
	 || (Date.now() - _timeStart) > _swipeMaxTime //ignore press&hold (swipe too slow)
	 || pow2.IsSliding()) //don't start a new slide until previous slide is done
		return;
	if(event.changedTouches) {
		End(event.changedTouches[0]);
		event.preventDefault();
		return;
	}
	const xDiff = event.screenX - _xSwipe;
	const yDiff = event.screenY - _ySwipe;
	if(Math.abs(xDiff) > Math.abs(yDiff)) {
		if(Math.abs(xDiff) < _swipeMinDist)  return;
		if(xDiff > 0)  pow2.SlideRight();
		else           pow2.SlideLeft();
	} else {
		if(Math.abs(yDiff) < _swipeMinDist)  return;
		if(yDiff > 0)  pow2.SlideDown();
		else           pow2.SlideUp();
	}
	_timeStart = 0;
} //End

	return { Start:Start, End:End }; //exported functions
})(); //swipe;


//---------------------------------------------------------------------------
//onLoad - page loaded, initialize everything
//  document.DOMContentLoaded - occurs after HTML, before images are loaded
//  window.onload  - occurs after HTML, images, and all content loaded
document.addEventListener('DOMContentLoaded', ()=>{
	//pressing on game board starts swipe
	const gameBoard = document.getElementById('pow2Board');
	gameBoard.addEventListener('mousedown', swipe.Start);
	gameBoard.addEventListener('touchstart', swipe.Start);
	//releasing anywhere in document stops swipe
	window.addEventListener('mouseup', swipe.End); //NOTE! listen on window not gameBoard
	gameBoard.addEventListener('touchend', swipe.End);

	//game board intercepts arrow keys
	document.addEventListener('keydown', (e)=>{
		switch(e.code) {
		case 'ArrowLeft':  pow2.SlideLeft();   break;
		case 'ArrowRight': pow2.SlideRight();  break;
		case 'ArrowUp':    pow2.SlideUp();     break;
		case 'ArrowDown':  pow2.SlideDown();   break;
		} //switch
		return false;
	});
}); //Init
