(function() {
  var AppView, Todo, TodoView, Todos;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Todo = Backbone.Model.extend({
    defaults: function() {
      return {
        completed: false,
        dateCreated: new Date,
        sortOrder: app.todos.nextSortOrder()
      };
    }
  });
  Todos = Backbone.Collection.extend({
    model: Todo,
    localStorage: new Store('todos'),
    comparator: function(todo) {
      return todo.get('sortOrder');
    },
    nextSortOrder: function() {
      if (this.length === 0) {
        return 0;
      } else {
        return this.last().get('sortOrder') + 1;
      }
    }
  });
  TodoView = Backbone.View.extend({
    tagName: 'li',
    events: {
      'click .completed': 'clickCompleted',
      'dblclick .description': 'editDescription',
      'keyup .edit-field': 'updateDescription',
      'blur .edit-field': 'updateDescription',
      'click .delete': 'deleteTodo',
      'mouseover': 'mouseOverTodo',
      'mouseout': 'mouseOutTodo'
    },
    render: function() {
      $(this.el).data('id', this.model.get('id'));
      $(this.el).html($('#todo-list-item').tmpl({
        description: this.model.get('description'),
        completed: this.model.get('completed')
      }));
      if (this.model.get('completed')) {
        return $(this.el).addClass('completed');
      } else {
        return $(this.el).removeClass('completed');
      }
    },
    clickCompleted: function(e) {
      this.model.set({
        completed: $(e.currentTarget).prop('checked')
      });
      this.model.save();
      return this.render();
    },
    editDescription: function() {
      var description;
      this.$('.description').addClass('hidden');
      this.$('.edit-field').val(this.model.get('description'));
      this.$('.edit').removeClass('hidden');
      this.$('.edit-field').focus();
      description = this.$('.edit-field').val();
      this.$('.edit-field').val('');
      return this.$('.edit-field').val(description);
    },
    updateDescription: function(e) {
      if (e.type === 'focusout') {
        this._setDescription();
      } else if (e.type === 'keyup') {
        if (e.keyCode === 13) {
          return this._setDescription();
        } else if (e.keyCode === 27) {
          this.$('.edit').addClass('hidden');
          return this.$('.description').removeClass('hidden');
        }
      }
    },
    deleteTodo: function(e) {
      var view;
      e.preventDefault();
      view = this;
      return $('#dialog-confirm-delete').dialog({
        resizable: false,
        modal: true,
        buttons: {
          'Delete': function() {
            $(this).dialog('close');
            view.model.destroy();
            return $(view.el).slideUp(100, function() {
              return view.remove();
            });
          },
          'Cancel': function() {
            return $(this).dialog('close');
          }
        }
      });
    },
    mouseOverTodo: function() {
      this.$('.delete-div').removeClass('hidden');
      return this.$('.move-handle').removeClass('invisible');
    },
    mouseOutTodo: function() {
      this.$('.delete-div').addClass('hidden');
      return this.$('.move-handle').addClass('invisible');
    },
    _setDescription: function() {
      var description;
      description = $.trim(this.$('.edit-field').val());
      this.model.set({
        description: description
      });
      this.model.save();
      return this.render();
    }
  });
  AppView = Backbone.View.extend({
    initialize: function() {
      app.todos.bind('add', this.addTodo, this);
      app.todos.bind('reset', this.resetTodos, this);
      app.todos.fetch();
      return this.$('#todos-list').sortable({
        handle: '.move-handle',
        update: __bind(function(e, ui) {
          var newTodos;
          newTodos = $.makeArray(this.$('#todos-list li')).reverse();
          _(newTodos).each(function(el, i) {
            var todo;
            todo = app.todos.get($(el).data('id'));
            todo.set({
              sortOrder: i
            });
            return todo.save();
          });
          return app.todos.sort({
            silent: true
          });
        }, this)
      });
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
      var el, todoView;
      todoView = new TodoView({
        model: todo
      });
      todoView.render();
      el = $(todoView.el);
      el.hide();
      $('#todos-list').prepend(el);
      return el.slideDown(100);
    },
    resetTodos: function() {
      return app.todos.each(__bind(function(todo) {
        return this.addTodo(todo);
      }, this));
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
