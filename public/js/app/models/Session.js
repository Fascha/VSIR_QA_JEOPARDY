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
      ROUND_JEOPARDY = 'round:Jeopardy!',
      QUERY_QUESTION = 'q=question:*',
      GAME_CATEGORY_QUERY = 'q=' + CATEGORY + '*',
      GAME_CATEGORY_NUMBER = 5,
      GAME_QUESTION_NUMBER = 100000,
      randomIndex,
      questions,
      questionFetched,
      $body,
      globalCounter,
      reload,
      init = function(){
        $body = $('body');
        randomIndex = Math.floor(Math.random() * 10000);
        questionFetched = 0;
        globalCounter = 0;
        reload = false;
        questions = {};
      },
      getAllCategories = function(){
        var query = GAME_CATEGORY_QUERY,
            options = GROUP + GROUP_FIELD + WT_JSON + INDENT + ROWS + '1000000';

        fetch(query, options,_onCategoriesTagCloudListFetchedSuccess);
      },
      getQuestionTagCloudList = function(){
        var query = 'q=*:*',
            options = '&facet=true&facet.field=question_stopword_filtered' + WT_JSON + INDENT + ROWS + '1';

        fetch(query, options, _onQuestionTagCloudListFetchedSuccess);
      },
      getAnswerTagCloudList = function(){
        var query = 'q=*:*',
            options = '&facet=true&facet.field=answer_stopword_filtered' + WT_JSON + INDENT + ROWS + '1';

        fetch(query, options, _onAnswerTagCloudListFetchedSuccess);
      },
      _onCategoriesTagCloudListFetchedSuccess = function(resp){
        var list = resp.grouped.category.groups;

        list = _(list).sortBy(function(obj){
          return obj.doclist.numFound;
        });

        $body.trigger('fetched_tags', {list: _getCategoriesCloudList(list)});
      },
      _onQuestionTagCloudListFetchedSuccess = function(resp){
        var list = resp.facet_counts.facet_fields.question_stopword_filtered;

        $body.trigger('fetched_tags', {list: _getWordCloudList(list)});
      },
      _onAnswerTagCloudListFetchedSuccess = function(resp){
        var list = resp.facet_counts.facet_fields.answer_stopword_filtered;

        $body.trigger('fetched_tags', {list: _getWordCloudList(list)});
      },
      _getCategoriesCloudList = function(list){
        var cloudList = [];

        for(var i = list.length - 1; i > list.length -51; i--){
          cloudList.push([list[i].groupValue, list[i].doclist.numFound])
        }

        console.log(cloudList);
        return cloudList;
      },
      _getWordCloudList = function(list){
        var words = [],
            count = [],
            wordCloudList = [];

        for(var i = 0; i < list.length; i++){
          if(i % 2 === 0){
            words.push(list[i]);
          }else{
            count.push(list[i]);
          }
        }

        var length = words.length;
        for(var j = 0; j < length; j++){
          wordCloudList.push([words[j], (count[j] / 50)]);
        }

        return wordCloudList;
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
        globalCounter++;
        if(group.length >= 5 != reload){
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
            $body.trigger('game_initialized', questions);
            init();
          }
        }else {
          reload = true;
          if(globalCounter >= 5) {
            init();
            startNewGame();
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
          return stringToNumber(obj.groupValue);
        });
      },

      stringToNumber = function(string){
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
  that.stringToNumber = stringToNumber;
  that.getAllCategories = getAllCategories;
  that.getQuestionTagCloudList = getQuestionTagCloudList;
  that.getAnswerTagCloudList = getAnswerTagCloudList;
  that.APIPATH = APIPATH;
  that.WT_JSON = WT_JSON;
  that.INDENT = INDENT;

  return that;
})();