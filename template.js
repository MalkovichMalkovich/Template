
var Template =
{
	debug: false,
	blocks: {},
	vars: {},
	pub: {},
	blocksPattern: /\[([A-Z0-9_\.]+?)\](.*?)\[\/\1\]/gim,

	preProcessors:
	{
		basic: function(text)
		{
			text = text.replace(/<\!--[\s\S]*?-->|\r|\t|\n|\s{2,}/gm, ''); // Remove all new lines, tabs, double spaces and html comments
			text = text.replace(/#\{(.+?)\}/gi, "<!--|--><!--$1--><!--|-->"); // Tokenize

			return text;    
		},

		logicBlocks: function(text)
		{
			text = text.replace(/<if\s+(.+?)>/gi, "<!--|--><!--function(){if($1) {return [''--><!--|-->"); // if
			text = text.replace(/<\/if>\s*?<else if\s+(.+?)>/gi, "<!--|--><!--''].join('')} else if ($1) {return [''--><!--|-->"); // else if
			text = text.replace(/<\/if>\s*?<else>/gi, "<!--|--><!--''].join('')} else {return [''--><!--|-->"); // else
			text = text.replace(/<\/(if|else)>/gi, "<!--|--><!--''].join('')}}.call(this)--><!--|-->");

			return text;    
		},

		loopBlocks: function(text)
		{
			// foreach loop
			text = text.replace(/<foreach\s+(.+?)>/gi, "<!--|--><!--function(p){var t=p, _r=[], _t=$1; if (_t && _t.length){for(var i=0, l=_t.length; i<l; i++){t=_t[i]; t._parent=p; t._index = i; _r.push([''--><!--|-->");
			text = text.replace(/<\/foreach>/gi, "<!--|--><!--''].join(''));} return _r.join('')}}.call(this, t)--><!--|-->");

			// for loop
			text = text.replace(/<for\s+(.+?)>/gi, "<!--|--><!--function(){var _r=[]; for($1){_r.push([''--><!--|-->");
			text = text.replace(/<\/for>/gi, "<!--|--><!--''].join(''));} return _r.join('')}.call(this)--><!--|-->");

			return text;    
		},

		scriptBlocks: function(text)
		{
			return text.replace(/<script(?:\s.+?)?>(.*?)<\/script>/gim, "<!--|--><!--function(){$1}.call(this)--><!--|-->"); 
		},

		linkedBlocks: function(text)
		{
			return text.replace(/<@(.+?)(?:\s+(.+?))?\s?\/>/gi, function(match, p1, p2)
			{
				return (p2) ? "<!--|--><!--this._rd('"+p1+"', "+p2+")--><!--|-->" : "<!--|--><!--this._rd('"+p1+"', t."+p1+"||t)--><!--|-->";
			});    
		},    
	},

	initialize: function(rawData) 
	{               
		this.pub = 
		{
			_fv: this.findVar, 
			_rd: this.render,
			vars: this.vars,
			blocks: this.blocks
		};

		if (rawData)
		{
			this.add(rawData);    
		}   
	},

	add: function(rawData)
	{
		if (typeof rawData === 'string')
		{
			this.compile(this.parse(rawData));    
		}
		else
		{
			this.compile(rawData);    
		}
	},

	findVar: function(hayStack, needle)
	{
		if (hayStack[needle])
		{
			return hayStack[needle];
		}
		else if (hayStack._parent)
		{
			return this._fv(hayStack._parent, needle);	
		}
		else
		{
			return '';
		}
	},

	parse: function(rawData)
	{
		var parsedBlocks = {};
		var foundBlock = null;
		var rawBlock, parsedBlock, tokenName;

		for (var processor in this.preProcessors)
		{
			if (this.preProcessors.hasOwnProperty(processor))
			{
				rawData = this.preProcessors[processor](rawData);     
			}
		}

		do
		{
			foundBlock = this.blocksPattern.exec(rawData);

			if (foundBlock)
			{       
				rawBlock = foundBlock[2]; // Block's raw text
				parsedBlock = [];

				rawBlock = rawBlock.split('<!--|-->');

				for (var i=0, l=rawBlock.length; i<l; i++)
				{ 
					if (i%2 === 1)
					{
						tokenName = rawBlock[i].substring(4, rawBlock[i].length-3);

						tokenName = tokenName.replace(/\$([A-Z0-9_\.]+)/gi, "t.$1");
						tokenName = tokenName.replace(/\@([A-Z0-9_\.]+)/gi, "this._fv(t, '$1')");
						tokenName = tokenName.replace(/\^([A-Z0-9_\.]+)/gi, "this.vars.$1");

						parsedBlock.push(tokenName);    
					}
					else
					{   
						if (rawBlock[i])
						{
							parsedBlock.push("'"+rawBlock[i].replace(/'/g, "\\'")+"'");
						}        
					}
				}

				parsedBlocks[foundBlock[1]] = 't._parent = this.vars; return ['+parsedBlock.join(',')+'].join("");';
			}
		}
		while (foundBlock);

		return parsedBlocks;
	},

	compile: function(blocks)
	{
		for(var blockName in blocks)
		{
			if (blocks.hasOwnProperty(blockName))
			{
				this.blocks[blockName] = new Function('t', blocks[blockName]);     
			}
		}
	},

	render: function(name, data)
	{
		data = data || {};

		if (this.blocks[name])
		{
			return this.blocks[name].call(this.pub, data);
		}    
	}
};
