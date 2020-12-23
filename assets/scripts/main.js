$(document).ready(
    function()
    {
        chrome.storage.sync.get(['tasklist'], function(result) {
            var html = result.tasklist.map(function(e)
            {
                var unit;
                var left = e.deadline - Date.now();
                if(Math.abs(left)>3600000*24*14)
                {
                    left = Math.floor(left/(3600000*24*14));
                    unit = ' weeks';
                }
                else if(Math.abs(left)>3600000*24)
                {
                    left = Math.floor(left/(3600000*24));
                    unit = ' days';
                }
                else if (Math.abs(left)>3600000)
                {
                    left = Math.floor(left/3600000);
                    unit = ' hours';
                }
                else if(Math.abs(left)>=0)
                {
                    left = Math.floor(left/60000);
                    unit = ' minutes'
                }
                if (left>0)
                {
                    left += unit;
                    return `
                    <li class="task on-time">${e.title}
                        <br><span>
                    ${left}
                    </span>
                    </li>
                    `;
                }
                else 
                {
                    left = "Late by " + -1*left + unit;
                    return `
                    <li class="task late">${e.title}
                        <br><span>
                    ${left}
                    </span>
                    </li>
                    `;
                }
                
            })
            $('#todo-tab ul').append(html);
          });

          chrome.storage.sync.get(['blacklist'], function(result) {
          var html = result.blacklist.map(function(e)
          {
              return `
              <li id="${e}" class="blacklisted">
                ${e.split('www.')[1].split('/')[0]}
              </li>
              `;
          });
          $('#lists-tab ul').append(html);
        });
    }
)

$(".menu-button").click(
    function(event)
    {
        var self = event.target.id;
        console.log(self);
        $("#wrapper").removeClass();
        $("#wrapper").addClass(self);
    }
)

$(".menu-side-button").click(
    function(event)
    {
        var self = event.target.id + "-tab";
        $(".menu-side-button").removeClass("active");
        $(this).addClass("active");
        console.log(self);
        $(".tab").addClass("hidden");
        $("#"+self).removeClass("hidden");
        if(self=="lists-tab")
        {
            $("#wrapper").removeClass().addClass("dark");
        }
        else 
        {
            $("#wrapper").removeClass().addClass("white");
        }
    }
)

$(".tab").on("click", "li", function(event){
    event.preventDefault();
    new Audio('assets/sounds/woosh.mp3').play()
    $(this).addClass("hidden-li").delay(250).queue(function(next)
    {
        $(this).addClass("hidden");
        next();
    });
});

$('#working-time select').change(function(e)
{
    var name=$(this).attr('id');
    var selected = $(this).val();
    chrome.storage.sync.set({name: selected});
})

$('#working-time input').change(function(e)
{
    var name=$(this).attr('id');
    var selected = $(this).val();
    chrome.storage.sync.set({name: selected});
})

$(".add-bl").click(function()
{
    chrome.tabs.getSelected(null, function(tab){
        var url = tab.url;
        chrome.storage.sync.get(['blacklist'], function(result)
        {
            result.blacklist.push(url);
            chrome.storage.sync.set({blacklist:result.blacklist});
        })
    });
})

$("#lists-tab").on("click", "li", function(e){
    e.preventDefault();
    url = $(this).attr('id');
    chrome.storage.sync.get(['blacklist'], function(result){
    const isDeleted = (element) => element == url;
    var index = result.blacklist.findIndex(isDeleted);
    result.blacklist.splice(index, 1);
    console.log(index);
    console.log(url);
    chrome.storage.sync.set({blacklist:result.blacklist})
    })
})






chrome.storage.onChanged.addListener(function (e) {
	chrome.storage.sync.get(['blacklist'], function(result) {
        var html = result.blacklist.map(function(e)
        {
            return `
            <li class="blacklisted">
              ${e.split('www.')[1].split('/')[0]}
            </li>
            `;
        });
        $("#lists-tab ul").empty();
        $('#lists-tab ul').append(html);
    })
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
