<?php 

//---------------------------------------------------------------------------------------------------------------
// editorService - Saves and Reads content for Code Editor
//---------------------------------------------------------------------------------------------------------------

date_default_timezone_set("Europe/Stockholm");

// Include basic application services!
include_once "../Shared/sessions.php";
include_once "basic.php";

// Connect to database and start session
pdoConnect();
session_start();

if(isset($_SESSION['uid'])){
		$userid=$_SESSION['uid'];
}else{
		$userid="1";		
} 

$opt=getOP('opt');
$courseid=getOP('courseid');
$coursevers=getOP('coursevers');
$duggaid=getOP('did');
$moment=getOP('moment');

$debug="NONE!";	

$hr=false;

//------------------------------------------------------------------------------------------------
// Services
//------------------------------------------------------------------------------------------------

if(checklogin()){
	$query = $pdo->prepare("SELECT visibility FROM course WHERE cid=:cid");
	$query->bindParam(':cid', $courseid);
	$result = $query->execute();
	if ($row = $query->fetch(PDO::FETCH_ASSOC)) {
			$hr = ((checklogin() && hasAccess($_SESSION['uid'], $courseid, 'r')) || $row['visibility'] != 0);
			if($hr){
/*		
					// The code for modification using sessions
					if(strcmp($opt,"DEL")===0){
							$query = $pdo->prepare("DELETE FROM listentries WHERE lid=:lid");
							$query->bindParam(':lid', $sectid);
							if(!$query->execute()) {
								$debug="Error updating entries";
							}
*/
					}
			}
	}
	
}

//------------------------------------------------------------------------------------------------
// Retrieve Information			
//------------------------------------------------------------------------------------------------

if($hr){
		$debug="HR ";
		// See if we already have a result i.e. a chosen variant.
		$query = $pdo->prepare("SELECT aid,cid,quiz,variant,moment,vers,uid FROM userAnswer WHERE uid=:uid AND cid=:cid AND moment=:moment AND vers=:coursevers;");
		$query->bindParam(':cid', $courseid);
		$query->bindParam(':coursevers', $coursevers);
		$query->bindParam(':uid', $userid);
		$query->bindParam(':moment', $moment);
		$result = $query->execute();

		$savedvariant="UNK";
		$newvariant="";
		$variants=array();

		if ($row = $query->fetch(PDO::FETCH_ASSOC)) {
				$savedvariant=$row['variant'];
		}
		
		// Retrieve variant list
		$query = $pdo->prepare("SELECT vid,param FROM variant WHERE quizID=:duggaid;");
		$query->bindParam(':duggaid', $duggaid);
		$result=$query->execute();
		if (!$result) err("SQL Query Error: ".$pdo->errorInfo(),"Field Querying Error!");
		$i=0;
		foreach($query->fetchAll() as $row) {
				$variants[$i]=array(
					'vid' => $row['vid'],
					'param' => $row['param']
				);
				$i++;
		}

		// If there are any variants, randomize
		if($savedvariant==""||$savedvariant=="UNK"){
				if(sizeof($variants)>0) $newvariant=$variants[rand(0,sizeof($variants)-1)]['vid'];
		}

		// Savedvariant now contains variant (from previous visit) "" (null) or UNK (no variant inserted)
		if(($savedvariant=="")&&($newvariant!="")){
						$query = $pdo->prepare("UPDATE userAnswer SET variant=:variant WHERE uid=:uid AND cid=:cid AND moment=:moment AND vers=:coursevers;");
						$query->bindParam(':cid', $courseid);
						$query->bindParam(':coursevers', $coursevers);
						$query->bindParam(':uid', $userid);
						$query->bindParam(':moment', $moment);
						$query->bindParam(':variant', $newvariant);
						$debug="U";
						if(!$query->execute()) {
							$error=$query->errorInfo();
							$debug="Error updating entries".$error[2];
						}
		}else if(($savedvariant=="UNK")&&($newvariant!="")){
						$query = $pdo->prepare("INSERT INTO userAnswer(uid,cid,moment,vers,variant) VALUES(:uid,:cid,:moment,:coursevers,:variant);");
						$query->bindParam(':cid', $courseid);
						$query->bindParam(':coursevers', $coursevers);
						$query->bindParam(':uid', $userid);
						$query->bindParam(':moment', $moment);
						$query->bindParam(':variant', $newvariant);
						$debug="I";
						if(!$query->execute()) {
							$error=$query->errorInfo();
							$debug="Error updating entries".$error[2];
						}
		}
		if(($savedvariant=="")||($savedvariant=="UNK")) $savedvariant=$newvariant;

		// Retrieve variant
		$param="UNK";
		foreach ($variants as $variant) {
		    $debug.=" ".$savedvariant." ".$variant['vid'];
		    if($variant['vid']==$savedvariant) $param=$variant['param'];
		}

}else{
		$param="FORBIDDEN!!";
}

$array = array(
	"debug" => $debug,
	"param" => $param
);

echo json_encode($array);
?>