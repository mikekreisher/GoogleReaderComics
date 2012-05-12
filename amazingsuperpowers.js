function addSecrets(image, panel, text) {
	$(image).after(
		$("<div />").append(
			$("<br />"),
			$("<img />").attr("src",panel),
			$("<br />"),
			$("<p />").append(text)
		)
	);
	$(image.parentNode).attr("bgcolor","#f5f4d1");
}

function go() {
	$("img[src^='http://www.amazingsuperpowers.com/comics']").each(function() {
		var title = $(this).attr("title");
		var src = $(this).attr("src");
		var panel = asp_regex(src);
		if ( panel != null ) {
			addSecrets(this, panel, title);
		}
	});
}

checkOption("asp", go);
