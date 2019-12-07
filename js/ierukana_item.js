var ImasCg = (ImasCg ? ImasCg : {});
ImasCg.Ierukana_item = function () {

	var SITE_URL = 'https://masajiro999.github.io/ierukana/item.html';

	var COMPARE_MODE_FLAG = {
		name: 1,
		name_kana: 2,
		first_name: 4,
		first_name_kana: 8,
		last_name: 16,
		last_name_kana: 32,
	};
	var BUTTON_LABEL = {
		'gameStart': 'Start!',
		'giveUp': 'Give Up!',
	};
	var MESSAGE = {
		'gameClear': 'ゲームクリア！',
		'alreadyAnswer': 'そのアイテムはもう解答済みです。',
		'notExist': '該当するアイテムが見つかりません。',
	};
	var THREE_ATTRIBUTES_ARRAY = ['all'];
	var COLUMNS_IN_ROW = 10;

	//var jsonData = null;
	var numOfChampions = {'all': 0, 'cu': 0, 'co': 0, 'pa': 0 };
	var numOfRemains = {'all': 0, 'cu': 0, 'co': 0, 'pa': 0 };

	var compare_mode = null;
	var difficulty = null;
	var startUnixTime = null;
	var clearCount = null;
	var lastChampionName = null;

	// var getChampionById = function(id) {
	// 	$.each(jsonData, function(index, item) {
	// 		if (item.id === id)
	// 			return item;
	// 	});
	// 	return null;
	// };

	var getChampionByName = function(name, compare_flags) {
		var result = [];
		$.each(jsonData, function(index, item) {
			name = name.replace(/\s+/g, '');
			var itemName = item.name.replace(/\s+/g, '');
			itemName = itemName.replace('「','');
			itemName = itemName.replace('」','');
			itemName = itemName.replace(':','');
			if (itemName.replace('・', '').replace('＝', '') === name.replace('IV', 'Ⅳ')) {
				result.push(item);
 			}else if (itemName === name.replace('&', '＆').replace('Ⅳ', 'IV')) {
				result.push(item);
			}

		});
		return result;
	};

	var numOfAllChampionsByAttribute = function (attr) {
		var cnt = 0;
		$.each(jsonData, function(index, item) {
				cnt++;
		});
		return cnt;
	};

	var updateChampionsNum = function () {
		$('#num-of-remain').text(numOfRemains['all']);
		$.each(THREE_ATTRIBUTES_ARRAY, function(index, attr) {
			$('#' + attr + '-items span.remain').text('あと' + numOfRemains[attr] + '個');
		});
	};

	var resetFormAtGameStart = function() {
		$('#result-tweet-btn').remove();

		setDifficulty();
		$('#difficulty-select').fadeOut('fast', function() {
			$('#difficulty-show').text($('#radio-' + difficulty + ' label').text());
		});

		numOfRemains = $.extend(true, {}, numOfChampions);
		$.each(THREE_ATTRIBUTES_ARRAY, function(index, attr) { initTableByAttribute(attr); });
		updateChampionsNum();
	};

	var resetFormAtGameEnd = function() {
		clearInterval(clearCount);
		$('#answer-btn').prop('disabled', 'false');
		$('#game-start-btn').removeClass('btn-danger').addClass('btn-success').val(BUTTON_LABEL['gameStart']);
		$('#game-start-btn').after($('<input type="button" id="result-tweet-btn" value="Share Tweet!" class="btn btn-info">'));

		$('#difficulty-select').show();
		$('#difficulty-show').text('');
		$('#lang').prop('disabled', false);

	};

	var giveUp = function () {
		$.each(jsonData, function(index, item) {
			if (! item.answered) {
				//var index = getChampionIdByName(item.name);
				$('#' + item.id).addClass('giveUp').text(item.name);
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
		$('#lang').prop('disabled', true);
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
				'easy':'アイテムマスター',
				'normal':'アイテムマスター☆',
				'hard':'アイテムマスター☆☆',
			};
			tweetText = 'あなたは ' + clearTime + ' でアイテム'
				+ numOfChampions['all'] + '個の名前を全て言えた'
				+ job[difficulty] + 'です。最後に言ったアイテムは' + lastChampionName + 'です。';
		} else {
			var forgetChampions = jsonData.filter(function(v) {
				return !v.answered;
			});

			var oneForgetChampion = forgetChampions[Math.floor(Math.random() * (forgetChampions.length - 1))];

			tweetText = 'あなたは ' + clearTime + ' かけて'
				+ (numOfChampions['all'] - numOfRemains['all'])
				+ '個のアイテムを言うことができました。'
				+ oneForgetChampion.name + ' 等、' + numOfRemains['all']
				+ '個の名前を言えませんでした。精進しましょう。';
		}
		var resultTweet = 'https://twitter.com/intent/tweet?hashtags=LoLアイテム言えるかな&text='
		resultTweet = resultTweet + tweetText + SITE_URL;
		window.open(encodeURI(resultTweet));
	};

  // 同一名称対応
	var answerButtonSubmit = function () {
		var answer = $('#answer-text').val();
		answer = answer.replace('・', '');

		var idolsHitName = getChampionByName(answer, compare_mode);
		if (idolsHitName.length > 0) {
			var idolsNotAnswered = idolsHitName.filter(function(v){ return !v.answered; });
			if (idolsNotAnswered.length > 0) {
				$.each(idolsNotAnswered,function(index){
					var item = idolsNotAnswered[index];
					$('#' + item.id).addClass('answered').text(item.name);
					item.answered = true;
					lastChampionName = item.name;

					numOfRemains['all'] -= 1;
				})
				updateChampionsNum();

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
					COMPARE_MODE_FLAG.name;
			case 'hard':
				compare_mode = compare_mode |
					COMPARE_MODE_FLAG.name;
		}
	};

	var initTableByAttribute = function (attr) {
		var tableId = '#' + attr + '-items';

		$(tableId + ' span.remain').text('あと' + numOfRemains[attr] + '個');
		$(tableId + ' tbody').html('');

		var $tr = $('<tr></tr>');
		var cnt = 0;
		var appendRow = function () {
			$(tableId + ' tbody').append($tr.clone());
			$tr = $('<tr></tr>');
			cnt = 0;
		};
		$.each(jsonData, function(index, item) {
			item.answered = false;
			item.attr = 'all';
			if (item.attr === attr) {
				var $td = $('<td id="' + item.id + '">&nbsp;</td>');
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
				numOfChampions['all'] = jsonData.length;
				numOfRemains['all'] = numOfChampions['all'];
				$.each(THREE_ATTRIBUTES_ARRAY, function(index, attr) {
					numOfChampions[attr] = numOfAllChampionsByAttribute(attr);
					numOfRemains[attr] = numOfChampions[attr];
					initTableByAttribute(attr);
				});
				$('.numOfChampion').text(numOfChampions['all']);
				$('#num-of-remain').text(numOfChampions['all']);

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

			var lang = $('#lang option:selected').val();
			var locales = 'locales/'+lang+'/item.json';

			$.getJSON(locales).done(function(data) {
				jsonData = Object.keys(data.data).map(function (key) {
					data.data[key].id = key;
					return data.data[key]
				});

				innerInit();
			}).fail(function(errorData) {
				$('#message-area').text('データ読み込みエラー');
			});

		},
		changeLang : function(lang) {
			jsonData = null;
			var innerInit = function () {
//				numOfChampions['all'] = jsonData.length;
				numOfRemains['all'] = numOfChampions['all'];
				$.each(THREE_ATTRIBUTES_ARRAY, function(index, attr) {
					numOfChampions[attr] = numOfAllChampionsByAttribute(attr);
					numOfRemains[attr] = numOfChampions[attr];
					initTableByAttribute(attr);
				});
				$('.numOfChampion').text(numOfChampions['all']);
				$('#num-of-remain').text(numOfChampions['all']);

			};
//			var lang = $('#lang option:selected').val();
			var locales = 'locales/'+lang+'/item.json';

			$.getJSON(locales).done(function(data) {
				jsonData = Object.keys(data.data).map(function (key) {
					data.data[key].id = key;
					return data.data[key]
				});
				innerInit();
			}).fail(function(errorData) {
				$('#message-area').text('データ読み込みエラー');
			});

		}

	};
}();
$(function(){ ImasCg.Ierukana_item.init(); });
