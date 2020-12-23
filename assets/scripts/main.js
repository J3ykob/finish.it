$(document).ready(function () {
	chrome.storage.sync.get(['tasklist'], function (result) {
		console.log('Value currently is ' + result.tasklist[0].title)
		var html = result.tasklist.map(function (e) {
			return `
                <li>${e.title}</li>
                `
		})
		$('#todo-tab ul').html(html)
	})
})

chrome.storage.onChanged.addListener(function (e) {
	chrome.storage.sync.get(['tasklist'], function (result) {
		console.log('Value currently is ' + result.tasklist[0].title)
		var html = result.tasklist.map(function (e) {
			return `
                    <li>${e.title}</li>
                    `
		})
		$('#todo-tab ul').html(html)
	})
})

$('.menu-button').click(function (event) {
	var self = event.target.id
	console.log(self)
	$('#wrapper').removeClass()
	$('#wrapper').addClass(self)
})

$('.menu-side-button').click(function (event) {
	var self = event.target.id + '-tab'
	$('.menu-side-button').removeClass('active')
	$(this).addClass('active')
	console.log(self)
	$('.tab').addClass('hidden')
	$('#' + self).removeClass('hidden')
})
$('.add-task-button').click(function (event) {
	let input = $('.add-task-input').val()

	let keyword = ['tomorrow', 'today', 'at', 'by', 'due', 'till', 'in', 'in a', 'since', 'untill']
	let urlkeyword = ['.pl', '.org', '.gov', '.com', '.eu', '.edu', '.it', '.io']

	let matchedTitle = input.split(' ')[0]

	let matchedUrl = urlkeyword.forEach((e, i) => {
		if (input.search(e) > 0) {
			return input.split(e)[0].split(' ')[1] + e + input.split(e)[1].split(' ')[0]
		}
	})

	let date = new Date()

	let rd = new RegExp('tomorrow|today', 'g')

	if (
		input.match(/((?<=(\:|\.))[0-9]{2}|([0-9](?=(\:|\.)))|[0-9](?=[paPA][Mm])|(?<=(by|at|till)\ )[0-9]|$(\ [0-9]\ ))/g)
	) {
		let match = input.match(
			/((?<=(\:|\.))[0-9]{2}|([0-9](?=(\:|\.)))|[0-9](?=[paPA][Mm])|(?<=(by|at|till)\ )[0-9]|$(\ [0-9]\ ))/g
		)
		let pm = input.match(/[0-9](?=[pPmM])/g)

		date.setMinutes(match[1] ? match[1] : 0)
		date.setHours(parseInt(match[0]) + (pm ? 12 : 0))
		console.log(match[0], match[1], match, date)
	}

	if (input.match(rd)) {
		let match = input.match(rd)
		console.log(match)
		switch (match[0]) {
			case 'tomorrow':
				date.setDate(date.getDate() + 1)
				break
			case 'today':
				break
			default:
				break
		}
	}
	chrome.storage.sync.get(['tasklist'], function (e) {
		let tasks = e.tasklist
		tasks.push({
			title: matchedTitle ? matchedTitle : 'Zadanie ' + (tasks.length + 1),
			deadline: date,
			url: matchedUrl ? matchedUrl : 'https://medium.com/',
		})
		chrome.storage.sync.set({ tasklist: tasks }, () => {
			chrome.storage.sync.get(['tasklist'], function (e) {
				console.log(e.tasklist)
			})
		})
	})
})
