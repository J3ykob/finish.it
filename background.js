let blacklist = ['facebook', 'youtube']
let goodlist = ['https://portal.librus.pl/rodzina']

let task = {
	title: 'Zadanie 1',
	deadline: Date.now(),
	url: 'https://portal.librus.pl/rodzina',
}
let task2 = {
	title: 'Zadanie 2',
	deadline: new Date().setHours(23),
	url: 'https://portal.librus.pl/rodzina',
}

chrome.storage.sync.set({ goodlist: [task, task2] }, function () {
	console.log('Value is set to ' + [task, task2])
})

chrome.webNavigation.onCommitted.addListener(
	function (d) {
		chrome.storage.sync.get(['goodlist'], function (e) {
			let goodList = e.goodlist

			let p = Math.min.apply(
				null,
				goodList.map((e) => {
					return Date.now() - e.deadline
				})
			)
			chrome.tabs.update(d.tabId, {
				url: goodList.find((e) => {
					return Date.now() - e.deadline == p
				}).url,
			})
		})
	},
	{
		url: blacklist.map((e) => {
			console.log(e)
			return {
				urlContains: e,
			}
		}),
	}
)
