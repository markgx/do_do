# Models
Todo = Backbone.Model.extend
  defaults: ->
    completed: false
    dateCreated: new Date

Todos = Backbone.Collection.extend
  model: Todo
  sessionStorage: new Store('todos')

# Views
TodoView = Backbone.View.extend
  tagName: 'li'

  events:
    'click .completed': 'clickCompleted'
    'dblclick .description': 'editDescription'
    'keyup .edit-field': 'updateDescription'
    'blur .edit-field': 'updateDescription'

  render: ->
    $(@el).html($('#todo-list-item').tmpl
      description: @model.get('description')
      completed: @model.get('completed')
    )

    if @model.get('completed')
      $(@el).addClass('completed')
    else
      $(@el).removeClass('completed')

  clickCompleted: (e) ->
    @model.set(completed: $(e.currentTarget).prop('checked'))
    @model.save()
    @render()

  editDescription: ->
    @$('.description').addClass('hidden')
    @$('.edit-field').val(@model.get('description'))
    @$('.edit').removeClass('hidden')
    @$('.edit-field').focus()

    # set cursor at end of textbox
    description = @$('.edit-field').val()
    @$('.edit-field').val('')
    @$('.edit-field').val(description)

  updateDescription: (e) ->
    if e.type is 'focusout'
      @_setDescription()
      return
    else if e.type is 'keyup'
      if e.keyCode is 13 # enter
        @_setDescription()
      else if e.keyCode is 27 # escape
        @$('.edit').addClass('hidden')
        @$('.description').removeClass('hidden')

  _setDescription: ->
    description = $.trim(@$('.edit-field').val())
    @model.set(description: description)
    @model.save()
    @render()

AppView = Backbone.View.extend
  initialize: ->
    app.todos.bind('add', @addTodo, this)
    app.todos.bind('reset', @resetTodos, this)

    app.todos.fetch()

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

  resetTodos: ->
    app.todos.each (todo) =>
      @addTodo(todo)

# the main app
window.app =
  views: {}

  init: ->
    app.todos = new Todos
    app.views.appView = new AppView(el: $('#dodo-container'))
