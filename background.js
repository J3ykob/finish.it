let blacklist = ['https://www.facebook.com/', 'https://www.youtube.com/']
let workhours = [480, 960, 1, 5]

// let task = {
// 	title: 'Zadanie 1',
// 	deadline: '' + new Date(),
// 	url: 'https://portal.librus.pl/rodzina',
// 	status: 'todo',
// }
// let task2 = {
// 	title: 'Zadanie 2',
// 	deadline: '' + new Date(),
// 	url: 'https://portal.librus.pl/rodzina',
// 	status: 'todo',
// }

// let stats = {
// 	total: 2,
// 	done: 0,
// }

// chrome.storage.sync.set({ tasklist: [task, task2] }, function () {
// 	console.log('Value is set to ' + [task, task2])
// })
// chrome.storage.sync.set({ blacklist: blacklist })
// chrome.storage.sync.set({ workhours: workhours })
// chrome.storage.sync.set({ stats: stats })

chrome.webNavigation.onCommitted.addListener(
	function (d) {
		chrome.storage.sync.get(['workhours'], function (e) {
			let ct = new Date().getMinutes() + new Date().getHours() * 60
			let cd = new Date().getDay()
			console.log(ct, cd, e.workhours)
			if (ct > e.workhours[0] && ct < e.workhours[1] && e.workhours[2] <= cd && e.workhours[3] >= cd) {
				var blacklist = []
				chrome.storage.sync.get(['tasklist'], function (e) {
					let goodList = e.tasklist

					let g = goodList.find((e) => {
						const now = Date.now()
						return (
							Math.abs(now - new Date(e.deadline).getTime()) ==
							Math.min.apply(
								null,
								goodList.flatMap((e) => {
									return e.status == 'todo' ? Math.abs(now - new Date(e.deadline).getTime()) : []
								}, [])
							)
						)
					})
					console.log(
						goodList.flatMap((e) => {
							return e.status == 'todo' ? Math.abs(Date.now() - new Date(e.deadline).getTime()) : []
						}, []),
						g
					)

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
