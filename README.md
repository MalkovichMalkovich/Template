#Template.js#
A light-weight client-side Javascript templating engine

Template.js is small (less than 6KB uncompressed) and extremely fast. It can be easily integrated into your favorite Javascript framework or used as a standalone. Template.js is great for small and large projects.


###How to use it###
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
