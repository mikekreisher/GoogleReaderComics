function go() {
	$("img[src*='smbc-comics.com/comics/']").each(function(i) {
		var src = $(this).attr("src");
		var panel = smbc_regex(src);
		if ( panel != null ) {
			$(this).after(
				$("<div />").append(
					$("<img />").attr("src",panel)
				)
			);
		}
	});
}

checkOption("smbc", go);
