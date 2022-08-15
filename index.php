<?php # pow2 game  i.e. 1024 - slide the tiles to combine powers of 2
require_once "{$_SERVER['DOCUMENT_ROOT']}/inc/header.php";
require_once "{$_SERVER['DOCUMENT_ROOT']}/inc/sql.php";

//start a new game, return game's unique ID
if(isset($_GET['id'])) {
	ob_end_clean();
	$name = $_SESSION['name'] ?? '';
	//Note: Every time the page loads (or user presses Reset button) a new game is created.
	// Some of these new games are never played. Reuse unplayed games before creating a new one.
	$uid = DB::Run('SELECT uid FROM pow2_scores WHERE name=? AND score=0 AND level=0', 
			[$name])->fetchColumn(); //check for existing, unused game for this player
	if($uid) { //reuse unused game
		DB::Run('UPDATE pow2_scores SET started=NOW(), updated=NOW() WHERE uid=?', [$uid]);
		exit($uid);
	}
	//create a new game
	$uid = bin2hex(random_bytes(16)); //16 bytes = 32 hex digits
	if(DB::Run('INSERT INTO pow2_scores SET uid=?, name=?', [$uid, $name]))
		exit($uid);
	exit(0); //DB fail
} //GET id

//update player's current score, return list of high scores
if(isset($_SERVER['REQUEST_METHOD'])  &&  $_SERVER['REQUEST_METHOD'] === 'PUT') {
	//get player's current score from PUT variables [score, level, id]
	parse_str(file_get_contents("php://input"), $aPut); //$aPut = $_PUT
	$score = filter_var($aPut['score'] ?? 0, FILTER_SANITIZE_NUMBER_INT);
	$level = filter_var($aPut['level'] ?? 0, FILTER_SANITIZE_NUMBER_INT);
	$uid   = ctype_xdigit($aPut['uid'] ?? 0)  ?  $aPut['uid']  :  0;
	if($aPut  &&  count($aPut) == 3  &&  $score > 0  &&  $level > 0  &&  $uid) {
		//update player's current score
		DB::Run('UPDATE pow2_scores SET score=?, level=?, updated=NOW() WHERE uid=?', 
				[$score, $level, $uid]);
	}

	//return top 10 high scores
	ob_end_clean();
	$aScores = DB::Run('SELECT name, score, level, TIMEDIFF(updated,started), started'.
			' FROM pow2_scores ORDER BY score DESC LIMIT 50')->fetchAll(PDO::FETCH_NUM);
	if(!$aScores)  exit('[]');
	foreach($aScores as $score)
		$score[4] = date('j M Y g:ia', strtotime($score[4])); //us a prettier date/time format
	exit(json_encode($aScores));
} //POST[scores]


if(!IsSignedIn()) //show Sign In dialog
	echo "<script>document.addEventListener('DOMContentLoaded', ()=>OpenLogin());</script>";
?>

<!-- game board -->
<article id="pow2">
  <h1>2<sup id="pow2Level">0</sup></h1>
  <button id="pow2BtnUp" onclick="pow2.SlideUp()"></button>
  <h2 id="pow2Score">0</h2>

  <button id="pow2BtnLeft" onclick="pow2.SlideLeft()"></button>
  <div id="pow2Board"></div>
  <button id="pow2BtnRight" onclick="pow2.SlideRight()"></button>

  <div></div>
  <button id="pow2BtnDown" onclick="pow2.SlideDown()"></button>
  <div></div>
</article>

<!-- instructions -->
<div id="pow2Instr">
  <h1 id="pow2GameOver" style="display:none">Game Over</h1>
  <p class="wide_only">Use buttons or arrow key to slide tiles.</p>
  <input type="checkbox" id="pow2Tilt" checked> Show tilt animation<br>
  <button class="blueBtn large" onclick="pow2.Reset()">Restart</button>
</div>

<!-- high scores -->
<table id="pow2Scores">
<caption>High Scores</caption>
<thead>
  <th title="Top Ten">#</th>
  <th title="Player's name">Name</th>
  <th title="Total score">Score</th>
  <th title="Highest exponent achieved">2<sup>n</sup></th>
  <th title="Time elapsed from start to finish" class="wide_only">Elapsed</th>
  <th title="Date/time when game was started" class="wide_only">Started</th>
</thead>
<tbody></tbody>
</table>

<script src="pow2.js" defer></script>

<?php include "{$_SERVER['DOCUMENT_ROOT']}/inc/footer.php"; ?>
