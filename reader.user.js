// ==UserScript==
// @name			Comic Helper
// @namespace		http://github.com/wfriesen/comic-helper
// @description		Adds content to web comic RSS feeds shown in Google Reader,
// including comics for feeds that don't include it, and hidden "easter egg"
// content
// @version			3.2
// @include			http://reader.google.com/reader/*
// @include			http://www.google.com/reader/*
// @require			https://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js
// ==/UserScript==

var extension = false;

function is_comic(link) {
	var comics = {
            "http://feedproxy.google.com/~r/AbstruseGoose/"         : "ag", // Abstruse Goose
			"http://www.amazingsuperpowers.com/"                    : "asp", // Amazing Super Powers
            "http://www.anticscomic.com/"                           : "ac", // Antics Comic
            "http://www.awkwardzombie.com/"                         : "az", // Awkward Zombie #NEEDS WORK			
			"http://www.boatcrime.com/"                             : "bc", // Boat Crime
            "http://brawlinthefamily.keenspot.com/"                 : "bitf", // Brawl in the Family
			"http://www.explosm.net/comics/"                        : "ch", // Cyanide & Happiness
            "http://feedproxy.google.com/~r/thedoghousediaries/"    : "dd", // Doghouse Diaries
            "http://gunshowcomic.com/"                              : "gsc", // Gun Show Comics
            "http://feedproxy.google.com/~r/hijinksensue/"          : "he", // Hijinx Ensue
            "http://www.geekculture.com/joyoftech/"                 : "jot", // The Joy of Tech
            "http://feedproxy.google.com/~r/LukeSurl/"              : "ls", // Luke Surl
            "http://loldwell.com/"                                  : "lw", // LOLd Well
            "http://mrlovenstein.com/"                              : "ml", // Mr Lovenstein
            "http://nedroid.com/"                                   : "npd", // Nedroid Picture Diary
            "http://feedproxy.google.com/~r/nerfnow/"               : "nn", // Nerf Now
            "http://theoatmeal.com/"                                : "oat", // The Oatmeal #NEEDS WORK
            "http://feedproxy.google.com/~r/Optipess/"              : "opt", // Optipess
			"http://feeds.penny-arcade.com/"                        : "pa", // Penny Arcade
            "http://popstrip.com/"                                  : "ps", // Popstrip
			"http://feedproxy.google.com/~r/smbc-comics/"           : "smbc", // SMBC
			"http://www.smbc-comics.com/"                           : "smbc", // SMBC
            "http://www.somethingpositive.net/"                     : "sp", // Something Positive
            "http://www.stickycomics.com/"                          : "sc", // Sticky Comics
			"http://xkcd.com/"                                      : "xkcd", // XKCD
	}
	for (var c in comics) {
		if ( link.match("^"+c) ) return comics[c];
	}
	return null;
}

function add_secrets(item_body, title, panel_src) {
	var div = $("<div />");
	if ( panel_src ) div.append($("<img />").attr("src", panel_src));
	if ( title ) div.append($("<p />").append(title).css("background","#FFFF66"));
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
		case "ac":
		case "ag":
		case "bc":
        case "bitf":
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
            img = $(item_body).find("img")
			title = $(img).attr("title");
			if (title) {
				add_secrets(img,title,null);
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
		case "smbc":
			var img = $(item_body).find("img");
			var panel = smbc_regex(img.attr("src"));
			if ( panel != null ) {
				add_secrets(item_body, null, panel);
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
            img = $(item_body).find("img");
            src = $(img).attr("src");
            var panel = nn_regex(src);
            if(panel != null){
                add_secrets(img, null, panel);
            }
            $(img).hide();
            break;
        case "he":
            img = $(item_body).find("img");
            src = $(img).attr("src");
            title = $(img).attr("title")
            var panel = he_regex(src);
            if(panel != null){
                add_secrets(img, title, panel);
            }
            $(img).hide();
            break;
	}
}

var process_node = function(e) {
	var entry_main = null;
	var entry_title_link = null;
	var item_body = null;
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
