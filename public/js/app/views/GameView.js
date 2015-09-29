/**
 * Created by Matze on 27.09.2015.
 */
Jeopardy.GameView = (function(){
  var that = {},
      SessionModel = undefined,
      $body = undefined,
      questions = undefined,
      $myModal = undefined,
      $myModalLabel = undefined,
      $myModalQuestion = undefined,
      $myModalAnswer = undefined,
      currentQuestion = undefined,
      currentTarget = undefined,
      $buttonNewGame = undefined,
      gamePoints = 0,
      answeredQuestions = 0,
      $points = undefined,
      $error = undefined,
      $categories = undefined,
      init = function(Session){
        $buttonNewGame = $('#buttonNewGame');
        $points = $('#points');
        $body = $('body');
        $error = $('#error');
        SessionModel = Session;
        SessionModel.init();
        SessionModel.startNewGame();
        $myModal = $('#myModal');
        $myModalLabel = $('#myModalLabel');
        $myModalQuestion = $('#question');
        $myModalAnswer = $('#answer');
        $categories = $('#categories');

        $(window).resize(_arrangeHeadlines);

        $myModal.on('show.bs.modal', function () {
          $myModalAnswer.focus();
        });

        _resetGameBoard();

        $buttonNewGame.click(_onNewGame);

        $body.on('game_initialized', _onGameInitialized);

        $('button[name="answer_submit"]').click(_onAnswerSubmit);
        $('button[name="restart_game"]').click(_onNewGame);
        $('input[type="image"]').click(_onFieldClicked);
      },
      _onNewGame = function(){
        $('button[name="answer_submit"]').removeClass('hide');
        $('button[name="restart_game"]').addClass('hide');
        $myModal.modal('hide');
        questions = undefined;

        gamePoints = 0;
        answeredQuestions = 0;

        _resetGameBoard();

        SessionModel.init();
        SessionModel.startNewGame();
      },
      _onGameInitialized = function(ev, data){;
        questions = data;

        _showCategories();
        _arrangeHeadlines();
        _setValues();
        _enableGame();
      },
      _resetGameBoard = function(){
        $('input[type="image"]').addClass('overlay');
        $('input[type="image"]').prop('disabled', true);
      },
      _enableGame = function(){
        $('input[type="image"]').removeClass('overlay');
        $('input[type="image"]').prop('disabled', false);
      },
      _showCategories = function(){
        var counter = 1;
        for(var key in questions){
          if(questions.hasOwnProperty(key)){
            var $category = $('#category_' + counter + ' h4');
            $category.html(""+key);

            counter++;
          }
        }
      },
      _setValues = function(){
        var counterCategories = 1;
        for(var key in questions){
          var counterRows = 1;
          for(var val in questions[key]){
            var field = $('#row_' + counterRows).find('input[data-category=' + counterCategories + ']');
            field.data('value', val);
            field.attr('src', _getImageSrc(val));
            counterRows++;
            if(counterRows >= 6){
              break;
            }
          }
          counterCategories++;
        }
      },
      _getImageSrc = function(val){
        switch (val){
          case '$100':
            return '../../../images/button_100.jpg';
          case '$200':
            return '../../../images/button_200.png';
          case '$300':
            return '../../../images/button_300.jpg';
          case '$400':
            return '../../../images/button_400.png';
          case '$500':
            return '../../../images/button_500.jpg';
          case '$600':
            return '../../../images/button_600.png';
          case '$700':
            return '../../../images/button_700.jpg';
          case '$800':
            return '../../../images/button_800.png';
          case '$900':
            return '../../../images/button_900.jpg';
          case '$1000':
            return '../../../images/button_1000.png';
        }
      },
      _onFieldClicked = function(ev){
        var field = $(ev.currentTarget),
            category = $('#category_' + field.data('category') + ' h4').html(),
            value = field.data('value'),
            question = questions[category.replace(/&amp;/g, '&')][value];

        currentTarget = field;
        currentQuestion = question;

        _showQuestion(question)
      },
      _showQuestion = function(question){
        var headline = 'Category: ' + question.category + '   Value: ' + question.value;
        $myModalLabel.html(headline);
        $myModalQuestion.html(question.question[0]);
        $myModal.modal('show');
      },
      _onAnswerSubmit = function(){
        var answer = $myModalAnswer.val();
        if(answer.trim()) {
          $error.addClass('hide');
          if (answer.toLowerCase() === currentQuestion.answer.toLowerCase()) {
            _increasePoints(currentQuestion.value);
            $points.html('Money: $' + gamePoints);
          }
          $myModalAnswer.val("");
          currentTarget.prop('disabled', true);
          currentTarget.addClass('overlay');
          answeredQuestions++;
          if(answeredQuestions >= 25){
            answeredQuestions = 0;
            $('button[name="answer_submit"]').addClass('hide');
            $('button[name="restart_game"]').removeClass('hide');
            $myModalAnswer.addClass('hide');
            $myModalLabel.html('GAME OVER');
            $myModalQuestion.html('Congratulations! You won: $' + gamePoints);
          }else{
            $myModal.modal('hide');
          }
        }else{
          $error.removeClass('hide');
        }
      },
      _increasePoints = function(value){
        switch (value){
          case '$200':
            gamePoints += 200;
            break;
          case '$400':
            gamePoints += 400;
            break;
          case '$500':
            gamePoints += 600;
            break;
          case '$600':
            gamePoints += 800;
            break;
          case '$1000':
            gamePoints += 1000;
            break;
        }
      },
      _arrangeHeadlines = function(){
        var width = $('#row_1 input').first().width(),
            height = $('#row_1 input').first().height();

        $categories.width((width)*5);

        for(var i = 1; i < 6; i++){
          $('#category_' + i).width(width);
          $('#category_' + i).height(height);
        }
      };

  that.init = init;

  return that;
})();