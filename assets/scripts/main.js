function drawTasks() {
	chrome.storage.sync.get(['tasklist'], function (result) {
		var html = result.tasklist.map(function (e) {
			var unit
			var left = new Date(e.deadline) - new Date()
			if (Math.abs(left) > 3600000 * 24 * 14) {
				left = Math.floor(left / (3600000 * 24 * 14))
				unit = ' weeks'
			} else if (Math.abs(left) > 3600000 * 24) {
				left = Math.floor(left / (3600000 * 24))
				unit = ' days'
			} else if (Math.abs(left) > 3600000) {
				left = Math.floor(left / 3600000)
				unit = ' hours'
			} else if (Math.abs(left) >= 0) {
				left = Math.floor(left / 60000)
				unit = ' minutes'
			}
			if(e.status=="todo")
			{
			if (left > 0) {
				left += unit
				return `
					<li class="task on-time" id="${e.title}"><div id="${e.title}">${e.title}
                        <br><span>
                    ${left}
					</span></div><div id="${e.title}" class="favicon">
					<img id="${e.title}" src="https://s2.googleusercontent.com/s2/favicons?domain_url=${e.url}&sz=64"></div>
                    </li>
                    `
			} else {
				left = 'Late by ' + -1 * left + unit
				return `
                    <li class="task late" id="${e.title}"><div id="${e.title}">${e.title}
                        <br><span>
						${left}
						</span></div><div id="${e.title}" class="favicon">
						<img src="https://s2.googleusercontent.com/s2/favicons?domain_url=${e.url}&sz=64"></div>
						</li>
                    `
			}
		}
		})
		$('#todo-tab #tasks').empty().append(html)
		chrome.storage.sync.get(['stats'], function(res){
			var curTasksArray = result.tasklist.map(function (e) {
				var temp = 0;
				if(e.status=="todo") temp++;
				return temp;
			})
			curTasks = curTasksArray.reduce((a,b) => a+b, 0)
			console.log(curTasks);
			html2="<span>Current tasks: " + curTasks + "</span><br><span>Done tasks: "+res.stats.done+"</span>"
			$("#task-stats").empty().append(html2);
		})
	})
}

function getDateFromInput(input)
{
	let urlkeyword = ['.pl', '.org', '.gov', '.com', '.eu', '.edu', '.it', '.io']

	let matchedUrl = urlkeyword.forEach((e, i) => {
		if (input.search(e) > 0) {
			return input.split(e)[0].split(' ')[1] + e + input.split(e)[1].split(' ')[0]
		}
	})

	let date = new Date()

	let rd = new RegExp('tomorrow|today', 'g')

	console.log(
		input.match(
			/(((?<=[0-9]{1,2}[\:\.])[0-9]{2}|[0-9]{1,2}(?=([\:\.][0-9]{2})))|[0-9]{1,2}(?=(\ ?[paPA]\.?[Mm]))|(?<=(by|at|till)\ )[0-9]{1,2}|(\ [0-9]{1,2}\ ?)$)/g
		)
	)

	const match = input.match(
		/(((?<=[0-9]{1,2}[\:\.])[0-9]{2}|[0-9]{1,2}(?=([\:\.][0-9]{2})))|[0-9]{1,2}(?=(\ ?[paPA]\.?[Mm]))|(?<=(by|at|till)\ )[0-9]{1,2}|(\ [0-9]{1,2}\ ?)$)/g
	)

	let pm = input.match(/[0-9](?=(\ ?[pP]\.?[mM]))/g)

	if (match) {
		date.setMinutes(match[1] ? match[1] : 0)
		if (match[0] + (pm ? 12 : 0) < new Date().getHours()) {
			date.setDate(date.getDate() + 1)
		}
		date.setHours(parseInt(match[0]) + (pm ? 12 : 0))
		console.log(match[0], match[1], match, date)
	}

	let matchrd = input.match(rd)

	if (matchrd) {
		switch (matchrd[0]) {
			case 'tomorrow':
				console.log(matchrd)
				date.setDate(date.getDate() + 1)
				break
			case 'today':
				break
			default:
				break
		}
	} else if (!match) {
		date.setDate(date.getDate() + 1)
		chrome.storage.sync.get(['workhours'], function (e) {
			date.setHours(Math.floor(e.workhours[1] / 60))
			date.setMinutes(0)
		})
	}

	let matchedTitle = input
		.replace(/(?<=([0-9]\ ?))([paPA]\.?[mM]\.?)/g, '')
		// .replace(match ? (match[1] ? match[0] + ':' + match[1] : match[0]) : '', '')
		.replace(
			/(((?<=[0-9]{1,2}[\:\.])[0-9]{2}|[0-9]{1,2}(?=([\:\.][0-9]{2})))|[0-9]{1,2}(?=(\ ?[paPA]\.?[Mm]))|(?<=(by|at|till)\ )[0-9]{1,2}|(\ [0-9]{1,2}\ ?)$|(?<=[0-9]{1,2})([\:\.](?=[0-9]{2})))/g,
			''
		)
		.replace(matchrd ? matchrd[0] : '', '')
	return date;
}

function refreshStats()
{
	console.log("test");
	chrome.storage.sync.get(['tasklist'], function(result){
		chrome.storage.sync.get(['stats'], function(result2){
			console.log(result2.stats);
			let stats=result2.stats;
			stats.done++;
			chrome.storage.sync.set({stats:stats}, function(){					
				chrome.storage.sync.get(['stats'], function(res){
					var curTasksArray = result.tasklist.map(function (e) {
						var temp = 0;
						if(e.status=="todo") temp++;
						return temp;
					})
					curTasks = curTasksArray.reduce((a,b) => a+b, 0) - 1
					console.log(curTasks);
					html2="<span>Current tasks: " + curTasks + "</span><br><span>Done tasks: "+res.stats.done+"</span>"
					$("#task-stats").empty().append(html2);
			})
			
		})
	})
	
})
}

function drawDate()
{
	var today = new Date();
	var weekday = new Array(7);
	var month = new Array(12);
	weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	var dateTitle = weekday[today.getDay()];
	day=today.getDate();
	var dayNum;
	if(day>10) dayNum=day/10;
	else dayNum = day;

	switch(dayNum)
	{
		case 1:
			day+="st";
			break;
		case 2:
			day+="nd";
			break;
		case 3:
			day+="rd";
			break;
		default:
			day+="th";
	}
	dateTitle += `
	<br><span style="font-weight:300; font-size:.5em; line-height: 0;">${day}
	`;
	dateTitle+=month[today.getMonth()]+"</span>";

	console.log(day);
	$("h1").append(dateTitle);
}



function drawNewTask()
{
	chrome.tabs.getSelected(null, function (tab) {
		var url = tab.url
		let html = `<li class="task new"><div>
		<input id="new-task-input" class="add-task-input" type="text" placeholder="Text Mom tomorrow" autofocus="true" />
		<br><span>
		tomorrow
		</span></div><div id="" class="favicon">
		<img id="" src="https://s2.googleusercontent.com/s2/favicons?domain_url=${url}&sz=64"></div>
		</li>`;
		$("#add-tasks ul").append(html);
	})
}

$(document).ready(function () {
	drawNewTask()
	drawDate();
	navigator.webkitGetUserMedia(
		{ audio: true },
		(s) => {
			console.log(s)
		},
		(e) => {
			console.log(e)
		}
	)
	drawTasks()
	chrome.storage.sync.get(['workhours'], function (e) {
		$('#start-day option:selected').attr('selected', false)
		$('#start-day option')
			.eq(e.workhours[2] - 1)
			.attr('selected', true)
		$('#end-day option:selected').attr('selected', false)
		$('#end-day option')
			.eq(e.workhours[3] - 1)
			.attr('selected', true)
		$('.wh-from').val(
			(Math.floor(e.workhours[0] / 60) > 9 ? '' : '0') +
				Math.floor(e.workhours[0] / 60) +
				':' +
				(e.workhours[0] % 60 > 9 ? '' : '0') +
				(e.workhours[0] % 60)
		)
		$('.wh-to').val(
			(Math.floor(e.workhours[1] / 60) > 9 ? '' : '0') +
				Math.floor(e.workhours[1] / 60) +
				':' +
				(e.workhours[1] % 60 > 9 ? '' : '0') +
				(e.workhours[1] % 60)
		)
	})

	chrome.storage.sync.get(['blacklist'], function (result) {
		var html = result.blacklist.map(function (e) {
			return `
              <li id="${e}" class="blacklisted">
                ${e.split('//')[1].split('/')[0]}
              </li>
              `
		})
		$('#lists-tab ul').append(html)
	})

	//const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
	//const recognition = new SpeechRecognition()
	/*
	recognition.continuous = true
	recognition.interimResults = false
	// recognition.lang = 'en'
	recognition.onerror = (e) => {
		console.log(e)
		if (e.error == 'not-allowed')
			window.location.href = 'chrome-extension://lakepiipmgnhgbmnpbhaaclnchoniknl/popup.html'
	}

	recognition.start()

	console.log(recognition)

	let s = false

	recognition.onspeechstart = (e) => {
		console.log(e)
		if (!s) {
			console.log('looking for "okay"', s)
			setTimeout(() => {
				recognition.stop()
			}, 650)
		}
	}

	recognition.onstart = (e) => {
		console.log('sr started')
	}
	recognition.onend = (e) => {
		console.log(e)
		recognition.start()
	}

	recognition.onresult = (e) => {
		console.log(e)
		const t = e.results[e.resultIndex][0].transcript
		console.log(t)
		if (t.match(/okay|set|okej|ok/gi)) {
			console.log(t)
			s = true
		} else if (s) {
			console.log(t)
			addTask(t)
			s = false
		}
	}*/
})

drawProgressBar();
function drawProgressBar()
{
	start = [231,65,75]
	middle = [227,217,40]
	end = [65,217,98]
	progress=1;
	chrome.storage.sync.get(['tasklist'], function (result) {
		var todayTotalArray = result.tasklist.map(function (e) {
			var temp=0;
			var today = new Date();
			console.log(e.deadline);
			var deadline = new Date(e.deadline); 
			if(deadline.getDate()==today.getDate() && deadline.getMonth()==today.getMonth() && deadline.getFullYear()==today.getFullYear())
			{
				temp++
			}
			return temp;
		})
		var todayDoneArray = result.tasklist.map(function (e) {
			var temp=0;
			var today = new Date();
			console.log(e.deadline);
			var deadline = new Date(e.deadline); 
			if(deadline.getDate()==today.getDate() && deadline.getMonth()==today.getMonth() && deadline.getFullYear()==today.getFullYear() && e.status=="done")
			{
				temp++
			}
			return temp;
		})
		let todayTotal = todayTotalArray.reduce((a,b) => a+b, 0);
		let todayDone = todayDoneArray.reduce((a,b) => a+b, 0);
		
		if(todayTotal>0) 
		{
			progress = todayDone/todayTotal;
		}
		console.log(progress)
		if (progress>.5){
			w = (progress-.5)*2;
			color = [
				Math.round((middle[0]+(end[0]-middle[0])*w)),
				Math.round((middle[1]+(end[1]-middle[1])*w)),
				Math.round((middle[2]+(end[2]-middle[2])*w)),
			]
		}
		else{
			w = progress*2
			color = [
				Math.round((start[0]+(middle[0]-start[0])*w)),
				Math.round((start[1]+(middle[1]-start[1])*w)),
				Math.round((start[2]+(middle[2]-start[2])*w)),
			]
		}
		console.log (color);
		let width = progress*327;
		if(progress>0)
		{
			barHTML = `<span>Today tasks:</span><div class="progress-bg">
					<div class="progress-in">
					</div>
				</div>`;
		}
		else {
			barHTML = `<span>Today tasks:</span><div class="progress-bg">
					<div class="progress-in">
					</div>
				</div>`;
		}
		$("#progress").empty().append(barHTML);
		$(".progress-in").css("background-color", "rgb("+color[0]+","+color[1]+","+color[2]+")")
		$(".progress-in").css("width", width + "px")
	})
	
}

function updateProgressBar()
{
	console.log("updateeee");
	start = [231,65,75]
	middle = [227,217,40]
	end = [65,217,98]
	progress=1;
	chrome.storage.sync.get(['tasklist'], function (result) {
		var todayTotalArray = result.tasklist.map(function (e) {
			var temp=0;
			var today = new Date();
			console.log(e.deadline);
			var deadline = new Date(e.deadline); 
			if(deadline.getDate()==today.getDate() && deadline.getMonth()==today.getMonth() && deadline.getFullYear()==today.getFullYear())
			{
				temp++
			}
			return temp;
		})
		var todayDoneArray = result.tasklist.map(function (e) {
			var temp=0;
			var today = new Date();
			console.log(e.deadline);
			var deadline = new Date(e.deadline); 
			if(deadline.getDate()==today.getDate() && deadline.getMonth()==today.getMonth() && deadline.getFullYear()==today.getFullYear() && e.status=="done")
			{
				temp++
			}
			return temp;
		})
		let todayTotal = todayTotalArray.reduce((a,b) => a+b, 0);
		let todayDone = todayDoneArray.reduce((a,b) => a+b, 0);
		
		if(todayTotal>0) 
		{
			progress = (todayDone+1)/todayTotal;
		}
		console.log(progress)
		if (progress>.5){
			w = (progress-.5)*2;
			color = [
				Math.round((middle[0]+(end[0]-middle[0])*w)),
				Math.round((middle[1]+(end[1]-middle[1])*w)),
				Math.round((middle[2]+(end[2]-middle[2])*w)),
			]
		}
		else{
			w = progress*2
			color = [
				Math.round((start[0]+(middle[0]-start[0])*w)),
				Math.round((start[1]+(middle[1]-start[1])*w)),
				Math.round((start[2]+(middle[2]-start[2])*w)),
			]
		}
		console.log (color);
		let width = progress*327;
		if(progress>0)
		{
			barHTML = `<span>Today tasks:</span><div class="progress-bg">
					<div class="progress-in">
					</div>
				</div>`;
		}
		else {
			barHTML = `<span>Today tasks:</span><div class="progress-bg">
					<div class="progress-in">
					</div>
				</div>`;
		}
		$(".progress-in").css("background-color", "rgb("+color[0]+","+color[1]+","+color[2]+")")
		$(".progress-in").css("width", width + "px")
	})
	
}

//USUWANIE TASKOW
$('#tasks').on("click", "li", function(e)
{
	var id=e.target.id;
	chrome.storage.sync.get(['tasklist'], function (result){
		for(var i=0; i<result.tasklist.length; i++) {
			for(key in result.tasklist[i]) {
			  if(result.tasklist[i][key]==id)
			  {
			  console.log(i);
			  result.tasklist[i].status="done";
			  var deadline = new Date(result.tasklist[i].deadline);
			  var today = new Date();
			  if(deadline.getDate()==today.getDate() && deadline.getMonth()==today.getMonth() && deadline.getFullYear()==today.getFullYear())
			  {
				updateProgressBar();
			  }
			  chrome.storage.sync.set({tasklist: result.tasklist})
			  }
			}
		  }
		  
	})
	refreshStats();
})


$('#lists-tab').on('click', 'li', function (e) {
	e.preventDefault()
	url = $(this).attr('id')
	chrome.storage.sync.get(['blacklist'], function (result) {
		const isDeleted = (element) => element == url
		var index = result.blacklist.findIndex(isDeleted)
		result.blacklist.splice(index, 1)
		console.log(index)
		console.log(url)
		chrome.storage.sync.set({ blacklist: result.blacklist })
	})
})

$('.menu-button').click(function (event) {
	var self = event.target.id
	console.log(self)
	$('#wrapper').removeClass()
	$('#wrapper').addClass(self)
})

$('.menu-side-button').click(function (event) {
	$('.menu-side-button').removeClass('active')
	$(this).addClass('active')
	$('.tab').addClass('hidden')
	$('#' + this.id + '-tab').removeClass('hidden')
	if (this.id + '-tab' == 'lists-tab') {
		$('#wrapper').removeClass().addClass('dark')
	} else {
		$('#wrapper').removeClass().addClass('white')
	}
})

$('#tasks').on('click', 'li', function (event) {
	event.preventDefault()
	new Audio('assets/sounds/woosh.mp3').play()
	$(this)
		.addClass('hidden-li')
		.delay(250)
		.queue(function (next) {
			$(this).addClass('hidden')
			next()
		})
})

$('#add-tasks').on('click', 'li', function(e){
	e.preventDefault();
	if($(e.target).is("input"))
	{
		return false;
	}
	else 
	{
		console.log("dodano");
		addTask($('#new-task-input').val());
		$("#new-task-input").val('');
		$("#add-tasks span").empty().append("tommorow");
	}
})

$(document).on("input", "#add-tasks input", function()
{
	var inputDate = new Date(getDateFromInput($("#new-task-input").val()));
	var left = inputDate - new Date()
	if (Math.abs(left) > 3600000 * 24 * 14) {
		left = Math.floor(left / (3600000 * 24 * 14))
		unit = ' weeks'
	} else if (Math.abs(left) > 3600000 * 23) {
		left = Math.ceil(left / (3600000 * 24))
		unit = ' days'
	} else if (Math.abs(left) > 3600000) {
		left = Math.floor(left / 3600000)
		unit = ' hours'
	} else if (Math.abs(left) >= 0) {
		left = Math.floor(left / 60000)
		unit = ' minutes'
	}
	if (left<0){left='Late by '+left*-1;}
	$("#add-tasks span").empty().append(left+unit);
})

$('.add-bl').click(function () {
	chrome.tabs.getSelected(null, function (tab) {
		var url = tab.url
		console.log(url)
		chrome.storage.sync.get(['blacklist'], function (result) {
			result.blacklist.push(url)
			chrome.storage.sync.set({ blacklist: result.blacklist })
		})
	})
})



$('.working-time').change(function (ev) {
	let wh = []
	chrome.storage.sync.get(['workhours'], function (e) {
		wh = e.workhours
		if (ev.target.id == 'start-day' || ev.target.id == 'end-day') {
			wh[2] = $('#start-day').val()
			wh[3] = $('#end-day').val()
		} else if (ev.target.id == 'wh-from' || ev.target.id == 'wh-to') {
			wh[0] = parseInt($('#wh-from').val().split(':')[0]) * 60 + parseInt($('#wh-from').val().split(':')[1])
			wh[1] = parseInt($('#wh-to').val().split(':')[0]) * 60 + parseInt($('#wh-to').val().split(':')[1])
		}
		console.log(wh)
		chrome.storage.sync.set({ workhours: wh })
	})
})

$('#lists-tab').on('click', 'li', function (e) {
	e.preventDefault()
	url = $(this).attr('id')
	chrome.storage.sync.get(['blacklist'], function (result) {
		const isDeleted = (element) => element == url
		var index = result.blacklist.findIndex(isDeleted)
		result.blacklist.splice(index, 1)
		console.log(index)
		console.log(url)
		chrome.storage.sync.set({ blacklist: result.blacklist })
	})
})

chrome.storage.sync.onChanged.addListener(function (e) {
	chrome.storage.sync.get(['tasklist'], function (e) {})
	chrome.storage.sync.get(['blacklist'], function (result) {
		var html = result.blacklist.map(function (e) {
			return `
            <li class="blacklisted">
              ${e.split('//')[1].split('/')[0]}
            </li>
            `
		})
		$('#lists-tab ul').empty().append(html)
	})
})

function addTask(input) {
	let urlkeyword = ['.pl', '.org', '.gov', '.com', '.eu', '.edu', '.it', '.io']

	let matchedUrl = urlkeyword.forEach((e, i) => {
		if (input.search(e) > 0) {
			return input.split(e)[0].split(' ')[1] + e + input.split(e)[1].split(' ')[0]
		}
	})

	let date = new Date()
	console.log(date)

	let rd = new RegExp('tomorrow|today', 'g')

	console.log(
		input.match(
			/(((?<=[0-9]{1,2}[\:\.])[0-9]{2}|[0-9]{1,2}(?=([\:\.][0-9]{2})))|[0-9]{1,2}(?=(\ ?[paPA]\.?[Mm]))|(?<=(by|at|till)\ )[0-9]{1,2}|(\ [0-9]{1,2}\ ?)$)/g
		)
	)

	const match = input.match(
		/(((?<=[0-9]{1,2}[\:\.])[0-9]{2}|[0-9]{1,2}(?=([\:\.][0-9]{2})))|[0-9]{1,2}(?=(\ ?[paPA]\.?[Mm]))|(?<=(by|at|till)\ )[0-9]{1,2}|(\ [0-9]{1,2}\ ?)$)/g
	)

	let pm = input.match(/[0-9](?=(\ ?[pP]\.?[mM]))/g)

	if (match) {
		date.setMinutes(match[1] ? match[1] : 0)
		if (match[0] + (pm ? 12 : 0) < new Date().getHours()) {
			date.setDate(date.getDate() + 1)
		}
		date.setHours(parseInt(match[0]) + (pm ? 12 : 0))
		console.log(match[0], match[1], match, date)
	}

	let matchrd = input.match(rd)

	if (matchrd) {
		switch (matchrd[0]) {
			case 'tomorrow':
				console.log(matchrd)
				date.setDate(date.getDate() + 1)
				break
			case 'today':
				break
			default:
				break
		}
	} else if (!match) {
		date.setDate(date.getDate() + 1)
		chrome.storage.sync.get(['workhours'], function (e) {
			date.setHours(Math.floor(e.workhours[1] / 60))
			date.setMinutes(0)
		})
	}

	let matchedTitle = input
		.replace(/(?<=([0-9]\ ?))([paPA]\.?[mM]\.?)/g, '')
		// .replace(match ? (match[1] ? match[0] + ':' + match[1] : match[0]) : '', '')
		.replace(
			/(((?<=[0-9]{1,2}[\:\.])[0-9]{2}|[0-9]{1,2}(?=([\:\.][0-9]{2})))|[0-9]{1,2}(?=(\ ?[paPA]\.?[Mm]))|(?<=(by|at|till)\ )[0-9]{1,2}|(\ [0-9]{1,2}\ ?)$|(?<=[0-9]{1,2})([\:\.](?=[0-9]{2})))/g,
			''
		)
		.replace(matchrd ? matchrd[0] : '', '')

	chrome.storage.sync.get(['tasklist'], function (e) {
		let tasks = e.tasklist
		console.log(date)
		tasks.push({
			title: matchedTitle ? matchedTitle : 'Zadanie ' + (tasks.length + 1),
			deadline: '' + date,
			url: matchedUrl ? matchedUrl : 'https://medium.com/',
			status: "todo"
		})
		chrome.storage.sync.set({ tasklist: tasks }, () => {
			drawTasks()
			chrome.storage.sync.get(['tasklist'], function (e) {
				console.log(e.tasklist)
			})
		})
	})
	chrome.storage.sync.get(['stats'], function(result){
		let stats=result.stats;
		stats.total++;
		chrome.storage.sync.set({stats:stats}, function(e){		console.log(stats)
			console.log(e)
		})
	})
}

$('.add-task-button').click(function (event) {
	let input = $('.add-task-input').val()

	$('.add-task-input').val('');
	updateProgressBar();

	addTask(input)
})

$('#add-tasks').keypress(function (e) {
	if (e.keyCode == 13) {
		let input = $('.add-task-input').val()
		$('.add-task-input').val('')
    updateProgressBar();

		addTask(input)
	}
})
