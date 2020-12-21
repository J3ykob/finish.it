let blacklist = ['facebook', 'youtube']
let goodlist = ['https://portal.librus.pl/rodzina']

chrome.storage.sync.set({ goodlist: ['https://portal.librus.pl/rodzina'] }, function () {
	console.log('Value is set to ' + ['https://portal.librus.pl/rodzina'])
})

chrome.webNavigation.onCommitted.addListener(
	function () {
		let goodList = []
		chrome.storage.sync.get(['goodlist'], function (e) {
			goodList = e
		})
		let inside = `window.location = "${goodList[Math.floor(Math.random() * goodList.length - 1)]}"`
		chrome.tabs.executeScript({
			code: inside,
		})
	},
	{
		url: blacklist.map((e, i) => {
			console.log(e)
			return {
				urlContains: e,
			}
		}),
	}
)
