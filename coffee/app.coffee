# Models
Todo = Backbone.Model.extend
  defaults: ->
    completed: false
    dateCreated: new Date

Todos = Backbone.Collection.extend
  model: Todo
  localStorage: new Store('todos')

# Views
TodoView = Backbone.View.extend
  tagName: 'li'

  events:
    'click .completed': 'clickCompleted'

  render: ->
    $(this.el).html($('#todo-list-item').tmpl(description: this.model.get('description')))

  clickCompleted: (e) ->
    # TODO: set completed
    alert('TODO');

AppView = Backbone.View.extend
  initialize: ->
    app.todos.bind('add', @addTodo, this)

  events:
    'keyup #new-task-field': 'newTask'

  newTask: (e) ->
    $newTaskField = $(e.currentTarget)

    if e.keyCode isnt 13 or $newTaskField.val() is ''
      return

    todo = new Todo(description: $newTaskField.val())
    app.todos.create(todo)
    $newTaskField.val('')

  addTodo: (todo) ->
    todoView = new TodoView(model: todo)      
    todoView.render()
    $('#todos-list').append(todoView.el);

# the main app
window.app =
  views: {}

  init: ->
    app.todos = new Todos
    app.views.appView = new AppView(el: $('#dodo-container'))
