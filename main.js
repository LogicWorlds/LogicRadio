document.addEventListener("DOMContentLoaded", ready);

var API_URL = "https://logixy.net/icecast/status-json.xsl"; //Адрес API
var SREAM_URL = "https://logixy.net/icecast/live.mp3";	//Основной поток
var settings = {};
settings.firstChenel = 0; //Основной канал
settings.lastChenel  = 1; //Дополнительный канал (для серверного вещания без диджея)
settings.updateTime   = 10000; //Интервал обновления информации (1000 - 1 секкунда)
settings.debug = false; //Отладка

console.log("\
 ██▓     ▒█████    ▄████  ██▓ ▄████▄   ██▀███   ▄▄▄      ▓█████▄  ██▓ ▒█████  \n\
▓██▒    ▒██▒  ██▒ ██▒ ▀█▒▓██▒▒██▀ ▀█  ▓██ ▒ ██▒▒████▄    ▒██▀ ██▌▓██▒▒██▒  ██▒\n\
▒██░    ▒██░  ██▒▒██░▄▄▄░▒██▒▒▓█    ▄ ▓██ ░▄█ ▒▒██  ▀█▄  ░██   █▌▒██▒▒██░  ██▒\n\
▒██░    ▒██   ██░░▓█  ██▓░██░▒▓▓▄ ▄██▒▒██▀▀█▄  ░██▄▄▄▄██ ░▓█▄   ▌░██░▒██   ██░\n\
░██████▒░ ████▓▒░░▒▓███▀▒░██░▒ ▓███▀ ░░██▓ ▒██▒ ▓█   ▓██▒░▒████▓ ░██░░ ████▓▒░\n\
░ ▒░▓  ░░ ▒░▒░▒░  ░▒   ▒ ░▓  ░ ░▒ ▒  ░░ ▒▓ ░▒▓░ ▒▒   ▓▒█░ ▒▒▓  ▒ ░▓  ░ ▒░▒░▒░ \n\
░ ░ ▒  ░  ░ ▒ ▒░   ░   ░  ▒ ░  ░  ▒     ░▒ ░ ▒░  ▒   ▒▒ ░ ░ ▒  ▒  ▒ ░  ░ ▒ ▒░ \n\
  ░ ░   ░ ░ ░ ▒  ░ ░   ░  ▒ ░░          ░░   ░   ░   ▒    ░ ░  ░  ▒ ░░ ░ ░ ▒  \n\
    ░  ░    ░ ░        ░  ░  ░ ░         ░           ░  ░   ░     ░      ░ ░  \n\
                             ░                            ░                   \n\
");

function log(msg, type='log') {
	if(settings['debug'] == true && type == 'debug') {
		console.log('[Debug] [LogicRadio]', msg);
	} else if (type != 'debug') {
		console.log('[LogicRadio]', msg);
	}
}

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

	if(settings[chenel] in chenelsInfo) {
		if(!('stream_start' in chenelsInfo[settings[chenel]])){
			chenel = 'lastChenel';
			if(!('stream_start' in chenelsInfo[settings[chenel]])){
				$('#debug').html('Ни один поток радио не доступен! (Попытка получить название из корня)');
				chenel = 'noCh';
			}
		}
	} else {
		chenel = 'noCh';
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
	Replaces("#currentListenersCount", chenelInfo['listeners']?chenelInfo['listeners']:'0');
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
			log(data, 'debug');
			syncRadioStart(data);
		}
	});
}

function setStreamUrl() {
	audio.src = SREAM_URL + '?' + Math.floor(new Date().getTime() / 1000);//Для того, чтобы адрес потока был каждый раз разный
}

//Проигрыватель
var audio = new Audio("");//Инициализируем аудио-плеер
var is_play = false;
function playRadio(){
	if(audio.paused) {//Не пауза? Значит загружаем и запускаем поток
		audio.preload = true;
		setStreamUrl();
		audio.play();
	} else {//Пауза
		audio.pause();
		

	}
}

audio.onplay = ()=>{
	if(is_play)
		return;
	is_play = true;
	if(audio.currentTime > 3 && audio.currentTime != Infinity) // Ставим на конец файла
		audio.currentTime = audio.duration-3;
	log('Play.');
	timeWatcher();
	log('TimeWatcher started.')
		$('.player').addClass('pause');//Всякие анимашки
		$('.playEffect').removeClass('startPauseAnimation');
		$('.playEffect').addClass('startAnimate');
		if($('.playEffect').hasClass('startAnimate'))
			setTimeout("$('.playEffect').removeClass('startAnimate');", 2000);
}

audio.pause = ()=>{
	if(!is_play)
		return;
	is_play = false;
	log('Pause.');
	audio.src = "data:audio/ogg;base64,0";//Просто устанавливаем поток на какой-то пустой звук
		$('.player').removeClass('pause');//Всякие анимашки
			$('.playEffect').removeClass('startAnimate');
			$('.playEffect').addClass('startPauseAnimation');
			if($('.playEffect').hasClass('startPauseAnimation'))
				setTimeout("$('.playEffect').removeClass('startPauseAnimation');", 500);
}

//Для мобильных устройств (управление кнопками в шторке уведомлений)
//audio.onpause = ()=>{
//	audio.pause();
//}

function restartStream() {
    log('Restarting stream.');
    audio.pause();
    setStreamUrl();
	audio.preload = true;
    setTimeout(() => { audio.play(); }, 2000);
}

var time = 0;
function timeWatcher() {
    if (audio.paused) {
		log('TimeWatcher stoped.')
        return;
	}
	log("[TW] " + time + " " + audio.currentTime, 'debug');
    if (time == audio.currentTime && audio.currentTime != 0 || audio.ended) {
        restartStream();
    } else {
        time = audio.currentTime;
    }
    setTimeout("timeWatcher();", 500);
}

audio.onended = function() {//Фц-я проверки на "не отключился ли плеер в то время, когда ему не нужно было отключаться"
	if(!audio.paused) {
		log("Stream end found.");
		restartStream();
	}
	playRadio();
}

//Ползунок громкости
// Вспоминаем его значение
localVolume = localStorage.getItem('radioVolume');
if (localVolume !== null) {
	document.getElementById("slider").value = localVolume;
}
SetVolume();
function SetVolume() {
	var inpRange = document.getElementById("slider").value;
	localStorage.setItem('radioVolume', inpRange);
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
		$('.navColors').css({"background" : "#A5C2D450"});
	} else {//Ночной
		$('body').css({"background" : "url('images/bgNight.png') fixed", "background-size" : "auto 100%", "background-position" : "center center"});
		$('.navColors').css({"background" : "linear-gradient(to right, rgba(255,255,255,1) -30%,rgba(255,255,255,0) 30%)"});
	}
	setTimeout("bgMode();", 10000);
}
