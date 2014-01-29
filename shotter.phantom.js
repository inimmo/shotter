var
	page = require('webpage').create(),
	system = require('system'),
	fs = require('fs'),
	config_filename = system.args[1],
	config = null
;

if (!config_filename)
{
	console.log("Usage: phantomjs shotter.js <config_file>");
	phantom.exit(1);
}

config = JSON.parse(fs.read(config_filename));

if (!fs.exists(config.output_dir))
{
	fs.makeDirectory(config.output_dir);
}

page.onConsoleMessage = function(msg, line, source) { console.log(msg); };

page.open(config.target_url, function (status) {
	if (status !== 'success')
	{
		phantom.exit(1);
	}
	
	setTimeout(function () {
		var shots = page.evaluate(function (selectors) {
			var elem;
			
			for (var i = 0; i < selectors.length; i++)
			{
				elem = document.querySelectorAll(selectors[i].css_selector)[0];
				
				if (elem)
				{
					selectors[i].clip_rect = elem.getBoundingClientRect();
				}
			}
			
			return selectors;
		}, config.selectors);
		
		for (var i = 0; i < shots.length; i++)
		{
			page.clipRect = shots[i].clip_rect;
			page.render(config.output_dir + '/' + shots[i].descriptor + '.png');
		}
		
		phantom.exit(0);
	}, 200);
});
