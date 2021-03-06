<?php
require_once(dirname(__FILE__) . '/../Shared/database.php');
require_once(dirname(__FILE__) . '/constants.php');
//---------------------------------------------------------------------------------------------------------------
// checklogin - Checks Login Credentials and initiates the kind session variable that holds the credentials
//---------------------------------------------------------------------------------------------------------------

/**
 * Check whether or not the user is logged in.
 * @return bool Returns true if the user is logged in and false if they aren't
 */
function checklogin()
{
	// If neither session nor post return not logged in
	if(array_key_exists('loginname', $_SESSION)){
		return true;
	} else if(failedLoginCount($_SERVER['REMOTE_ADDR']) < 100 && array_key_exists('username', $_COOKIE) && array_key_exists('password', $_COOKIE)) {
		return login($_COOKIE['username'], $_COOKIE['password'], false);
	} else {		
		return false;
	}
}	

/**
 * Returns the number of failed logins from this IP address in the
 * last 30 minutes.
 * @param string $addr Address to look up
 * @return int
 */
function failedLoginCount($addr)
{
	global $pdo;

	if($pdo == null) {
		pdoConnect();
	}

	$query = $pdo->prepare('SELECT COUNT(1) FROM eventlog WHERE address=:addr AND type=:type AND ts > (CURRENT_TIMESTAMP() - interval 30 minute)');
	// TODO: Proxy detection?
	$query->bindParam(':addr', $addr);
	$query->bindValue(':type', EVENT_LOGINERR);

	if($query->execute() && $query->rowCount() > 0) {
		$count = $query->fetch(PDO::FETCH_NUM);
		return $count[0];
	} else {
		return 0;
	}
}

/**
 * Log in the user with the specified username and password and
 * optionally set cookies for the user to be remembered until next
 * time they visit the site.
 * @param string $username Username of the user to log in
 * @param string $password Password of the user to log in
 * @param bool $savelogin Whether or not to save the information in a cookie
 * @return bool True on success (the user was logged in), false on failure.
 */ 
function login($username, $password, $savelogin)
{
	global $pdo;

	if($pdo == null) {
		pdoConnect();
	}

//echo "SELECT uid,username,password,superuser FROM user WHERE username=:username and password=password(':pwd') LIMIT 1";

	$query = $pdo->prepare("SELECT uid,username,password,superuser FROM user WHERE username=:username and password=password(:pwd) LIMIT 1");

	$query->bindParam(':username', $username);
	$query->bindParam(':pwd', $password);

	$query->execute();

	if($query->rowCount() > 0) {
		// Fetch the result
		$row = $query->fetch(PDO::FETCH_ASSOC);
		$_SESSION['uid'] = $row['uid'];
		$_SESSION["loginname"]=$row['username'];
		$_SESSION["passwd"]=$row['password'];
		$_SESSION["superuser"]=$row['superuser'];

		// Save some login details in cookies.
		if($savelogin) {
			setcookie('username', $row['username'], time()+60*60*24*30, '/');
			setcookie('password', $password, time()+60*60*24*30, '/');
		}
		return true;

	} else {
		return false;
	}
}

/**
 * Check if a specified user ID has the requested access on a specified course
 * @param int $userId User ID of the user to look up
 * @param int $courseId ID of the course to look up access for
 * @param string $access_type A single letter denoting read or write access 
 * (r and w respectively)
 * @return bool Returns true if the user has the requested access on the course
 * and false if they don't.
 */
function hasAccess($userId, $courseId, $access_type)
{
	$access = getAccessType($userId, $courseId);

	if($access_type === 'w') {
		return strtolower($access) == 'w';
	} else if ($access_type === 'r') {
		return strtolower($access) == 'r' || strtolower($access) == 'w'; 
	} else {
		return false;
	}
}

/**
 * Returns superuser status of user
 * @param int $userId User ID of the user to look up
 * @return true false. True if superuser false if not
 */
function isSuperUser($userId)
{
	global $pdo;

	if($pdo == null) {
		pdoConnect();
	}

	$query = $pdo->prepare('SELECT count(uid) AS count FROM user WHERE uid=:1 AND superuser=1');
	$query->bindParam(':1', $userId);
	$query->execute();
	$result = $query->fetch();

	if ($result["count"]==1) {
		return true;
	} else {
		return false;
	}
}

/**
 * Returns the access a specified user has on the specified course
 * @param int $userId User ID of the user to look up
 * @param int $courseId Course ID of the course to look up access on
 * @return string Returns the access for the user on the selected course (r or w)
 */
function getAccessType($userId, $courseId)
{
		global $pdo;
	
		if($pdo == null) {
			pdoConnect();
		}
	
		$query = $pdo->prepare('SELECT access FROM user_course WHERE uid=:uid AND cid=:cid LIMIT 1');
		$query->bindParam(':uid', $userId);
		$query->bindParam(':cid', $courseId);
		$query->execute();
	
		// Fetch data from the database
		if($query->rowCount() > 0) {
			$access = $query->fetch(PDO::FETCH_ASSOC);
			return strtolower($access['access']);
		} else {
			return false;
		}
}

?>
