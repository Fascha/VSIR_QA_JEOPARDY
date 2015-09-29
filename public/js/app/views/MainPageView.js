/**
 * Created by Matze on 27.09.2015.
 */
Jeopardy.MainPageView = (function () {
    var that = {},
        $buttonRandom = undefined,
        $buttonSearch = undefined,
        $searchField = undefined,
        SessionModel = undefined,
        $body = undefined,
        $searchResultTable = undefined,
        $searchTable = undefined,
        init = function (Session) {
          SessionModel = Session;
          SessionModel.init();

          $buttonRandom = $('#randomButton');
          $buttonSearch = $('#searchButton');
          $searchField = $('input[type="search"]');
          $searchResultTable = $('#searchResults');
          $searchTable = $('#searchTable');

          $body = $('body');
          $body.on('question_searched_success', _onQuestionSearchedSuccess);
          $body.on('question_searched_error', _onQuestionSearchedError);

          _setClickListener();
        },
        _setClickListener = function () {
          $buttonRandom.click(_onButtonRandomClicked);
          $buttonSearch.click(_onButtonSearchClicked);
        },
        _normalizeValue = function(val){
          if(typeof val === 'string') {
            return val.replace(/\\/g, '\\\\').replace(/"/g, '\\\"').replace(/\(/g, '\\\\(').replace(/\)/g, '\\\\)');
          }else{
            return val;
          }
        },
        _onButtonRandomClicked = function (ev) {
          SessionModel.searchForQuestion(undefined, true);
        },
        _onButtonSearchClicked = function (ev) {
          var question = $searchField.val();
          SessionModel.searchForQuestion(question);
        },
        _onQuestionSearchedSuccess = function(ev, resp){
          var docs = resp.docs;

          if(docs && docs.length > 0) {
            $searchResultTable.html('');

            for (var i = 0; i < docs.length; i++) {
              var doc = docs[i],
                  tr = $('<tr></tr>'),
                  tdQuestion = $('<td>' + _normalizeValue(doc.question) + '</td>'),
                  tdAnswer = $('<td>' + _normalizeValue(doc.answer) + '</td>'),
                  tdValue = $('<td>' + _normalizeValue(doc.value) + '</td>'),
                  tdCategory = $('<td>' + _normalizeValue(doc.category) + '</td>'),
                  tdAirDate = $('<td>' + _normalizeValue(doc.air_date) + '</td>'),
                  tdRound = $('<td>' + _normalizeValue(doc.round) + '</td>'),
                  tdShowNumber = $('<td>' + _normalizeValue(doc.show_number) + '</td>');

              tr.append(tdQuestion);
              tr.append(tdAnswer);
              tr.append(tdValue);
              tr.append(tdCategory);
              tr.append(tdAirDate);
              tr.append(tdRound);
              tr.append(tdShowNumber);

              $searchResultTable.append(tr);
            }

            $searchTable.removeClass('hide');
          }else{
            $searchTable.addClass('hide');
          }
        },
        _onQuestionSearchedError = function(err){

        };

    that.init = init;

    return that;
  })();