// Portify.JS Express Chainloader
// Should complete all steps needed to load portify.js
// Also mutates the google listen.js file to selectively block images

function insertBeforeLastOccurrence(strToSearch, strToFind, strToInsert) {
    var n = strToSearch.lastIndexOf(strToFind);
    if (n < 0) return strToSearch;
    return strToSearch.substring(0,n) + strToInsert + strToSearch.substring(n);    
}

function addscript(url, cbname){
	var script = document.createElement('script');
	script.src = url;
	script.type = 'text/javascript';
	script.onload =function(){cbname()};
	document.getElementsByTagName('head')[0].appendChild(script);
}
if ((document.readyState == 'complete' || document.readyState == 'interactive') && window.portifyExpress != true){
	window.portifyExpress = true;
	if (window.jQuery === undefined){
		addscript('https://code.jquery.com/jquery-1.11.0.min.js', locationmapper);
	} else {
		locationmapper();
	}
} else {
	if (window.canImage === true){
		   addstyle("https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css");
		   window.modalstage = 2;
		   dospotimport();
	}
}
function locationmapper(){
	switch(window.location.pathname) {
		case "/music/portifyjs":
			gplayTakeover();
			break;
		case "/web-api/console/get-current-user-playlists/":
			spotifyCode();
			break;
		default:
			window.location = "https://developer.spotify.com/web-api/console/get-current-user-playlists/";
			break;
	}
}

function spotifyCode(){
	if (window.location.pathname.indexOf('authorize') != -1){
		document.querySelector('.auth-allow').click();
	} else {
		var lasttime = localStorage.getItem('portifyTime');
		var coclick = false;
		if (lasttime === null){
			localStorage.setItem('portifyTime', new Date().getTime().toString());
			$('#clearOauth').click();
			coclick = true;
		} else {
			if ((new Date().getTime() - parseInt(lasttime))/1000 > 3600){
				localStorage.setItem('portifyTime', new Date().getTime().toString());
				$('#clearOauth').click();
				coclick = true;
			}
		}
		if ($('#oauth').attr('value').length > 0 && !coclick){
			window.location = "https://play.google.com/music/portifyjs?spotifyoauth=" + $('#oauth').attr('value');
		} else {
			$('#oauthPopup').click();
			$('input[type=checkbox]').attr('checked', 'checked');
			$('#oauthRequestToken').click();
		}
	}
}

function gplayTakeover(){
	window.spotifyoauth = window.QueryString.spotifyoauth;
	$.ajax({
		url : 'https:\/\/play.google.com\/music\/listen?u\x3d0\x26hl\x3den-US',
		dataType: "text",
		success : function (data) {
			window.htmldata = data;
			window.listensrc = window.htmldata.slice(window.htmldata.indexOf('listen_extended')-67,window.htmldata.indexOf('listen_extended')+59)
			document.write(data.replace("listen_extended", ""));
			$.ajax({
					url : window.sjsrc,
					dataType: "text",
					success : function (datac) {
						$('<script>')
							.attr('type', 'text/javascript')
							.text(datac.replace('animationConfig', 'notAnimationConfig'))
							.appendTo('body');
					}
				});
			setTimeout(function() {
				$.ajax({
					url : window.listensrc,
					dataType: "text",
					success : function (datab) {
						//var inject = ";var DP=function(a,b,c,e){var localtxt = (BP(b(c||CP,void 0,e)));var re = /src=/g;var result = localtxt.replace(re, 'nosrc=');a.innerHTML=result;};" // Our string to inject at the bottom of the listen.js page. Replaces obfusicated function DP with a patched version that replaces 'src' with 'nosrc'.
						var functionIndicator = "=function(a,b,c,e){a.innerHTML="; // This string is used to locate the function we need to modify
						var i = datab.split(functionIndicator)[1].indexOf('}');
						var splits = [datab.split(functionIndicator)[1].slice(0,i), datab.split(functionIndicator)[1].slice(i+1)];
						var smod = datab.split(functionIndicator)[0] + "=function(a,b,c,e){a.innerHTML=window.mutateInput(" + splits[0] + ")}" + splits[1];
						console.log(smod);
						$('<script>')
							.attr('type', 'text/javascript')
							.text(smod)
							.appendTo('body');
						$('<style>')
							.attr('type', 'text/css')
							.text('* {transition: none !important;}')
							.appendTo('head');
						document.close();
						$.getScript("https://rawgit.com/jgrocho/Portify.JS/master/portify.js");
					}
				});
			}, 1000);
		}
	});
}

window.mutateInput = function(input){
	if (window.canImage !=  true){
		var re = /src=/g;
		return input.replace(re, 'nosrc=');
	} else{
		return input;
	}
}

window.QueryString = function () {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
        // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
        // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  } 
    return query_string;
}();
