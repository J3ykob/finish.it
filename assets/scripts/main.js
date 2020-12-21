$('.menu-button').click(function (event) {
	var self = event.target.id
	console.log(self)
	$('#wrapper').removeClass()
	$('#wrapper').addClass(self)
})

$('.menu-side-button').click(function (event) {
	var self = event.target.id + '-tab'
	console.log(self)
	$('.tab').addClass('hidden')
	$('#' + self).removeClass('hidden')
})

$('.add-task-button').click(function (event) {
	let title = $('.add-task-title').val()
	let deadline = $('.add-task-deadline').val()
	let url = $('.add-task-url').val()
	chrome.storage.sync.get(['tasklist'], function (e) {
		let tasks = e.tasklist
		tasks.push({
			title: title ? title : 'Zadanie ' + (tasks.length + 1),
			deadline: deadline ? deadline : Date.now(),
			url: url ? url : 'https://medium.com/',
		})
		chrome.storage.sync.set({ tasklist: tasks }, () => {
			chrome.storage.sync.get(['tasklist'], function (e) {
				console.log(e.tasklist)
			})
		})
	})
})
