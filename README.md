#Template.js#
A light-weight client-side Javascript templating engine

Template.js is small (less than 6KB uncompressed) and extremely fast. It can be easily integrated into your favorite Javascript framework or used as a standalone. Template.js is great for small and large projects.


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

Above is a basic example of initializing Template.js with a small template containing one *block* ([example]...[/example]) that contains two *tokens*. The template is then rendered vie the `Template.render` function that takes two parameters - the name of the block (`'example'`) and the view object (`view`) containing the values for the tokens.


**Please note:** Template.js is just a templating engine and will not load template texts for you, so you'll have to do it manually using ajax or any other technique to retrieve large ammounts of text. Here's an example using *jQuery's* ajax implementation:
```javascript
$.get('my_template.tpl', function(result)
{
	Template.initialize(result);
	var output = Template.render('...', view);
});
```

##Blocks##
Templates are made of blocks. Blocks are slices of HTML and Template.js tags and tokens. Output is made by combining blocks or by using each block induvidualy via the `Template.render` function. 
Its best to regard blocks as functions (which they are by the way), they can accept view structures and can be linked inside other blocks.

Let's take a simple template made from 3 blocks:
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

Let's initialize Template.js with this template (we'll assign it to `templateText` variable):
```javascript
Template.initialize(templateText);
```

Now, that we have our template compiled, let's render it with the data from the `view` structure:
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
