document.addEventListener("DOMContentLoaded", ready);

var API_URL = "https://logicworld.ru/icecast/status-json.xsl"; //Адрес API
var audio = new Audio('https://logicworld.ru/icecast/live.mp3'); //Основной поток
audio.volume = 0.1; //Default volume
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
			$('#debug').html('Ни один поток радио не доступен!');
			return;
		}
	}

	//Установка данных на места плейсхолдеров
	var chenelInfo = radioInfo['icestats']['source'][settings[chenel]];
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
function playRadio(){
	if(audio.paused) {
		audio.play();
		$('.player').addClass('pause');

			$('.playEffect').removeClass('startPauseAnimation');
			$('.playEffect').addClass('startAnimate');
			if($('.playEffect').hasClass('startAnimate'))
				setTimeout("$('.playEffect').removeClass('startAnimate');", 2000);

	} else {
		audio.pause();
		audio.load();
		$('.player').removeClass('pause');
			$('.playEffect').removeClass('startAnimate');
			$('.playEffect').addClass('startPauseAnimation');
			if($('.playEffect').hasClass('startPauseAnimation'))
				setTimeout("$('.playEffect').removeClass('startPauseAnimation');", 500);

	}
}
//Ползунок громкости
var slider = document.getElementById('slider');
var item = slider.querySelector('#item');
var result = document.getElementById('result');

var sliderClientCoords = slider.getBoundingClientRect();
var sliderCoords = {};
sliderCoords.top = sliderClientCoords.top + pageYOffset;
sliderCoords.left = sliderClientCoords.left + pageXOffset;
cordsFix();

item.onmousedown = function(e){
	 item.ondragstart = function() {
      return false;
   };

   var itemClientCoords = item.getBoundingClientRect();
   var itemCoords = {};
   itemCoords.top = itemClientCoords.top + pageYOffset;
	 itemCoords.left = itemClientCoords.left + pageXOffset;

   var right = slider.offsetWidth - item.offsetWidth;

   var shiftX = e.pageX - itemCoords.left;

   document.onmousemove = function(e){
   		var newLeft = e.pageX - sliderCoords.left - shiftX;
      if(newLeft < 0) newLeft = 0;
      if(newLeft > right) newLeft = right;
      item.style.left = newLeft + 'px';
      result.innerHTML = Math.round(newLeft / right * 100) + '%';

      audio.volume = newLeft / right;//Громкость
	  return false;
   }

   document.onmouseup = function(){
   		document.onmousemove = document.onmouseup = null;
   }
}

function cordsFix() {
	sliderCoords.top = sliderClientCoords.top + pageYOffset;
	sliderCoords.left = sliderClientCoords.left + pageXOffset;
	sliderClientCoords = slider.getBoundingClientRect();
	setTimeout("cordsFix();", 500);
}

//Правка центра эффекта
$(window).on('scroll',function(){
    $('.playEffect').css("margin-top", -$(this).scrollTop());
});