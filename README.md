#Template.js#
A light-weight client-side Javascript templating engine

Template.js is small (4KB uncompressed) and extremely fast. It can be easily integrated into your favorite Javascript framework or used as a standalone. Template.js is great for small and large projects.


##How to use it##
```javascript
Template.initialize('[example]Hello #{$place}, my name is #{$name}.[/example]');

var view = 
{
	place: 'world',
	name: 'Archie'
}
var output = Template.render('example', view); // Hello world, my name is Archie.
```

Above is a basic example of initializing Template.js with a small template containing one `block` ([example]...[/example]) that contains two `tokens`. The template is then rendered via the `Template.render()` function that takes two parameters - the name of the block (`'example'`) and the view object (`view`) containing the values for the tokens.


**Please note:** Template.js is just a templating engine and will not load template texts for you, so you'll have to do it manually using ajax or any other technique to retrieve large ammounts of text. Here's an example using [*jQuery's*](http://jquery.com) ajax implementation:
```javascript
$.get('my_template.tpl', function(result)
{
	Template.initialize(result);
	var output = Template.render('...', view);
});
```

##Blocks##
Templates are made of blocks. Blocks are slices of HTML and Template.js tags and tokens. Output is made by combining blocks or by using each block induvidualy via the `Template.render()` function. 
Its best to regard blocks as functions (which they are by the way), they can accept view structures and can be linked inside other blocks.

Let's take a simple template made from 3 blocks: `body`, `header` and `footer`
```html
[body]
	<@header/>
	<h1>#{$title}</h1>
	<p>The is the body of the website</p>
	<@footer {year: new Date().getYear()}/>
[/body]

[header]
	<div>Hello, #{$name}</div>
[/header]

[footer]
	<div>The year is: #{$year}</div>
[/footer]
```
As we can see, the `body` block have [linked block tags](#blocks) to blocks `header` and `footer`, effectively placing their content inside the `body` block.

We'll initialize Template.js with this template (we'll assign it to `templateText` variable):
```javascript
Template.initialize(templateText);
```

Now, that we have our template compiled, we'll render it with the data from the `view` structure:
```javascript
var view = 
{
	title: 'My first real template'
	header:
	{
		name: 'Archie'
	}
};

var output = Template.render('templateText', view);
```
The resulting value of the `output` variable will be:
```html
<div>Hello, Archie</div>
<h1>My first real template</h1>
<p>The is the body of the website</p>
<div>The year is: 2013</div>
```
**Please note:** Template.js is just a templating engine and will not escape, validate or in any way transform the data you provide it with. It is up to you to make sure the data is properly handeled before providing it to the `Template.render()` function.


##Tokens##
Tokens are basic template constructs. Tokens contain [variables](#variables) and can include basic logical and mathematical operations or even Javascript functions.
Here are some of the possible operations you can do with tokens:
* `#{$variable}` and `#{$variable.childVariable}` The most basic token construct, outputs the value of `variable` or `variable.childVariable` to the template or an empty string if not set, false or null.
* `#{$variable || 'default value'}` Same as the previous, but will return '*default value*' string if `variable` not set, empty false or null.
* `#{Math.abs($variable1 + $variable2)}` Will return the absolute sum of `variable1` and `variable2`.
* `#{$light == 'red' ? 'stop' : 'go'}` Will return '*stop*' if `light` equals '*red*', otherwise will return '*go*'.
* `#{$text.replace(/\b(https?:\/\/.+?)\b/gim, '<a href="$1">$1</a>')}` Will replace all urls in `text` with anchor tags.

Other combinations are also possible, just use your imagination.


##Variables##
Variables represent values of the view structure where the name of the variable represents the corresponding key name in the view structure. Variables can be set, modified, removed and searched for. Variables are discarded once `Template.render()` completed its job. To preserve variables and their values in the template, Template.js has a "global" variables structure `Template.vars` that is used to keep values over multiple render operations.
Possible variable types:
* `$variable`, `$variable.childVariable` or `$variable['childVariable']` Local variable, will take the value of the corresponding key in the [scope](#scope) of the provided view structure
* `@variable` Inherited variable, will recursively search for the corresponding key up the view substructure tree and finaly in the `Template.vars` structure. Read more about [variable scoping](#scope
* `^variable`, `^variable.childVariable` or `^variable['childVariable']` Global template variable, will take the value of the corresponding key in the `Template.vars` structure. Changes made to global template variables are kept over multiple render operations.
* `variable` Javascript variable defined in the global scope of `window` or the current [tag](#tags)


##Tags##
Template.js supports several tags that enable you to dynamicaly modify or add content to the rendered block. Tags allow logical operations, looping and block linking.
###IF, ELSE IF, ELSE tags###
```html
<if $light == 'red'>
	Wait angrilly
</if>
<else if $light == 'yellow'>
	Start honking the guy infront of you
</if>
<else>
	Drive
</else>
```
`id`, `else if` and `else` tags can be nested

###FOR and FOR IN loops ###
```html
<ul>
	<for var i=0; i<10; i++>
		<li>I am number #{i}</li>
	</for>		
</ul>

<ul>
	<for var index in $people>
		<li>My name is #{$people[index].name}</li>
	</for>		
</ul>
```

###FOREACH loop ###
The `foreach` loop allows you to quickly iterate over the desired view sub-structure. 
```html
<ul>
	<foreach $items>
		<li>I am number #{i}</li>
	</foreach>		
</ul>
```

**Take note:** All tags are functions that perform at runtime, therefore excesive or incorrect usage may penalty rendering performance. Use them wisely. 
