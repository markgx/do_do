var Todo = Backbone.Model.extend({
  defaults: function() {
    return {
      completed: false,
      dateCreated: new Date
    };
  }
});

var Todos = Backbone.Collection.extend({
  model: Todo,
  localStorage: new Store("todos")
})

var TodoView = Backbone.View.extend({
  tagName: 'li',

  events: {
    'click .completed': 'clickCompleted'
  },

  render: function() {
    $(this.el).html($('#todo-list-item').tmpl({ description: this.model.get('description') }));
  },

  clickCompleted: function(e) {
    // TODO: set completed
    alert('TODO');
  },
});

var DoDoContainerView = Backbone.View.extend({
  initialize: function() {
    app.todos.bind('add', this.addTodo, this);
    app.todos.bind('reset', this.addAll, this);
  },

  events: {
    'keyup #new-task-field': 'newTask'
  },

  newTask: function(e) {
    var $newTaskField = $(e.currentTarget);

    if (e.keyCode !== 13 || $newTaskField.val() === '') {
      return;
    }

    var todo = new Todo({ description: $newTaskField.val() });
    var todoView = new TodoView({ model: todo });
    todoView.render();

    app.todos.create(todo);

    $newTaskField.val('');
  },

  addTodo: function(todo) {
    $('#todos-list').append(todoView.el);
  }
});

window.app = {
  views: {},

  init: function() {
    app.todos = new Todos;
    app.views.containerView = new DoDoContainerView({ el: $('#dodo-container') });
  }
};
