<?php session_start(); 
include_once(dirname(__file__)."/../../../Shared/sessions.php");	
if (checklogin() && isset($_POST["courseid"]) && isset($_POST["quizid"])) {	
?>
<script src="js/ajax.js"></script>
<script>
page.title("Quiz menu");
</script>
<div class='middle center'>
	<p id="dateinfo"><p>
	<p id="admin_title"></p>
	<button class='default' onclick="changeURL('quiz/quiz?courseid=' + qs.courseid + '&quizid='+qs.quizid);">Start Test</button>
	
	<?php if (hasAccess($_SESSION["uid"], $_POST["courseid"], "w")) { ?>
	<button class='default' onclick="changeURL('quiz/edit?courseid=' + qs.courseid + '&quizid='+qs.quizid);">Edit</button>
	<button class='default' onclick="changeURL('quiz/studentlist?courseid=' + qs.courseid + '&quizid=' + qs.quizid);">Studentlist</button>
	<?php } ?>
</div>
<script type="text/javascript">
	var qs = getUrlVars();
	getQuizNameForMenu(qs.quizid, qs.courseid);
</script>
<?php
} else {
	include(dirname(__file__)."/../404.php");
}
?>