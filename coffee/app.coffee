# Models
Todo = Backbone.Model.extend
  defaults: ->
    completed: false
    starred: false
    dateCreated: new Date
    dateCompleted: null
    sortOrder: app.todos.nextSortOrder()

Todos = Backbone.Collection.extend
  model: Todo
  localStorage: new Store('todos')

  comparator: (todo) ->
    todo.get('sortOrder')

  nextSortOrder: ->
    if @length is 0
      return 0
    else
      return @last().get('sortOrder') + 1

# Views
TodoView = Backbone.View.extend
  tagName: 'li'

  events:
    'click .star': 'toggleStarred'
    'click .completed': 'clickCompleted'
    'dblclick .description': 'editDescription'
    'keyup .edit-field': 'updateDescription'
    'blur .edit-field': 'updateDescription'
    'click .delete': 'deleteTodo'
    'mouseover': 'mouseOverTodo'
    'mouseout': 'mouseOutTodo'

  render: ->
    $(@el).data('id', @model.get('id'))

    $(@el).html($('#todo-list-item').tmpl
      starred: @model.get('starred')
      description: @model.get('description')
      completed: @model.get('completed')
      dateCompleted: (if @model.get('dateCompleted') then @model.get('dateCompleted') else '')
    )

    if @model.get('completed')
      $(@el).addClass('completed')
    else
      $(@el).removeClass('completed')

  toggleStarred: ->
    @model.set(starred: !@model.get('starred'))
    @model.save()
    @render()

  clickCompleted: (e) ->
    completed = $(e.currentTarget).prop('checked')
    @model.set(completed: completed)

    if completed
      @model.set(dateCompleted: (new Date).toISOString())
    else
      @model.set(dateCompleted: null)

    @model.save()
    @render()
    $('.timeago').timeago();

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

  deleteTodo: (e) ->
    e.preventDefault()

    view = this

    $('#dialog-confirm-delete').dialog
      resizable: false
      modal: true
      buttons:
        'Delete': ->
          $(this).dialog('close')
          view.model.destroy()
          $(view.el).slideUp(100, ->
            view.remove()
          )

        'Cancel': ->
          $(this).dialog('close')

  mouseOverTodo: ->
    @$('.delete-div').removeClass('hidden')
    @$('.move-handle').removeClass('invisible')

    if not @model.get('starred')
      @$('.star').css('opacity', 0.5)

  mouseOutTodo: ->
    @$('.delete-div').addClass('hidden')
    @$('.move-handle').addClass('invisible')

    if not @model.get('starred')
      @$('.star').css('opacity', '')

  _setDescription: ->
    description = $.trim(@$('.edit-field').val())
    @model.set(description: description)
    @model.save()
    @render()

window.AppView = Backbone.View.extend
  initialize: ->
    @todos = new Todos
    @todos.bind('add', @addTodo, this)
    @todos.bind('reset', @resetTodos, this)

    @todos.fetch()

    @$('#todos-list').sortable
      handle: '.move-handle'
      update: (e, ui) =>
        newTodos = $.makeArray(@$('#todos-list li')).reverse()

        _(newTodos).each((el, i) ->
          todo = @todos.get($(el).data('id'))
          todo.set(sortOrder: i)
          todo.save()
        )

        @todos.sort(silent: true)

    if @todos.length is 0
      $('#empty-message').show()

  events:
    'keyup #new-task-field': 'newTask'

  newTask: (e) ->
    $newTaskField = $(e.currentTarget)

    if e.keyCode isnt 13 or $newTaskField.val() is ''
      return

    todo = new Todo(description: $newTaskField.val())
    @todos.create(todo)
    $newTaskField.val('')

    $('#empty-message').hide()

  addTodo: (todo) ->
    todoView = new TodoView(model: todo)      
    todoView.render()

    # animate adding to list
    el = $(todoView.el)
    el.hide()
    $('#todos-list').prepend(el)
    el.slideDown(100)

  resetTodos: ->
    @todos.each (todo) =>
      @addTodo(todo)
