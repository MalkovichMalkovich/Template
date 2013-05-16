var Template =
{
	blocks: {},
	vars: {},
	pub: {},
	blocksPattern: /\[([A-Z0-9_\.]+?)\](.*?)\[\/\1\]/gim,
	
	preProcessors:
	{
		cleaning: [/<\!--[\s\S]*?-->|\r|\t|\n|\s{2,}/gm, ''],
		tokens: [/#\{(.+?)\}/gi, "<!--|--><!--$1--><!--|-->"],
		ifTag: [/<if\s+(.+?)>/gi, "<!--|--><!--function(){if($1) {return [''--><!--|-->"],
		elseIfTag: [/<\/if>\s*?<else if\s+(.+?)>/gi, "<!--|--><!--''].join('')} else if ($1) {return [''--><!--|-->"],
		elseTag: [/<\/if>\s*?<else>/gi, "<!--|--><!--''].join('')} else {return [''--><!--|-->"],
		ifElseCloseTag: [/<\/(if|else)>/gi, "<!--|--><!--''].join('')}}.call(this)--><!--|-->"],
		foreachTag: [/<foreach\s+(.+?)(?:\s+in\s+(.+?)(?:\s+as\s+(.+?))?)?>/gi, function(match, p1, p2, p3)
		{
			p3 = p3 || 't._item'; // iterrated item variable name
			p2 = p2 || p1; // iterated structure variable name
			p1 = p1 || 't._index'; // iterrator index name
			
			return "<!--|--><!--function(struct){var t=struct, _t="+p2+", _r=[]; if (_t && _t.length){for(var i=0, l=_t.length; i<l; i++){t=_t[i]; t._parent=struct; "+p1+" = i; "+p3+" = t; _r.push([''--><!--|-->";
		}],
		foreachCloseTag: [/<\/foreach>/gi, "<!--|--><!--''].join(''));} return _r.join('')}}.call(this, t)--><!--|-->"],
		forTag: [/<for\s+(.+?)>/gi, "<!--|--><!--function(){var _r=[]; for($1){_r.push([''--><!--|-->"],
		forCloseTag: [/<\/for>/gi, "<!--|--><!--''].join(''));} return _r.join('')}.call(this)--><!--|-->"],
		scriptTag: [/<script(?:\s.+?)?>(.*?)<\/script>/gim, "<!--|--><!--function(){$1}.call(this)--><!--|-->"],
		linkedBlockTag: [/<@(.+?)(?:\s+(.+?))?\s?\/>/gi, function(match, p1, p2)
		{
			return (p2) ? "<!--|--><!--this._rd('"+p1+"', "+p2+")--><!--|-->" : "<!--|--><!--this._rd('"+p1+"', t."+p1+"||t)--><!--|-->";
		}]	
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

	parse: function(rawData)
	{
		var parsedBlocks = {};
		var foundBlock = null;
		var preProcessor, rawBlock, parsedBlock, tokenName;

		for (var name in this.preProcessors)
		{
			if (this.preProcessors.hasOwnProperty(name))
			{
				preProcessor = this.preProcessors[name];  
				rawData = rawData.replace(preProcessor[0], preProcessor[1]);     
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
};
