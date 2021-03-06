/********************************************************************************

   Documentation

*********************************************************************************

Execution Order
---------------------
 #1 setup() is first function to be called this then invokes returned() callback through AJAX
 #2 returned() is next function to be called as a callback from setup.

Testing Link:

EditorV50.php?exampleid=1&courseid=1&cvers=2013
 
-------------==============######## Documentation End ###########==============-------------
*/

/********************************************************************************

   Globals

*********************************************************************************/

var retdata;
var tokens = [];            // Array to hold the tokens.
var dmd=0;
var isdropped=false;
var genSettingsTabMenuValue = "wordlist";
var codeSettingsTabMenuValue = "implines";				
var querystring = parseGet();
var filez;

/********************************************************************************

   SETUP

*********************************************************************************/

function setup()
{
		$.ajax({url: "editorService.php", type: "POST", data: "courseid="+querystring['courseid']+"&exampleid="+querystring['exampleid']+"&opt=List"+"&cvers="+querystring['cvers'], dataType: "json", success: returned});											
}

//---------------------------------------------------------------------------------------------------
// Renderer
//---------------------------------------------------------------------------------------------------

function returned(data)
{	
		retdata=data;
		
		console.log(retdata);

		// Fill Section Name and Example Name
		var examplenme=document.getElementById('exampleName');
		examplenme.innerHTML=data['examplename'];
		var examplesect=document.getElementById("exampleSection");
		examplesect.innerHTML=data['sectionname']+"&nbsp;:&nbsp;";

		if(retdata['debug']!="NONE!") alert(retdata['debug']);

		if(retdata['writeaccess'] == "w"){
				// If write access show settings cog wheel.
		}
		
		// User can choose template if no template has been choosen and the user has write access.
		console.log("Templ::"+retdata['templateid']+" "+retdata['writeaccess']);
		if((retdata['templateid'] == 0)){
			if(retdata['writeaccess'] == "w"){
				$("#chooseTemplate").css("display","block");
				return;
			}else{
				console.log("NoWrite "+retdata['writeaccess']+"!");
				/* Create an error message to user or send user back to duggasys */
				return;
			}
		}
		
		// If there is a template
		changeCSS("css/"+retdata['stylesheet']);

		console.log("Setting Template: "+retdata['stylesheet']);

		// Clear div2
		$("#div2").html("");

		// create boxes
	
		for(var i=0;i<retdata['numbox'];i++){
			
			var contentid="box"+retdata['box'][i][0];
			var boxid=retdata['box'][i][0];
			var boxtype=retdata['box'][i][1].toUpperCase();
			var boxcontent=retdata['box'][i][2];
		
			// don't create templatebox if it already exists
			if(!document.getElementById(contentid)){
				addTemplatebox(contentid);
			}
			
			if(boxtype == "CODE"){
					// Print out code example in a code box					
					document.getElementById(contentid).removeAttribute("contenteditable");
	
					$("#"+contentid).removeClass("descbox").addClass("codebox");
	
					createboxmenu(contentid,boxid,boxtype);

					// Make room for the menu by setting padding-top equal to height of menubox
					// For some reason without this fix the code box is placed at same height as the menu, obstructing first lines of the code
					if($("#"+contentid+"menu").height() == null){
						var boxmenuheight = 0;
					}else{
						var boxmenuheight= $("#"+contentid+"menu").height();
					}
					$("#"+contentid).css("margin-top", boxmenuheight-1);

					rendercode(boxcontent,boxid);
			}else if(boxtype == "DOCUMENT"){
				
					// Print out description in a document box
					$("#"+contentid).removeClass("codebox").addClass("descbox");
					var desc = boxcontent;
					desc = replaceAll("&nbsp;"," ",desc);
					
					// Highlight important words!
					var iwcounter=0;
					important = retdata.impwords;
					for(j=0;j<important.length;j++){
							var sstr="<span id='IWW' class='impword' onmouseover='highlightKeyword(\""+important[j]+"\")' onmouseout='dehighlightKeyword(\""+important[j]+"\")'>"+important[j]+"</span>";														
							desc=replaceAll(important[j],sstr,desc);
					}
					
					/* Assign Content */
					$("#"+contentid).html(desc);

					if($("#"+contentid+"menu").height() == null){
						var boxmenuheight = 0;
					}else{
						var boxmenuheight= $("#"+contentid+"menu").height();
					}
					$("#"+contentid).css("margin-top", boxmenuheight);
					
					
					createboxmenu(contentid,boxid,boxtype);
					
					if($("#"+contentid+"menu").height() == null){
						var boxmenuheight = 0;
					}else{
						var boxmenuheight= $("#"+contentid+"menu").height();
					}
					$("#"+contentid).css("margin-top", boxmenuheight);
					
			}else if(boxtype == "NOT DEFINED"){
					if(retdata['writeaccess'] == "w"){
						createboxmenu(contentid,boxid,boxtype);
						
						// Make room for the menu by setting padding-top equals to height of menubox
						if($("#"+contentid+"menu").height() == null){
							var boxmenuheight = 0;
						}else{
							var boxmenuheight= $("#"+contentid+"menu").height();
						}
						$("#"+contentid).css("margin-top", boxmenuheight);
					}
			}

		}

}

//----------------------------------------------------------------------------------
// displayEditExample: Displays the dialog box for editing a code example
//----------------------------------------------------------------------------------

function displayEditExample(boxid)
{
	console.log("DISPLAYING EDIT EXAMPLE!");
	
	$("#title").val(retdata['examplename']);
	$("#playlink").val(retdata['playlink']);
	
	var iw=retdata['impwords'];
	var str="";
	for(var i=0;i<iw.length;i++){
			str+="<option>"+iw[i]+"</option>";
	}
	$("#impwords").html(str);

	// Get the filename for current codebox
	var bestr="";
	var afstr="";
	var beforeid="tol";
	var afterid="tol";
	var ba=retdata['beforeafter'];
	for(var i=0; i<ba.length; i++){
		if(ba[i][0] == beforeid){

		}else{
				bestr+="<option value='"+ba[i][0]+"'>"+ba[i][1]+":"+ba[i][2]+"</option>";
		}
		if(ba[i][0] == afterid){
		
		}else{
				afstr+="<option value='"+ba[i][0]+"'>"+ba[i][1]+":"+ba[i][2]+"</option>";		
		}
	}
	$("#before").html(bestr);
	$("#after").html(afstr);

	$("#editExample").css("display","block");
}

//----------------------------------------------------------------------------------
// displayEditContent: Displays the dialog box for editing a content pane
//----------------------------------------------------------------------------------

function displayEditContent(boxid)
{
	
	$("#title").val(retdata['examplename']);

	var dirs=retdata['directory'];
	var str="";
	for(var i=0;i<dirs.length;i++){
			str+="<option>"+dirs[i]+"</option>";
	}
	$("#filename").html(str);
	

	var wordl=retdata['wordlists'];
	var str="";
	for(var i=0;i<wordl.length;i++){
			str+="<option value='"+wordl[i][0]+"'>"+wordl[i][1]+"</option>";
	}
	$("#wordlist").html(str);
		
	$("#editContent").css("display","block");
}

//----------------------------------------------------------------------------------
// addTemplatebox: Adds a new template box to div2
//----------------------------------------------------------------------------------

function addTemplatebox(id)
{
	console.log("Addtemplatebox "+id);

	str="<div id='"+id+"wrapper' ";
	if(id==("box"+retdata['numbox'])){
		str+="class='boxwrapper activebox'>";
	}else{
		str+="class='boxwrapper deactivatedbox'>";
	}
	str+="<div id='"+id+"' class='box'></div>";
	str+="</div>";
	
	str=str+$("#div2").html();
	$("#div2").html(str);

}

//----------------------------------------------------------------------------------
// createboxmenu: Creates the menu at the top of a box. 
//                Is called by returned
//----------------------------------------------------------------------------------

function createboxmenu(contentid, boxid, type){
	console.log("  BOXMENU "+contentid+" "+boxid+" "+type);

	if(!document.getElementById(contentid+"menu")){
		var boxmenu = document.createElement("div");
		document.getElementById(contentid+"wrapper").appendChild(boxmenu);
		boxmenu.setAttribute("class", "buttomenu2 buttomenu2Style");
		boxmenu.setAttribute("id", contentid+"menu");
		if(retdata['writeaccess'] == "w"){

			//----------------------------------------------------------------------------------------- DOCUMENT
			if(type=="DOCUMENT"){
				var str = '<table cellspacing="2"><tr>';
				str+= '<td class="butto2" title="Change box title"><span class="boxtitleEditable">'+retdata['box'][boxid-1][3]+'</span></td>';
				str+= '<td class="butto2 showdesktop" title="Remove formatting" onclick="styleReset();"><img src="../Shared/icons/reset_button.svg" /></td>';
				str+= '<td class="butto2 showdesktop" title="Heading" onclick="styleHeader();"><img src="../Shared/icons/boldtext_button.svg" /></td>';
				str+= "<td class='butto2 showdesktop imgdropbutton' onclick='displayDrop(\"imgdrop\");'  title='Select image'><img src='../Shared/icons/picture_button.svg' /></td>";
							
				str+="</tr></table>";
				//----------------------------------------------------------------------------------------- END DOCUMENT
			}else if(type=="CODE"){
				
				//----------------------------------------------------------------------------------------- CODE
				
				var str = "<table cellspacing='2'><tr>";
				str+= '<td class="butto2" title="Change box title"><span class="boxtitleEditable" contenteditable="true" onblur="changeboxtitle(this,'+boxid+');">'+retdata['box'][boxid-1][4]+'</span></td>';

				str+="<td class='butto2 showdesktop codedropbutton' onclick='displayEditContent("+boxid+");' ><img src='../Shared/icons/general_settings_button.svg' /></td>";
								
				str+= '</tr></table>';
			
			}else{
				var str = "<table cellspacing='2'><tr>";
				str+="<td class='butto2 showdesktop'>";
				str+= "<select class='chooseContentSelect' onchange='changeboxcontent(this.value,\""+boxid+"\",\""+contentid+"\");removeboxmenu(\""+contentid+"menu\");'>";
					str+= "<option>Choose content</option>";
						str+= "<option value='CODE'>Code example</option>";
						str+= "<option value='DOCUMENT'>Description section</option>";
					str+= "</select>";
				str+= '</td></tr></table>';
			}					
			boxmenu.innerHTML=str;	
			
			//----------------------------------------------------------------------------------------- END CODE
		
		}else{
			var str = '<table cellspacing="2"><tr>';
			str+= '<td ><span class="boxtitle">'+retdata['box'][boxid-1][3]+'</span></td>';
			str+='</tr></table>';
			boxmenu.innerHTML=str;	
		}
			
			
		$(boxmenu).click(function(event){
			if($(window).width() <=1100){
				toggleClass(document.getElementById(boxmenu.parentNode.getAttribute("id")).getAttribute("id"));
			}
		});
	}
		
}

//----------------------------------------------------------------------------------
// removeTemplatebox: Removes any template box -- Is called by renderer
//----------------------------------------------------------------------------------

function removeTemplatebox(){
	
	for(var i=document.getElementsByClassName("box").length; i>retdata['numbox']; i--){
		document.getElementById("div2").removeChild(document.getElementById("box"+i+"wrapper"));
	}
}

//----------------------------------------------------------------------------------
// createhotdogmenu: Creates the menu at the top of a box -- Is called by renderer
//----------------------------------------------------------------------------------

function createhotdogmenu(){

	// div2 refers to the main content div below the floating menu
	var content = document.getElementById("div2");
	if(document.getElementById("hotdogdrop")){
		var hotdogmenu = document.getElementById("hotdogdrop");
		console.log("Hotdogmenu A");
	}else{
		var hotdogmenu = document.createElement("span");
		content.appendChild(hotdogmenu);
		hotdogmenu.id = "hotdogdrop";
		hotdogmenu.className = "hotdogdropStyle dropdown dropdownStyle showmobile";

		console.log("Hotdogmenu B");
	}
	
		str = '<table cellspacing="0" class="showmobile"><tr>';
		str += '<td class="mbutto mbuttoStyle " title="Back to list" onclick="Up();"><img src="../Shared/icons/home_button.svg" /></td>';
		str += '<td class="mbutto mbuttoStyle beforebutton " id="beforebutton" title="Previous example" onmousedown="Skip(\"bd\");" onmouseup="Skip(\"bu\");" onclick="Skip(\"bd\")"><img src="../Shared/icons/backward_button.svg" /></td>';
		str += '<td class="mbutto mbuttoStyle afterbutton " id="afterbutton" title="Next example" onmousedown="Skip(\"fd\");" onmouseup="Skip(\"fu\");" onclick="Skip(\"fd\")"><img src="../Shared/icons/forward_button.svg" /></td>';
		str += '<td class="mbutto mbuttoStyle playbutton " id="playbutton" title="Open demo" onclick="Play();"><img src="../Shared/icons/play_button.svg" /></td>';
		str += '</tr>';
		for(i=0;i<retdata['numbox'];i++){
		//	str += "<tr><td class='mbutto mbuttoStyle' title='Show \""+retdata['box'][i][3]+"\"' onclick='toggleClass(\"box"+(i+1)+"wrapper\");' colspan='4'>"+retdata['box'][i][3]+"<img src='../Shared/icons/hotdogTabButton2.svg' /></td></tr>";
			str += "<tr><td class='mbutto mbuttoStyle' title='Show \""+retdata['box'][i][3]+"\"' onclick='toggleTabs(\"box"+(i+1)+"wrapper\",this);' colspan='4'>"+retdata['box'][i][3]+"<img src='../Shared/icons/hotdogTabButton.svg' /></td></tr>";
		}		
 //		str += '<tr><td class="mbutto mbuttoStyle " title="Show JS" onclick="" colspan="4">JS<img src="../Shared/icons/hotdogTabButton2.svg" /></td></tr>';
 //		str += '<tr><td id="numberbuttonMobile" class="mbutto mbuttoStyle " title="Show rownumbers" onclick="fadelinenumbers();" colspan="4">Show rownumbers<img src="../Shared/icons/hotdogTabButton.svg" /></td></tr>';

		// str += '<tr><td class="mbutto mbuttoStyle " title="Settings" onclick="" colspan="4">Settings</td></tr>';
		str += '<tr><td class="mbutto mbuttoStyle " title="Change to desktop site" onclick="disableResponsive(&quot;yes&quot;); setEditing();" colspan="4">Desktop site</td></tr>';

		str += '</table>';
		
		hotdogmenu.style.display="block";	
		hotdogmenu.innerHTML = str;
	
}

//----------------------------------------------------------------------------------
// toggleClass: Modifies class using Jquery to contain "activebox" class selector -- called by code generated by createhotdog
//----------------------------------------------------------------------------------

function toggleClass(id)
{
	console.log("   toggleClass"+id);
	var className = $('#'+id).attr('class');
	$(".boxwrapper").addClass("deactivatedbox").removeClass("activebox");	
	if(className.indexOf("activebox") >-1){
		/* Height of the boxmenu + 1px for border-bottom */
	//	$('#'+id).animate({height: "26px"}, 500);	
		$("#"+id).removeClass("activebox").addClass("deactivatedbox");

	}else{
	//	$('#'+id).animate({height: "100%"}, 500);
		$("#"+id).removeClass("deactivatedbox").addClass("activebox");	
	}
}

//----------------------------------------------------------------------------------
// displayDrop: Modifies class using Jquery to contain "activebox" class selector -- called by code generated by createhotdog
//----------------------------------------------------------------------------------

function displayDrop(dropid)
{	
	drop = document.getElementById(dropid);
	if($(drop).is(":hidden")){
		$(".dropdown").css({display: "none"});
		drop.style.display="block";
	}else{
		drop.style.display="none";
	}	
}

//----------------------------------------------------------------------------------
// highlightop: Highlights an operator and corresponding operator in code window
//----------------------------------------------------------------------------------

function highlightop(otherop,thisop)
{
		$("#"+otherop).addClass("hi");					
		$("#"+thisop).addClass("hi");					
}

//----------------------------------------------------------------------------------
// highlightop: Dehighlights an operator and corresponding operator in code window
//----------------------------------------------------------------------------------

function dehighlightop(otherop,thisop)
{
		$("#"+otherop).removeClass("hi");					
		$("#"+thisop).removeClass("hi");					
}

//----------------------------------------------------------------------------------
// SkipBTimeout: Skip forward and backward menu timeout
//----------------------------------------------------------------------------------

/*
function SkipBTimeout()
{
		if(dmd==1){	
			switchDrop("backwdrop");
			isdropped=true;
		}	
}

function SkipBDown()
{		
		setTimeout(function(){SkipBTimeout();}, 1000);							
		dmd=1;
}


function SkipBUp()
{
		dmd=0;
}

function SkipB()
{		
		if(issetDrop("backwdrop")&&isdropped==false){
			var prevexampleid=parseInt(retdata['before'].reverse()[0][1]);
			location="EditorV30.php?courseid="+querystring['courseid']+"&exampleid="+prevexampleid;
		}else if(issetDrop("backwdrop")&&isdropped==true){
				isdropped=false;
		}else{
			// get previous example in the hierarchy
			var prevexampleid=parseInt(retdata['before'].reverse()[0][1]);
			location="EditorV30.php?courseid="+querystring['courseid']+"&exampleid="+prevexampleid;
		}
}


function SkipF()
{
		if(issetDrop("forwdrop")&&isdropped==false){
			var nextexampleid=parseInt(retdata['after'][0][1]);
			location="EditorV30.php?courseid="+querystring['courseid']+"&exampleid="+nextexampleid;
		}
		else if(issetDrop("forwdrop")&&isdropped==true){
				isdropped=false;
		}else{
			// get next example in the hierarchy
			var nextexampleid=parseInt(retdata['after'][0][1]);
			location="EditorV30.php?courseid="+querystring['courseid']+"&exampleid="+nextexampleid;
		}
}
*/


//----------------------------------------------------------------------------------
// Skip: Handles skipping either forward or backward. If pressed show menu
//----------------------------------------------------------------------------------

function Skip(skipkind)
{
		alert(skipkind);
}

// -------------==============######## Verified Functions End ###########==============-------------

//Retrive height for buliding menu.
$(window).load(function() {
	var windowHeight = $(window).height();
	textHeight= windowHeight-50;
	$("#table-scroll").css("height", textHeight);
});

$(window).resize(function() {
	var windowHeight = $(window).height();
	textHeight= windowHeight-50;
	$("#table-scroll").css("height", textHeight);
	
	
	// Keep right margin to boxes when user switch from mobile version to desktop version
	if($(".buttomenu2").height() == null){
		var boxmenuheight = 0;
	}else{
		var boxmenuheight= $(".buttomenu2").height();
	}
	$(".box").css("margin-top", boxmenuheight);

});

document.addEventListener("drop", function(e) {
    // cancel drop
    e.preventDefault();
});

document.addEventListener("paste", function(e) {
    // cancel paste
    e.preventDefault();
    // get text representation of clipboard
    var text = e.clipboardData.getData("text/plain");
    // insert text manually
    document.execCommand("insertText", false, text);
});

/********************************************************************************

   UI Hookups

*********************************************************************************/

//----------------------------------------------------------------------------------
// changeboxcontent: Called when the contents of the boxes at the top of a content div is changed
//----------------------------------------------------------------------------------

function changeboxcontent(boxcontent,boxid)
{
	alert(boxcontent+" "+boxid);
	AJAXService("changeboxcontent","&boxid="+boxid+"&boxcontent="+boxcontent);	
}

// -------------==============######## Verified Functions End ###########==============-------------
	

/********************************************************************************

   HTML freeform editing code

*********************************************************************************/

//----------------------------------------------------------------------------------
// Switches Dropdown List to Visible
//----------------------------------------------------------------------------------

function hideDrop(dname)
{
		var dropd=document.getElementById(dname);
		if(dropd!=null) dropd.style.display="none";							
}

//----------------------------------------------------------------------------------
// Switches Dropdown List to Visible
//----------------------------------------------------------------------------------

function switchDrop(dname)
{
		var dropd=document.getElementById(dname); 
		if(dropd.style.display=="block"){
			$( dropd ).slideUp("fast");
			//	dropd.style.display="none";							
		}else{
				hideDrop("forwdrop");
				hideDrop("backwdrop");
				$('#hotdogdrop').hide();
			
			$( dropd ).slideDown("fast");
			dropd.style.display="block";
		} 
}

//----------------------------------------------------------------------------------
// Reads value from Dropdown List
//----------------------------------------------------------------------------------

function issetDrop(dname)
{
		var dropd=document.getElementById(dname);
		if(dropd.style.display=="block"){
				return true;
		}else{
				return false;
		}
}

//----------------------------------------------------------------------------------
// Connects blur event to a functon for each editable element
//----------------------------------------------------------------------------------

function setupEditable()
{	
		if(retdata['writeaccess']=="w"){
				var editable=document.getElementById('exampleName');
				editable.addEventListener("blur", function(){editedExamplename();}, true);
		/*
				var fditable=document.getElementById('docucontent');
				fditable.addEventListener("blur", function(){editedDescription();}, true);
		*/
		}
}

function editedExamplename()
{
		var editable=document.getElementById('exampleName');
		var examplename=dehtmlify(editable.innerHTML,true,60);
		editable.innerHTML=examplename;
		AJAXService("editExampleName","&examplename="+examplename);
}

//----------------------------------------------------------------------------------
// Removes most html tags from a string!
//----------------------------------------------------------------------------------

function dehtmlify(mainstr,ignorebr,maxlength)
{
		
		mod=0;
		outstr="";
		
		if(maxlength==0||mainstr.length<maxlength){
				ln=mainstr.length;
		}else{
				ln=maxlength;
		}
		tagstr="";
		
		for(i=0;i<ln;i++){
				currchr=mainstr.charAt(i);
				if(currchr=="<"){
						mod=1;
						tagstr="";
				}else if(mod==1&&currchr==" "){
						mod=2;
				}else if(currchr==">"){
						mod=0;
						if(tagstr=="br"||tagstr=="b"||tagstr=="strong"){
								if(tagstr=="br"&&ignorebr==true){
										// Ignore BR tag 
								}else{
										outstr+="<"+tagstr+">";
								}
						}else if(tagstr=="br/"||tagstr=="b/"||tagstr=="strong/"){
								if(tagstr=="br/"&&ignorebr==true){
										// Ignore BR tag 
								}else{
										outstr+="<"+tagstr+">";
								}
						}else if(tagstr=="/br"||tagstr=="/b"||tagstr=="/strong"){
								if(tagstr=="/br"&&ignorebr==true){
										// Ignore BR tag 
								}else{
										outstr+="<"+tagstr+">";
								}
						}
				}else{
						if(mod==0){
								outstr+=currchr;
						}else if(mod==1){
								tagstr+=currchr;
						}else if(mod==2){
								if(currchr=="/") tagstr+=currchr;
						}
				}
		}
		return outstr;
}

//----------------------------------------------------------
// Highlights an important word from the important word list
//----------------------------------------------------------		

function highlightKeyword(kw)
{
			$(".impword").each(function(){
				if(this.innerHTML==kw){
					$(this).addClass("imphi");	

				}
			});	
}

//----------------------------------------------------------
// DeHighlights an important word from the important word list
//----------------------------------------------------------		

function dehighlightKeyword(kw)
{
			$(".impword").each(function(){
				if(this.innerHTML==kw){
					$(this).removeClass("imphi");	
				}
			});	
}

/********************************************************************************

   Tokenizer

*********************************************************************************/

// Token class and storage definition									
function token (kind,val,fromchar,tochar,row) {
this.kind = kind;
this.val = val;
this.from = fromchar;
this.to = tochar;
this.row = row;
}

//----------------------------------------------------------
// Store token in tokens array
// Creates a new token object using the constructor
//----------------------------------------------------------						

function maketoken(kind,val,from,to,rowno)
{
	newtoken=new token(kind,val,from,to,rowno);
	tokens.push(newtoken);
}

//----------------------------------------------------------
// Writes error from tokenizer
//----------------------------------------------------------						

function error(str,val,row)
{
	alert("Tokenizer Error: "+str+val+" at row "+row);
}

//----------------------------------------------------------------------------------
// replaceAll: Used by tokenizer to replace all instances of find string with replace string in str.
//             The idea behind this is to  cancel the html entities introduced to allow streaming of content
//----------------------------------------------------------------------------------

function replaceAll(find, replace, str)
{
    return str.replace(new RegExp(find, 'g'), replace);
}

//----------------------------------------------------------
// Tokenize: Tokenizer partly based on ideas from the very clever tokenizer written by Douglas Cockford
//           The tokenizer is passed a string, and a string of prefix and suffix terminators
//----------------------------------------------------------						

function tokenize(instring,inprefix,insuffix)
{
// replace HTML-entities
instring = replaceAll("&lt;","<",instring);
instring = replaceAll("&gt;",">",instring);
instring = replaceAll("&amp;","&",instring);

var from;                   	// index of the start of the token.
var i = 0;                  	// index of the current character.
var length=instring.length;		// length of the string

var c;                      	// current character.
var n;                      	// current numerical value
var q;                      	// current quote character
var str;                    	// current string value.
var row=1;										// current row value

c = instring.charAt(i);
while (c) {		// c == first character in each word
		from = i;
		if (c <= ' '){																					// White space and carriage return
			  if((c=='\n')||(c=='\r')||(c =='')){
						maketoken('newline',"",i,i,row);
						str="";
            row++;
				}else{
        		str=c;
				}
				
        i++;
    		while(true){
		        c=instring.charAt(i);
						if(c>' '||!c) break;
    				if((c=='\n')||(c=='\r')||(c =='')){
                //str += c;
								maketoken('whitespace',str,from,i,row);				                
								maketoken('newline',"",i,i,row);
                str="";
								// White space Row (so we get one white space token for each new row) also increase row number
    						row++;
    				}else{
            		str += c;
    				}
            i++;
				}
				if(str!="") maketoken('whitespace',str,from,i,row);
		}else if((c >='a'&&c<='z')||(c>='A'&&c<='Z')){					// Names i.e. Text
    		str = c;      				
    		i++;
    		while(true){
        		c = instring.charAt(i);
        		if ((c >='a'&&c<='z')||(c>='A'&&c<='Z')||(c>='0'&&c<='9')||c=='_'){
            		str += c;
            		i++;
        		}else{
            		break;
        		}
    		} 
    		maketoken('name',str,from,i,row);
    }else if(c >= '0' && c <= '9'){			// Number token
        str = c;
        i++;
    		while(true){
		        c = instring.charAt(i);
            if (c < '0' || c > '9') break;
            i++;
            str+=c;
        }
        if(c=='.'){
            i++;
            str+=c;
            for(;;){
    		        c=instring.charAt(i);
                if (c < '0' || c > '9') break;
                i++;
                str+=c;
            }
        }
        if (c=='e'||c=='E') {
            i++;
            str+=c;
		        c=instring.charAt(i);
            if(c=='-'||c=='+'){
                i+=1;
                str+=c;
    		        c=instring.charAt(i);
            }
            if (c < '0' || c > '9') error('Bad Exponent in Number: ',str,row);
            do {
                i++;
                str+=c;
    		        c=instring.charAt(i);
            }while(c>='0'&&c<='9');
        }
        if (c>='a'&&c<='z'){
            str += c;
            i += 1;
            error('Bad Number: ',str,row);
        }
        n=+str;
        if(isFinite(n)){
						maketoken('number',n,from,i,row);		            		
        }else{
            error('Bad Number: ',str,row);
        }
    }else if(c=='\''||c=='"'){	   // String .. handles c style breaking codes. Ex: "elem" or "text"
        str='';
        q=c;
        i++;
    		while(true){
		        c=instring.charAt(i);
            if (c<' '){
        				if((c=='\n')||(c=='\r')||(c == '')) row++; 	// Add row if this white space is a row terminator				 																						
            		error('Unterminated String: ',str,row);		
            		break;                		
            }

            if (c==q) break;

            if (c=='\\'){
                i += 1;
                if (i >= length) {
                		error('Unterminated String: ',str,row);		
                		break;                		
                }
    		        c=instring.charAt(i);
                
                if(c=='b'){ c='\b'; break; }
                if(c=='f'){ c='\f'; break; }
                if(c=='n'){ c='\n'; break; }
                if(c=='r'){ c='\r'; break; }
                if(c=='t'){ c='\t'; break; }
                if(c=='u'){
                    if (i >= length) {
		             	error('Unterminated String: ',str,row);		
		             	break;                		
                    }
                    c = parseInt(this.substr(i + 1, 4), 16);
                    if (!isFinite(c) || c < 0) {
		                		error('Unterminated String: ',str,row);		
		                		break;                		
                    }
                    c = String.fromCharCode(c);
                    i+=4;
                    break;		                    
                }
            }
            str += c;
            i++;
        }
        i++;
        maketoken('string',c+str+c,from,i,row);
        c=instring.charAt(i);

    }else if (c=='/'&&instring.charAt(i+1)=='/'){	// Comment of // type ... does not cover block comments
        i++;
        str=c; 
    		while(true){
		        c=instring.charAt(i);
            if (c=='\n'||c=='\r'||c=='') {
                row++;
                break;
            }else{
                str+=c;                
            }
            i++;
        }	
				maketoken('rowcomment',str,from,i,row);
				/* This does not have to be hear because a newline creates in coderender function 
				maketoken('newline',"",i,i,row); */													                
    }else if (c=='/'&&instring.charAt(i+1)=='*'){		// Block comment of /* type
        i++;
    		str=c; 
    		while(true){
		        c=instring.charAt(i); 
            if ((c=='*'&&instring.charAt(i+1)=='/')||(i==length)) {
                str+="*/"
                i+=2;
  		        c=instring.charAt(i); 
                break;
            }	
            if (c=='\n'||c=='\r'||c=='') { 
            	// don't make blockcomment or newline if str is empty
            	if(str != ""){
            		maketoken('blockcomment',str,from,i,row);
					maketoken('newline',"",i,i,row);
            		row++;
                	str="";
            	}
            }else{ 
                str+=c;                
            }
            i++;
        }	
      	  	maketoken('blockcomment',str,from,i,row);
		}else if(inprefix.indexOf(c) >= 0) {											// Multi-character Operators
    		str = c;
    		i++;
    		while(true){
		        c=instring.charAt(i); 
        		if (i >= length || insuffix.indexOf(c) < 0) {
            		break;
        		}
        		str += c; 
        		i++;
    		} 
    		maketoken('operator',str,from,i,row);
		} else {																									// Single-character Operators
    		i++;  
    		maketoken('operator',c,from,i,row);
    		c = instring.charAt(i);
		}
	}
}

//----------------------------------------------------------------------------------
// Renders a set of tokens from a string into a code viewer div
// Requires tokens created by a cockford-type tokenizer
//----------------------------------------------------------------------------------

function rendercode(codestring,boxid)
{
    var destinationdiv = "box" + boxid;
	tokens = [];
	
	important = [];
	for(var i=0;i<retdata.impwords.length;i++){
		important[retdata.impwords[i]]=retdata.impwords[i];	
	}
	

	keywords=[];
	for(var i=0;i<retdata['words'].length;i++){
		if(retdata['words'][i][0]==wordlist){
			temp=[retdata['words'][i][1],retdata['words'][i][2]];
			keywords[temp]=temp;
		}
	}

	improws=[];
	for(var i=0;i<retdata.improws.length;i++){
        if ((retdata['improws'][i][0]) == boxid){
       		improws.push(retdata.improws[i]);
		}
	}
	tokenize(codestring,"<>+-&","=>&:");
			
	// Iterate over token objects and print kind of each token and token type in window 
	printout=document.getElementById(destinationdiv);
	str="";
	cont="";

	lineno=0;
	
	str+="<div class='normtextwrapper'>";
	
	
	pcount=0;
	parenthesis=new Array();
	bcount=0;
	bracket=new Array();
	cbcount=0;
	cbracket=new Array();

	pid="";
	
	var iwcounter=0;
	
	for(i=0;i<tokens.length;i++){
			
		tokenvalue=String(tokens[i].val);
			
		// Make white space characters
		tokenvalue=tokenvalue.replace(/ /g, '&nbsp;');
		tokenvalue=tokenvalue.replace(/\\t/g, '&nbsp;&nbsp;');
			
		if(tokens[i].kind=="rowcomment"){
			cont+="<span class='comment'>"+tokenvalue+"</span>";
		}else if(tokens[i].kind=="blockcomment"){
			cont+="<span class='comment'>"+tokenvalue+"</span>";
		}else if(tokens[i].kind=="string"){
			cont+="<span class='string'>"+tokenvalue+"</span>";
		}else if(tokens[i].kind=="number"){
			cont+="<span class='number'>"+tokenvalue+"</span>";
		}else if(tokens[i].kind=="name"){
			var foundkey=0;
					
			// Removed two for loops here and replaced it with smart indexing. either kind 2 or kind 1
			if(important[tokenvalue]!=null){
					foundkey=2;
			}else if(keywords[tokenvalue]!=null){	
						foundkey=1;						
			}
			
			if(foundkey==1){
				cont+="<span class='keyword"+label+"'>"+tokenvalue+"</span>";														
			}else if(foundkey==2){
				iwcounter++;
				cont+="<span id='IW"+iwcounter+"' class='impword' onmouseover='highlightKeyword(\""+tokenvalue+"\")' onmouseout='dehighlightKeyword(\""+tokenvalue+"\")'>"+tokenvalue+"</span>";														
			}else{
				cont+=tokenvalue;
			}
					
		}else if(tokens[i].kind=="operator"){
			if(tokenvalue=="("){
				pid="PA"+pcount+boxid; 
				pcount++;
				parenthesis.push(pid);
				cont+="<span id='"+pid+"' class='oper' onmouseover='highlightop(\"P"+pid+"\",\""+pid+"\");' onmouseout='dehighlightop(\"P"+pid+"\",\""+pid+"\");'>"+tokenvalue+"</span>";												
			}else if(tokenvalue==")"){
				pid=parenthesis.pop();
				cont+="<span id='P"+pid+"' class='oper' onmouseover='highlightop(\""+pid+"\",\"P"+pid+"\");' onmouseout='dehighlightop(\""+pid+"\",\"P"+pid+"\");'>"+tokenvalue+"</span>";																						
			}else if(tokenvalue=="["){
				pid="BR"+bcount;
				bcount++;
				bracket.push(pid);
				cont+="<span id='"+pid+"' class='oper' onmouseover='highlightop(\"P"+pid+"\",\""+pid+"\");' onmouseout='dehighlightop(\"P"+pid+"\",\""+pid+"\");'>"+tokenvalue+"</span>";												
			}else if(tokenvalue=="]"){
				pid=bracket.pop();
				cont+="<span id='P"+pid+"' class='oper' onmouseover='highlightop(\""+pid+"\",\"P"+pid+"\");' onmouseout='dehighlightop(\""+pid+"\",\"P"+pid+"\");'>"+tokenvalue+"</span>";																						
			}else if(tokenvalue=="{"){
				pid="CBR"+cbcount+boxid;
					cbcount++;
					cbracket.push(pid);
					cont+="<span id='"+pid+"' class='oper' onmouseover='highlightop(\"P"+pid+"\",\""+pid+"\");' onmouseout='dehighlightop(\"P"+pid+"\",\""+pid+"\");'>"+tokenvalue+"</span>";												
				}else if(tokenvalue=="}"){
					pid=cbracket.pop();
					cont+="<span id='P"+pid+"' class='oper' onmouseover='highlightop(\""+pid+"\",\"P"+pid+"\");' onmouseout='dehighlightop(\""+pid+"\",\"P"+pid+"\");'>"+tokenvalue+"</span>";																						
				}else{
					cont+="<span class='oper'>"+tokenvalue+"</span>";										
				}
		}else{
			cont+=tokenvalue;
		}
				// tokens.length-1 so the last line will be printed out
		if(tokens[i].kind=="newline" || i==tokens.length-1){  
			// Prevent empty lines to be printed out
			if(cont != ""){
				
				// count how many linenumbers that'll be needed
				lineno++;

			// Print out normal rows if no important exists
				if(improws.length==0){
					str+="<div class='normtext'>"+cont+"</div>";
				}else{	
					// Print out important lines
					for(var kp=0;kp<improws.length;kp++){
						if(lineno>=parseInt(improws[kp][1])&&lineno<=parseInt(improws[kp][2])){
							str+="<div class='impo'>"+cont+"</div>";
							break;
						}else{
							if(kp == (improws.length-1)){
								str+="<div class='normtext'>"+cont+"</div>";
							}
						}						
					}
				}	
				cont="";
			}	
		}
	}
	str+="</div>";
		
		// Print out rendered code and border with numbers
	printout.innerHTML = createCodeborder(lineno,improws) + str;
		
	linenumbers();
}

// function to create a border with line numbers
function createCodeborder(lineno,improws){
	var str="<div class='codeborder'>";
	var x= 0;
	
	for(var i=1; i<=lineno; i++){
		// Print out normal numbers
		if(improws.length ==0){
			str+="<div class='no'>"+(i)+"</div>";	
		}else{
			// Print out numbers for an important row
			for(var kp=0;kp<improws.length;kp++){
				if(i>=parseInt(improws[kp][1])&&i<=parseInt(improws[kp][2])){
					str+="<div class='impono'>"+(i)+"</div>";	
					break;	
					
				}else{
					if(kp==(improws.length-1)){
						str+="<div class='no'>"+(i)+"</div>";					
					}
				}			
			}
		}
	}
	
	str+="</div>";
	return str;
}

function linenumbers()
{	
	if(localStorage.getItem("linenumbers") == "false"){	
		$( "#numberbutton img" ).attr('src', '../Shared/icons/noNumbers_button.svg'); 
		$( "#numberbuttonMobile img" ).attr('src', '../Shared/icons/hotdogTabButton2.svg');
		$( ".codeborder" ).css("display","none");	
	}
}

function fadelinenumbers()
{
	if ( $( ".codeborder" ).is( ":hidden" ) ) {
		$( ".codeborder" ).fadeIn( "slow" );
		$( "#numberbuttonMobile img" ).attr('src', '../Shared/icons/hotdogTabButton.svg');
		$( "#numberbutton img" ).attr('src', '../Shared/icons/numbers_button.svg');
		localStorage.setItem("linenumbers", "true");					  
	}else{
		$( ".codeborder" ).fadeOut("slow");
		$( "#numberbuttonMobile img" ).attr('src', '../Shared/icons/hotdogTabButton2.svg');
		$( "#numberbutton img" ).attr('src', '../Shared/icons/noNumbers_button.svg');
		localStorage.setItem("linenumbers", "false");
	 }
}


function changedSecurity(){
	var cb = document.getElementById('checkbox');
	var option = 0;
	if(cb.checked){
		option = 1;
	}
	
	AJAXService("updateSecurity","&public="+ option);
}

function mobileTheme(id){
	if ($(".mobilethemebutton").is(":hidden")){
		  $(".mobilethemebutton").css("display","table-cell");
	}
	else{
		  $(".mobilethemebutton").css("display","none");
	}
}

//Set the editing properties for mobile and desktop version
function setEditing(){
	var	hotdog = document.getElementById("hidehotdog");
	var	isDesktop = $(hotdog).is(":hidden");
	if(isDesktop){
		 $("*[contenteditable]").attr("contenteditable","true"); 
		 $(".tooltip").css("display", "block");
	}else{ 
		$("*[contenteditable]").attr("contenteditable","false"); 
		$(".tooltip").css("display", "none");
	}
}

//----------------------------------------------------------------------------------
// changeTemplate: Change template by updating hidden field
//----------------------------------------------------------------------------------

function changetemplate(templateno)
{
	$(".tmpl").each(function( index ) {
			$(this).css("background","#ccc");
	});

	$("#templat"+templateno).css("background","#fc4");
	$("#templateno").val(templateno);
}

//----------------------------------------------------------------------------------
// updateTemplate: Write template hidden field to database
//----------------------------------------------------------------------------------

function updateTemplate()
{
		templateno=$("#templateno").val();
		$("#chooseTemplate").css("display","none");
		$.ajax({url: "editorService.php", type: "POST", data: "courseid="+querystring['courseid']+"&exampleid="+querystring['exampleid']+"&opt=SETTEMPL"+"&cvers="+querystring['cvers']+"&templateno="+templateno, dataType: "json", success: returned});											
}

function closeEditContent()
{
		$("#editContent").css("display","none");
}

function closeEditExample()
{
		$("#editExample").css("display","none");
}

function updateContent()
{

}