window.onload = function() {
	var oV = document.getElementById("v1");
	var DisX = 0;
	var DisY = 0;
	var html = "";
	var timer = null;
	var id = null;
	//获取随机音乐
	function getMusicRandom(id) {
		//如果没有专辑id,默认为华语专辑
		//		var id = id || 'public_yuzhong_huayu';
		if(id) {
			id = id;
		} else {
			id = 'public_yuzhong_huayu'
		}
		var musicUrl = "https://jirenguapi.applinzi.com/fm/getSong.php?channel=" + id
		$.ajax({
			type: 'get',
			url: musicUrl,
			dataType: "json",
			async: false,
			success: function(data) {
				getData(data);
				console.log(data);
			},
			error: function(err) {
				alert("没有获取到音乐")
				console.log(err)
			}
		})
	}
	getMusicRandom();

	function getData(data) {
		musicTitle = data.song[0].title;
		musicSid = data.song[0].sid;
		musicArtist = data.song[0].artist;
		musicLrc = data.song[0].lrc;
		musicPicture = data.song[0].picture;
		musicUrlS = data.song[0].url;
		$(".left img").attr("src", musicPicture);
		$(".controls_play img").attr("src", musicPicture);
		$(".songname p").text(musicTitle);
		$(".music_information h3").text(musicTitle);
		$("#main .singer").text("歌手：" + musicArtist);
		$("#blurBg").css("background","url("+musicPicture+")")
		lrcUrl = "https://jirenguapi.applinzi.com/fm/getLyric.php?&sid=" + musicSid;
		oV.src = musicUrlS;

		getLrc();
		getDownloadLink();
	}

	//获取歌词
	function getLrc() {
		$.ajax({
			type: "get",
			url: lrcUrl,
			async: true,
			dataType: "json",
			success: function(lrc) {
				console.log(lrc.lyric);
				showLrc(lrc.lyric);
			},
			error: function(err) {
				//				console.log(err);
				$(".licr").html("<li class='active'>暂未找到歌词<li>")
			}
		});
	}

	//载入歌词
	function showLrc(lrc) {
		html = ""; //先清空原来的
		if(lrc) {

			var textArr = lrc.split("[");

			for(var i = 1; i < textArr.length; i++) {
				var timeAndgc = textArr[i].split("]");
				var time = timeAndgc[0];
				var lyrics = timeAndgc[1];

				var s = time.split(".");
				var ms = s[1];
				var min = s[0].split(":");
				var _ms = min[0] * 60 + min[1] * 1;

				html += "<li id=" + _ms + ">" + lyrics + "</li>";
				$(".licr").html(html);
			}
		} else {
			$(".licr").html("<li class='active'>暂未找到歌词<li>")
		}
	}

	//播放时滚动歌词
	oV.ontimeupdate = function() {
		var timer = this.currentTime;
		//		console.log(timer)
		var s = parseInt(timer);
		var liHeight = $(".licr li").height();
		var scrollDistance = -(($(".active").index() + 1) * liHeight) + liHeight * 4; //滚动一次的距离
		for(var i = 0; i < s; i++) {
			$("#" + i).addClass("active").siblings().removeClass("active");
			$(".licr").css({
				"marginTop": scrollDistance,
				"transition": ".4s"
			});

		}
	}

	//总时长
	setInterval(function() {
		$(".timeleng i:last").text(changeTime(oV.duration));
	}, 1000);

	//获取专辑
	function getMusicAlbum() {
		$.ajax({
			type: 'get',
			url: "https://jirenguapi.applinzi.com/fm/getChannels.php",
			dataType: "json",
			success: function(data) {
				//				console.log(data);
				albumList(data)
			},
			error: function(err) {
				alert("专辑获取错误")
				console.log("错误", err)
			}
		})
	}
	getMusicAlbum();

	//制作专辑列表
	var listName = "";

	function albumList(data) {
		//		console.log(data.channels[0]);
		for(var i = 0; i < data.channels.length; i++) {
			listName += "<li>" + data.channels[i].name + "</li>";
		}
		$("#playlist ol").html(listName);
		for(var i = 0; i < $("#playlist ol li").length; i++) {
			$("#playlist ol li").eq(i).click(function() {
				var _index = $(this).index();
				$(this).addClass("listNameActive").siblings().removeClass("listNameActive");
				dataID = data.channels[_index].channel_id;
				//				console.log(dataID);
				getMusicRandom(dataID);
				toChange();
			})
		}

	}

	//专辑列表显示隐藏
	$("#controls_right li").eq(3).click(function() {
		$("#playlist").stop().slideToggle();
	});

	//点击播放
	$("#controls .play").click(function() {
		autoPlay();
	});

	//播放暂停
	function autoPlay() {
		if(oV.paused) {
			oV.play();
			$(".left img").removeClass("stoptransform");
			
			$(".left img").addClass("addtransform");
			$("#controls .play").css("background-position", "-120px -60px");

			nowTime();
			timer = setInterval(nowTime, 1000);
		} else {
			oV.pause();
			$(".left img").addClass("stoptransform");
			$("#controls .play").css("background-position", "");
			clearInterval(timer)
		}
	}

	//下载歌曲
	$("#controls_right li").eq(2).click(function() {
		getDownloadLink()
	})

	//获取下载链接
	function getDownloadLink() {
		$("#controls_right li").eq(2).find("a").attr("href", musicUrlS)
	}

	//下一首
	$(".next").click(function() {
		getMusicRandom(window.dataID);
		toChange();
	});

	//监听播放完毕后下一首
	oV.loop = false;
	oV.addEventListener('ended', function() {
		getMusicRandom(window.dataID);
		toChange();
	}, false);

	//上一首
	$(".prev").click(function() {
		getMusicRandom(window.dataID);
		toChange();
	})

	//重置
	function toChange() {
		$("audio").attr("autoplay", "autoplay"); //自动播放
		$("audio").load(); //重新加载
		autoPlay();
	};

	//静音
	$("#controls_right li:nth-child(1) span").click(function() {
		if(oV.muted) {
			oV.volume = iScare;
			oV.muted = false;
			$("#voice .voice_dot").css("bottom", "");
			$("#voice .voice_dot").css("top", T);
			$(this).css("background-position", "");
		} else {
			oV.volume = 0;
			oV.muted = true;
			$("#voice .voice_dot").css("top", "");
			$("#voice .voice_dot").css("bottom", 0);
			$(this).css("background-position", "-144px -195px");
		}
	});

	//播放时间
	function nowTime() {
		$(".timeleng i:first").text(changeTime(oV.currentTime));
		var scale = oV.currentTime / oV.duration;
		oDot.style.left = scale * $(".bar").width() + "px"
	};

	//调整时间
	function changeTime(iNum) {
		iNum = parseInt(iNum);
		var iM = toZero(Math.floor(iNum % 3600 / 60));
		var iS = toZero(Math.floor(iNum % 60));
		return iM + ":" + iS;
	};

	function rangeChange() {
		var oV = $("audio")[0];
		var offset = event.offsetX;
		var barWidth = this.offsetWidth;
		var percent = offset / barWidth;
		console.log(percent)
		console.log(offset);
		nowTime();
		$('.dot').css("left", (offset - 6));
		oV.currentTime = oV.duration * percent
	};
	$(".bar_len").click(rangeChange)

	//播放进度条
	var oDot = $(".dot")[0];
	oDot.onmousedown = function(ev) {
		var ev = ev || window.event;
		DisX = ev.clientX - oDot.offsetLeft;

		document.onmousemove = function(ev) {
			var ev = ev || window.event;
			var L = ev.clientX - DisX;
			if(L < 0) {
				L = 0;
			} else if(L > $(".bar_len").width() - oDot.offsetWidth) {
				L = $(".bar_len").width() - oDot.offsetWidth
			}

			oDot.style.left = L + "px";
			//保留两位小数
			var scale = Math.floor((L / ($(".bar_len").width() - oDot.offsetWidth)) * 100) / 100;

			nowTime();
			oV.currentTime = scale * oV.duration;
		}
		document.onmouseup = function() {
			document.onmousemove = document.onmouseup = null;
		}
		return false
	}

	//音量进度条显示隐藏
	$('#controls_right li:nth-child(1)').mouseenter(function() {
		$("#voice").stop().fadeIn(500)
	}).mouseleave(function() {
		$("#voice").stop().fadeOut(500)
	});

	//音量进度条
	var oVolunDot = $("#voice .voice_dot")[0];
	oVolunDot.onmousedown = function(ev) {
		var ev = ev || window.event;
		DisY = ev.clientY - this.offsetTop;
		document.onmousemove = function(ev) {
			var ev = ev || window.event;
			T = ev.clientY - DisY;
			if(T < 0) {
				T = 0;
			} else if(T > $(".voice_bar").height() - oVolunDot.offsetHeight) {
				T = $(".voice_bar").height() - oVolunDot.offsetHeight
			}

			oVolunDot.style.top = T + "px";
			//保留两位小数
			var scare = Math.floor((T / ($(".voice_bar").height() - oVolunDot.offsetHeight)) * 100) / 100;
			iScare = Math.abs(scare - 1);
			oV.volume = iScare; //音量
			document.title = iScare;
			if(scare == 1) {
				$("#controls_right li:nth-child(1) span").css("background-position", "-144px -195px")
			} else {
				$("#controls_right li:nth-child(1) span").css("background-position", "")
			}
		}
		document.onmouseup = function() {
			document.onmousemove = document.onmouseup = null;
		}
		return false
	}

	//列表滚动条
	var oBox = $("#playlist")[0];
	var oBarDot = $("#playlist .list_bar .bar_dot")[0];
	var oBar = $("#playlist .list_bar")[0];
	var oOl = $("#playlist ol")[0];

	oBarDot.onmousedown = function(ev) {
		var ev = ev || event;
		var disX = ev.clientX - this.offsetLeft;
		var disY = ev.clientY - this.offsetTop;

		document.onmousemove = function(ev) {
			var ev = ev || event;
			var T = ev.clientY - disY;
			if(T < 0) {
				T = 0;
			} else if(T > oBar.offsetHeight - oBarDot.offsetHeight) {
				T = oBar.offsetHeight - oBarDot.offsetHeight
			};
			var iRolling = T / (oBar.offsetHeight - oBarDot.offsetHeight);

			oBarDot.style.top = T + "px";
			var scrollDistance = -iRolling * (oOl.offsetHeight - oBox.offsetHeight);
			oOl.style.top = scrollDistance + "px";
		}
		document.onmouseup = function() {
			document.onmousemove = document.onmouseup = null;
		}
		return false;
	}

	//补零
	function toZero(n) {
		
		return n<10?'0'+n:""+n
	};
}