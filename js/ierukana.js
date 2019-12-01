var ImasCg = (ImasCg ? ImasCg : {});
ImasCg.Ierukana = function () {

	var SITE_URL = 'http://marsa746079.github.io/ierukana/';

	var COMPARE_MODE_FLAG = {
		full_name: 1,
		full_name_kana: 2,
		first_name: 4,
		first_name_kana: 8,
		last_name: 16,
		last_name_kana: 32,
	};
	var BUTTON_LABEL = {
		'gameStart': 'ゲーム開始',
		'giveUp': '降参',
	};
	var MESSAGE = {
		'gameClear': 'ゲームクリア！',
		'alreadyAnswer': 'その子はもう解答済みです。',
		'notExist': '該当する名前が見つかりません。',
	};
	var THREE_ATTRIBUTES_ARRAY = ['cu', 'co', 'pa'];
	var COLUMNS_IN_ROW = 10;

	//var jsonData = null;
	var numOfIdols = {'all': 0, 'cu': 0, 'co': 0, 'pa': 0 };
	var numOfRemains = {'all': 0, 'cu': 0, 'co': 0, 'pa': 0 };

	var compare_mode = null;
	var difficulty = null;
	var startUnixTime = null;
	var clearCount = null;
	var lastIdolName = null;

	var getIdolById = function(id) {
		$.each(jsonData.idols, function(index, idol) {
			if (idol.id === id)
				return idol;
		});
		return null;
	};

	var getIdolByName = function(name, compare_flags) {
		var result = [];
		$.each(jsonData.idols, function(index, idol) {
			$.each(COMPARE_MODE_FLAG, function(key, compare_flag) {
				if (compare_flags & compare_flag) {
					if (idol[key].replace('・', '') === name) {
						result.push(idol);
					}
				}
			});
		});
		return result;
	};

	var numOfAllIdolsByAttribute = function (attr) {
		var cnt = 0;
		$.each(jsonData.idols, function(index, idol) {
			if (idol.attr === attr)
				cnt++;
		});
		return cnt;
	};

	var updateIdolsNum = function () {
		$('#num-of-remain').text(numOfRemains['all']);
		$.each(THREE_ATTRIBUTES_ARRAY, function(index, attr) {
			$('#' + attr + '-idols span.remain').text('あと' + numOfRemains[attr] + '人');
		});
	};

	var resetFormAtGameStart = function() {
		$('#result-tweet-btn').remove();

		setDifficulty();
		$('#difficulty-select').fadeOut('fast', function() {
			$('#difficulty-show').text($('#radio-' + difficulty + ' label').text());
		});

		numOfRemains = $.extend(true, {}, numOfIdols);
		$.each(THREE_ATTRIBUTES_ARRAY, function(index, attr) { initTableByAttribute(attr); });
		updateIdolsNum();
	};

	var resetFormAtGameEnd = function() {
		clearInterval(clearCount);
		$('#answer-btn').prop('disabled', 'false');
		$('#game-start-btn').removeClass('btn-danger').addClass('btn-success').val(BUTTON_LABEL['gameStart']);
		$('#game-start-btn').after($('<input type="button" id="result-tweet-btn" value="結果をツイート" class="btn btn-info">'));

		$('#difficulty-select').show();
		$('#difficulty-show').text('');
	};

	var giveUp = function () {
		$.each(jsonData.idols, function(index, idol) {
			if (! idol.answered) {
				$('#' + idol.id).addClass('giveUp').text(idol.full_name);
			}
		});
		resetFormAtGameEnd();
	};

	var gameClear = function () {
		alert(MESSAGE['gameClear']);
		resetFormAtGameEnd();
	};

	var gameStartCountDown = function (count) {
		$('#game-start-btn').val(count).prop('disabled', 'false');
		if (count == 0) {
			gameStart();
			return;
		} else {
			setTimeout(function() { gameStartCountDown(count - 1);}, 1000);
		}
	};

	var gameStart = function () {
		$('#game-start-btn').removeClass('btn-success').addClass('btn-danger').prop('disabled', '').val(BUTTON_LABEL['giveUp']);
		$('#answer-btn').prop('disabled', '');
		startUnixTime = parseInt((new Date) / 1);
		clearCount = setInterval(function() { countUpStart(startUnixTime); }, 10);
	};

	var countUpStart = function () {
		var nextUnixTime = parseInt((new Date) / 1);
		var wTime = (nextUnixTime - startUnixTime) % 60000;
		var minutes = (nextUnixTime - startUnixTime) / 60000;
		var second = (wTime / 1000);
		var milliSecond = Math.floor((second * 100)) % 100;
		second = Math.floor(second);
		minutes = Math.floor(minutes);

		$('#timer-area').html(('00' + minutes).slice(-3) + ':' + ('0' + second).slice(-2) + ':' + ('0' + milliSecond).slice(-2));
	};

	var resultTweetButtonSubmit = function () {
		var clearTime = $('#timer-area').text();
		clearTime = clearTime.replace(':', "分");
		clearTime = clearTime.replace(':', "秒");

		var tweetText = '';
		if (numOfRemains['all'] == 0) {
			var job = {
				'easy':'アイドルマスター',
				'normal':'アイドルマスター☆',
				'hard':'アイドルマスター☆☆',
			};
			tweetText = 'あなたは ' + clearTime + ' でアイドル'
				+ numOfIdols['all'] + '人の名前を全て言えた'
				+ job[difficulty] + 'です。最後に言ったアイドルは' + lastIdolName + 'です。';
		} else {
			var forgetIdols = jsonData.idols.filter(function(v) {
				return !v.answered;
			});
			var oneForgetIdol = forgetIdols[Math.floor(Math.random() * (forgetIdols.length - 1))];

			tweetText = 'あなたは ' + clearTime + ' かけて'
				+ (numOfIdols['all'] - numOfRemains['all'])
				+ '人のアイドルを言うことができました。'
				+ oneForgetIdol.full_name + ' 等、' + numOfRemains['all']
				+ '人の名前を言えませんでした。精進しましょう。';
		}
		var resultTweet = 'https://twitter.com/intent/tweet?hashtags=シンデレラガールズ言えるかな&text='
		resultTweet = resultTweet + tweetText + SITE_URL;
		window.open(encodeURI(resultTweet));
	};

	var answerButtonSubmit = function () {
		var answer = $('#answer-text').val();
		answer = answer.replace('・', '');

		var idolsHitName = getIdolByName(answer, compare_mode);
		if (idolsHitName.length > 0) {
			var idolsNotAnswered = idolsHitName.filter(function(v){ return !v.answered; });
			if (idolsNotAnswered.length > 0) {
				var idol = idolsNotAnswered[0];
				$('#' + idol.id).addClass('answered').text(idol.full_name);
				idol.answered = true;
				lastIdolName = idol.full_name;

				numOfRemains['all'] -= 1;
				numOfRemains[idol.attr] -= 1;
				updateIdolsNum();

				$('#answer-text').val('');
				$('#message-area').text('');

				if (numOfRemains['all'] == 0) {
					gameClear();
				}
			} else {
				$('#message-area').text(MESSAGE['alreadyAnswer']);
			}
		} else {
			$('#message-area').text(MESSAGE['notExist']);
		}
	};

	var gameStartButtonSubmit = function () {
		var $btn = $('#game-start-btn');
		if ($btn.hasClass('btn-success')) {
			resetFormAtGameStart();
			gameStartCountDown(3);
		} else if ($btn.hasClass('btn-danger')) {
			giveUp();
			return;
		}
	};

	var setDifficulty = function () {
		difficulty = $('input[name="difficulty-radio"]:checked').val();
		compare_mode = 0;
		switch (difficulty) {
			case 'easy':
				compare_mode = compare_mode |
					COMPARE_MODE_FLAG.first_name |
					COMPARE_MODE_FLAG.first_name_kana |
					COMPARE_MODE_FLAG.last_name |
					COMPARE_MODE_FLAG.last_name_kana;
			case 'normal':
				compare_mode = compare_mode |
					COMPARE_MODE_FLAG.full_name_kana;
			case 'hard':
				compare_mode = compare_mode |
					COMPARE_MODE_FLAG.full_name;
		}
	};

	var initTableByAttribute = function (attr) {
		var tableId = '#' + attr + '-idols';

		$(tableId + ' span.remain').text('あと' + numOfRemains[attr] + '人');
		$(tableId + ' tbody').html('');

		var $tr = $('<tr></tr>');
		var cnt = 0;
		var appendRow = function () {
			$(tableId + ' tbody').append($tr.clone());
			$tr = $('<tr></tr>');
			cnt = 0;
		};
		$.each(jsonData.idols, function(index, idol) {
			idol.answered = false;
			if (idol.attr === attr) {
				var $td = $('<td id="' + idol.id + '">&nbsp;</td>');
				$tr.append($td.clone());
				cnt++;
				if (cnt == COLUMNS_IN_ROW) {
					appendRow();
				}
			}
		});
		if (cnt != 0) {
			appendRow();
		}
	};

	return {

		init: function () {

			jsonData = null;

			var innerInit = function () {
				numOfIdols['all'] = jsonData.idols.length;
				numOfRemains['all'] = numOfIdols['all'];
				$.each(THREE_ATTRIBUTES_ARRAY, function(index, attr) {
					numOfIdols[attr] = numOfAllIdolsByAttribute(attr);
					numOfRemains[attr] = numOfIdols[attr];
					initTableByAttribute(attr);
				});
				$('.numOfIdol').text(numOfIdols['all']);
				$('#num-of-remain').text(numOfIdols['all']);

				$('#answer-text').on('keypress', function(e) {
					if (e.which == 13) {
						answerButtonSubmit();
					}
				});
				$('#answer-btn').on('click', function() {
					answerButtonSubmit();
				});
				$('#game-start-btn').on('click', function() {
					gameStartButtonSubmit();
				});
				$('#answer-area').on('click', '#result-tweet-btn', function() {
					resultTweetButtonSubmit();
				});
			};

			$.getJSON('data/idols.json').done(function(data) {
				jsonData = data;
				innerInit();
			}).fail(function(errorData) {
				$('#message-area').text('データ読み込みエラー');
			});

		}

	};
}();
$(function(){ ImasCg.Ierukana.init(); });