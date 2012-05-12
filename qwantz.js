function go() {
	//title tag
	var image = getTitleImage("/comics/");
	var title = "";
	if (image != null) title = "Title: " + $(image).attr("title");

	//subject line of "contact" email address
	var subject = "";
	$("a:contains('contact')").each(function() {
		var contact = $(this).attr("href");
		var index = contact.indexOf("mailto:ryan@qwantz.com?subject=");
		if (index != -1) {
			subject = "Contact: " + contact.substring(index+31);
		}
	});

	//RSS title
	var rss = "";
	var txt = new RegExp("<span class=\"rss-title\">(.*?)</span>","m");
	if (txt.test(document.documentElement.outerHTML)) {
		rss = txt.exec(document.documentElement.outerHTML)[1];
		if (rss == null) rss = "";
		else rss = "RSS: " + rss;
	}

	$(image).after($("<div />").append(
			$("<p />").append(title),
			$("<p />").append(subject),
			$("<p />").append(rss)
	));
}

checkOption("qwantz", go);
