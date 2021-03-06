function updateNewTaskField(e, value) {
	let v = value ? value : $('.add-task-input').val()
	console.log(v)
	console.log(parseInput(v))
	if (e) {
		if (e.keyCode == 13) {
			updateProgressBar()
			addTask(v)
			v = ''
		} else if (document.activeElement != document.querySelector('.add-task-input')) {
			if (e.keyCode > 31 && e.keyCode < 127) {
				v += e.key
			} else if (e.keyCode == 8) {
				v = v.slice(0, -1)
			}
		}
	}
	$('.add-task-input').val(v)
	var inputDate = new Date(parseInput(v).date)
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
	if (left < 0) {
		left = 'Late by ' + left * -1
	}
	$('#add-tasks span')
		.empty()
		.append(left + unit)
}

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
				if (left > 1) unit = ' days'
				else unit = ' day'
			} else if (Math.abs(left) > 3600000) {
				left = Math.floor(left / 3600000)
				unit = ' hours'
			} else if (Math.abs(left) >= 0) {
				left = Math.floor(left / 60000)
				unit = ' minutes'
			}
			if (e.status == 'todo') {
				if (left > 0) {
					left += unit
					return `
					<li class="task on-time" id="${e.title}"><div id="${e.title}">${e.title}
                        <br><span>
                    ${left}
					</span></div><div id="${e.title}" class="favicon">
					<img  alt="" id="${e.title}" src="https://s2.googleusercontent.com/s2/favicons?domain_url=${e.url}&sz=64"></div>
                    </li>
                    `
				} else {
					left = 'Late by ' + -1 * left + unit
					return `
                    <li class="task late" id="${e.title}"><div id="${e.title}">${e.title}
                        <br><span>
						${left}
						</span></div><div id="${e.title}" class="favicon">
						<img alt="" src="https://s2.googleusercontent.com/s2/favicons?domain_url=${e.url}&sz=64"></div>
						</li>
                    `
				}
			} else {
				return null
			}
		})
		if (html.every((element) => element === null)) {
			html = `<h1 class="message">Enjoy your free time!</h1>`
		}
		console.log(html)
		$('#todo-tab #tasks').empty().append(html)
		chrome.storage.sync.get(['stats'], function (res) {
			var curTasksArray = result.tasklist.map(function (e) {
				var temp = 0
				if (e.status == 'todo') temp++
				return temp
			})
			curTasks = curTasksArray.reduce((a, b) => a + b, 0)
			console.log(curTasks)
			html2 = '<span>Current tasks: ' + curTasks + '</span><br><span>Done tasks: ' + res.stats.done + '</span>'
			$('#task-stats').empty().append(html2)
		})
	})
}

function refreshStats() {
	chrome.storage.sync.get(['tasklist'], function (result) {
		chrome.storage.sync.get(['stats'], function (result2) {
			console.log(result2.stats)
			let stats = result2.stats
			stats.done++
			chrome.storage.sync.set({ stats: stats }, function () {
				chrome.storage.sync.get(['stats'], function (res) {
					var curTasksArray = result.tasklist.map(function (e) {
						var temp = 0
						if (e.status == 'todo') temp++
						return temp
					})
					curTasks = curTasksArray.reduce((a, b) => a + b, 0) - 1
					console.log(curTasks)
					html2 = '<span>Current tasks: ' + curTasks + '</span><br><span>Done tasks: ' + res.stats.done + '</span>'
					$('#task-stats').empty().append(html2)
				})
			})
		})
	})
}

function drawDate() {
	var today = new Date()
	var weekday = new Array(7)
	var month = new Array(12)
	weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
	month = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December',
	]
	var dateTitle = weekday[today.getDay()]
	day = today.getDate()
	var dayNum
	if (day > 10) dayNum = day / 10
	else dayNum = day

	switch (dayNum) {
		case 1:
			day += 'st'
			break
		case 2:
			day += 'nd'
			break
		case 3:
			day += 'rd'
			break
		default:
			day += 'th'
	}
	dateTitle += `
	<br><span style="font-weight:300; font-size:.5em; line-height: 0;">${day}
	`
	dateTitle += month[today.getMonth()] + '</span>'

	console.log(day)
	$('h1').append(dateTitle)
}

function drawNewTask() {
	chrome.tabs.getSelected(null, function (tab) {
		var url = tab.url
		let html = `<li class="task new"><div>
		<input id="new-task-input" class="add-task-input" type="text" placeholder="Text Mom tomorrow" autofocus="true" />
		<br><span>
		tomorrow
		</span></div><div id="" class="favicon">
		<img id="" alt="" src="https://s2.googleusercontent.com/s2/favicons?domain_url=${url}&sz=64"></div>
		</li>`
		$('#add-tasks ul').append(html)
	})
}

$(document).ready(function () {
	drawNewTask()
	drawDate()
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
		console.log(e)
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

	refresh()

	// const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
	// const recognition = new SpeechRecognition()

	// recognition.continuous = true
	// recognition.interimResults = true
	//recognition.lang = 'en'
	// recognition.onerror = (e) => {
	// 	console.log(e)
	// 	if (e.error == 'not-allowed')
	// 		window.location.href = 'chrome-extension://lakepiipmgnhgbmnpbhaaclnchoniknl/popup.html'
	// }

	// recognition.start()

	// console.log(recognition)

	// let s = false

	// recognition.onspeechstart = (e) => {}

	// recognition.onstart = (e) => {
	// 	console.log('sr started')
	// }
	// recognition.onend = (e) => {}

	// recognition.onresult = (e) => {
	// updateNewTaskField(null, e.results[e.resultIndex][0].transcript)
	// console.log(e)
	// const t = e.results[e.resultIndex][0].transcript
	// console.log(t)
	// if (t.match(/okay|set|okej|ok/gi)) {
	// 	console.log(t)
	// 	s = true
	// } else if (s) {
	// 	console.log(t)
	// 	addTask(t)
	// 	s = false
	// }
	//}
})

drawProgressBar()
function drawProgressBar() {
	start = [231, 65, 75]
	middle = [227, 217, 40]
	end = [65, 217, 98]
	progress = 1
	chrome.storage.sync.get(['tasklist'], function (result) {
		var todayTotalArray = result.tasklist.map(function (e) {
			var temp = 0
			var today = new Date()
			console.log(e.deadline)
			var deadline = new Date(e.deadline)
			if (
				deadline.getDate() == today.getDate() &&
				deadline.getMonth() == today.getMonth() &&
				deadline.getFullYear() == today.getFullYear()
			) {
				temp++
			}
			return temp
		})
		var todayDoneArray = result.tasklist.map(function (e) {
			var temp = 0
			var today = new Date()
			console.log(e.deadline)
			var deadline = new Date(e.deadline)
			if (
				deadline.getDate() == today.getDate() &&
				deadline.getMonth() == today.getMonth() &&
				deadline.getFullYear() == today.getFullYear() &&
				e.status == 'done'
			) {
				temp++
			}
			return temp
		})
		let todayTotal = todayTotalArray.reduce((a, b) => a + b, 0)
		let todayDone = todayDoneArray.reduce((a, b) => a + b, 0)

		if (todayTotal > 0) {
			progress = todayDone / todayTotal
		}
		console.log(progress)
		if (progress > 0.5) {
			w = (progress - 0.5) * 2
			color = [
				Math.round(middle[0] + (end[0] - middle[0]) * w),
				Math.round(middle[1] + (end[1] - middle[1]) * w),
				Math.round(middle[2] + (end[2] - middle[2]) * w),
			]
		} else if (progress <= 1) {
			w = progress * 2
			color = [
				Math.round(start[0] + (middle[0] - start[0]) * w),
				Math.round(start[1] + (middle[1] - start[1]) * w),
				Math.round(start[2] + (middle[2] - start[2]) * w),
			]
		} else {
			progress = 1
			color = end
		}
		console.log(color)
		let width = progress * 327
		if (progress > 0) {
			barHTML = `<span>Today tasks:</span><div class="progress-bg">
					<div class="progress-in">
					</div>
				</div>`
		} else {
			barHTML = `<span>Today tasks:</span><div class="progress-bg">
					<div class="progress-in">
					</div>
				</div>`
		}
		$('#progress').empty().append(barHTML)
		$('.progress-in').css('background-color', 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')')
		$('.progress-in').css('width', width + 'px')
	})
}

function updateProgressBar() {
	console.log('updateeee')
	start = [231, 65, 75]
	middle = [227, 217, 40]
	end = [65, 217, 98]
	progress = 1
	chrome.storage.sync.get(['tasklist'], function (result) {
		var todayTotalArray = result.tasklist.map(function (e) {
			var temp = 0
			var today = new Date()
			console.log(e.deadline)
			var deadline = new Date(e.deadline)
			if (
				deadline.getDate() == today.getDate() &&
				deadline.getMonth() == today.getMonth() &&
				deadline.getFullYear() == today.getFullYear()
			) {
				temp++
			}
			return temp
		})
		var todayDoneArray = result.tasklist.map(function (e) {
			var temp = 0
			var today = new Date()
			console.log(e.deadline)
			var deadline = new Date(e.deadline)
			if (
				deadline.getDate() == today.getDate() &&
				deadline.getMonth() == today.getMonth() &&
				deadline.getFullYear() == today.getFullYear() &&
				e.status == 'done'
			) {
				temp++
			}
			return temp
		})
		let todayTotal = todayTotalArray.reduce((a, b) => a + b, 0)
		let todayDone = todayDoneArray.reduce((a, b) => a + b, 0)

		if (todayTotal > 0) {
			progress = (todayDone + 1) / todayTotal
		}
		console.log(progress)
		if (progress > 0.5) {
			w = (progress - 0.5) * 2
			color = [
				Math.round(middle[0] + (end[0] - middle[0]) * w),
				Math.round(middle[1] + (end[1] - middle[1]) * w),
				Math.round(middle[2] + (end[2] - middle[2]) * w),
			]
		} else {
			w = progress * 2
			color = [
				Math.round(start[0] + (middle[0] - start[0]) * w),
				Math.round(start[1] + (middle[1] - start[1]) * w),
				Math.round(start[2] + (middle[2] - start[2]) * w),
			]
		}

		console.log(color)
		let width = progress * 327
		if (progress > 0) {
			barHTML = `<span>Today tasks:</span><div class="progress-bg">
					<div class="progress-in">
					</div>
				</div>`
		} else {
			barHTML = `<span>Today tasks:</span><div class="progress-bg">
					<div class="progress-in">
					</div>
				</div>`
		}
		$('.progress-in').css('background-color', 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')')
		$('.progress-in').css('width', width + 'px')
	})
}

//USUWANIE TASKOW
$('#tasks').on('click', 'li', function (e) {
	var id = e.target.id
	chrome.storage.sync.get(['tasklist'], function (result) {
		for (var i = 0; i < result.tasklist.length; i++) {
			for (key in result.tasklist[i]) {
				if (result.tasklist[i][key] == id) {
					console.log(i)
					result.tasklist[i].status = 'done'
					var deadline = new Date(result.tasklist[i].deadline)
					var today = new Date()
					if (
						deadline.getDate() == today.getDate() &&
						deadline.getMonth() == today.getMonth() &&
						deadline.getFullYear() == today.getFullYear()
					) {
						updateProgressBar()
					}
					chrome.storage.sync.set({ tasklist: result.tasklist })
				}
			}
		}
	})
	refreshStats()
})

$('#lists-tab').on('click', 'li', function (e) {
	e.preventDefault()
	url = $(this).attr('id')
	chrome.storage.sync.get(['blacklist'], function (result) {
		const isDeleted = (element) => element == url
		var index = result.blacklist.findIndex(isDeleted)
		result.blacklist.splice(index, 1)
		chrome.storage.sync.set({ blacklist: result.blacklist })
		refresh()
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

$('#add-tasks').on('click', 'li', function (e) {
	e.preventDefault()
	if ($(e.target).is('input')) {
		return false
	} else {
		console.log('dodano')
		addTask($('#new-task-input').val())
		$('#new-task-input').val('')
		$('#add-tasks span').empty().append('tommorow')
	}
})

$(document).on('input', '#add-tasks input', function () {})

$('.add-bl').click(function () {
	chrome.tabs.getSelected(null, function (tab) {
		chrome.storage.sync.get(['blacklist'], function (result) {
			result.blacklist.push(tab.url)
			console.log(result.blacklist)
			chrome.storage.sync.set({ blacklist: result.blacklist })
		})
	})
})

$('.working-time').change(function (ev) {
	let wh = []
	chrome.storage.sync.get(['workhours'], function (e) {
		wh = e.workhours
		if (ev.target.id == 'start-day' || ev.target.id == 'end-day') {
			wh[2] = $('#start-day').val() == 0 ? 7 : $('#start-day').val()
			wh[3] = $('#end-day').val() == 0 ? 7 : $('#end-day').val()
		} else if (ev.target.id == 'wh-from' || ev.target.id == 'wh-to') {
			wh[0] = parseInt($('#wh-from').val().split(':')[0]) * 60 + parseInt($('#wh-from').val().split(':')[1])
			wh[1] = parseInt($('#wh-to').val().split(':')[0]) * 60 + parseInt($('#wh-to').val().split(':')[1])
		}
		console.log(wh)
		chrome.storage.sync.set({ workhours: wh })
		chrome.storage.sync.get(['workhours'], function (e) {
			console.log(e)
		})
	})
})

function refresh() {
	chrome.storage.sync.get(['tasklist'], function (e) {})
	chrome.storage.sync.get(['blacklist'], function (result) {
		var html = result.blacklist.map(function (e) {
			if (e.includes('www.')) {
				return `
              <li id="${e}" class="blacklisted"><div>
				${e.split('//')[1].split('/')[0].split('www.')[1]}<br></div>
				<div class="favicon">
						<img alt="" src="https://s2.googleusercontent.com/s2/favicons?domain_url=${e}&sz=64"></div>
				</div>
			  </li>
              `
			} else {
				return `
              <li id="${e}" class="blacklisted">
                ${e.split('//')[1].split('/')[0]}
              </li>
			  `
			}
		})
		$('#blacklist-list').empty().append(html)
	})
}
chrome.storage.sync.onChanged.addListener(function (e) {
	refresh()
})

function parseInput(input) {
	console.log(input)
	const URLKEYWORDS = ['pl', 'org', 'gov', 'com', 'eu', 'edu', 'it', 'io']
	const DATEKEYWORDS = ['tomorrow', 'in a week', 'today', 'in a month', 'in a year', 'in a hour']
	const GETTIME = input.match(
		new RegExp(
			'(((?<=[0-9]{1,2}[\\:\\.])[0-9]{2}|[0-9]{1,2}(?=([\\:\\.][0-9]{2})))|[0-9]{1,2}(?=(\\ ?[paPA]\\.?[Mm]))|(?<=(by|at|till)\\ )[0-9]{1,2}|(\\ [0-9]{1,2}\\ ?)$)',
			'g'
		)
	)

	const GETPM = input.match(new RegExp('(?<=[0-9])(\\ ?[pP]\\.?\\ ?[mM]\\.?\\ ?)'))
	const GETAM = input.match(new RegExp('(?<=[0-9])(\\ ?[aA]\\.?\\ ?[mM]\\.?\\ ?)'))
	const GETDATE = input.match(
		new RegExp(
			'' +
				DATEKEYWORDS.map((e, i) => {
					return e + (i == DATEKEYWORDS.length - 1 ? '' : '|')
				}).join(''),
			'gi'
		)
	)
	const GETURL = input.match(
		new RegExp(
			'' +
				URLKEYWORDS.map((e, i) => {
					return '\\.' + e + (i == URLKEYWORDS.length - 1 ? '' : '|')
				}).join(''),
			'g'
		)
	)

	console.log(
		new RegExp(
			'' +
				URLKEYWORDS.map((e, i) => {
					return /\./ + e + (i == URLKEYWORDS.length - 1 ? '' : '|')
				}).join(''),
			'g'
		)
	)

	let matchedUrl = GETURL
		? (input.split(GETURL[0])[0].split(' ')[1]
				? input.split(GETURL[0])[0].split(' ').reverse()[0]
				: input.split(GETURL[0])[0]) +
		  GETURL[0] +
		  (input.split(GETURL[0])[1].split(' ')[0] ? input.split(GETURL[0])[1].split(' ')[0] : input.split(GETURL[0])[1])
		: ''

	console.log(GETTIME, GETPM, GETAM, GETDATE, GETURL, matchedUrl)
	let date = new Date()
	date.setHours(
		GETTIME
			? (GETTIME.length > 1 ? parseInt(GETTIME[GETTIME.length - 2]) : parseInt(GETTIME[0])) +
					(GETPM
						? (GETTIME.length > 1 ? parseInt(GETTIME[GETTIME.length - 2]) : parseInt(GETTIME[0]) || 0) == 12
							? 0
							: 12
						: GETAM
						? (GETTIME.length > 1 ? parseInt(GETTIME[GETTIME.length - 2]) : parseInt(GETTIME[0]) || 0) == 12
							? 12
							: 0
						: 0)
			: 23
	)
	date.getMinutes() < new Date().getMinutes() ? (date.getHours() <= new Date().getHours() ? date.setDate() + 1 : 0) : 0
	date.setMinutes(GETTIME ? (GETTIME.length > 1 ? parseInt(GETTIME[GETTIME.length - 1]) : 0) : 59)

	if (GETDATE) {
		switch (GETDATE[GETDATE.length - 1]) {
			case 'tomorrow':
				date.setDate(date.getDate() + 1)
				break
			case 'today':
				date.setDate(date.getDate())
				break
			case 'in a week':
				date.setDate(date.getDate() + 7)
				break
			case 'in a month':
				date.setMonth(date.getMonth() + 1)
				break
			case 'in a year':
				date.setFullYear(date.getFullYear() + 1)
			case 'in a hour':
				date.setHours(date.getHours() + 1)
		}
	}

	const matchedTitle = input
		.replace(GETDATE, '')
		.replace(
			(GETTIME ? (GETTIME.length > 1 ? GETTIME[0] + input.match(/\.|\:/) + GETTIME[1] : GETTIME[0]) : '') +
				(GETPM || GETAM ? input.match(/\:?\.?\ ?/) + (GETPM[0] || GETAM[0]) + input.match(/\:?\.?\ ?/) : ''),
			''
		)
		.replace(matchedUrl, '')
		.replace(/\ *$/, '')

	let returnobj = {
		date: date,
		url: matchedUrl ? 'https://' + matchedUrl.replace(/https?\:\/\//, '') : '',
		title: matchedTitle,
	}
	console.log(returnobj)
	return returnobj
}

function addTask(input) {
	const newTask = parseInput(input)

	chrome.tabs.getSelected(null, function (tab) {
		chrome.storage.sync.get(['tasklist'], function (e) {
			let tasks = e.tasklist
			tasks.push({
				title: newTask.title ? newTask.title : 'Zadanie ' + (tasks.length + 1),
				deadline: '' + newTask.date,
				url: newTask.url ? newTask.url : tab.url ? tab.url : 'https://medium.com/',
				status: 'todo',
			})
			chrome.storage.sync.set({ tasklist: tasks }, () => {
				drawTasks()
				chrome.storage.sync.get(['tasklist'], function (e) {
					console.log(e.tasklist)
				})
			})
		})
		chrome.storage.sync.get(['stats'], function (result) {
			let stats = result.stats
			stats.total++
			chrome.storage.sync.set({ stats: stats }, function (e) {
				console.log(stats)
				console.log(e)
			})
		})
	})
}

$('.add-task-button').click(function (event) {
	let input = $('.add-task-input').val()

	$('.add-task-input').val('')
	updateProgressBar()

	addTask(input)
})

$(this).keydown(function (e) {
	if ($('#lists-tab').hasClass('hidden')) {
		updateNewTaskField(e)
	}
})
