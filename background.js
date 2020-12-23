let blacklist = ['https://www.facebook.com/', 'https://www.youtube.com/']
let goodlist = ['https://portal.librus.pl/rodzina']
let workhours = [480, 960]

let task = {
    title: 'Zadanie 1',
    deadline: new Date().setMonth(2),
    url: 'https://portal.librus.pl/rodzina',
}
let task2 = {
	title: 'Zadanie 2',
	deadline: new Date().setHours(23),
	url: 'https://portal.librus.pl/rodzina',
}

chrome.storage.sync.set({ tasklist: [task, task2] }, function () {
	console.log('Value is set to ' + [task, task2])
})
chrome.storage.sync.set({ blacklist: blacklist })
chrome.storage.sync.set({ workhours: workhours })

chrome.webNavigation.onCommitted.addListener(
	function (d) {
		chrome.storage.sync.get(['workhours'], function (e) {
			let ct = new Date().getMinutes() + new Date().getHours() * 60
			console.log(ct, e.workhours)
			if (ct > e.workhours[0] && ct < e.workhours[1]) {
				var blacklist = []
				chrome.storage.sync.get(['tasklist'], function (e) {
					let goodList = e.tasklist

					let p = Math.min.apply(
						null,
						goodList.map((e) => {
							return Date.now() - e.deadline
						})
					)

					let g = goodList.find((e) => {
						return Date.now() - e.deadline == p
					})

					chrome.tabs.update(d.tabId, {
						url: g.url,
					})
				})
				chrome.storage.sync.get(['blacklist'], function (e) {
					blacklist = e.blacklist
				})
			}
		})
	},
	{
		url: blacklist.map((e) => {
			return {
				urlEquals: e,
			}
		}),
	}
)
