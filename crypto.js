var veryLargeNumber = 1000000000;

$(document).ready(function() {

	var taglines = ['Building Strong Passwords for the Rest of Us', 
					'Strong Passwords for Everyone',
					'Strong Passwords - Easy to Remember',
					"Because We're More Like Homer Simpson Than Superman",
					"Entropy : To Infinity and Beyond",
					"Password Security For All",
					"Simplicity and Strength"
					];
	var index =  Math.floor(taglines.length*Math.random());
	// $("h2.tagline").hide().fadeIn(2000).html(taglines[index]);

	var domains = new Array();
	var encryptionTime;
	// var refreshDate = null;

	

	var passwordLength = $("input#length").val();
	$('input[type="range"]').attr('max',passwordLength).next().text(1);

	function initialize() {
		if (localStorage.length > 0) {
			console.log("Found " + localStorage.length + " items in localStorage.");
			var prev = $("div#previousDomains ul");
			for (var i=0; i<localStorage.length;i++) {
				prev.append('<li><a class="previous" href="#">' + localStorage.key(i) + '</a></li>');
				domains.push(localStorage.key(i));
			}
			$("div#previousDomains").show(); // delay(500).slideDown();

		} else {
			console.log("No previous domains found.");
		}
	}
	initialize();

	

	// Handle user clicks on previously stored domains
	$("a.previous").click(function(e) {
		e.preventDefault();
		var key = $(this).text();

		// Set form values
		$("input#domain").val(key);
		var options = JSON.parse(localStorage.getItem(key));
		$("input#version").val(options.version);

		var sliderVals = [options.numLower, options.numUpper, options.numNumbers, options.numSymbols];
		$('input#length').val(options.passwordLength);
		for (var i=0; i<sliderVals.length; i++) {
			console.log(sliderVals[i] + " : " + typeof sliderVals[i]);
			if (sliderVals[i] > 0) {
				$('input[type="range"]').eq(i)
					.attr('value',sliderVals[i])
					.attr('max',options.passwordLength).change();
			} else {
				var slider = $('input[type="range"]').eq(i);
				slider.fadeOut();
				slider.next().fadeOut();
				slider.before().attr('checked','false').attr('readonly','true');
			}
				
		}
		$("div#show").slideUp();
		$("div#options").slideUp();
		$("div#refreshDiv a span").empty().text("Generate new " + key + " password");
		$("div#refreshDiv").slideDown();
		

		// Slide up the (hide) the previous domains section to clean up the UI
		$("div#previousDomains").slideUp();
	});

	$("input#length").change(function() {
		$('input[type="range"]').attr('max',$("input#length").val());
		checkSliders();
	});

	$("div#previousDomains a.emptyAll").click(function(e) {
		e.preventDefault();
		showConfirmationDialog();
	});

	function showConfirmationDialog() {
		$("#dark").fadeIn();
		$("#confirmClearStorage").fadeIn();
	}

	$("#hideClearButton").click(function() {
		$("#confirmClearStorage").fadeOut();
		$("#dark").fadeOut();
	});

	$("#nukeStorageButton").click(function() {
		clearLocalStorage();
		$("#confirmClearStorage").fadeOut();
		$("#dark").fadeOut();
	});

	function clearLocalStorage() {
		$("div#previousDomains ul").empty();
		$("div#previousDomains").slideUp();
		localStorage.clear();
	}

	$("div a#displayOptions").click(function(e) {
		e.preventDefault();
		$(this).parent().slideUp();
		$("div#options").slideDown();
	})


	$('input[type="range"]').change(function() {
		$(this).next().text($(this).val());
		checkSliders();
	});

	//$("a#refresh").click(function(e) {
	//	var d = new Date();
	//	refreshDate = (d.getMonth()+1) + '-' + d.getDate() + '-' + d.getFullYear();
	//});

	$("input#master").keypress(function(e){
		
		if (e.which==13) {
			e.preventDefault();
			$("a#encrypt").click();
			return false;
		}
		
	})

	$("a#encrypt").click(function(e) {
		e.preventDefault();
		var master = $("input#master").val();
		var domain = $("input#domain").val();

		

		if (!$("input#master").val()) {
			console.log("missing master");
			$("span#missingMaster").show();
		} else {
			$("span#missingMaster").hide();
		}

		if (!$("input#domain").val()) {
			console.log("missing domain");
			$("span#missingDomain").show();
		} else {
			$("span#missingDomain").hide();
		}

		// Empty the password field
		$("input#master").val('');
		$("progress").val(0);
		
		var validOptions = checkSliders();

		if (master && domain && validOptions) {
			
			//var d = new Date();
			//var refreshDate = (d.getMonth()+1) + '-' + d.getDate() + '-' + d.getFullYear();
			// console.log("Refresh Date = " + refreshDate); 

			var length = parseInt($("input#length").val());
			
			// Stretch the hash a stochastic number of times.
			var sum=0;
			for (var i=0;i<master.length;i++) {
				sum = sum + master.charCodeAt(i);
			}
			var numIterations = (sum*29)%10000; // Multiply the total sum by a prime to "mix" up the digits.
			console.log(numIterations);
			var hash = '';
			var existingVersion = $("input#version").val();

			var version;
			if (existingVersion) {
				version = parseInt(existingVersion);
			} else {
				// First time using password
				version = Math.floor(veryLargeNumber*Math.random());
			}
			

			
			var bytes = 100;
			var iterations = 1000;

			$("div#progress").slideToggle();
			var mypbkdf2 = new PBKDF2(master, version, iterations, bytes);
			var status_callback = function(percent_done) {
				$("#progress span").text("Computed " + Math.floor(percent_done) + "%");
				$("progress").val(percent_done);
			};
			var result_callback = function(key) {
				encryptionTime = new Date().getTime() - startTime;
				console.log("Took " + encryptionTime/1000 + " seconds.")
				var span = $("#progress span");
				span.text("Done encryption...");
				span.parent().delay(100).slideToggle();
				generateRandomString(key);

			};
			console.log("deriving key");
			var startTime = new Date().getTime();
			mypbkdf2.deriveKey(status_callback, result_callback);
			console.log("derived key");
			
			
			// George Feedback
			// Generate new #### password
			// Move "the Problem" and "How it works" to less prominent locations (outside main area)
			// "ARE YOU SURE YOU WANT TO REFRESH YOUR PASSWORD? NO GOING BACK"

			/*
			// $("#progress").slideDown('fast');
			for (var i=0; i<numIterations; i++) {
				hash = CryptoJS.SHA256(hash + domain + master + version).toString();
				var percent_done = 100*i/numIterations;
				if (Math.floor(percent_done)%5==0) {
					// $(".meter span").text(Math.round(percent_done) + "%");
					$("progress").val(percent_done);

				}
				// $(".meter > span").animate({width:(i/numIterations)});
			}
			*/
			function generateRandomString(key) {
				Math.seedrandom(key);

				lower = 'abcdefghijklmnopqrstuvwxyz';
				numbers = '0123456789';
				symbols = '!@#$%^&*';

				var alphabet = '';
				if ($("input#az").is(':checked')) {
					alphabet = lower;
				}
				if ($("input#AZ").is(':checked')) {
					alphabet = alphabet + lower.toUpperCase();
				}
				if ($("input#09").is(":checked")) {
					alphabet = alphabet + numbers;
				}
				if ($("input#symbols").is(":checked")) {
					alphabet = alphabet + symbols;
				}

				password = '';
				var indices = [];
				for (var i=0; i<length; i++) {
					index = Math.floor(alphabet.length*Math.random());
					password = password + alphabet[index];
					indices.push(i);
				}
		
				// Guarantee password character diversity (at least 1 of each required character type)
				var rangeIds = ['az','AZ','09','symbols'];
				var charSets = [lower, lower.toUpperCase(), numbers, symbols];
				for (var i=0; i<rangeIds.length; i++) {
					if ($("input#"+rangeIds[i]).is(":checked")) {
						var numIter = parseInt($('input[type="range"]').eq(i).val());
						for (var j=0; j<numIter; j++) {
							password = inject(charSets[i], password, indices);
						}
					}
				}

				$("p#output").html(password);
				$("div#outputDiv").slideDown();
				// $("div#encryptionDetails").slideDown();
				var bitsEntropy = password.length * Math.log(alphabet.length) / Math.log(2);
				$("span#bits").html(Math.round(bitsEntropy));

				var billion = 1000000000;
				var billionsOfCombinations = Math.pow(alphabet.length,password.length) / billion;
				var numCombos = Math.pow(alphabet.length,password.length);
				var numTimeToTryHalf = 0.5*numCombos*encryptionTime;
				
				$("span#combinations").html(numberWithCommas(Math.round(billionsOfCombinations)) + " Billion");

				var years = (billionsOfCombinations/(2*86400*365.25));
				
				$("span#timeToCrack").html(numberWithCommas(Math.round(numTimeToTryHalf)) + " years");
				$("div#encryptionDetails").slideDown();


				// if ($("input#remember").is(":checked") && $.inArray(domain, domains)) {
				if ($("input#remember").is(":checked")) {
					var options = {};
					// options.refreshDate = refreshDate;
					options.passwordLength = parseInt($("input#length").val());
					if ($("input#az").is(':checked')) {
						options.numLower = parseInt($('input[type="range"]').eq(0).val());
					} else {
						options.numLower = 0;
					}
					if ($("input#AZ").is(':checked')) {
						options.numUpper = parseInt($('input[type="range"]').eq(1).val());
					} else {
						options.numUpper = 0;
					}
					if ($("input#09").is(":checked")) {
						options.numNumbers = parseInt($('input[type="range"]').eq(2).val());
					} else {
						options.numNumbers = 0;
					}
					if ($("input#symbols").is(":checked")) {
						options.numSymbols = parseInt($('input[type="range"]').eq(3).val());
					} else {
						options.numSymbols = 0;
					} 
					options.version    = version;
					localStorage.setItem(domain,JSON.stringify(options));
					console.log("Saved the " + domain + " domain in localStorage.");
				} else {
					console.log("Did not save the " + domain + " (already stored)");
				}

			}
		}

	});

	
	function checkSliders() {
		var sum=0;
		$('input[type="range"]').each(function() {
			sum = sum + parseInt($(this).val());
		});
		var length = parseInt($("input#length").val()); 

		if (sum > length) {
			console.log("Error");
			$(".rangeValue").addClass("error");
			$("p.error").slideDown();
			$("p.error span:first").text(sum);
			$("p.error span:last").text(length);
			return false;
		} else {
			console.log("Satisfied : sum=" + sum + "; val="+length);
			$(".rangeValue").removeClass("error");
			$("p.error").slideUp();
			return true;
		}
	}

	function inject(charSet, password, availableIndices) {
		var newPassword = String(password); // Deep copy
		var randomChar = charSet[Math.floor(charSet.length*Math.random())]; // Select random character from input char set
		var randomIndex = Math.floor(availableIndices.length*Math.random()); // Select random index to pop
		var index = Number(availableIndices.splice(randomIndex,1)); // Pop an randomly selected available value
		newPassword = setCharAt(newPassword, index, String(randomChar)); // inject the new character at the random index
		return newPassword;
	}

	function setCharAt(str, index, chr) {
		return String(str.substr(0,index) + chr.toString() + str.substr(index+1));
	}

	function numberWithCommas(x) {
    	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	$("a#howItWorks").click(function(e) {
		e.preventDefault();
		$("#dark").fadeIn();
		$("#howItWorksModal").fadeIn();
	})
	$("a#problem").click(function(e) {
		e.preventDefault();
		$("#dark").fadeIn();
		$("#problemModal").fadeIn();
	});
	$("a#about").click(function(e) {
		e.preventDefault();
		$("#dark").fadeIn();
		$("#aboutModal").fadeIn();
	});


	$("a.hideModal").click(function(e) {
		e.preventDefault();
		$(this).parent().fadeOut();
		$("#dark").fadeOut();
	});

	$("a#refreshPassword").click(function(e) {
		e.preventDefault();
		$("#dark").fadeIn();
		$("#confirmRefreshModal").fadeIn();
		$("#confirmRefreshModal span").text($("input#domain").val())
	});

	$("a#confirmRefresh").click(function(e) {
		e.preventDefault();
		refreshVersion();
		$("a.hideModal").click();
		$("a#refreshPassword").slideToggle();
	});

	$("a#cancelRefresh").click(function(e) {
		e.preventDefault();
		$("a.hideModal").click();
	})

	function refreshVersion() {
		var newVersion = Math.floor(veryLargeNumber*Math.random());
		$("input#version").val(newVersion);
//		$(this).text("Refreshed");
//		$('div#refreshDiv').delay(2000).slideUp();

	}

	$("#gray").click(function() {
		$('link[href="lime.css"]').attr('href','crypto.css');
	});
	$("#lime").click(function() {
		$('link[href="crypto.css"]').attr('href','lime.css');
	});

	$("#dark").click(function() {
		$(".modal").fadeOut();
		$(this).fadeOut();
	});


	function scrambler(len) {
		// 
	}

	function download(filename, text) {
        var pom = document.createElement('a');
        pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        pom.setAttribute('download', filename);
        pom.click();
    }

    function exportSettings() {
    	var Settings = {};
    	for (var i=0; i<localStorage.length; i++) {
    		Settings[localStorage.key(i)] = localStorage[localStorage.key(i)];
    	}
    	var json = JSON.stringify(Settings);
    	download('KeyLime_Settings.txt',json);
    }

    $("a#importexport").click(function(e) {
		e.preventDefault();
		$("#dark").fadeIn();
		$("#BackupSettings").fadeIn();
	})

    $("#export").click(function() {
    	exportSettings();
    });

    // Import KeyLime Settings
    $("#files").change(function(evt) {
    	if (window.File && window.FileReader) {
    		// Hooray!  File API is supported!
    		var reader = new FileReader();
    		reader.onload = function(e) {
    			var text = reader.result;
    			console.log("text = " + text);
    			var obj = JSON.parse(text);
    			console.log("obj = " + obj);
    			for (var key in obj) { localStorage[key] = obj[key]; }
    			$("#importStatus").html("Successfully imported " + Object.keys(obj).length + " keys!").fadeIn();
    			
    			$("#BackupSettings").delay(1000).fadeOut();
    			$("#dark").fadeOut();
    			initialize();
    		}

    		reader.readAsText(evt.target.files[0]);
    	} else {
    		// The File APIs are not fully supported
    	}
    });

    // $("BackupSettings")


});