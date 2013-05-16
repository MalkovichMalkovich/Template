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
* `$variable`, `$variable.childVariable` or `$variable['childVariable']` **Local variable**, will take the value of the corresponding key in the [scope](#scope) of the provided view structure
* `@variable` **Inherited variable**, will recursively search for the corresponding key up the view substructure tree and finaly in the `Template.vars` structure. Read more about [variable scoping](#scope)
* `^variable`, `^variable.childVariable` or `^variable['childVariable']` **Global template variable**, will take the value of the corresponding key in the `Template.vars` structure. Changes made to global template variables are kept over multiple render operations.
* `variable` a regular Javascript variable defined in the global scope of `window` or the current [tag](#tags)


##Tags##
Template.js supports several tags that enable you to dynamicaly modify or add content to the rendered block. Tags allow logical operations, looping and block linking.
**Please note:** All tags are functions that perform at runtime, therefore excesive or incorrect usage may penalty rendering performance. Use them wisely. 

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
The `foreach` loop allows you to quickly iterate over the desired view substructure array. The `foreach` loop tag is somewhat different than the other loop tags as it will shift the [scope](#scope) to the provided view substructure array item. 
Let's create a simple view structure with nested substructure array for our `foreach` tag to iterate on:
```javascript
var view = 
{
	people:
	[
		{name: 'John', age: 31},
		{name: 'Jim', age: 42},
		{name: 'Jake', age: 25},
	]
}
```

There are 3 ways to itterate over substructures.
```html
<ul>
	<foreach $people>
		<li>My name is #{$name}, my age is #{$age}</li>
	</foreach>		
</ul>
```
In this example we provide a single `$people` array to the `foreach` tag to itterate over.

```html
<ul>
	<foreach $index in $people>
		<li>#{$index}. My name is #{$name}, my age is #{$age}</li>
	</foreach>		
</ul>
```
Here we have assigned a name to our itterator index (`$index`) so now we can use it as a [local variable](#variables) in the [scope](#scope) of our current substructure array item. If the index name is not set, it will take a default name `$_index`.

```html
<ul>
	<foreach $index in $people as $person>
		<li>#{$index+1}. My name is #{$name}, my age is #{$person['age']}</li>
	</foreach>		
</ul>
```
We have added an additional variable `$person` to our `foreach` tag. This variable is our current array item, so we can access its keys explicitly within the tag or any nested tags or [linked blocks](#linked_block).

Once again, the `foreach` loop will shift the [scope](#scope) to the current substructure array item, so in order to access values from the parent structure, we need to use [inherited variables](#variables) (`@variable`).

###Linked block tag###
As their name suggests, `linked blocks` are [template blocks](#blocks) that render inside the block we are currently rendering. 

Consider the following view structure:
```javascript
var view = 
{
	name: 'Archie',
	place: 'somewhere',
	header:
	{
		place: 'world'
	},
	foo:
	{
		year: 2013
	}
}
```
Now, let's look at our template:
```html
[main]
	<@header>
	<div>My name is #{$name}</div>
	<@footer>
[/main]

[header]
	<h1>Hello, #{$place}!</h1>
[/header]

[footer]
	<div>The year is: #{$year}</div>
[/footer]
```

When rendered, linked tags will try to use a view substructure with the `linked block's` name as its key. If no such substructure exists, the `linked block` will use the parent structure, so the resulring output will be:
```html
<h1>Hello, world!</h1>
<div>My name is Archie</div>
<div>The year is:</div>
```
But, if we are to remove the `header` substructure from our view, the result will be:
```html
<h1>Hello, somewhere!</h1>
<div>My name is Archie</div>
<div>The year is:</div>
```

We can also explicitlly assign structure data to our `linked block`:
```html
<@header {place: 'here'}>
<div>My name is #{$name}</div>
<@header $foo>
```
Will result in:
```html
<h1>Hello, here!</h1>
<div>My name is Archie</div>
<div>The year is: 2013</div>
```
