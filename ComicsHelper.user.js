// ==UserScript==
// @name ComicsHelper
// @namespace kreisher.com
// @description Adds content to web comic RSS feeds shown in Google Reader,
// including comics for feeds that don't include it, and hidden "easter egg"
// content
// @version 1
// @include http://reader.google.com/reader/*
// @include http://www.google.com/reader/*
// @require https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js
// ==/UserScript==

var extension = false;

function is_comic(link) {

	var comics = {
		"http://feedproxy.google.com/~r/AbstruseGoose/" 		: "ag",   // Abstruse Goose
		"http://www.amazingsuperpowers.com/"            		: "asp",  // Amazing Super Powers
		"http://www.anticscomic.com/"                   		: "ant",  // Antics Comic
		"http://www.boatcrime.com/"                     		: "bc",   // Boat Crime
		"http://brawlinthefamily.keenspot.com/"         		: "bitf", // Brawl in the Family
		"http://feedproxy.google.com/~r/Channelate/"			: "c8",	  // Channelate
		"http://feedproxy.google.com/~r/CowbirdsInLove/~3/"		: "cil",  // Cowbirds in Love
		"http://www.explosm.net/comics/"                		: "ch",   // Cyanide & Happiness
		"http://feedproxy.google.com/~r/DoctorKawaii/~3/"		: "dk",	  // Doctor Kawaii
		"http://feedproxy.google.com/~r/thedoghousediaries/"    : "dd",   // Doghouse Diaries
		"http://gunshowcomic.com/"                              : "gsc",  // Gun Show Comics
		"http://feedproxy.google.com/~r/hijinksensue/"          : "he",   // Hijinx Ensue
		"http://hijinksensue.com/"								: "he",   // Hijinx Ensue
		"http://www.geekculture.com/joyoftech/"                 : "jot",  // The Joy of Tech
		"http://legacy-control.com/comic/"						: "lc",	  // Legacy Control
		"http://feedproxy.google.com/~r/LICD/"					: "licd", // Least I Could Do
		"http://feedproxy.google.com/~r/LukeSurl/"              : "ls",   // Luke Surl
		"http://loldwell.com/" 									: "lw",   // LOLd Well
        "http://mrlovenstein.com/" 								: "ml",   // Mr Lovenstein
        "http://nedroid.com/" 									: "npd",  // Nedroid Picture Diary
		"http://www.nerdragecomic.com/"							: "nr",	  // Nerd Rage
        "http://feedproxy.google.com/~r/nerfnow/" 				: "nn",   // Nerf Now
		"http://www.nukees.com/"								: "nu",	  // Nukees
		"http://theoatmeal.com/"                                : "oat",  // The Oatmeal #NEEDS WORK
		"http://feedproxy.google.com/~r/Optipess/"      		: "opt",  // Optipess
		"http://www.optipess.com/"								: "opt",  // Optipess
		"http://feeds.penny-arcade.com/"                		: "pa",   // Penny Arcade
		"http://popstrip.com/"                                  : "ps",   // Popstrip
		"http://robbieandbobby.com/"							: "rab",  // Robbie and Bobby
		"http://feedproxy.google.com/~r/smbc-comics/"   		: "smbc", // SMBC
		"http://www.smbc-comics.com/"                   		: "smbc", // SMBC
		"http://www.somethingpositive.net/"                     : "sp",   // Something Positive
		"http://www.stickycomics.com/dilemma/"          		: "sc",   // Sticky Comics
		"http://feedproxy.google.com/~r/TwoGuysAndGuy/"			: "tgag", // Two Guys and Guy
		"http://xkcd.com/"                              		: "xkcd", // XKCD
		
	}
	for (var c in comics) {
		if ( link.match("^"+c) ) return comics[c];
	}
	return null;
}

function add_secrets(item_body, title, panel_src) {
	var div = $("<div />");
	if ( title ) div.append($("<p />").append(title).css("background", "#FFFFAD"));
	if ( panel_src ) {
		if ($.isArray(panel_src)){
			var pic;
			for(pic in panel_src){
				div.append($("<img />").attr("src", panel_src[pic]));
			}
		} else {
			div.append($("<img />").attr("src", panel_src));
		}
	}
	$(item_body).after(div);
}

function handle_response(data, item_body, title) {
	var panel_src = null;
	try {
		responseJSON = JSON.parse(data);
		panel_src = responseJSON.panel;
	} catch (e) {}
	
	if (panel_src || title) {
		add_secrets(item_body, title, panel_src);
	}
}

function ajax_panel(link, item_body, title) {
	link = "http://comic-helper.appspot.com/panel?link="+link;
	if ( extension ) {
		$.get(link, function(data) {
			handle_response(data, item_body, title);
		});
	} else {
		setTimeout(function() {
		GM_xmlhttpRequest({
			method: "GET",
			url: link,
			onload: function(response) {
				handle_response(response.responseText, item_body, title);
			}
		});
		}, 0);
	}
}

function get_extras(comic, item_body, link) {
	link = encodeURIComponent(link);
	var title = null;
	switch (comic) {
		case "ag":
		case "ant":
		case "bc":
		case "bitf":
		case "cil":
		case "dd":
		case "gsc":
		case "ls":
		case "lw":
		case "ml":
		case "npd":
		case "opt":
		case "ps":
		case "sc":
		case "xkcd":
			title = $(item_body).find("img").attr("title");
			if (title) {
				add_secrets(item_body,title,null);
			}
			break;
		case "asp":
			var img = $(item_body).find("img");
			title = img.attr("title");
			var panel = asp_regex(img.attr("src"));
			if ( panel != null ) {
				add_secrets(item_body,title,panel);
			}
			break;
		case "ch":
			ajax_panel(link, item_body, title);
			break;
		case "pa":
			var div_html = $(item_body).find("div").html();
			var test = /New Comic/i;
			if (( div_html ) && ( test.test(div_html) )) {
				ajax_panel(link, item_body, null);
			}
			break;
		case "smbc":
			var img = $(item_body).find("img");
			var panel = smbc_regex(img.attr("src"));
			if ( panel != null ) {
				add_secrets(item_body, null, panel);
			}
			break;
		case "jot":
            var panel = jot_regex(link);
            if(panel != null){
                add_secrets(item_body, null, panel);
            }
			break;
        case "sp":
            var panel = sp_regex(link);
            if(panel != null){
                add_secrets(item_body, null, panel);
            }
            break;
        case "nn":
            img = $(item_body).find("img[src*='comic']");
            src = $(img).attr("src");
            var panel = nn_regex(src);
            if(panel != null){
                add_secrets(img, null, panel);
            }
            $(img).hide();
            break;
		case "nu":
			var panel = nu_regex(link);
			if(panel != null){
				add_secrets(item_body, null, panel);
			}
			break;
        case "he":
            img = $(item_body).find("img[src*='comics-rss']");
			if($(img).attr("src") == null ) {
				img = $(item_body).find("img[src*='uploads']");
			}
            src = $(img).attr("src");
            title = $(img).attr("title")
            var panel = he_regex(src);
            if(panel != null){
                add_secrets(img, title, panel);
            }
            $(img).hide();
            break;
			
		case "dk":
			img = $(item_body).find("img[src*='doctorkawaii.com']");
			src = $(img).attr("src");
			title = $(img).attr("title");
			var panel = dk_regex(src);
			if(panel != null){
				add_secrets(img, title, panel);
				$(img).hide();
			}
			break;
			
		case "nr":
			var panel = nr_regex(link);
			if(panel != null){
				add_secrets(item_body, null, panel);
			}
			break;
		
		case "lc":
			img = $(item_body).find("img[src*='comics-rss']");
            src = $(img).attr("src");
            title = $(img).attr("title")
            var panel = lc_regex(src);
            if(panel != null){
                add_secrets(img, title, panel);
            }
            $(img).hide();
            break;
			
		case "licd":
			img = $(item_body).find("img[src*='leasticoulddo']");
			src = $(img).attr("src");
			var panel = licd_regex(src);
			var title = null;
			if (panel != null){
				$(img).hide();
				add_secrets(img, title, panel);
			}
			break;
			
		case "tgag":
			img = $(item_body).find("img[src*='twogag']");
			src = $(img).attr("src");
			var panel = tgag_regex(src);
            title = $(img).attr("title");
			if(panel != null){
				img.hide();
				add_secrets(img, title, panel);
			}
			break;
			
		case "rab":
			img = $(item_body).find("img[src*='robbieandbobby']");
			src = $(img).attr("src");
			var panel = rab_regex(src);
			title = $(img).attr("title");
			if(panel != null){
				img.hide();
				add_secrets(img, title, panel);
			}
			break;
	}
}

var process_node = function(e) {
	var entry_main = null;
	var entry_title_link = null;
	var item_body = null;
	$('iframe').css("display","none");
	$(e.target).children("div[class='entry-main']").each(function() {
		entry_main = this;
		$(entry_main).find("a[class='entry-title-link']").each(function() {
			entry_title_link = $(this).attr("href");
		});
		$(entry_main).find("div[class='item-body']").each(function() {
			item_body = this;
		});
	});
	if ( !entry_main || !entry_title_link || !item_body ) return;
	
	var comic = is_comic(entry_title_link);
	if ( !comic ) return;
	get_extras(comic, item_body, entry_title_link);
}

function go() {
	document.body.addEventListener('DOMNodeInserted', process_node, false);
}

if ( typeof checkOption == 'function' ) {
	extension = true;
	checkOption("reader", go);
} else {
		go();
}

function getTitleImage (srcString, needsTitle) {
	/*
	Locate the first image whose src attribute contains srcString.
	needsTitle is a boolean (defaults to true), and causes the function
	to only return the image if it contains a "title" attribute, otherwise
	it returns null
	*/
	if ( needsTitle == undefined ) needsTitle = true;
	var image = null;
	$("img[src*='"+srcString+"']").each(function(i) {
		if ( !needsTitle || this.hasAttribute("title") ) {
			image = this;
		}
	});
	return image;
}

function addTitle(image) {
	/*
	Simple way to add title text below a given image. For some comics,
	calling this with the output of getTitleImage is all that's needed
	*/
	var div = $("<div />").append($(image).attr("title"));
	$(image).after(div);
}

function grabAndAdd(srcString) {
	/*
	Puts together the getTitleImage and addTitle functions, allowing some
	comics to be coded in just this one function call
	*/
	var titleImage = getTitleImage(srcString);
	if ( titleImage != null ) addTitle(titleImage);
}

// function checkOption(name, cb) {
	// /*
	// Send a request to background.html to retrieve variable 'name'
	// from localStorage. If it is "true", then call the callback
	// function cb
	// */
	
	// chrome.extension.sendRequest({option: name}, function(response) {
		// alert(response.option);
		// if ( !response.option || response.option == "true" ) {
			// cb();
		// }
	// });
	// alert("HERE");
// }

function asp_regex(src) {
	/*
	Perform the regular expression to translate from a given comic source
	url, into it's associated hidden comic for amazingsuperpowers.com
	This is stored in common.js so that it can be used in the files for
	the ASP home page, as well as in Google Reader
	*/
	var re = new RegExp(/http:\/\/www\.amazingsuperpowers\.com\/comics(-rss)?\/(\d{4}-\d{2}-\d{2})-.*\.png/);
	var match = re.exec(src);
	var panel = null;
	if (match != null) {
		panel = "http://www.amazingsuperpowers.com/hc/comics/" + match[2] + ".jpg";
	}
	return panel;
}

function smbc_regex(src) {
	/*
	Guess at the URL of the secret panel, given the src of a comic
	*/
	var re = new RegExp(/http:\/\/(.*)\.smbc-comics\.com\/comics\/(\d{8})\.gif/);
	var match = re.exec(src);
	var panel = null;
	if (match != null) {
		panel = "http://"+match[1]+".smbc-comics.com/comics/"+match[2]+"after.gif";
	}
	return panel;
}

function jot_regex(src) {
    var re = new RegExp(/http:\/\/www\.geekculture\.com\/joyoftech\/joyarchives\/(\d+)\.html/);
    var match = re.exec(decodeURIComponent(src));
    var panel = [];
    if(match != null) {
        panel.push("http://www.geekculture.com/joyoftech/joyimages/"+match[1]+".gif");
		panel.push("http://www.geekculture.com/joyoftech/joyimages/"+match[1]+".jpg");
    }
    return panel;
}

function sp_regex(src){
    var re = new RegExp(/http:\/\/www\.somethingpositive\.net\/(sp\d+)\.shtml/);
    var match = re.exec(decodeURIComponent(src));
    var panel = null;
    if(match != null) {
        panel = "http://www.somethingpositive.net/"+match[1]+".png";
    }
    return panel;
}

function nn_regex(src){
    var re = new RegExp(/http:\/\/www\.nerfnow\.com\/comic\/thumb\/(\d+)\/large/);
    var match = re.exec(src);
    var panel = null;
    if(match != null) {
        panel = "http://www.nerfnow.com/comic/image/"+match[1];
    }
    return panel;
}

function he_regex(src){
    var re = new RegExp(/http:\/\/hijinksensue\.com\/comics-rss\/(.+)/);
    var match = re.exec(src);
    var panel = null;
    if(match != null) {
        panel = "http://hijinksensue.com/comics/"+match[1];
    } else {
		re = new RegExp(/http:\/\/hijinksensue.com\/wp-content\/uploads\/(.+)-\d{3}x\d{3}\.jpg/);
		match = re.exec(src);
		if(match != null) {
			panel = "http://hijinksensue.com/wp-content/uploads/"+match[1]+".jpg";
		}
	}
    return panel;
}

function dk_regex(src){
	var re = new RegExp(/http:\/\/doctorkawaii.com\/wp-content\/uploads\/(.+)-150x150.jpg/);
	var match = re.exec(src);
	var panel = null;
	if(match != null) {
		panel = "http://doctorkawaii.com/wp-content/uploads/"+ match[1] +".jpg";
	}
	return panel;
}

function nr_regex(src){
	var re = new RegExp(/http%3A%2F%2Fwww\.nerdragecomic\.com%2Findex\.php%3Fdate%3D(.*)/);
	var match = re.exec(src);
	var panel = null;
	if(match != null){
		panel = "http://www.nerdragecomic.com/strips/"+match[1]+".jpg";
	}
	return panel;
}

function lc_regex(src){
    var re = new RegExp(/http:\/\/legacy-control\.com\/comics-rss\/(.*)/);
    var match = re.exec(src);
    var panel = null;
    if(match != null) {
        panel = "http://legacy-control.com/comics/"+match[1];
    } 
    return panel;
}

function nu_regex(src){
	var re = new RegExp(/http%3A%2F%2Fwww\.nukees\.com%2Fd%2F(.*)\.html/);
	var match = re.exec(src);
	var panel = null;
	if(match != null){
		panel = "http://www.nukees.com/comics/nukees"+match[1]+".gif"
	}
	return panel;
}

function licd_regex(src){
	var re = new RegExp(/(http:\/\/cdn\.leasticoulddo\.com\/wp-content\/uploads\/2013\/02\/20130220)-180x60\.gif/);
	var match = re.exec(src);
	var panel = null;
	if (match != null){
		panel = match[1] + ".gif";
	}
	return panel;
}

function tgag_regex(src){
    var panel = src.replace("comics-rss", "comics");
    return panel;
}

function rab_regex(src){
    var panel = src.replace("comics-firstpanel", "comics");
    return panel;
}