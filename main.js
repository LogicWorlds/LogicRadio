document.addEventListener("DOMContentLoaded", ready);

var API_URL = "https://logicworld.ru/icecast/status-json.xsl"; //Адрес API
var audio = new Audio('https://logicworld.ru/icecast/live.mp3'); //Основной поток
//audio.volume = 0.1; //Default volume
audio.load();
var settings = {};
settings.firstChenel = 0; //Основной канал
settings.lastChenel  = 1; //Дополнительный канал (для серверного вещания без диджея)
settings.updateTime   = 10000; //Интервал обновления информации (1000 - 1 секкунда)
settings.debug = false; //Отладка

function ready(){
	Replaces("#streamName", "Loading...");
	Replaces("#currentSong", "Loading...");
	syncRadioInfo();
}
function syncRadioStart(radioInfo) {
	var chenel = 'firstChenel';
	if((radioInfo == null) || (radioInfo['icestats']['source'] == null)){//Ты пренёс воздух или какую-то дичь?
		settings['debug']?$('#debug').html('ERROR'):'';
		return;
	}
	var chenelsInfo = radioInfo['icestats']['source']
		
	if(chenelsInfo[settings[chenel]]['stream_start'] == null){
		chenel = 'lastChenel';
		if(chenelsInfo[settings[chenel]]['stream_start'] == null){
			$('#debug').html('Ни один поток радио не доступен! (Попытка получить название из корня)');
			chenel = 'noCh';
		}
	}

	//Установка данных на места плейсхолдеров
	var chenelInfo;
	if(chenel != 'noCh') {
		chenelInfo = radioInfo['icestats']['source'][settings[chenel]];
	} else {
		chenelInfo = radioInfo['icestats']['source'];
	}
	Replaces("#streamName", chenelInfo['server_name']);
	Replaces("#currentSong", chenelInfo['title']);
	Replaces("#serverDescription", chenelInfo['server_description']?chenelInfo['server_description']:'');
	Replaces("#currentListenersCount", chenelInfo['listeners']?chenelInfo['listeners']:'');
	Replaces("#genre", chenelInfo['genre']?chenelInfo['genre']:'');


	//$('#debug').html(radioInfo['icestats']['source'][settings[chenel]]['server_name']);
}

function syncRadioInfo(){
	getServerInfo();
	setTimeout("syncRadioInfo()", settings['updateTime']);
}

function Replaces(replaceID, replaceble) {
	$(replaceID).html(replaceble);
}

function getServerInfo(){
	$.ajax({
		url: API_URL,
		type : 'GET',
		dataType: 'json',
		beforeSend: function () {settings['debug']?$('#debug').html("LOADING..."):false;},
		success: function (data) {
			settings['debug']?console.log(data):'';
			syncRadioStart(data);
		}
	});
}

//Проигрыватель
audio.load();
audio.play();
audio.muted=true;
function playRadio(){
	if(audio.muted) {
		audio.muted=false;
		$('.player').addClass('pause');

			$('.playEffect').removeClass('startPauseAnimation');
			$('.playEffect').addClass('startAnimate');
			if($('.playEffect').hasClass('startAnimate'))
				setTimeout("$('.playEffect').removeClass('startAnimate');", 2000);

	} else {
		audio.muted=true;
		$('.player').removeClass('pause');
			$('.playEffect').removeClass('startAnimate');
			$('.playEffect').addClass('startPauseAnimation');
			if($('.playEffect').hasClass('startPauseAnimation'))
				setTimeout("$('.playEffect').removeClass('startPauseAnimation');", 500);

	}
}
//Ползунок громкости
SetVolume();
function SetVolume() {
	var inpRange = document.getElementById("slider").value;
	audio.volume = inpRange / 100;
	$('#result').html(inpRange + '%');
}

//Правка центра эффекта
$(window).on('scroll',function(){
    $('.playEffect').css("margin-top", -$(this).scrollTop());
});

//Ночной режим (по времени)
bgMode();
function bgMode() {
	var now = new Date();
	if((now.getHours() > 6) && (now.getHours() < 21)) {//Деневной режим
		$('body').css({"background" : "url('images/bg.png') fixed", "background-size" : "auto 100%", "background-position" : "center center"});
		$('.navColors').css({"background" : "#A5C2D450", "box-shadow" : "0 5px 10px #A6A6A670"});
	} else {//Ночной
		$('body').css({"background" : "url('images/bgNight.png') fixed", "background-size" : "auto 100%", "background-position" : "center center"});
		$('.navColors').css({"background" : "linear-gradient(to right, rgba(255,255,255,1) -30%,rgba(255,255,255,0) 30%)", "box-shadow" : "none"});
	}
	setTimeout("bgMode();", 10000);
}