(function() {
  var AppView, Todo, TodoView, Todos;
  Todo = Backbone.Model.extend({
    defaults: function() {
      return {
        completed: false,
        dateCreated: new Date
      };
    }
  });
  Todos = Backbone.Collection.extend({
    model: Todo,
    localStorage: new Store('todos')
  });
  TodoView = Backbone.View.extend({
    tagName: 'li',
    events: {
      'click .completed': 'clickCompleted'
    },
    render: function() {
      return $(this.el).html($('#todo-list-item').tmpl({
        description: this.model.get('description')
      }));
    },
    clickCompleted: function(e) {
      return alert('TODO');
    }
  });
  AppView = Backbone.View.extend({
    initialize: function() {
      return app.todos.bind('add', this.addTodo, this);
    },
    events: {
      'keyup #new-task-field': 'newTask'
    },
    newTask: function(e) {
      var $newTaskField, todo;
      $newTaskField = $(e.currentTarget);
      if (e.keyCode !== 13 || $newTaskField.val() === '') {
        return;
      }
      todo = new Todo({
        description: $newTaskField.val()
      });
      app.todos.create(todo);
      return $newTaskField.val('');
    },
    addTodo: function(todo) {
      var todoView;
      todoView = new TodoView({
        model: todo
      });
      todoView.render();
      return $('#todos-list').append(todoView.el);
    }
  });
  window.app = {
    views: {},
    init: function() {
      app.todos = new Todos;
      return app.views.appView = new AppView({
        el: $('#dodo-container')
      });
    }
  };
}).call(this);
