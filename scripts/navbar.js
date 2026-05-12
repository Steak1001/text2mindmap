// Logic for the top navigation bar (navbar) in the app.
navbar = (function() {
	function closeDropdowns() {
		$(".navbar-dropdown .dropdown-content").hide();
	}

	function setVisibilityIcon(buttonId, visibility) {
		$(`#${buttonId} > i`).removeClass("fa-eye fa-eye-slash");
		if (visibility) {
			$(`#${buttonId} > i`).addClass("fa-eye");
		} else {
			$(`#${buttonId} > i`).addClass("fa-eye-slash");
		}
	}

	$(document).ready(function() {
		const idFunctionMap = {
			"file-new": appFunctions.fileNew,
			"file-open": appFunctions.fileOpen,
			"file-save": appFunctions.fileSave,
			"file-rename": appFunctions.fileRename,
			"file-preferences": appFunctions.filePreferences,
			// New feature hooks
			"file-save-svg": function() {
				if (typeof exportSVGFeature !== 'undefined') exportSVGFeature();
			},
			"edit-find-replace": function() {
				$("#find-replace-modal").addClass("active");
				$("#find-input").focus();
			}
		};

		let $links = $(".navbar a");

		$links.on("click touchstart", function(event) {
			if ($(this).attr("href") === "#") { event.preventDefault(); }
			const id = $(this).attr("id");
			if (id in idFunctionMap) {
				idFunctionMap[id]($(this));
				closeDropdowns();
			}
		});

		$(document).on("click", function(event) {
			closeDropdowns();
			let $navbarDropdown = $(event.target).parent(".navbar-dropdown");
			if ($navbarDropdown.length !== 0) {
				$navbarDropdown.find(".dropdown-content").show();
			}
		});
	});

	return { setVisibilityIcon };
}());
