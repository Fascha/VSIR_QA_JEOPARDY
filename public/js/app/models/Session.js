/**
 * Created by Matze on 27.09.2015.
 */
Jeopardy.Session = (function(){
  var that = {},
      APIPATH = "http://localhost:8983/solr/jeopardy/select?",
      RANDOM = '&sort=random_',
      DESC = ' desc',
      WT_JSON = '&wt=json',
      INDENT = '&indent=true',
      ROWS = '&rows=',
      AND = '+AND+',
      GROUP = '&group=true',
      GROUP_FIELD = '&group.field=category',
      CATEGORY = 'category:',
      VALUE = 'value:',
      ROUND_JEOPARDY = 'round:Jeopardy!',
      QUESTION = 'question',
      QUERY_QUESTION = 'q=question:',
      GAME_CATEGORY_QUERY = 'q=' + CATEGORY + '*',
      GAME_VALUE_QUERY = 'q=' + VALUE + '"$',
      MONEY_CONSTANT = 200,
      GAME_CATEGORY_NUMBER = 5,
      GAME_QUESTION_NUMBER = 100000,
      QUESTION_ROW_NUMBER = 3,
      randomIndex,
      questions,
      questionFetched,
      $body,
      init = function(){
        $body = $('body');
        randomIndex = Math.floor(Math.random() * 10000);
        questionFetched = 0;
        questions = {};
      },
      searchForQuestion = function(question, searchRandom){
        var query = QUERY_QUESTION,
            options = WT_JSON + INDENT + ROWS + '3';
        if(searchRandom === true){
          query += '*';
          options += RANDOM + randomIndex + DESC;
        }else{
            query += '"' + question + '"';
        }

        randomIndex = Math.floor(Math.random() * 10000);

        fetch(query, options, _onQuestionSearchedSuccess, _onQuestionSearchedError);
      },
      startNewGame = function(){
        _fetchCategories();
      },

      _fetchCategories = function(){
        var options = GROUP + GROUP_FIELD + WT_JSON + INDENT + ROWS + GAME_CATEGORY_NUMBER + RANDOM + randomIndex + DESC;
        fetch(GAME_CATEGORY_QUERY + AND + ROUND_JEOPARDY, options, _onCategoriesFetchedSuccess, _onCategoriesFetchedError);
      },

      _onCategoriesFetchedSuccess = function(resp){
        if(resp) {
          var groups = resp.grouped.category.groups,
              categories = _getCategoriesFromGroups(groups);

          _fetchAllQuestions(categories);
        }
      },

      _onCategoriesFetchedError = function(err){

      },

      _getCategoriesFromGroups = function(groups){
        if(groups){
          var categories = [];
          for(var i = 0; i < groups.length; i++){
            var category = groups[i].groupValue;
            category = category.replace("&", "%26");
            category = category.replace(/\\/g, '\\\\');
            category = category.replace(/"/g, '\\\"');

            categories.push(category);
          }
          return categories;
        }else{
            return [];
        }
      },

      _fetchAllQuestions = function(categories){
        for(var i = 0; i < categories.length; i++){
          var category = categories[i];
            _fetchQuestion(category);
        }
      },

      _fetchQuestion = function(category){
        var query = 'q=category:' + '"' + category + '"',
            options = '+AND+round:"Jeopardy!"&group=true&group.field=value' + WT_JSON + INDENT + ROWS + GAME_QUESTION_NUMBER + RANDOM + randomIndex + DESC;
        fetch(query, options, _onQuestionFetchedSuccess, _onQuestionFetchedError);
      },

      _onQuestionFetchedSuccess = function(resp){
        var group = _sortByValue(resp.grouped.value.groups);

        if(group.length >= 5){
          for(var i = 0; i < group.length; i++){
            var question = group[i].doclist.docs[0],
                value = question.value,
                category = question.category;

            if(!questions[category]) {
              questions[category] = {};
            }

            questions[category][value] = question;

          }

          questionFetched++;

          if(questionFetched >= 5){
            questionFetched = 0;
            $body.trigger('game_initialized', questions);
          }
        }
      },

      _onQuestionFetchedError = function(err){

      },

      _onQuestionSearchedSuccess = function(resp){
        $body.trigger('question_searched_success', resp.response);
      },

      _onQuestionSearchedError = function(err){
        $body.trigger('question_searched_error', err);
      },

      _sortByValue = function(array){
        return _(array).sortBy(function(obj){
          return _stringToNumber(obj.groupValue);
        });
      },

      _stringToNumber = function(string){
        return parseInt(string.substring(1).replace(/,/g, ''))
      },

      fetch = function(query, options, callbackSuccess, callbackError){
        return $.ajax({
          url: APIPATH + query + options,
          type: 'GET',
          dataType: 'jsonp',
          jsonp: 'json.wrf',
          success: function(resp){
            if(callbackSuccess){
              callbackSuccess(resp);
            }
          },
          error: function(err){
            if(callbackError){
              callbackError(err);
            }
          }
        });
      };

  that.init = init;
  that.startNewGame = startNewGame;
  that.fetch = fetch;
  that.searchForQuestion = searchForQuestion;

  return that;
})();